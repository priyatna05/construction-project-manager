import axios from 'axios';
import dayjs from 'dayjs';
import { produce } from 'immer';
import { create } from 'zustand';

const useNotificationsStore = create(set => ({
  notifications: [],
  setNotifications: notifications => {
    return set(
      produce(state => {
        state.notifications = [...notifications];
      })
    );
  },
  addNotification: notification => {
    return set(
      produce(state => {
        // Deduplicate by id: if exists, remove old and re-prepend
        const existingIdx = state.notifications.findIndex(n => n.id === notification.id);
        const filtered =
          existingIdx !== -1
            ? state.notifications.filter(n => n.id !== notification.id)
            : state.notifications;

        const trimmed =
          filtered.length >= 6 ? filtered.slice(0, filtered.length - 1) : filtered;

        state.notifications = [notification, ...trimmed];
      })
    );
  },
  markAsRead: async notification => {
    try {
      await axios.put(route('notifications.read', notification.id));

      return set(
        produce(state => {
          const index = state.notifications.findIndex(i => i.id === notification.id);
          state.notifications[index].read_at = dayjs().toISOString();
        })
      );
    } catch (e) {
      console.warn('Failed to set notification as read', e);
    }
  },
  markAllAsRead: async () => {
    try {
      await axios.put(route('notifications.read.all'));

      return set(
        produce(state => {
          state.notifications.forEach(notification => {
            notification.read_at = dayjs().toISOString();
          });
        })
      );
    } catch (e) {
      console.warn('Failed to set notifications as read', e);
    }
  },
  deleteNotification: async notificationId => {
    try {
      await axios.delete(route('notifications.destroy', notificationId));

      return set(
        produce(state => {
          state.notifications = state.notifications.filter(n => n.id !== notificationId);
        })
      );
    } catch (e) {
      console.warn('Failed to delete notification', e);
    }
  },
  clearAllNotifications: async () => {
    try {
      await axios.delete(route('notifications.clear.all'));

      return set(
        produce(state => {
          state.notifications = [];
        })
      );
    } catch (e) {
      console.warn('Failed to clear all notifications', e);
    }
  },

}));

export default useNotificationsStore;

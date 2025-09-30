import { usePage } from '@inertiajs/react';
import { showNotification } from '@mantine/notifications';
import useNotificationsStore from './store/useNotificationsStore';
import useTaskGroupsStore from './store/useTaskGroupsStore';
import useTasksStore from './store/useTasksStore';

export default function useWebSockets() {
  const {
    auth: { user },
  } = usePage().props;
  const { addNotification } = useNotificationsStore();
  const {
    addTaskLocally,
    updateTaskLocally,
    removeTaskLocally,
    restoreTaskLocally,
    addCommentLocally,
    addAttachmentsLocally,
    removeAttachmentLocally,
    updateTaskInventoryLocally,
    reorderTaskLocally,
    moveTaskLocally,
  } = useTasksStore();
  const {
    addTaskGroupLocally,
    updateTaskGroupLocally,
    removeTaskGroupLocally,
    restoreTaskGroupLocally,
    reorderTaskGroupLocally,
  } = useTaskGroupsStore();

  const initUserWebSocket = () => {
    window.Echo.private(`App.Models.User.${user.id}`).notification(notification => {
      addNotification(notification);

      showNotification({
        title: notification.title,
        message: notification.description,
        autoClose: 8000,
      });
    });
  };

  const initProjectWebSocket = project => {
    window.Echo.private(`App.Models.Project.${project.id}`)
      .listen('Task\\TaskCreated', e => addTaskLocally(e.task))
      .listen('Task\\TaskUpdated', e => updateTaskLocally(e.taskId, e.property, e.value))
      .listen('Task\\TaskDeleted', e => removeTaskLocally(e.taskId))
      .listen('Task\\TaskRestored', e => restoreTaskLocally(e.groupId, e.task))
      .listen('Task\\InventoryUpdated', e => {
        updateTaskInventoryLocally(e.taskId, e.inventories);
      })
      .listen('Task\\CommentCreated', e => addCommentLocally(e.comment))
      .listen('Task\\AttachmentsUploaded', e => addAttachmentsLocally(e.attachments))
      .listen('Task\\AttachmentDeleted', e => removeAttachmentLocally(e.taskId, e.attachmentId))
      .listen('Task\\TaskOrderChanged', e => reorderTaskLocally(e.groupId, e.fromIndex, e.toIndex))
      .listen('Task\\TaskGroupChanged', e =>
        moveTaskLocally(e.fromGroupId, e.toGroupId, e.fromIndex, e.toIndex)
      )
      .listen('TaskGroup\\TaskGroupCreated', e => addTaskGroupLocally(e.taskGroup))
      .listen('TaskGroup\\TaskGroupUpdated', e => updateTaskGroupLocally(e.taskGroup))
      .listen('TaskGroup\\TaskGroupDeleted', e => removeTaskGroupLocally(e.taskGroupId))
      .listen('TaskGroup\\TaskGroupRestored', e => restoreTaskGroupLocally(e.taskGroup))
      .listen('TaskGroup\\TaskGroupOrderChanged', e => reorderTaskGroupLocally(e.taskGroupIds))
      .listen('Analytic\\EvmRecordUpdated', e => {
        // Handle real-time EVM record update
        // You can update your dashboard state/store here accordingly
        console.log('EVM Record updated:', e.evmRecord);
        // TODO: Add logic to update dashboard state with e.evmRecord
      });

    return () => window.Echo.leave(`App.Models.Project.${project.id}`);
  };

  const initTaskWebSocket = task => {
    window.Echo.private(`App.Models.Task.${task.id}`).listen('Task\\CommentCreated', e =>
      addCommentLocally(e.comment)
    );

    return () => window.Echo.leave(`App.Models.Task.${task.id}`);
  };

  const initInventoryWebSocket = (onInventoryUpdated) => {
  window.Echo.channel('inventories').listen('InventoryUpdated', e => {
    console.log('Inventory updated event received:', e.inventory);

    if (typeof onInventoryUpdated === 'function') {
      onInventoryUpdated(e.inventory);
    }

    showNotification({
      title: 'Inventory Updated',
      message: `Inventory "${e.inventory.name}" updated successfully.`,
      color: 'blue',
      autoClose: 5000,
    });
  });

  return () => window.Echo.leaveChannel('inventories');
};

  return { initUserWebSocket, initProjectWebSocket, initTaskWebSocket, initInventoryWebSocket };
}

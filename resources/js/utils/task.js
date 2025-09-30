import dayjs from 'dayjs';

export const isOverdue = task => {
  return dayjs().isAfter(task.due_on);
};

export const formatDateForServer = date => {
  return date instanceof Date ? dayjs(date).format('YYYY-MM-DD') : date;
};

export const buildOptions = (field, value, labels, users) => {
  if (field === 'labels') {
    return value.map(id => labels.find(i => i.id === id));
  }
  if (field === 'subscribed_users') {
    return value.map(id => users.find(i => i.id.toString() === id));
  }
  return null;
};

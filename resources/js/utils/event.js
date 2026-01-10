import {
  IconCalendarEvent,
  IconClipboardCheck,
  IconTargetArrow,
} from '@tabler/icons-react';

export const getEventTypeProps = (type) => {
  switch (type) {
    case 'meeting':
      return { icon: IconCalendarEvent, color: 'blue', label: 'Meeting' };
    case 'task':
      return { icon: IconClipboardCheck, color: 'green', label: 'Task' };
    case 'goal':
      return { icon: IconTargetArrow, color: 'violet', label: 'Goal' };
    default:
      return { icon: IconCalendarEvent, color: 'gray', label: 'Event' };
  }
};

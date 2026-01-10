import usePreferences from '@/hooks/usePreferences';
import { Draggable } from '@hello-pangea/dnd';
import TaskCard from './Task/TaskCard';
import TaskRow from './Task/TaskRow';

export default function Task({ task, index, allTasks }) {
  const { tasksView } = usePreferences();
  const isDragDisabled = !can('reorder task') || route().params.archived;

  if (!task || !task.id) {
    return null;
  }

  return (
    <Draggable
      draggableId={task.id.toString()}
      index={index}
      isDragDisabled={isDragDisabled}
    >
      {provided => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          {tasksView === 'list' ? (
            <TaskRow
              task={task}
              index={index}
              allTasks={allTasks}
            />
          ) : (
            <TaskCard
              task={task}
              index={index}
              allTasks={allTasks}
            />
          )}
        </div>
      )}
    </Draggable>
  );
}

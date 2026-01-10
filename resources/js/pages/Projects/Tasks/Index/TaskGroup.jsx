import { Draggable, Droppable } from '@hello-pangea/dnd';
import { Text, Group, rem } from '@mantine/core';
import { IconGripVertical } from '@tabler/icons-react';
import Task from './Task';
import TaskGroupActions from './TaskGroupActions';
import classes from './css/TaskGroup.module.css';

export default function TaskGroup({ group, tasks, allTasks, ...props }) {
  const isDragDisabled = !can('reorder task group') || route().params.archived;

  return (
    <Draggable
      draggableId={group.id.toString()}
      isDragDisabled={isDragDisabled}
      {...props}
    >
      {(provided, snapshot) => (
        <div
          className={`${classes.row} ${snapshot.isDragging && classes.itemDragging}`}
          ref={provided.innerRef}
          {...provided.draggableProps}
        >
          <div className={classes.group}>
            <Group>
              <div
                {...provided.dragHandleProps}
                className={classes.dragHandle}
              >
                <IconGripVertical
                  style={{
                    width: rem(20),
                    height: rem(20),
                    display:
                      can('reorder task group') && !route().params.archived ? 'inline' : 'none',
                  }}
                  stroke={1.5}
                />
              </div>
              <Group
                position='apart'
                style={{ flexGrow: 2 }}
              >
                <Text
                  size='lg'
                  fw={700}
                  truncate
                >
                  {group.name}
                </Text>
              </Group>
              <TaskGroupActions
                group={group}
                className={classes.actions}
              />
            </Group>
          </div>
          <Droppable
            droppableId={`group-${group.id}-tasks`}
            type='task'
          >
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={snapshot.isDraggingOver ? 'isDraggingOver' : ''}
              >
                {tasks.filter(task => task && task.id).map((task, index) => (
                  <Task
                    key={task.id}
                    task={task}
                    index={index}
                    allTasks={allTasks}
                  />
                ))}
                <div className={classes.placeholder}>{provided.placeholder}</div>
              </div>
            )}
          </Droppable>
        </div>
      )}
    </Draggable>
  );
}

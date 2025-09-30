import useTaskDrawerStore from '@/hooks/store/useTaskDrawerStore';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import { ActionIcon, Text, Group, Tooltip, rem } from '@mantine/core';
import { IconGripVertical, IconPlus } from '@tabler/icons-react';
import Task from './Task';
import TaskGroupActions from './TaskGroupActions';
import classes from './css/TaskGroup.module.css';

export default function TaskGroup({ group, tasks, allTasks, ...props }) {
  const { openCreateTask } = useTaskDrawerStore();

  return (
    <Draggable
      draggableId={group.id.toString()}
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
            {!route().params.archived && can('create task') && (
              <Tooltip
                label='Add task'
                openDelay={1000}
                withArrow
              >
                <ActionIcon
                  variant='filled'
                  size='md'
                  radius='xl'
                  onClick={() => openCreateTask(group.id)}
                >
                  <IconPlus
                    style={{ width: rem(18), height: rem(18) }}
                    stroke={2}
                  />
                </ActionIcon>
              </Tooltip>
            )}
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
                {tasks.map((task, index) => (
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

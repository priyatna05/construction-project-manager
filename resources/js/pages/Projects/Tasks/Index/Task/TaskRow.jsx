import { Label } from '@/components/Label';
import useTaskDrawerStore from '@/hooks/store/useTaskDrawerStore';
import useTasksStore from '@/hooks/store/useTasksStore';
import { isOverdue } from '@/utils/task';
import { shortName } from '@/utils/user';
import { Link } from '@inertiajs/react';
import {
  Checkbox,
  Paper,
  Group,
  Pill,
  Badge,
  Text,
  Tooltip,
  rem,
  Avatar,
  useComputedColorScheme,
} from '@mantine/core';
import { IconGripVertical } from '@tabler/icons-react';
import TaskActions from '../TaskActions';
import { getInitials } from '@/utils/user';
import { isParent, isChild } from '@/utils/depends';
import React from 'react';
import * as TablerIcons from '@tabler/icons-react';
import classes from './css/TaskRow.module.css';

export default function TaskRow({ task, allTasks }) {
  const { complete } = useTasksStore();
  const { openEditTask } = useTaskDrawerStore();
  const computedColorScheme = useComputedColorScheme();
  const isParentTask = isParent(task.id, allTasks);
  const isChildTask = isChild(task);
  const isIntermediateTask = isParentTask && isChildTask;

  return (
    <Paper
      className={`${classes.task}
            ${task.completed_at !== null && classes.completed}
            ${isParentTask ? classes.parentTask : isChildTask ? classes.dependentTask : ''}`}
      wrap='nowrap'
    >
      <Group
        gap='sm'
        wrap='nowrap'
        w='100%'
      >
        <IconGripVertical
          style={{
            width: rem(18),
            height: rem(18),
            display: can('reorder task') ? 'inline' : 'none',
          }}
          stroke={1.5}
          className={classes.dragHandle}
        />

        <Checkbox
          size='sm'
          radius='xl'
          color='green'
          checked={task.completed_at !== null}
          onChange={e => complete(task, e.currentTarget.checked)}
          className={can('complete task') ? classes.checkbox : classes.disabledCheckbox}
        />
        {task.assigned_to_user && (
          <Link href={route('users.edit', task.assigned_to_user.id)}>
            <Tooltip
              label={task.assigned_to_user.name}
              openDelay={1000}
              withArrow
            >
              <Pill
                size='sm'
                className={classes.user}
              >
                {shortName(task.assigned_to_user.name)}
              </Pill>
            </Tooltip>
          </Link>
        )}
        <Tooltip
          label={
            isIntermediateTask
              ? 'This task has dependencies and is also depended upon'
              : isParentTask
                ? 'Other tasks depend on this task'
                : isChildTask
                  ? 'This task depends on another'
                  : 'Standalone task'
          }
          withArrow
        >
          <Text
            className={classes.name}
            size='sm'
            fw={500}
            truncate='end'
            c={isOverdue(task) && task.completed_at === null ? 'red.7' : ''}
            onClick={() => openEditTask(task)}
            component='div'
          >
            #{task.number ?? '...'} : {task.name}
            {isIntermediateTask ? (
              <Badge
                color='yellow'
                variant='light'
              >
                Intermediate
              </Badge>
            ) : isParentTask ? (
              <Badge
                color='green'
                variant='light'
              >
                Parent
              </Badge>
            ) : isChildTask ? (
              <Badge
                color='blue'
                variant='light'
              >
                Child
              </Badge>
            ) : null}
          </Text>
        </Tooltip>
        {task.dependencies?.map(dep => {
          if (!dep.relation_type) return null;
          return (
            <Tooltip
              key={dep.id}
              label={`Depends on #${dep.id} (${dep.name})`}
              withArrow
            >
              <Badge
                color={dep.relation_type.color || 'gray'}
                variant='light'
                size='sm'
                leftSection={
                  TablerIcons[dep.relation_type.icon] ? (
                    React.createElement(TablerIcons[dep.relation_type.icon], {
                      size: 12,
                      stroke: 1.5,
                    })
                  ) : (
                    <TablerIcons.IconAlertCircle
                      size={12}
                      stroke={1.5}
                    />
                  )
                }
              >
                {dep.relation_type.name}
              </Badge>
            </Tooltip>
          );
        })}
        <Group
          wrap='nowrap'
          style={{ rowGap: rem(3), columnGap: rem(12) }}
        >
          {(task.labels || []).map(label => (
            <Label
              key={label.id}
              name={label.name}
              color={label.color}
              icon={label.icon}
              dot={false}
            />
          ))}
        </Group>
        {task.assigned_to_user && (
          <Tooltip
            label={task.assigned_to_user.name}
            openDelay={1000}
            withArrow
          >
            <Link
              href={route('users.edit', task.assigned_to_user.id)}
              style={{ textDecoration: 'none' }}
            >
              <Avatar
                src={task.assigned_to_user.avatar}
                radius='xl'
                size={20}
                color={computedColorScheme === 'light' ? 'white' : 'blue'}
              >
                {getInitials(task.assigned_to_user.name)}
              </Avatar>
            </Link>
          </Tooltip>
        )}

        {(can('archive task') || can('restore task')) && (
          <TaskActions
            task={task}
            className={classes.actions}
          />
        )}
      </Group>
    </Paper>
  );
}

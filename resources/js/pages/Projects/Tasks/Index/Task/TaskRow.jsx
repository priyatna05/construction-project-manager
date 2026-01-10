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
  Text,
  Tooltip,
  rem,
  Avatar,
  useComputedColorScheme,
  ActionIcon,
  Collapse,
  Stack,
} from '@mantine/core';
import {
  IconGripVertical,
  IconArrowNarrowDownDashed,
  IconArrowNarrowUpDashed,
} from '@tabler/icons-react';
import TaskActions from '../TaskActions';
import { getInitials } from '@/utils/user';
import classes from './css/TaskRow.module.css';
import { useState, useMemo } from 'react';
import { day } from '@/utils/datetime';

export default function TaskRow({ task }) {
  const { complete } = useTasksStore();
  const { openEditTask } = useTaskDrawerStore();
  const computedColorScheme = useComputedColorScheme();
  const [opened, setOpened] = useState(false);

  const detailItems = useMemo(() => {
    const progress = `${Math.round(task?.progress_task ?? 0)}%`;
    const statusLabels = (task?.labels || []).filter(label => label?.type === 'pt_status');
    const status = statusLabels.length > 0 ? statusLabels.map(label => label.name).join(', ') : '-';
    const priority = task?.priority?.name ?? task?.priority?.slug ?? '-';
    const assignee = task?.assigned_to_user?.name ?? 'Unassigned';
    return [
      {
        label: 'Start',
        value: day(task.start_date) || '-',
      },
      {
        label: 'End',
        value: day(task.end_date) || '-',
      },
      {
        label: 'Progress',
        value: progress,
      },
      {
        label: 'Status',
        value: status,
      },
      {
        label: 'Priority',
        value: priority,
      },
      {
        label: 'Assignee',
        value: assignee,
      },
    ];
  }, [task]);

  return (
    <Paper
      className={`${classes.task} ${task.completed_at !== null && classes.completed}`}
      wrap='nowrap'
    >
      <Stack gap={4}>
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
          <Tooltip
            label='Completed a task'
            withArrow
          >
            <Checkbox
              size='sm'
              radius='xl'
              color='green'
              checked={task.completed_at !== null}
              onChange={e => complete(task, e.currentTarget.checked)}
              disabled={!can('complete task')}
              className={can('complete task') ? classes.checkbox : classes.disabledCheckbox}
            />
          </Tooltip>
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
          </Text>
          {!opened && (
            <>
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
            </>
          )}
          {(can('archive task') || can('restore task') || can('delete task')) && (
            <TaskActions
              task={task}
              className={classes.actions}
            />
          )}
          <ActionIcon
            variant='subtle'
            color='blue'
            onClick={() => setOpened(prev => !prev)}
            className={classes.toggle}
          >
            {opened ? (
              <IconArrowNarrowUpDashed
                className={classes.toggleIcon}
                style={{ transform: 'rotate(0deg)' }}
              />
            ) : (
              <IconArrowNarrowDownDashed className={classes.toggleIcon} />
            )}
          </ActionIcon>
        </Group>
        <Collapse in={opened}>
          <Paper
            className={classes.detail}
            p='sm'
            radius='md'
          >
            <div className={classes.detailGrid}>
              {detailItems.map(item => (
                <div
                  key={item.label}
                  className={classes.detailCell}
                >
                  <Text
                    size='xs'
                    c='dimmed'
                    ta='center'
                  >
                    {item.label}
                  </Text>
                  <Text
                    size='sm'
                    fw={500}
                    ta='center'
                  >
                    {item.value}
                  </Text>
                </div>
              ))}
            </div>
          </Paper>
        </Collapse>
      </Stack>
    </Paper>
  );
}

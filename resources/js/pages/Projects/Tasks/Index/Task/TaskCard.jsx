import { Label } from '@/components/Label';
import useTaskDrawerStore from '@/hooks/store/useTaskDrawerStore';
import useTasksStore from '@/hooks/store/useTasksStore';
import { getInitials } from '@/utils/user';
import { Link } from '@inertiajs/react';
import {
  Avatar,
  Checkbox,
  Group,
  Tooltip,
  Paper,
  rem,
  useComputedColorScheme,
  Text,
  ActionIcon,
  Collapse,
  Stack,
} from '@mantine/core';
import {
  IconArrowNarrowDownDashed,
  IconArrowNarrowUpDashed,
  IconGripVertical,
} from '@tabler/icons-react';
import TaskActions from '../TaskActions';
import { isOverdue } from '@/utils/task';
import classes from './css/TaskCard.module.css';
import { useMemo, useState } from 'react';
import { day } from '@/utils/datetime';

export default function TaskCard({ task }) {
  const { openEditTask } = useTaskDrawerStore();
  const { complete } = useTasksStore();
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
      className={`${classes.task} ${task.completed_at ? classes.completed : ''}`}
      style={{
        padding: rem(8),
      }}
      shadow='xs'
      radius='md'
    >
      <Stack gap={6}>
        <Group
          justify='space-between'
          align='center'
          wrap='nowrap'
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
              <IconArrowNarrowUpDashed className={classes.toggleIcon} />
            ) : (
              <IconArrowNarrowDownDashed className={classes.toggleIcon} />
            )}
          </ActionIcon>
        </Group>

        {!opened && (
          <Group
            wrap='wrap'
            spacing={5}
            style={{ rowGap: rem(3), columnGap: rem(12) }}
          >
            {(task.labels || []).map(label => (
              <Label
                key={label.id}
                name={label.name}
                color={label.color}
                icon={label.icon}
                size={9}
                dot={false}
              />
            ))}
          </Group>
        )}

        {!opened && task.assigned_to_user && (
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

        <Collapse in={opened}>
          <Paper
            className={classes.detail}
            p='sm'
            radius='md'
            withBorder
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

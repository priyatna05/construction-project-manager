import { Avatar, Badge, Group, Paper, Table, Text, Tooltip } from '@mantine/core';
import { day } from '@/utils/datetime';
import { getInitials } from '@/utils/user';

const currency = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
const getTags = (task) =>
  (task?.labels || []).filter(label => label?.name && ![task?.priority?.id, task?.unit?.id].includes(label?.id));

export default function TaskGroupDetails({ group, tasks }) {
  const rows = (tasks || group?.tasks || []).map(task => {
    const tags = getTags(task);
    const assignees = (task.subscribed_users && task.subscribed_users.length > 0)
      ? task.subscribed_users
      : task.assigned_to_user
        ? [task.assigned_to_user]
        : [];
    const totalCost = (task.volume || 0) * (task.unit_cost_task || 0);
    const dependencies = Array.isArray(task.dependencies) ? task.dependencies : [];
    const isCompleted = Boolean(task?.is_completed);

    return (
      <Table.Tr key={task.id}>
          <Tooltip
            label={isCompleted ? 'Task completed' : 'Task not completed'}
            withArrow
            color={isCompleted ? 'green' : 'red'}
          >
        <Table.Td style={isCompleted ? { backgroundColor: '#ebfbee' } : undefined}>
          {(tasks || group?.tasks || []).indexOf(task) + 1}
          </Table.Td>
          </Tooltip>
        <Table.Td>
          <Text fw={600}>{task.name || '-'}</Text>
          <Text size='xs' c='dimmed' lineClamp={2}>
            {task.description || 'No description'}
          </Text>
        </Table.Td>
        <Table.Td>{day(task.start_date) || '-'}</Table.Td>
        <Table.Td>{day(task.end_date) || '-'}</Table.Td>
        <Table.Td>{task.volume ?? '-'}</Table.Td>
        <Table.Td>{task.unit_cost_task ? currency.format(task.unit_cost_task) : '-'}</Table.Td>
        <Table.Td>{totalCost ? currency.format(totalCost) : '-'}</Table.Td>
        <Table.Td>
          {dependencies.length ? (
            <Group gap='xs' wrap='wrap'>
              {dependencies.slice(0, 2).map(dep => (
                <Tooltip
                  key={dep.id}
                  label={`Relation: ${dep.relation_type?.name || 'N/A'}${dep.lag_days ? `, Lag: ${dep.lag_days}d` : ''}`}
                  withArrow
                  color='blue'
                >
                  <Badge
                    variant='light'
                    size='sm'
                    color={dep.relation_type?.color || 'gray'}
                  >
                    {dep.name || '-'}
                  </Badge>
                </Tooltip>
              ))}
              {dependencies.length > 2 && (
                <Badge variant='outline' size='sm'>
                  +{dependencies.length - 2} more
                </Badge>
              )}
            </Group>
          ) : (
            <Text size='xs' c='dimmed'>-</Text>
          )}
        </Table.Td>
        <Table.Td>
          {assignees.length ? (
            <Group gap='xs'>
              <Tooltip
                label={assignees[0].name}
                withArrow
                color='blue'
              >
                <Avatar
                  src={assignees[0].avatar}
                  radius='xl'
                  size={24}
                  color='blue'
                >
                  {getInitials(assignees[0].name)}
                </Avatar>
              </Tooltip>
              {assignees.length > 1 && (
                <Tooltip
                  label={assignees.map(user => user.name).join(', ')}
                  withArrow
                >
                  <Avatar
                    radius='xl'
                    size={24}
                    color='gray'
                    variant='light'
                  >
                    +{assignees.length - 1}
                  </Avatar>
                </Tooltip>
              )}
            </Group>
          ) : (
            <Text size='xs' c='dimmed'>-</Text>
          )}
        </Table.Td>
        <Table.Td>{`${Math.round(task.progress_task ?? 0)}%`}</Table.Td>
        <Table.Td>
          {tags.length ? (
            <Tooltip
              label={`Tags: [${tags.map(l => l.name).join(', ')}]`}
              withArrow
              color='blue'
            >
              <Group gap='xs' wrap='wrap'>
                {tags.slice(0, 1).map(label => (
                  <Badge
                    key={label.id || label.name}
                    color={label.color || 'gray'}
                    variant='light'
                    size='sm'
                  >
                    {label.name}
                  </Badge>
                ))}
                {tags.length > 3 && (
                  <Badge variant='outline' size='sm'>
                    +{tags.length - 3} more
                  </Badge>
                )}
              </Group>
            </Tooltip>
          ) : (
            <Text size='xs' c='dimmed'>-</Text>
          )}
        </Table.Td>

      </Table.Tr>
    );
  });

  const Source = tasks || group?.tasks || [];
  // console.log('TaskGroupDetails Source tasks:', Source);
  const toNumber = value => {
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
  };
  const volumeValue = Source.reduce((sum, t) => sum + toNumber(t.volume), 0);
  const totalValue = Source.reduce((sum, t) => sum + toNumber(t.budget_task_plan), 0);

  return (
    <Paper p='md'>
      <Table striped withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>No</Table.Th>
            <Table.Th>Task</Table.Th>
            <Table.Th>Start</Table.Th>
            <Table.Th>End</Table.Th>
            <Table.Th>Volume</Table.Th>
            <Table.Th>Unit Cost</Table.Th>
            <Table.Th>Total Cost</Table.Th>
            <Table.Th>Predecessors</Table.Th>
            <Table.Th>Teams</Table.Th>
            <Table.Th>Progress</Table.Th>
            <Table.Th>Tags</Table.Th>

          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rows.length ? rows : (
            <Table.Tr>
              <Table.Td colSpan={14}>
                <Text ta='center' c='dimmed'>No tasks in this group.</Text>
              </Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>

      <Table mt='lg' withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Totals</Table.Th>
            <Table.Th>Value</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          <Table.Tr>
            <Table.Td fw={600}>Total Volume Groups ( SUM(Volume Task X-Z) )</Table.Td>
            <Table.Td>{volumeValue}</Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td fw={600}>Total Cost Groups ( SUM(Cost Task X-Z) )</Table.Td>
            <Table.Td>{currency.format(totalValue)}</Table.Td>
          </Table.Tr>
        </Table.Tbody>
      </Table>
    </Paper>
  );
}

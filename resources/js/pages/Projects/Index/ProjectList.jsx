import { Table, Text, Group, Avatar, Tooltip } from '@mantine/core';
import { getInitials } from '@/utils/user';
import { stopOnIgnoreLink } from '@/utils/domEvents';
import { Link } from '@inertiajs/react';
import ProjectCardActions from './ProjectCardActions';

export default function ProjectList({ item, onEdit }) {
  return (
    <Table.Tr
      key={item.id}
      onClick={stopOnIgnoreLink}
    >
      <Table.Td>{item.code}</Table.Td>
      <Table.Td>
        <Link
          href={route('projects.tasks', item.id)}
          onClick={stopOnIgnoreLink}
        >
          <Text fw={600}>{item.name}</Text>
        </Link>
      </Table.Td>
      <Table.Td>{item.clientCompany?.name}</Table.Td>
      <Table.Td>
        <Group spacing='sm'>
          {item.users_with_access?.slice(0, 4).map(user => (
            <Tooltip
              key={user.id}
              label={user.name}
              withArrow
            >
              <Avatar
                size='sm'
                src={user.avatar}
              >
                {getInitials(user.name)}
              </Avatar>
            </Tooltip>
          ))}
          {item.users_with_access?.length > 4 && (
            <Avatar size='sm'>+{item.users_with_access.length - 4}</Avatar>
          )}
        </Group>
      </Table.Td>
      <Table.Td>
        {item.completed_tasks_count} / {item.all_tasks_count}
      </Table.Td>
      <Table.Td>{item.status}</Table.Td>
      <Table.Td>
        <ProjectCardActions
          item={item}
          onEdit={onEdit}
        />
      </Table.Td>
    </Table.Tr>
  );
}

import TableRowActions from '@/components/TableRowActions';
import { getInitials } from '@/utils/user';
import { Link } from '@inertiajs/react';
import { Avatar, Badge, Group, Table, Text } from '@mantine/core';

export default function TableRow({ item, onEdit }) {
  return (
    <Table.Tr key={item.id}>
      <Table.Td>
        <Group gap='sm'>
          <Avatar
            src={item.avatar}
            size={40}
            radius={40}
            color='blue'
            alt={item.name}
          >
            {getInitials(item.name)}
          </Avatar>
          <div>
            <Text
              fz='sm'
              fw={500}
            >
              {item.name || '-'}
            </Text>
            <Text
              fz='xs'
              c='dimmed'
            >
              {item.job_title || '-'}
            </Text>
          </div>
        </Group>
      </Table.Td>
      <Table.Td>
        <Text fz='sm'>{item.email || '-'}</Text>
      </Table.Td>
      <Table.Td>
        <Text fz='sm'>{item.phone || '-'}</Text>
      </Table.Td>
      <Table.Td>
        <Text fz='sm'>{item.address || '-'}</Text>
      </Table.Td>
      <Table.Td>
        <Group gap='sm'>
          {item.companies.map(item => (
            <Link
              href={route('clients.companies.edit', item.id)}
              key={item.id}
            >
              <Badge
                variant='light'
                color='grape'
                tt='unset'
              >
                {item.name}
              </Badge>
            </Link>
          ))}
        </Group>
      </Table.Td>
      {(can('edit client user') || can('archive client user') || can('restore client user') || can('delete client user')) && (
        <Table.Td>
          <TableRowActions
            item={item}
            onEdit={onEdit}
            editPermission='edit client user'
            archivePermission='archive client user'
            restorePermission='restore client user'
            archive={{
              route: 'clients.users.destroy',
              title: 'Archive client',
              content: `Are you sure you want to archive this client "${item.name}"? This action will prevent
                the client from logging in, while all other aspects related to the
                client's actions will remain unaffected.`,
              confirmLabel: 'Archive',
            }}
            restore={{
              route: 'clients.users.restore',
              title: 'Restore client',
              content: `Are you sure you want to restore this client "${item.name}"? This action will allow the client to login.`,
              confirmLabel: 'Restore',
            }}
            destroy={{
              route: 'clients.users.forceDelete',
              title: 'Delete client',
              content: `Are you sure you want to permanently delete this client "${item.name}"? This action cannot be undone.`,
              confirmLabel: 'Delete',
            }}
          />
        </Table.Td>
      )}
    </Table.Tr>
  );
}

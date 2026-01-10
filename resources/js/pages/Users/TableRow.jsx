import RoleBadge from '@/components/RoleBadge';
import TableRowActions from '@/components/TableRowActions';
import { getInitials } from '@/utils/user';
import { Avatar, Flex, Group, Table, Text } from '@mantine/core';

export default function TableRow({ item, onEdit }) {
  return (
    <Table.Tr key={item.id}>
      <Table.Td style={{ whiteSpace: 'normal', overflow: 'visible' }}>
        <Group
          gap='sm'
          align='center'
          wrap='nowrap'
        >
          <Avatar
            src={item.avatar}
            size={40}
            radius={40}
            color='blue'
            alt={item.name}
          >
            {getInitials(item.name)}
          </Avatar>
          <Text
            fz='sm'
            fw={500}
          >
            {item.name || '-'}
          </Text>
        </Group>
      </Table.Td>
      <Table.Td style={{ whiteSpace: 'normal', overflow: 'visible' }}>
        <Flex
          gap='sm'
          align='start'
          wrap='wrap'
        >
          {item.roles.map((role, index) => (
            <RoleBadge
              role={role}
              key={`role-${index}-${item.id}`}
            />
          ))}
        </Flex>
      </Table.Td>
      <Table.Td>
        <Text fz='sm'>{item.email || '-'}</Text>
      </Table.Td>
      <Table.Td>
        <Text fz='sm'>
          {item.email_verified_at ? new Date(item.email_verified_at).toLocaleString() : '-'}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text fz='sm'>{item.phone || '-'}</Text>
      </Table.Td>
      <Table.Td>
        <Text fz='sm'>{item.address || '-'}</Text>
      </Table.Td>

      {(can('edit user') || can('archive user') || can('restore user') || can('delete user')) && (
        <Table.Td>
          <TableRowActions
            item={item}
            onEdit={onEdit}
            editPermission='edit user'
            archivePermission='archive user'
            restorePermission='restore user'
            archive={{
              route: 'users.destroy',
              title: 'Archive user',
              content: `Are you sure you want to archive the user "${item.name}"? This action will prevent the user from logging in, while all other aspects related to their actions will remain unaffected.`,
              confirmLabel: 'Archive',
            }}
            restore={{
              route: 'users.restore',
              title: 'Restore user',
              content: `Are you sure you want to restore this user "${item.name}"? This action will allow the user to login.`,
              confirmLabel: 'Restore',
            }}
            destroy={{
              route: 'users.forceDelete',
              title: 'Delete user',
              content: `Are you sure you want to delete the user "${item.name}"? This action cannot be undone.`,
              confirmLabel: 'Delete',
            }}
          />
        </Table.Td>
      )}
    </Table.Tr>
  );
}

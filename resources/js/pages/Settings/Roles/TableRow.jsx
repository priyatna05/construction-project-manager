import TableRowActions from '@/components/TableRowActions';
import { Table, Text } from '@mantine/core';

export default function TableRow({ item, onEdit }) {
  const isLocked = role => {
    return ['admin', 'client'].includes(role);
  };

  return (
    <Table.Tr key={item.id}>
      <Table.Td>
        <Text
          fz='sm'
          tt='capitalize'
          c={isLocked(item.name) ? 'Blue' : ''}
        >
          {item.name}
        </Text>
      </Table.Td>
      <Table.Td w={165}>
        <Text fz='sm'>{item.permissions_count}</Text>
      </Table.Td>
      {(can('edit role') || can('archive role') || can('restore role') || can('delete role')) &&
        item.name !== 'admin' && (
          <Table.Td w={100}>
            <TableRowActions
              item={item}
              onEdit={onEdit}
              editPermission='edit role'
              archivePermission='archive role'
              restorePermission='restore role'
              archive={{
                route: 'settings.roles.destroy',
                title: 'Archive role',
                content: `Are you sure you want to archive this role "${item.name}"?`,
                confirmLabel: 'Archive',
              }}
              restore={{
                route: 'settings.roles.restore',
                title: 'Restore role',
                content: `Are you sure you want to restore this role "${item.name}"?`,
                confirmLabel: 'Restore',
              }}
              destroy={{
                route: 'settings.roles.forceDelete',
                title: 'Delete role',
                content: `Are you sure you want to delete this role "${item.name}"?`,
                confirmLabel: 'Delete',
              }}
            />
          </Table.Td>
        )}
    </Table.Tr>
  );
}

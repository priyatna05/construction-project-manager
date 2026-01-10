import TableRowActions from '@/components/TableRowActions';
import { ColorSwatch, Group, Table, Text } from '@mantine/core';
import { getIcon } from '@/components/helperLabel';

export default function TableRow({ item, onEdit }) {

  return (
    <Table.Tr>
      <Table.Td>
        {item.type
    ? item.type
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // kapital huruf pertama tiap kata
        .join(' ')
    : '-'}
        </Table.Td>
      <Table.Td>
        <Group
          gap='xs'
          wrap='nowrap'
        >
          {/* Warna label */}
          <ColorSwatch
            color={item.color}
            size={14}
          />

          {/* Icon */}
          {item.icon && getIcon(item.icon, { size: 16, color: item.color })}

          {/* Nama label */}
          <Text fz='sm'>{item.name}</Text>
        </Group>
      </Table.Td>
      {(can('edit label') ||
        can('archive label') ||
        can('restore label') ||
        can('delete label')) && (
        <Table.Td w={100}>
          <TableRowActions
            item={item}
            onEdit={onEdit}
            editPermission='edit label'
            archivePermission='archive label'
            restorePermission='restore label'
            archive={{
              route: 'settings.labels.destroy',
              title: 'Archive label',
              content: `Are you sure you want to archive this label "${item.name}"?`,
              confirmLabel: 'Archive',
            }}
            restore={{
              route: 'settings.labels.restore',
              title: 'Restore label',
              content: `Are you sure you want to restore this label "${item.name}"?`,
              confirmLabel: 'Restore',
            }}
            destroy={{
              route: 'settings.labels.forceDelete',
              title: 'Delete label',
              content: `Are you sure you want to delete this label "${item.name}"?`,
              confirmLabel: 'Delete',
            }}
          />
        </Table.Td>
      )}
    </Table.Tr>
  );
}

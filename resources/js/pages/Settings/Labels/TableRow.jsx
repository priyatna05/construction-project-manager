import TableRowActions from '@/components/TableRowActions';
import { ColorSwatch, Table, Text } from '@mantine/core';

export default function TableRow({ item, onEdit }) {
  return (
    <Table.Tr>
      <Table.Td w={80}>
        <Text fz='sm'>{item.type}</Text>
      </Table.Td>
      <Table.Td>
        <ColorSwatch color={item.color} />
      </Table.Td>
      <Table.Td>
        <Text fz='sm'>{item.name}</Text>
      </Table.Td>
      <Table.Td>
        <Text fz='sm'>{item.slug}</Text>
      </Table.Td>
      <Table.Td>
        <Text fz='sm'>{item.icon}</Text>
      </Table.Td>
      {(can('edit label') || can('archive label') || can('restore label') || can('delete label')) && (
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

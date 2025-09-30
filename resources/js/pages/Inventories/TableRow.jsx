import TableRowActions from '@/components/TableRowActions';
import { Flex, Table, Text } from '@mantine/core';
import { LabelDisplay } from '@/components/helperLabel';
import { money } from '@/utils/currency';

export default function TableRow({ item, onEdit }) {
  if (!item) {
    return null;
  }
  return (
    <Table.Tr key={item.id}>
      <Table.Td>
        <Text
          gap='sm'
          align='start'
          wrap='wrap'
        >
          {item.code}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text
          gap='sm'
          align='start'
          wrap='wrap'
        >
          {item.location_site_on_project?.name || '-'}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text
          gap='sm'
          align='start'
          wrap='wrap'
        >
          {item.name}
        </Text>
      </Table.Td>
      <Table.Td>{item.description}</Table.Td>
      <Table.Td style={{ whiteSpace: 'normal', overflow: 'visible' }}>
        <Flex
          gap='sm'
          align='start'
          wrap='wrap'
        >
          {Math.round(item.quantity_on_hand)}
        </Flex>
      </Table.Td>
      <Table.Td style={{ whiteSpace: 'normal', overflow: 'visible' }}>
        <Flex
          gap='sm'
          align='start'
          wrap='wrap'
        >
          <LabelDisplay label={item.type} />
        </Flex>
      </Table.Td>
      <Table.Td>
        <Text
          gap='sm'
          align='start'
          wrap='wrap'
        >
          <LabelDisplay label={item.unit} />
        </Text>
      </Table.Td>
      <Table.Td>
        <Text
          gap='sm'
          align='start'
          wrap='wrap'
        >
          {money(Math.round(item.unit_cost))}
        </Text>
      </Table.Td>
      {/* <Table.Td style={{ whiteSpace: 'normal', overflow: 'visible' }}>
        <Flex
          gap='sm'
          align='start'
          wrap='wrap'
        >
         <StatusBadge label={item.status} />
        </Flex>
      </Table.Td> */}
      {(can('edit inventory') || can('archive inventory') || can('restore inventory') || can('delete inventory')) && (
        <Table.Td>
          <TableRowActions
            item={item}
            onEdit={onEdit}
            editPermission='edit inventory'
            archivePermission='archive inventory'
            restorePermission='restore inventory'
            deletePermission='delete inventory'
            archive={{
              route: 'inventories.destroy',
              title: 'Archive inventories',
              content: `Are you sure you want to archive this inventory "${item.name}"? This action will prevent
                the user from logging in, while all other aspects related to the
                inventories actions will remain unaffected.`,
              confirmLabel: 'Archive',
            }}
            restore={{
              route: 'inventories.restore',
              title: 'Restore inventories',
              content: `Are you sure you want to restore this inventory "${item.name}"? This action will allow the inventory be actived.`,
              confirmLabel: 'Restore',
            }}
            destroy={{
              route: 'inventories.forceDelete',
              title: 'Delete inventories',
              content: `Are you sure you want to delete this inventory "${item.name}"? This action will remove form database`,
              confirmLabel: 'Delete',
            }}
          />
        </Table.Td>
      )}
    </Table.Tr>
  );
}

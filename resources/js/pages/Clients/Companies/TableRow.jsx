import TableRowActions from '@/components/TableRowActions';
import { Avatar, AvatarGroup, Group, Table, Text, Tooltip } from '@mantine/core';
import { getInitials } from '@/utils/user';

export default function TableRow({ item, onEdit }) {
  const companyAvatar = item.logo || item.avatar_url || item.logo_url || null;

  return (
    <Table.Tr key={item.id}>
      <Table.Td>
        <Group>
          <Tooltip
            label={item.name}
            withArrow
            withinPortal
            zIndex={2200}
            openDelay={250}
          >
          <Avatar
            src={companyAvatar}
            alt={item.name}
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              objectFit: 'cover',
            }}
            >
            {!companyAvatar && getInitials(item.name || '')}
          </Avatar>
            </Tooltip>
        </Group>
      </Table.Td>
      <Table.Td>
        <AvatarGroup>
          {item.clients.map(client => {
            const clientAvatar = client.avatar || client.avatar_url || null;
              return (
                <Tooltip
                  key={client.id}
                  label={client.name}
                  withArrow
                  withinPortal
                  zIndex={2200}
                  openDelay={250}
                >
                <Avatar
                  radius='xl'
                  src={clientAvatar}
                  alt={client.name}
                >
                  {!clientAvatar && getInitials(client.name || '')}
                </Avatar>
              </Tooltip>
            );
          })}
        </AvatarGroup>
      </Table.Td>
      <Table.Td>
        <Text
          fz='sm'
          fw={500}
        >
          {item.name}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text fz='sm'>{item.currency ? `${item.currency.symbol} ${item.currency.code}` : ''}</Text>
      </Table.Td>
      <Table.Td>
        <Text fz='sm'>{item.email || '-'}</Text>
      </Table.Td>
      <Table.Td>
        <Text fz='sm'>{item.phone || '-'}</Text>
      </Table.Td>
      <Table.Td>
        <Text fz='sm'>{item.web || '-'}</Text>
      </Table.Td>
      <Table.Td>
        <Text fz='sm'>
          {[item.address, item.city, item.postal_code, item.country?.name]
            .filter(Boolean)
            .join(', ') || '-'}
        </Text>
      </Table.Td>
      {(can('edit client company') ||
        can('archive client company') ||
        can('restore client company') ||
        can('delete client company')) && (
        <Table.Td>
          <TableRowActions
            item={item}
            onEdit={onEdit}
            editPermission='edit client company'
            archivePermission='archive client company'
            restorePermission='restore client company'
            archive={{
              route: 'clients.companies.destroy',
              title: 'Archive company',
              content: `Are you sure you want to archive this company "${item.name}"?`,
              confirmLabel: 'Archive',
            }}
            restore={{
              route: 'clients.companies.restore',
              title: 'Restore company',
              content: `Are you sure you want to restore this company "${item.name}"?`,
              confirmLabel: 'Restore',
            }}
            destroy={{
              route: 'clients.companies.forceDelete',
              title: 'Delete company',
              content: `Are you sure you want to permanently delete this company "${item.name}"? This action cannot be undone.`,
              confirmLabel: 'Delete',
            }}
          />
        </Table.Td>
      )}
    </Table.Tr>
  );
}

import { LabelDisplay } from '@/components/helperLabel';
import { Table, NumberInput, TextInput, ActionIcon, Tooltip, Group, Select } from '@mantine/core';
import { IconEdit, IconCheck, IconTrash } from '@tabler/icons-react';

export default function TableRow({
  index, item, selected, onChange,
  editing, toggleEdit, saveEdit, confirmDelete, handleQtyChange, disabled = false,
}) {
  const isEditing = editing.has(item.id) && !disabled;

  return (
    <Table.Tr>
      <Table.Td>{index + 1}</Table.Td>
      <Table.Td>{item.code || '-'}</Table.Td>
      <Table.Td>
        <Select
          data={[{ value: item.name, label: item.name }]}
          value={item.name}
          disabled
          variant="unstyled"
          size="sm"
        />
      </Table.Td>
      <Table.Td>
        <LabelDisplay label={item.type || '-'}/>
      </Table.Td>
      <Table.Td>
        <LabelDisplay label={item.unit || '-'}/>
      </Table.Td>
      <Table.Td>
        {item.unit_cost
          ? new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(item.unit_cost)
          : '-'
        }
      </Table.Td>
      <Table.Td>
        <NumberInput
          value={item.quantity}
          onChange={value => handleQtyChange(item.id, value)}
          min={0}
          max={item.quantity_on_hand}
          hideControls
          disabled={!isEditing}
        />
      </Table.Td>
      <Table.Td>
        {item.quantity && item.unit_cost
          ? new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(item.quantity * item.unit_cost)
          : '-'
        }
      </Table.Td>
      <Table.Td>
        <TextInput
          value={item.note || item.notes || ''}
          placeholder="Add a note..."
          disabled={!isEditing}
          onChange={e =>
            onChange(
              selected.map(res =>
                res.id === item.id ? { ...res, note: e.currentTarget.value, notes: e.currentTarget.value } : res
              ),
              true // Skip flash for individual changes
            )
          }
        />
      </Table.Td>
      <Table.Td>
        <Group gap="xs" wrap="nowrap">
          {isEditing ? (
            <Tooltip label="Save changes" withArrow
            position='top'
            color='green'>
              <ActionIcon color="green" onClick={() => saveEdit(item.id)} variant="filled" size="sm" disabled={disabled}>
                <IconCheck size={14} />
              </ActionIcon>
            </Tooltip>
          ) : (
              <Tooltip label="Edit resource" withArrow
            position='top'
            color='blue'>
                <ActionIcon color="blue" onClick={() => toggleEdit(item.id)} variant="filled" size="sm" disabled={disabled}>
                  <IconEdit size={14} />
                </ActionIcon>
              </Tooltip>
          )}
            <Tooltip label="Delete resource" withArrow
            position='top'
            color='red'>
              <ActionIcon color="red" onClick={() => confirmDelete(item)} size="sm" variant="filled" disabled={disabled}>
                <IconTrash size={14} />
              </ActionIcon>
            </Tooltip>
        </Group>
      </Table.Td>
    </Table.Tr>
  );
}

import { Table, Select, NumberInput, TextInput, ActionIcon, Group, Tooltip } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';

export default function AddRow({
  index,
  availableResources,
  autocompleteOptions,
  newResource,
  setNewResource,
  setAdding,
  selected,
  onChange,
  disabled = false,
}) {
  const handleSave = () => {
    if (disabled) return;
    if (newResource) {
      onChange([...selected, { ...newResource, quantity: newResource.quantity || 1, note: newResource.note || newResource.notes || '', notes: newResource.note || newResource.notes || '' }]);
      setAdding(false);
      setNewResource(null);
    }
  };

  return (
    <Table.Tr style={{ backgroundColor: '#f8f9fa' }}>
      <Table.Td>{index}</Table.Td>
      <Table.Td>{newResource?.code || '-'}</Table.Td>
      <Table.Td>
        <Select
          placeholder='Select resource'
          data={autocompleteOptions}
          value={newResource?.id?.toString() || ''}
          disabled={disabled}
          onChange={val => {
            const res = availableResources.find(r => r.id.toString() === val);
            setNewResource(res || null);
          }}
          searchable
          clearable
          maxDropdownHeight={200}
          styles={{
            dropdown: { zIndex: 9999 },
          }}
        />
      </Table.Td>
      <Table.Td>{newResource?.type?.name || newResource?.type || '-'}</Table.Td>
      <Table.Td>{newResource?.unit?.slug || '-'}</Table.Td>
      <Table.Td>
        {newResource?.unit_cost
          ? new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(newResource?.unit_cost)
          : '-'
        }
      </Table.Td>
      <Table.Td>
        <NumberInput
          placeholder='Qty'
          min={0}
          max={newResource?.quantity_on_hand || 0}
          hideControls
          value={newResource?.quantity || 1}
          disabled={disabled}
          onChange={val => setNewResource(prev => (prev ? { ...prev, quantity: val } : null))}
        />
      </Table.Td>
      <Table.Td>{newResource ? newResource.quantity * newResource.unit_cost || '-' : '-'}</Table.Td>
      <Table.Td>
        <TextInput
          placeholder='Add a note...'
          value={newResource?.note || newResource?.notes || ''}
          disabled={disabled}
          onChange={e => setNewResource(prev => (prev ? { ...prev, note: e.target.value, notes: e.target.value } : null))}
        />
      </Table.Td>
      <Table.Td>
        <Group
          gap='xs'
          wrap='nowrap'
        >
          <Tooltip label='Save' withArrow
            position='top'
            color='green'>
            <ActionIcon
              color='green'
              variant='filled'
              size='sm'
              onClick={handleSave}
              disabled={!newResource || disabled}
            >
              <IconCheck size={14} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label='Cancel' withArrow
            position='top'
            color='red'>
            <ActionIcon
              color='red'
              variant='filled'
              size='sm'
              onClick={() => setAdding(false)}
            >
              <IconX size={14} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Table.Td>
    </Table.Tr>
  );
}

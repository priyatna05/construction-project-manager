import { openConfirmModal } from '@/components/ConfirmModal';
import {
  Title,
  Text,
  UnstyledButton,
  Autocomplete,
  Box,
  NumberInput,
  Modal,
  Table,
  ActionIcon,
  Group,
  TextInput,
  Tooltip,
  Badge,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useState, useMemo } from 'react';
import { IconSettings, IconTrash, IconSearch, IconFilter } from '@tabler/icons-react';

export default function ResourcesPlanner({
  selected = [],
  onChange,
  availableResources = [],
  ...props
}) {
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [searchValue, setSearchValue] = useState('');
  const [modalSearchTerm, setModalSearchTerm] = useState('');

  // Filter daftar yang ditampilkan di modal berdasarkan pencarian
  const filteredSelected = useMemo(() => {
    if (!modalSearchTerm) return selected;
    return selected.filter(item =>
      item.name.toLowerCase().includes(modalSearchTerm.toLowerCase())
    );
  }, [selected, modalSearchTerm]);

  // Daftar resource yang belum dipilih (untuk autocomplete)
  const autocompleteOptions = useMemo(() => {
    const selectedIds = selected.map(s => s.id.toString());
    return availableResources
      .filter(res => !selectedIds.includes(res.id.toString()))
      .map(res => ({
        value: res.id.toString(),
        label: `${res.name} (Stok: ${res.quantity_on_hand} ${res.unit?.slug || ''})`,
      }));
  }, [availableResources, selected]);

  // Tambah resource saat user memilih dari autocomplete
  const handleAddResource = val => {
    const resource =
      availableResources.find(r => r.id.toString() === val) ||
      availableResources.find(r => r.name === val);
    if (!resource) return;

    const alreadySelected = selected.some(s => s.id === resource.id);
    if (!alreadySelected) {
      onChange([...selected, { ...resource, quantity: 1 }]);
    }

    setSearchValue('');
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    const updatedSelection = selected.map(item =>
      item.id === itemId ? { ...item, quantity: parseFloat(newQuantity) || 0 } : item
    );
    onChange(updatedSelection);
  };

  const confirmDeleteResource = resource => {
    openConfirmModal({
      type: 'danger',
      title: 'Delete Resource Allocation',
      content: (
        <Text size="sm">
          Are you sure you want to remove{' '}
          <Text span fw={700}>
            {resource.name}
          </Text>{' '}
          from this task? This action cannot be undone.
        </Text>
      ),
      confirmLabel: 'Delete',
      onConfirm: () => {
        const updatedSelection = selected.filter(item => item.id !== resource.id);
        onChange?.(updatedSelection);
      },
    });
  };

  return (
    <Box {...props}>
      {/* Header */}
      <Group justify="space-between" align="center">
        <UnstyledButton
          onClick={openModal}
          leftSection={<IconSettings size={16} />}
          disabled={selected.length === 0}
        >
          <Title order={4} mt="md">
            Resources Task
            <Text c="dimmed" fw={300} display="inline-block" ml={5}>
              ({selected.length})
            </Text>
          </Title>
        </UnstyledButton>
      </Group>

      {/* Autocomplete Input */}
      <Autocomplete
        mt="xs"
        placeholder="Search and add resources..."
        value={searchValue}
        onChange={setSearchValue}
        onOptionSubmit={handleAddResource}
        data={autocompleteOptions}
        nothingFound="No resources found"
        clearable
        searchable
      />

      {/* Badge Preview */}
      <Group mt="sm" gap="xs" wrap="wrap">
        {selected.map(item => (
          <Badge
            key={item.id}
            variant="light"
            color="blue"
            rightSection={
              <ActionIcon
                size="xs"
                color="blue"
                variant="subtle"
                onClick={() => confirmDeleteResource(item)}
              >
                <IconTrash size={12} />
              </ActionIcon>
            }
          >
            {item.name}
          </Badge>
        ))}
      </Group>

      {/* Modal */}
      <Modal
        opened={modalOpened}
        onClose={closeModal}
        title="Manage Allocated Resources"
        size="xl"
      >
        <Group justify="space-between" mb="md">
          <TextInput
            placeholder="Search allocated items..."
            leftSection={<IconSearch size={16} />}
            value={modalSearchTerm}
            onChange={e => setModalSearchTerm(e.target.value)}
          />
          <Tooltip label="Filter (coming soon)">
            <ActionIcon variant="default">
              <IconFilter size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>

        <Table striped withBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Resource Name</Table.Th>
              <Table.Th>Stock</Table.Th>
              <Table.Th>Allocated Qty</Table.Th>
              <Table.Th>Unit</Table.Th>
              <Table.Th>Notes</Table.Th>
              <Table.Th>Action</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {filteredSelected.map(item => (
              <Table.Tr key={item.id}>
                <Table.Td>{item.name}</Table.Td>
                <Table.Td>{item.quantity_on_hand}</Table.Td>
                <Table.Td>
                  <NumberInput
                    value={item.quantity}
                    onChange={value => handleQuantityChange(item.id, value)}
                    min={0}
                    max={item.quantity_on_hand}
                    step={1}
                    hideControls
                    styles={{ input: { width: '80px' } }}
                  />
                </Table.Td>
                <Table.Td>{item.unit?.slug || '-'}</Table.Td>
                <Table.Td>
                  <TextInput
                    value={item.notes || ''}
                    placeholder="Add a note..."
                    onChange={e => {
                      const updatedSelection = selected.map(res =>
                        res.id === item.id ? { ...res, notes: e.currentTarget.value } : res
                      );
                      onChange(updatedSelection);
                    }}
                    variant="unstyled"
                  />
                </Table.Td>
                <Table.Td>
                  <ActionIcon
                    color="red"
                    onClick={() => confirmDeleteResource(item)}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>

        {filteredSelected.length === 0 && (
          <Text c="dimmed" ta="center" p="md">
            No resources found.
          </Text>
        )}
      </Modal>
    </Box>
  );
}

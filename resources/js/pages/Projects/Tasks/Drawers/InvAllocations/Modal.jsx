import {
  Group,
  Text,
  Table,
  rem,
  Center,
  Box,
} from '@mantine/core';
import { IconReorder } from '@tabler/icons-react';
import AddRow from './AddRow';
import TableRow from './TableRow';
import Toolbar from './Toolbar';
import Modal from '@/components/Modal';

export default function ModalInvAllocations({
  opened,
  close,
  modalSearch,
  setModalSearch,
  filteredSelected,
  adding,
  setAdding,
  newResource,
  setNewResource,
  selected,
  onChange,
  availableResources,
  autocompleteOptions,
  confirmDelete,
  editing,
  toggleEdit,
  saveEdit,
  handleQtyChange,
  sortOption,
  setSortOption,
  disabled = false,
}) {
  const modalZIndex = 2300;
  const isDisabled = Boolean(disabled);

  return (
    <Modal
      opened={opened}
      onClose={close}
      centered
      draggable
      zIndex={modalZIndex}
      closeButtonProps={{ style: { position: 'absolute', top: 12, right: 12 } }}
      overlayProps={{ backgroundOpacity: 0.0, blur: 0, zIndex: modalZIndex }}
      transitionProps={{ transition: 'fade', duration: 200 }}
      styles={{
        content: {
          backgroundColor: '#fff',
          color: '#000',
          borderRadius: '10px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        },
        header: {
          backgroundColor: '#fff',
          borderBottom: 'none',
          paddingBottom: '0.5rem',
        },
        title: {
          color: '#000',
          fontWeight: 600,
        },
      }}
      title={
        <Group
          gap={10}
          align='center'
        >
          <IconReorder
            size={50}
            color='blue'
          />
          <div>
            <Text
              fz={rem(22)}
              fw={600}
            >
              Allocated Resources
            </Text>
            <Text
              fz='sm'
              c='dimmed'
            >
              Allocate inventory resources needed for this task
            </Text>
          </div>
        </Group>
      }
      size='auto'
    >
      <Center>
        <Box
          w='auto'
          mt='lg'
          pb='lg'
          ml='lg'
          mr='lg'
        >
          <Toolbar
            sortOption={sortOption}
            setSortOption={setSortOption}
            modalSearch={modalSearch}
            setModalSearch={setModalSearch}
            onAdd={isDisabled ? undefined : () => setAdding(true)}
            disabled={isDisabled}
          />

          <Table
            highlightOnHover
            withTableBorder
            withColumnBorders
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th>No</Table.Th>
                <Table.Th>Code</Table.Th>
                <Table.Th>Resource Name</Table.Th>
                <Table.Th>Type</Table.Th>
                <Table.Th>Unit</Table.Th>
                <Table.Th>Unit Cost</Table.Th>
                <Table.Th>Qty</Table.Th>
                <Table.Th>SubTotal</Table.Th>
                <Table.Th>Notes / Remark</Table.Th>
                <Table.Th>Action</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {!isDisabled && adding && (
                <AddRow
                  index={filteredSelected.length + 1}
                  availableResources={availableResources}
                  autocompleteOptions={autocompleteOptions}
                  newResource={newResource}
                  setNewResource={setNewResource}
                  setAdding={setAdding}
                  selected={selected}
                  onChange={onChange}
                  disabled={isDisabled}
                />
              )}
              {filteredSelected.map((item, i) => (
                <TableRow
                  key={item.id}
                  index={i}
                  item={item}
                  selected={selected}
                  onChange={onChange}
                  editing={editing}
                  toggleEdit={toggleEdit}
                  saveEdit={saveEdit}
                  confirmDelete={confirmDelete}
                  handleQtyChange={handleQtyChange}
                  disabled={isDisabled}
                />
              ))}
            </Table.Tbody>
          </Table>

          {filteredSelected.length === 0 && (
            <Text
              c='dimmed'
              ta='center'
              p='md'
            >
              No resources found.
            </Text>
          )}
        </Box>
      </Center>
    </Modal>
  );
}

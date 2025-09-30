import ActionButton from '@/components/ActionButton';
import ArchivedFilterButton from '@/components/ArchivedFilterButton';
import Pagination from '@/components/Pagination';
import TableHead from '@/components/TableHead';
import TableRowEmpty from '@/components/TableRowEmpty';
import Layout from '@/layouts/MainLayout';
import { reloadWithQuery } from '@/utils/route';
import { actionColumnVisibility, prepareColumns } from '@/utils/table';
import { usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Grid, Group, Select, TextInput, Title, Button, Table, NumberInput } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import TableRow from './TableRow';
import Modal from '@/components/Modal';
import useModal from '@/components/useModal';
import useForm from '@/hooks/useForm';
import Card from '@/components/Card';
import {
  formatLabelsForDropdown,
  renderSelectOptionWithIcon,
  getIcon,
} from '@/components/helperLabel';
import useWebSockets from '@/hooks/useWebSockets';

const InventoryIndex = () => {
  const { items, types, units } = usePage().props;
  const [inventoryItems, setInventoryItems] = useState(items.data || []);
  const { opened, open, close } = useModal();
  const [editingInventory, setEditingInventory] = useState(null);
  const sort = value => reloadWithQuery(value);

  const [form, submit, updateValue] = useForm('post', route('inventories.store'), {
    name: '',
    description: '',
    type: '',
    unit: '',
    unit_cost: '',
    quantity_on_hand: '',
  });

  const { initInventoryWebSocket } = useWebSockets();

  useEffect(() => {
    const unsubscribe = initInventoryWebSocket(updatedInventory => {
      setInventoryItems(prevItems => {
        const exists = prevItems.some(item => item.id === updatedInventory.id);
        return exists
          ? prevItems.map(item => (item.id === updatedInventory.id ? updatedInventory : item))
          : [updatedInventory, ...prevItems];
      });
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (editingInventory) {
      form.setMethod('put');
      form.setAction(route('inventories.update', editingInventory.id));
      form.setData({
        name: editingInventory.name || '',
        description: editingInventory.description || '',
        type: editingInventory.type?.slug || '',
        unit: editingInventory.unit?.slug || '',
        unit_cost: editingInventory.unit_cost || '',
        quantity_on_hand: editingInventory.quantity_on_hand || '',
      });
    } else {
      form.setMethod('post');
      form.setAction(route('inventories.store'));
      form.reset();
    }
  }, [editingInventory]);

  const handleCreate = () => {
    setEditingInventory(null);
    open();
  };

  const handleEdit = inventory => {
    updateValue(inventory);
    setEditingInventory(inventory);
    open();
  };

  const handleClose = () => {
    setEditingInventory(null);
    close();
  };

  const columns = prepareColumns([
    { label: 'Code', column: 'code', sticky: true, width: 150 },
    { label: 'Location on Site', column: 'location_site_on_project', sticky: true, width: 200 },
    { label: 'name', column: 'name' },
    { label: 'description', column: 'description' },
    { label: 'quantity', column: 'quantity' },
    { label: 'type', sortable: false },
    { label: 'unit', sortable: false },
    { label: 'unit cost', column: 'unit cost' },
    {
      label: 'Actions',
      sortable: false,
      visible: actionColumnVisibility('inventory'),
    },
  ]);

  const rows =
    Array.isArray(inventoryItems) && inventoryItems.length > 0 ? (
      inventoryItems.map(item => (
        <TableRow
          key={item.id}
          item={item}
          onEdit={handleEdit}
        />
      ))
    ) : (
      <TableRowEmpty colSpan={columns?.length || 1} />
    );

  const typeOptions = formatLabelsForDropdown(types);
  const unitOptions = formatLabelsForDropdown(units);

  const findLabelBySlug = (slug, labelList) => {
    if (typeof slug !== 'string') return undefined;
    return labelList.find(label => label.value.trim().toLowerCase() === slug.trim().toLowerCase());
  };

  const selectedType = findLabelBySlug(form.data.type, typeOptions);
  const selectedUnit = findLabelBySlug(form.data.unit, unitOptions);

  return (
    <>
      <Title style={{ color: 'white' }} mb='lg' >
        List of Inventories
      </Title>

      <Grid justify='space-between' align='center' mb='lg'>
        <Grid.Col span='content'>
          <Group>
            {can('create inventory') && (
              <Button
                leftSection={<IconPlus size={14} />}
                radius='xl'
                variant='default'
                onClick={handleCreate}
              >
                Create
              </Button>
            )}
            <ArchivedFilterButton />
          </Group>
        </Grid.Col>
      </Grid>

      <Card shadow='sm' withBorder my='lg' p={0}>
        <Table stickyHeader highlightOnHover>
          <TableHead columns={columns} sort={sort} />
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
        <Pagination current={items.meta.current_page} pages={items.meta.last_page} />
      </Card>

      <Modal
        key={editingInventory?.id || 'new'}
        opened={opened}
        onClose={handleClose}
        title={editingInventory ? 'Edit Inventory' : 'Create Inventory'}
      >
        <form onSubmit={e => submit(e, { onSuccess: () => handleClose() })}>
          <TextInput
            label='Name'
            placeholder='Input inventory name'
            required
            mt='md'
            value={form.data.name}
            onChange={e => updateValue('name', e.target.value)}
            error={form.errors.name}
          />

          <TextInput
            label='Description'
            placeholder='Input descriptions'
            mt='md'
            value={form.data.description}
            onChange={e => updateValue('description', e.target.value)}
            error={form.errors.description}
          />

          <Select
            label='Type'
            placeholder='Pick value Type'
            mt='md'
            required
            value={form.data.type ?? ''}
            onChange={value => updateValue('type', value)}
            data={typeOptions}
            leftSection={
              selectedType ? getIcon(selectedType.icon, { size: 18, color: selectedType.color }) : null
            }
            renderOption={renderSelectOptionWithIcon}
            error={form.errors.type}
          />

          <Select
            label='Unit'
            placeholder='Pick value Unit'
            mt='md'
            required
            value={form.data.unit ?? ''}
            onChange={value => updateValue('unit', value)}
            data={unitOptions}
            leftSection={
              selectedUnit ? getIcon(selectedUnit.icon, { size: 18, color: selectedUnit.color }) : null
            }
            renderOption={renderSelectOptionWithIcon}
            error={form.errors.unit}
          />

          <NumberInput
            label='Unit Cost'
            mt='md'
            required
            placeholder='Input unit cost'
            value={form.data.unit_cost}
            onChange={val => updateValue('unit_cost', val)}
            error={form.errors.unit_cost}
          />

          <NumberInput
            label='Quantity'
            mt='md'
            required
            placeholder='Input quantity'
            value={form.data.quantity_on_hand}
            onChange={val => updateValue('quantity_on_hand', val)}
            error={form.errors.quantity_on_hand}
          />

          <Group justify='flex-end' mt='xl'>
            <ActionButton type='submit' loading={form.processing}>
              {editingInventory ? 'Update' : 'Create'}
            </ActionButton>
          </Group>
        </form>
      </Modal>
    </>
  );
};

InventoryIndex.layout = page => <Layout title='Inventories'>{page}</Layout>;
export default InventoryIndex;

import ArchivedFilterButton from '@/components/ArchivedFilterButton';
import Pagination from '@/components/Pagination';
import TableHead from '@/components/TableHead';
import TableRowEmpty from '@/components/TableRowEmpty';
import Layout from '@/layouts/MainLayout';
import { reloadWithQuery } from '@/utils/route';
import { actionColumnVisibility, prepareColumns } from '@/utils/table';
import { usePage } from '@inertiajs/react';
import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Grid,
  Group,
  TextInput,
  Title,
  Button,
  Table,
  NumberInput,
  ActionIcon,
  Text,
  Loader,
  rem,
  Stack,
  Center,
  Box,
  Breadcrumbs,
} from '@mantine/core';
import { IconPlus, IconDeviceFloppy, IconCheck } from '@tabler/icons-react';
import TableRow from './TableRow';
import Modal from '@/components/Modal';
import useModal from '@/components/useModal';
import useForm from '@/hooks/useForm';
import Card from '@/components/Card';
import {
  formatLabelsForDropdown,
  renderSelectOptionWithIcon,
} from '@/components/helperLabel';
import {} from 'react';
import StatusSelect from '@/components/StatusSelect';

const InventoryIndex = () => {
  const { items, types, units } = usePage().props;
  const { opened, open, close } = useModal();
  const formRef = useRef(null);
  const [editingInventory, setEditingInventory] = useState(null);
  const [saved, setSaved] = useState(false);
  const sort = value => reloadWithQuery(value);

  const [form, submit, updateValue] = useForm('post', route('inventories.store'), {
    name: '',
    description: '',
    type: '',
    unit: '',
    unit_cost: '',
    quantity_on_hand: '',
  });

  // set form data ketika edit
  useEffect(() => {
    if (editingInventory) {
      form.setMethod('put');
      form.setAction(route('inventories.update', editingInventory.id));
      form.setData({
        name: editingInventory.name ?? '',
        description: editingInventory.description ?? '',
        type: editingInventory.type?.slug ?? '',
        unit: editingInventory.unit?.slug ?? '',
        unit_cost: parseFloat(editingInventory.unit_cost) || 0,
        quantity_on_hand: parseFloat(editingInventory.quantity_on_hand) || 0,
      });
    } else {
      form.setMethod('post');
      form.setAction(route('inventories.store'));
      form.reset();
    }
  }, [editingInventory]);

  const initialData = useMemo(() => {
    if (editingInventory) {
      return {
        name: editingInventory.name ?? '',
        description: editingInventory.description ?? '',
        type: editingInventory.type?.slug ?? '',
        unit: editingInventory.unit?.slug ?? '',
        unit_cost: parseFloat(editingInventory.unit_cost) || 0,
        quantity_on_hand: parseFloat(editingInventory.quantity_on_hand) || 0,
      };
    }
    return {
      name: '',
      description: '',
      type: '',
      unit: '',
      unit_cost: '',
      quantity_on_hand: '',
    };
  }, [editingInventory]);

  // Cek apakah ada perubahan dibandingkan data awal
  const hasChanged = useMemo(() => {
    const currentData = { ...form.data };
    const compareData = { ...initialData };

    // Normalize numeric fields for comparison
    ['unit_cost', 'quantity_on_hand'].forEach(field => {
      if (currentData[field] !== undefined) {
        currentData[field] = parseFloat(currentData[field]) || 0;
      }
      if (compareData[field] !== undefined) {
        compareData[field] = parseFloat(compareData[field]) || 0;
      }
    });

    return JSON.stringify(currentData) !== JSON.stringify(compareData);
  }, [form.data, initialData]);

  const processing = form.processing;
  const isEdit = !!editingInventory;

  const handleSubmit = e => {
    e.preventDefault();
    submit({
      onSuccess: () => {
        setSaved(true);
        setTimeout(() => {
          handleClose();
        }, 1500);
      },
    });
  };

  // --- TITLE BAR DINAMIS ---
  const TitleBar = (
    <Group
      align='center'
      ml='lg'
      mt='sm'
    >
      {hasChanged && (
        <ActionIcon
          onClick={handleSubmit}
          loading={processing}
          color={saved ? 'teal' : 'green'}
          radius='xl'
          size='xl'
          title='Save changes'
        >
          {processing ? (
            <Loader
              size='sm'
              color='white'
            />
          ) : saved ? (
            <IconCheck size={20} />
          ) : (
            <IconDeviceFloppy size={20} />
          )}
        </ActionIcon>
      )}
      <Stack spacing={2}>
        <Text
          fz={rem(22)}
          fw={600}
          ml={6}
        >
          {saved ? 'Saved ✓' : isEdit ? 'Update Inventory' : 'Create Inventory'}
        </Text>

        <Text
          fz='sm'
          c='dimmed'
          ml={6}
        >
          {saved
            ? 'All changes have been successfully saved.'
            : isEdit
              ? 'Update inventory details such as name, type, or quantity.'
              : 'Fill out the form below to create a new inventory item.'}
        </Text>
      </Stack>
    </Group>
  );

  // tombol create
  const handleCreate = () => {
    setEditingInventory(null);
    setSaved(false);
    open();
  };

  // tombol edit
  const handleEdit = inventory => {
    updateValue(inventory);
    setEditingInventory(inventory);
    open();
  };

  // close modal
  const handleClose = () => {
    setEditingInventory(null);
    close();
  };

  const typeOptions = formatLabelsForDropdown(types);
  const unitOptions = formatLabelsForDropdown(units);

  // ==== TABLE COLUMN ====
  const columns = prepareColumns([
    { label: 'Code', column: 'code', sticky: true, width: 150 },

    { label: 'Name', column: 'name' },
    { label: 'Description', column: 'description' },
    { label: 'Quantity', column: 'quantity_on_hand' },
    { label: 'Type', column: 'type' },
    { label: 'Unit', column: 'unit' },
    { label: 'Unit Cost', column: 'unit_cost' },
    { label: 'Status', column: 'status' },
    {
      label: 'Actions',
      sortable: false,
      visible: actionColumnVisibility('inventory'),
    },
  ]);

  const rows =
    Array.isArray(items.data) && items.data.length > 0 ? (
      items.data.map(item => (
        <TableRow
          key={item.id}
          item={item}
          onEdit={handleEdit}
        />
      ))
    ) : (
      <TableRowEmpty colSpan={columns?.length || 1} />
    );

  // ==== RENDER ====
  return (
    <>
      <Breadcrumbs
        fz={14}
        mb={30}
        separator={<Text c='white'>/</Text>}
      >
        <Text
          c='white'
          fw={500}
        >
          Inventories /
        </Text>
      </Breadcrumbs>
      <Title
        style={{ color: 'white' }}
        mb='lg'
      >
        List of Inventories
      </Title>

      <Grid
        justify='space-between'
        align='center'
        mb='lg'
      >
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

      <Card
        shadow='sm'
        withBorder
        my='lg'
        p={0}
      >
        <Table
          stickyHeader
          highlightOnHover
        >
          <TableHead
            columns={columns}
            sort={sort}
          />
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
        <Pagination
          current={items.meta.current_page}
          pages={items.meta.last_page}
        />
      </Card>

      {/* === MODAL === */}
      <Modal
        key={editingInventory?.id || 'new'}
        opened={opened}
        onClose={handleClose}
        draggable
        radius='md'
        centered
        closeButtonProps={{ style: { position: 'absolute', top: 12, right: 12 } }}
        overlayProps={{ backgroundOpacity: 0.45, blur: 6 }}
        transitionProps={{ transition: 'fade', duration: 200 }}
        title={TitleBar}
      >
        <Center>
          <Box
            w='80%'
            maw={620}
            pb='xl'
          >
            <form
              ref={formRef}
              onSubmit={handleSubmit}
            >
              {/* Basic Info */}
              <TextInput
                label='Name'
                mt='md'
                placeholder='e.g. Steel Bar 12mm'
                required
                value={form.data.name}
                onChange={e => updateValue('name', e.target.value)}
                error={form.errors.name}
              />
              <TextInput
                label='Description'
                mt='md'
                styles={{
                  input: {
                    minHeight: 80,
                    fontSize: '1rem',
                    paddingTop: 12,
                    paddingBottom: 12,
                  },
                }}
                placeholder='Short description or specifications'
                value={form.data.description}
                onChange={e => updateValue('description', e.target.value)}
                error={form.errors.description}
              />

              {/* Type & Unit */}
              <Group
                align='flex-start'
                grow
              >
                <StatusSelect
                  label='Type'
                  placeholder='Select inventory type'
                  required
                  mt='md'
                  clearable
                  value={form.data.type ?? ''}
                  onChange={value => updateValue('type', value)}
                  statuses={typeOptions}
                  renderOption={renderSelectOptionWithIcon}
                  error={form.errors.type}
                />

                <StatusSelect
                  label='Unit'
                  placeholder='Select measurement unit'
                  required
                  mt='md'
                  clearable
                  value={form.data.unit ?? ''}
                  onChange={value => updateValue('unit', value)}
                  statuses={unitOptions}
                  renderOption={renderSelectOptionWithIcon}
                  error={form.errors.unit}
                />
              </Group>

              {/* Cost & Quantity */}

              <Group
                align='flex-start'
                grow
              >
                <NumberInput
                  label='Unit Cost'
                  placeholder='Enter cost per unit'
                  required
                  mt='md'
                  thousandSeparator='.'
                  decimalSeparator=','
                  value={form.data.unit_cost}
                  onChange={val => updateValue('unit_cost', typeof val === 'string' ? parseFloat(val.replace(/\./g, '').replace(',', '.')) : val)}
                  error={form.errors.unit_cost}
                />

                <NumberInput
                  label='Quantity on Hand'
                  placeholder='Enter available quantity'
                  required
                  mt='md'
                  thousandSeparator='.'
                  decimalSeparator=','
                  value={form.data.quantity_on_hand}
                  onChange={val => updateValue('quantity_on_hand', typeof val === 'string' ? parseFloat(val.replace(/\./g, '').replace(',', '.')) : val)}
                  error={form.errors.quantity_on_hand}
                />
              </Group>
            </form>
          </Box>
        </Center>
      </Modal>
    </>
  );
};

InventoryIndex.layout = page => <Layout title='Inventories'>{page}</Layout>;
export default InventoryIndex;

import { useState, useEffect, useMemo } from 'react';
import { usePage } from '@inertiajs/react';
import {
  Button,
  Card,
  ColorInput,
  Group,
  Table,
  Title,
  Text,
  Anchor,
  TextInput,
  Grid,
  Select,
} from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import * as TablerIcons from '@tabler/icons-react';

import Layout from '@/layouts/MainLayout';
import Modal from '@/components/Modal';
import useModal from '@/components/useModal';
import useForm from '@/hooks/useForm';
import ActionButton from '@/components/ActionButton';
import Pagination from '@/components/Pagination';
import TableHead from '@/components/TableHead';
import TableRowEmpty from '@/components/TableRowEmpty';
import TableRow from './TableRow';
import ArchivedFilterButton from '@/components/ArchivedFilterButton';

import { reloadWithQuery } from '@/utils/route';
import { prepareColumns, actionColumnVisibility } from '@/utils/table';
import IconSelectOption from '@/components/IconSelectOption';

const toKebabCase = (str) =>
  str &&
  str
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    .map((x) => x.toLowerCase())
    .join('_') || '';

const LabelsIndex = () => {
  const { items } = usePage().props;
  const { opened, open, close } = useModal();
  const [editingLabel, setEditingLabel] = useState(null);

  const [form, submit, updateValue] = useForm('post', route('settings.labels.store'), {
    type: '',
    name: '',
    slug: '',
    color: '#228BE6',
    icon: '',
  });

  const labelTypes = [
    { value: 'pt_status', label: 'Project/Task Status' },
    { value: 'ptb_status', label: 'Project/Task Billing Status' },
    { value: 'task_relation', label: 'Task Relation' },
    { value: 'inventory_status_label', label: 'Inventory Status' },
    { value: 'inventory_type_label', label: 'Inventory Type' },
    { value: 'inventory_unit_label', label: 'Inventory Unit' },
    { value: 'invoice_status', label: 'Invoice Status' },
    { value: 'invoice_type', label: 'Invoice Type' },
  ];

const tablerIconOptions = useMemo(() => {
  const iconKeys = Object.keys(TablerIcons).filter(
    (key) => key.startsWith('Icon')
  );

  const options = iconKeys.map((key) => ({
    value: key,
    label: key,
  }));
  return options;
}, []);


  useEffect(() => {
    if (form.data.name) {
      const newSlug = toKebabCase(form.data.name);
      if (newSlug !== form.data.slug) {
        form.setData('slug', newSlug);
      }
    }
  }, [form.data.name]);

  useEffect(() => {
    if (editingLabel) {
      form.setData({
        type: editingLabel.type || '',
        name: editingLabel.name || '',
        slug: editingLabel.slug || '',
        color: editingLabel.color || '#228BE6',
        icon: editingLabel.icon || '',
      });
      form.setMethod('put');
      form.setAction(route('settings.labels.update', editingLabel.id));
    } else {
      form.setData({ type: '', name: '', slug: '', color: '#228BE6', icon: '' });
      form.setMethod('post');
      form.setAction(route('settings.labels.store'));
    }
    form.clearErrors();
  }, [editingLabel]);

  const handleCreate = () => {
    setEditingLabel(null);
    open();
  };

  const handleEdit = (item) => {
    setEditingLabel(item);
    open();
  };

  const handleClose = () => {
    setEditingLabel(null);
    form.reset();
    form.clearErrors();
    close();
  };

  const sort = (sort) => reloadWithQuery(sort);

  const columns = prepareColumns([
    { label: 'type', sortable: 'type' },
    { label: 'Color', sortable: false },
    { label: 'Name', column: 'name' },
    { label: 'Slug', column: 'slug' },
    { label: 'icon', column: 'icon' },
    { label: 'Actions', sortable: false, visible: actionColumnVisibility('label') },
  ]);

  const rows = items.data.length ? (
    items.data.map((item) => <TableRow key={item.id} item={item} onEdit={handleEdit} />)
  ) : (
    <TableRowEmpty colSpan={columns.length} />
  );

  return (
    <>
      <Title mb="lg" style={{ color: 'white' }}>
        List of label for this app!
      </Title>

      <Grid justify="space-between" align="center">
        <Grid.Col span="content">
          <Group>
            {can('create label') && (
              <Button
                leftSection={<IconPlus size={14} />}
                radius="xl"
                variant="default"
                onClick={handleCreate}
              >
                Create
              </Button>
            )}
            <ArchivedFilterButton />
          </Group>
        </Grid.Col>
      </Grid>

      <Card shadow="sm" withBorder mt="md">
        <Table stickyHeader>
          <TableHead columns={columns} sort={sort} />
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
        <Pagination current={items.meta.current_page} pages={items.meta.last_page} />
      </Card>

      <Modal
        key={editingLabel?.id || 'new'}
        opened={opened}
        onClose={handleClose}
        title={editingLabel ? 'Edit Label' : 'Create Label'}
      >
        <form onSubmit={e => submit(e, { onSuccess: () => handleClose() })}>
          <Select
            label="Type"
            placeholder="Select a label type"
            mt="md"
            required
            searchable
            value={form.data.type}
            onChange={(value) => form.setData('type', value || '')}
            data={labelTypes}
            error={form.errors.type}
          />

          <TextInput
            label="Name"
            placeholder="Label name"
            required
            mt="md"
            value={form.data.name}
            onChange={(e) => updateValue('name', e.target.value)}
            error={form.errors.name}
          />

          <TextInput
            label="Slug"
            placeholder="Auto-generated from name"
            required
            mt="md"
            value={form.data.slug}
            readOnly
            error={form.errors.slug}
          />

          <ColorInput
            label="Color"
            placeholder="Label color"
            required
            mt="md"
            value={form.data.color}
            onChange={(color) => updateValue('color', color)}
            swatches={[
              '#343A40', '#E03231', '#C2255C', '#9C36B5', '#6741D9',
              '#3B5BDB', '#2771C2', '#2A8599', '#2B9267', '#309E44',
              '#66A810', '#F08C00', '#E7590D'
            ]}
            swatchesPerRow={7}
            error={form.errors.color}
          />

          <Select
            label="Icon"
            placeholder="Search and select an icon"
            mt="md"
            searchable
            value={form.data.icon}
            onChange={(icon) => form.setData('icon', icon || '')}
            data={tablerIconOptions}
            renderOption={IconSelectOption}
            leftSection={
              form.data.icon ? (() => {
                const IconComponent = TablerIcons[form.data.icon];
                return IconComponent ? <IconComponent size={18} /> : null;
              })() : null
            }
            error={form.errors.icon}
            nothingFoundMessage="No icon found"
          />


          <Text size="xs" c="dimmed" mt={4}>
            Icons from <Anchor href="https://tabler.io/icons" target="_blank">Tabler Icons</Anchor>.
          </Text>

          <Group justify="flex-end" mt="xl">
            <ActionButton type="submit" loading={form.processing}>
              {editingLabel ? 'Update' : 'Create'}
            </ActionButton>
          </Group>
        </form>
      </Modal>
    </>
  );
};

LabelsIndex.layout = (page) => <Layout title="Labels">{page}</Layout>;

export default LabelsIndex;

import ArchivedFilterButton from '@/components/ArchivedFilterButton';
import Pagination from '@/components/Pagination';
import TableHead from '@/components/TableHead';
import TableRowEmpty from '@/components/TableRowEmpty';
import Layout from '@/layouts/MainLayout';
import { reloadWithQuery } from '@/utils/route';
import { actionColumnVisibility, prepareColumns } from '@/utils/table';
import { usePage } from '@inertiajs/react';
import { Button, Card, ColorInput, Group, Table, Title, TextInput, Grid } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import TableRow from './TableRow';
import useModal from '@/components/useModal';
import Modal from '@/components/Modal';
import useForm from '@/hooks/useForm';
import ActionButton from '@/components/ActionButton';
import { useState } from 'react';

const LabelsIndex = () => {
  const { items } = usePage().props;
  const { opened, open, close } = useModal();
  const [editingLabel, setEditingLabel] = useState(null);
  const sort = sort => reloadWithQuery(sort);

  const [form, submit, updateValue] = useForm(
    editingLabel ? 'put' : 'post',
    editingLabel
      ? route('settings.labels.update', editingLabel.id)
      : route('settings.labels.store'),
    {
      name: editingLabel?.name || '',
      color: editingLabel?.color || '#228BE6',
    }
  );

  const handleCreate = () => {
    setEditingLabel(null);
    open();
  };

  const handleEdit = item => {
    setEditingLabel(item);
    open();
  };

  const handleClose = () => {
    setEditingLabel(null);
    close();
  };


  const columns = prepareColumns([
    { label: 'Color', sortable: false },
    { label: 'Name', column: 'name' },
    {
      label: 'Actions',
      sortable: false,
      visible: actionColumnVisibility('label'),
    },
  ]);

  const rows = items.data.length ? (
    items.data.map(item => (
      <TableRow
        key={item.id}
        item={item}
        onEdit={handleEdit}
      />
    ))
  ) : (
    <TableRowEmpty colSpan={columns.length} />
  );

  return (
    <>
    <Title justify='space-between' align='start' gutter='xl' mb='lg'
    style={{color: 'white'}} >List of Status
    </Title>
  <Grid justify="space-between" align="center">
          <Grid.Col span="content">
            <Group>
          {can('create label') && (
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
      <br></br>
      <Card shadow="sm" withBorder>
            <Table.ScrollContainer miw={800} my="lg">
          <Table
            stickyHeader
          >
            <TableHead
              columns={columns}
              sort={sort}
              />
            <Table.Tbody>{rows}</Table.Tbody>
          </Table>
          </Table.ScrollContainer>
          <Pagination
            current={items.meta.current_page}
            pages={items.meta.last_page}
          />
      </Card>

      <Modal
        opened={opened}
        onClose={handleClose}
        title={editingLabel ? 'Edit Label' : 'Create Label'}
      >
        <form onSubmit={submit}>
          <TextInput
            label='Name'
            placeholder='Label name'
            required
            value={form.data.name}
            onChange={e => updateValue('name', e.target.value)}
            error={form.errors.name}
          />
          <ColorInput
            label='Color'
            placeholder='Label color'
            required
            mt='md'
            swatches={[
              '#343A40',
              '#E03231',
              '#C2255C',
              '#9C36B5',
              '#6741D9',
              '#3B5BDB',
              '#2771C2',
              '#2A8599',
              '#2B9267',
              '#309E44',
              '#66A810',
              '#F08C00',
              '#E7590D',
            ]}
            swatchesPerRow={7}
            value={form.data.color}
            onChange={color => updateValue('color', color)}
            error={form.errors.color}
          />

          <Group
            justify='flex-end'
            mt='xl'
          >
            <ActionButton
              variant='light'
              onClick={handleClose}
            >
              Cancel
            </ActionButton>
            <ActionButton loading={form.processing}>
              {editingLabel ? 'Update' : 'Create'}
            </ActionButton>
          </Group>
        </form>
      </Modal>
    </>
  );
};

LabelsIndex.layout = page => <Layout title='Labels'>{page}</Layout>;

export default LabelsIndex;

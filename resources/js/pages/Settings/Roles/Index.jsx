import ArchivedFilterButton from '@/components/ArchivedFilterButton';
import Pagination from '@/components/Pagination';
import TableHead from '@/components/TableHead';
import TableRowEmpty from '@/components/TableRowEmpty';
import Layout from '@/layouts/MainLayout';
import { reloadWithQuery } from '@/utils/route';
import { actionColumnVisibility, prepareColumns } from '@/utils/table';
import { usePage } from '@inertiajs/react';
import { Button, Card, Chip, Fieldset, Grid, Group, Title, TextInput, Table } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import TableRow from './TableRow';
import { useState } from 'react';
import useModal from '@/components/useModal';
import ActionButton from '@/components/ActionButton';
import Modal from '@/components/Modal';
import useForm from '@/hooks/useForm';
import { useEffect } from 'react';

const RolesIndex = () => {
  const {
    items,
    shared: { permissions },
  } = usePage().props;

  const { opened, open, close } = useModal();
  const [editingRole, setEditingRole] = useState(null);
  const sort = sort => reloadWithQuery(sort);

  const [form, submit, updateValue] = useForm('post', route('settings.roles.store'), {
    name: '',
    permissions: [],
  });
  useEffect(() => {
    if (editingRole) {
      form.setData({
        name: editingRole.name,
        permissions: editingRole.permissions || [],
      });
      form.setMethod('put');
      form.setAction(route('settings.roles.update', editingRole.id));
    } else {
      form.setData({
        name: '',
        permissions: [],
      });
      form.setMethod('post');
      form.setAction(route('settings.roles.store'));
    }

    form.clearErrors();
  }, [editingRole]);

  const handleCreate = () => {
    setEditingRole(null);
    open();
  };

  const handleEdit = role => {
    if (role && role.id) {
      setEditingRole(role);
      open();
    }
  };

  const handleClose = () => {
    setEditingRole(null);
    form.reset();
    form.clearErrors();
    close();
  };

  const columns = prepareColumns([
    { label: 'Name', column: 'name' },
    { label: 'Permissions count', sortable: false },
    {
      label: 'Actions',
      sortable: false,
      visible: actionColumnVisibility('role'),
    },
  ]);

  const rows = items.data.length ? (
    items.data?.map(item => (
      <TableRow
        item={item}
        key={item.id}
        onEdit={handleEdit}
      />
    ))
  ) : (
    <TableRowEmpty colSpan={columns.length} />
  );

  return (
    <>
      <Title
        justify='space-between'
        align='start'
        gutter='xl'
        mb='lg'
        style={{ color: 'white' }}
      >
        List of Roles
      </Title>
      <Grid
        justify='space-between'
        align='center'
      >
        <Grid.Col span='content'>
          <Group>
            {can('create role') && (
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
      <br />
      <Card>
        <Table.ScrollContainer
          miw={800}
          my='lg'
        >
          <Table stickyHeader>
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
      {permissions && (
        <Modal
          key={editingRole?.id || 'new'}
          opened={opened}
          onClose={handleClose}
          title={editingRole ? 'Edit Role' : 'Create Role'}
        >
          <form onSubmit={e => submit(e, { onSuccess: () => handleClose() })}>
            {(!editingRole || editingRole.name !== 'client') && (
              <TextInput
                label='Name'
                placeholder='Role name'
                required
                value={form.data.name}
                onChange={e => updateValue('name', e.target.value)}
                error={form.errors.name}
              />
            )}

            <Title
              order={3}
              mt={form.data.name !== 'client' ? 'xl' : ''}
            >
              Permissions
            </Title>

            {permissions &&
              Object.keys(permissions).length > 0 &&
              Object.keys(permissions).map(group => (
                <Fieldset
                  legend={group}
                  key={group}
                  tt='capitalize'
                  mt='sm'
                >
                  <Chip.Group
                    multiple
                    value={form.data.permissions}
                    onChange={values => updateValue('permissions', values)}
                  >
                    <Group
                      justify='start'
                      gap='sm'
                    >
                      {permissions[group].map(permission => (
                      <Chip
                        key={permission}
                        value={permission}
                        radius='sm'
                      >
                        {permission}
                      </Chip>
                    ))}
                    </Group>
                  </Chip.Group>
                </Fieldset>
              ))}

            <Group
              justify='flex-end'
              mt='xl'
            >
              <ActionButton
                type='submit'
                loading={form.processing}
              >
                {editingRole ? 'Update' : 'Create'}
              </ActionButton>
            </Group>
          </form>
        </Modal>
      )}
    </>
  );
};

RolesIndex.layout = page => <Layout title='Roles'>{page}</Layout>;

export default RolesIndex;

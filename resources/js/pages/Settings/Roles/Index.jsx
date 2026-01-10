import ArchivedFilterButton from '@/components/ArchivedFilterButton';
import Pagination from '@/components/Pagination';
import TableHead from '@/components/TableHead';
import TableRowEmpty from '@/components/TableRowEmpty';
import Layout from '@/layouts/MainLayout';
import { reloadWithQuery } from '@/utils/route';
import { actionColumnVisibility, prepareColumns } from '@/utils/table';
import { usePage } from '@inertiajs/react';
import {
  Button,
  Card,
  Chip,
  Fieldset,
  Grid,
  Group,
  Title,
  TextInput,
  Table,
  Center,
  Box,
  Divider,
  Text,
  rem,
  Stack,
  Loader,
  ActionIcon,
  Breadcrumbs,
} from '@mantine/core';
import { IconCheck, IconDeviceFloppy, IconPlus } from '@tabler/icons-react';
import TableRow from './TableRow';
import { useState } from 'react';
import useModal from '@/components/useModal';
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
  const [saved, setSaved] = useState(false);
  const modalZIndex = 2200;

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

  useEffect(() => {
    if (route().params?.create && can('create role')) {
      handleCreate();
    }
  }, []);

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

  const [initialData, setInitialData] = useState(form.data);

  const hasChanged = JSON.stringify(form.data) !== JSON.stringify(initialData);
  useEffect(() => {
    if (saved) {
      const timeout = setTimeout(() => setSaved(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [saved]);

  const handleSubmit = e => {
    e.preventDefault();

    submit({
      onSuccess: () => {
        setSaved(true);
        setInitialData(form.data);
        close();
      },
    });
  };

  const TitleBar = (
    <Group
      align='center'
      justify='flex-start'
      ml='lg'
      mt='sm'
      gap='md'
    >
      {hasChanged && (
        <ActionIcon
          onClick={handleSubmit}
          loading={form.processing}
          color={saved ? 'teal' : 'green'}
          radius='xl'
          size='xl'
          title='Save changes'
        >
          {form.processing ? (
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
        >
          {saved ? 'Saved ✓' : editingRole ? 'Update ' : 'Create '}
        </Text>

        <Text
          fz='sm'
          c='dimmed'
        >
          {saved
            ? 'All changes have been successfully saved.'
            : editingRole
              ? 'You are now updating permissions for this role.'
              : 'Create a new role and assign permissions.'}
        </Text>
      </Stack>
    </Group>
  );

  return (
    <>
      <Breadcrumbs
        fz='sm'
        mb='xl'
        separator={<Text c='dimmed'>/</Text>}
      >
        <Text c='dimmed'>Settings</Text>
        <Text
          c='white'
          fw={500}
        >
          Roles
        </Text>
      </Breadcrumbs>
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
          title={TitleBar}
          centered
          draggable
          size='auto'
          zIndex={modalZIndex}
          closeButtonProps={{ style: { position: 'absolute', top: 12, right: 12 } }}
          overlayProps={{ backgroundOpacity: 0.45, blur: 6 }}
          transitionProps={{ transition: 'fade', duration: 200 }}
        >
          <Center>
            <Box
              w='90%'
              maw={960}
              pb='xl'
              mt='lg'
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
                <Divider
                  mt={form.data.name !== 'client' ? 'xl' : ''}
                  mb='md'
                  label='Permissions :'
                  labelPosition='left'
                  styles={{
                    label: {
                      fontSize: '1.3rem',
                      fontWeight: 700,
                      color: 'var(--mantine-color-gray-8)',
                    },
                  }}
                />
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
              </form>
            </Box>
          </Center>
        </Modal>
      )}
    </>
  );
};

RolesIndex.layout = page => <Layout title='Roles'>{page}</Layout>;

export default RolesIndex;

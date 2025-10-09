import ArchivedFilterButton from '@/components/ArchivedFilterButton';
import Pagination from '@/components/Pagination';
import TableHead from '@/components/TableHead';
import TableRowEmpty from '@/components/TableRowEmpty';
import Layout from '@/layouts/MainLayout';
import ActionButton from '@/components/ActionButton';
import { getInitials } from '@/utils/user';
import { reloadWithQuery } from '@/utils/route';
import { actionColumnVisibility, prepareColumns } from '@/utils/table';
import { usePage } from '@inertiajs/react';
import {
  Button,
  Avatar,
  Anchor,
  Divider,
  FileInput,
  MultiSelect,
  PasswordInput,
  Text,
  TextInput,
  Grid,
  Group,
  Title,
  Table,
} from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import TableRow from './TableRow';
import Card from '@/components/Card';
import Modal from '@/components/Modal';
import useModal from '@/components/useModal';
import { useEffect, useState } from 'react';
import useForm from '@/hooks/useForm';

const ClientsIndex = () => {
  const {
    items,
    dropdowns: { companies },
  } = usePage().props;

  const { opened, open, close } = useModal();
  const [editingUser, setEditingUser] = useState(null);
  const sort = sort => reloadWithQuery(sort);

  const [form, submit, updateValue] = useForm('post', route('clients.users.store'), {
    avatar: null,
    name: '',
    address: '',
    phone: '',
    email: '',
    password: '',
    password_confirmation: '',
    companies: [],
  });

  useEffect(() => {
    if (editingUser) {
      form.setMethod('put');
      form.setAction(route('clients.users.update', editingUser.id));
      form.setData({
        avatar: null,
        name: editingUser.name || '',
        address: editingUser.address || '',
        phone: editingUser.phone || '',
        email: editingUser.email || '',
        password: '',
        password_confirmation: '',
        companies: (editingUser.companies || []).map(c => c.id.toString()),
      });
    } else {
      form.setMethod('post');
      form.setAction(route('clients.users.store'));
      form.setData({
        avatar: null,
        name: '',
        address: '',
        phone: '',
        email: '',
        password: '',
        password_confirmation: '',
        companies: [],
      });
    }
  }, [editingUser]);

  const handleCreate = () => {
    setEditingUser(null);
    open();
  };

  const handleEdit = user => {
    setEditingUser(user);
    open();
  };

  const handleClose = () => {
    setEditingUser(null);
    close();
  };

  const columns = prepareColumns([
    { label: 'User', column: 'name' },
    { label: 'Email', column: 'email' },
    { label: 'Verified', column: 'verified' },
    { label: 'Phone', column: 'phone' },
    { label: 'Address', column: 'address' },
    { label: 'Companies', sortable: false },
    {
      label: 'Actions',
      sortable: false,
      visible: actionColumnVisibility('client user'),
    },
  ]);

  const rows = items?.data?.length > 0 ? (
    items.data.map(item => (
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
        style={{ color: 'white' }}
        mb='lg'
      >
        List of Users Client
      </Title>
      <Grid
        justify='space-between'
        align='center'
        mb='md'
      >
        <Grid.Col span='content'>
          <Group>
            {can('create client user') && (
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
      >
        <Table
          stickyHeader
          highlightOnHover
          style={{ tableLayout: 'auto' }}
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

      <Modal
        key={editingUser?.id || 'new'}
        opened={opened}
        onClose={handleClose}
        title={editingUser ? 'Edit Client User' : 'Create Client User'}
      >
      <form onSubmit={submit}>
          <Grid
            justify='flex-start'
            align='flex-start'
            gutter='lg'
          >
            <Grid.Col span='content'>
              <Avatar
                src={
    form.data.avatar instanceof File
      ? URL.createObjectURL(form.data.avatar)
      : editingUser?.avatar || null}
                size={120}
                color='blue'
              >
                {getInitials(form.data.name)}
              </Avatar>
            </Grid.Col>
            <Grid.Col span='auto'>
              <FileInput
                label='Profile image'
                placeholder='Choose image'
                accept='image/png,image/jpeg'
                onChange={image => updateValue('avatar', image)}
                clearable
                error={form.errors.avatar}
              />
              <Text
                size='xs'
                c='dimmed'
                mt='sm'
              >
                If no image is uploaded we will try to fetch it via{' '}
                <Anchor
                  href='https://unavatar.io'
                  target='_blank'
                  opacity={0.6}
                >
                  unavatar.io
                </Anchor>{' '}
                service.
              </Text>
            </Grid.Col>
          </Grid>

          <TextInput
            label='Name'
            placeholder='User full name'
            required
            mt='md'
            value={form.data.name}
            onChange={e => updateValue('name', e.target.value)}
            error={form.errors.name}
          />

          <TextInput
            label='Phone'
            placeholder='Users phone number'
            mt='md'
            value={form.data.phone}
            onChange={e => updateValue('phone', e.target.value)}
            error={form.errors.phone}
          />

          <TextInput
            label='Address'
            placeholder='Users address'
            mt='md'
            value={form.data.address}
            onChange={e => updateValue('address', e.target.value)}
            error={form.errors.address}
          />

          <MultiSelect
            label='Companies'
            placeholder='Clients companies'
            mt='md'
            value={form.data.companies}
            onChange={values => updateValue('companies', values)}
            data={companies}
            error={form.errors.companies}
          />

          {form.data.companies.length === 0 && (
            <Text
              c='dimmed'
              fz='xs'
              mt='xs'
            >
              If left empty, you will be asked to create a company after creating the client.
            </Text>
          )}

          <Divider
            mt='xl'
            mb='md'
            label='Login credentials'
            labelPosition='center'
          />

          <TextInput
            label='Email'
            placeholder='User email'
            required
            value={form.data.email}
            onChange={e => updateValue('email', e.target.value)}
            onBlur={() => form.validate('email')}
            error={form.errors.email}
          />

          <PasswordInput
            label='Password'
            placeholder='User password'
            required
            mt='md'
            value={form.data.password}
            onChange={e => updateValue('password', e.target.value)}
            error={form.errors.password}
          />

          <PasswordInput
            label='Confirm password'
            placeholder='Confirm password'
            required
            mt='md'
            value={form.data.password_confirmation}
            onChange={e => updateValue('password_confirmation', e.target.value)}
            error={form.errors.password_confirmation}
          />

          <Group
            justify='flex-end'
            mt='xl'
          >
            <ActionButton type='submit' loading={form.processing}>
              {editingUser ? 'Update' : 'Create'}
            </ActionButton>
          </Group>
        </form>
      </Modal>
    </>
  );
};

ClientsIndex.layout = page => <Layout title='Clients'>{page}</Layout>;

export default ClientsIndex;

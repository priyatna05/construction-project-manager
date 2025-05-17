import ActionButton from "@/components/ActionButton";
import ArchivedFilterButton from '@/components/ArchivedFilterButton';
import Pagination from '@/components/Pagination';
import TableHead from '@/components/TableHead';
import TableRowEmpty from '@/components/TableRowEmpty';
import Layout from '@/layouts/MainLayout';
import { reloadWithQuery } from '@/utils/route';
import { actionColumnVisibility, prepareColumns } from '@/utils/table';
import { usePage } from '@inertiajs/react';
import {
  Anchor,
  Avatar,
  Divider,
  FileInput,
  Grid,
  Group,
  MultiSelect,
  PasswordInput,
  Text,
  TextInput,
  Title,
  Button,
  Card,
  Table,
} from "@mantine/core";
import { IconPlus } from '@tabler/icons-react';
import { getInitials } from "@/utils/user";
import TableRow from './TableRow';
import Modal from '@/components/Modal';
import useModal from '@/components/useModal';
import { useState } from 'react';
import useForm from '@/hooks/useForm';
import useRoles from "@/hooks/useRoles";

const UsersIndex = () => {
  const { items } = usePage().props;
  const { opened, open, close } = useModal();
  const [editingUser, setEditingUser] = useState(null);
  const { getDropdownValues } = useRoles();
  const sort = (value) => reloadWithQuery(value);

  const [form, submit, updateValue] = useForm(
    editingUser ? 'put' : 'post',
    editingUser
      ? route('users.update', editingUser.id)
      : route('users.store'),
    {
      avatar: null,
      name: editingUser?.name || '',
      job_title: editingUser?.job_title || '',
      roles: editingUser?.roles || [],
      phone: editingUser?.phone || '',
      address: editingUser?.address || '',
      email: editingUser?.email || '',
      password: '',
      password_confirmation: '',
    }
  );

  const handleCreate = () => {
    setEditingUser(null);
    open();
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    open();
  };

  const handleClose = () => {
    setEditingUser(null);
    close();
  };

  const columns = prepareColumns([
    { label: 'User', column: 'name' },
    { label: 'Role', sortable: false },
    { label: 'Email', column: 'email' },
    { label: 'Phone', column: 'phone' },
    { label: 'Address', column: 'address' },
    {
      label: 'Actions',
      sortable: false,
      visible: actionColumnVisibility('user'),
    },
  ]);

  const rows = items.data.length ? (
    items.data.map((item) => (
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
      <Title style={{ color: 'white' }} mb="lg">
        List of Users
      </Title>

      <Grid justify="space-between" align="center">
        <Grid.Col span="content">
          <Group>
          {can('create user') && (
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

      <Card shadow="sm" withBorder my="lg">
        <Table.ScrollContainer miw={800}>
          <Table stickyHeader>
            <TableHead columns={columns} sort={sort} />
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
        title={editingUser ? 'Edit User' : 'Create User'}
      >
        <form onSubmit={submit}>
          <Grid gutter="lg">
            <Grid.Col span="content">
              <Avatar
                src={form.data.avatar ? URL.createObjectURL(form.data.avatar) : null}
                size={120}
                color="blue"
              >
                {getInitials(form.data.name)}
              </Avatar>
            </Grid.Col>
            <Grid.Col span="auto">
              <FileInput
                label="Profile image"
                placeholder="Choose image"
                accept="image/png,image/jpeg"
                onChange={(image) => updateValue("avatar", image)}
                clearable
                error={form.errors.avatar}
              />
              <Text size="xs" c="dimmed" mt="sm">
                If no image is uploaded, we will try to fetch it via{" "}
                <Anchor href="https://unavatar.io" target="_blank" opacity={0.6}>
                  unavatar.io
                </Anchor>
              </Text>
            </Grid.Col>
          </Grid>

          <TextInput
            label="Name"
            placeholder="User full name"
            required
            mt="md"
            value={form.data.name}
            onChange={(e) => updateValue("name", e.target.value)}
            error={form.errors.name}
          />

          <TextInput
            label="Job title"
            placeholder="e.g. Frontend Developer"
            required
            mt="md"
            value={form.data.job_title}
            onChange={(e) => updateValue("job_title", e.target.value)}
            error={form.errors.job_title}
          />

          <MultiSelect
            label="Roles"
            placeholder="Select role"
            required
            mt="md"
            value={form.data.roles}
            onChange={(values) => updateValue("roles", values)}
            data={getDropdownValues({ except: ["client"] })}
            error={form.errors.roles}
          />

          <Group grow mt="md">
            <TextInput
              label="Phone"
              placeholder="User phone number"
              value={form.data.phone}
              onChange={(e) => updateValue("phone", e.target.value)}
              error={form.errors.phone}
            />
            <TextInput
              label="Address"
              placeholder="User address"
              value={form.data.address}
              onChange={(e) => updateValue("address", e.target.value)}
              error={form.errors.address}
            />
          </Group>

          <Divider mt="xl" mb="md" label="Login credentials" labelPosition="center" />

          <TextInput
            label="Email"
            placeholder="User email"
            required
            value={form.data.email}
            onChange={(e) => updateValue("email", e.target.value)}
            onBlur={() => form.validate("email")}
            error={form.errors.email}
          />

          <PasswordInput
            label="Password"
            placeholder="User password"
            required={!editingUser}
            mt="md"
            value={form.data.password}
            onChange={(e) => updateValue("password", e.target.value)}
            error={form.errors.password}
          />

          <PasswordInput
            label="Confirm password"
            placeholder="Confirm password"
            required={!editingUser}
            mt="md"
            value={form.data.password_confirmation}
            onChange={(e) => updateValue("password_confirmation", e.target.value)}
            error={form.errors.password_confirmation}
          />

          <Group justify="flex-end" mt="xl">
            <ActionButton
                          variant='light'
                          onClick={handleClose}
                        >
                          Cancel
                        </ActionButton>
                        <ActionButton loading={form.processing}>
                          {editingUser ? 'Update' : 'Create'}
                        </ActionButton>
                      </Group>
                    </form>
      </Modal>
    </>
  );
};

UsersIndex.layout = (page) => <Layout title="Users">{page}</Layout>;

export default UsersIndex;

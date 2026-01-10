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
  Tooltip,
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
  ActionIcon,
  Loader,
  Stack,
  rem,
  Center,
  Box,
  Select,
  Breadcrumbs,
  Paper,
  TooltipFloating,
} from '@mantine/core';
import {
  IconCheck,
  IconDeviceFloppy,
  IconInfoCircle,
  IconKey,
  IconLock,
  IconMail,
  IconPlus,
  IconRoad,
  IconTrash,
  IconUpload,
  IconUser,
} from '@tabler/icons-react';
import { getInitials } from '@/utils/user';
import TableRow from './TableRow';
import Modal from '@/components/Modal';
import useModal from '@/components/useModal';
import { useEffect, useState, useRef } from 'react';
import useForm from '@/hooks/useForm';
import useRoles from '@/hooks/useRoles';

const UsersIndex = () => {
  const {
    items,
    dropdowns: { countries },
  } = usePage().props;
  const { opened, open, close } = useModal();
  const [editingUser, setEditingUser] = useState(null);
  const { getDropdownValues } = useRoles();
  const fileInputRef = useRef(null);
  const [showUploadIcon, setShowUploadIcon] = useState(false);
  const sort = value => reloadWithQuery(value);
  const [saved, setSaved] = useState(false);
  const userData = items?.data || [];
  const modalZIndex = 2200;
  const comboboxProps = { withinPortal: true, zIndex: modalZIndex + 200 };

  const [addressParts, setAddressParts] = useState({
    street: '',
    city: '',
    postal_code: '',
    country_id: null,
  });

  const [form, submit, updateValue] = useForm('post', route('users.store'), {
    avatar: '',
    name: '',
    job_title: '',
    roles: [],
    phone: '',
    address: '',
    email: '',
    password: '',
    password_confirmation: '',
  });

  useEffect(() => {
    const { street, city, postal_code, country_id } = addressParts;
    const countryName = countries?.find(c => c.value === country_id)?.label || '';
    const fullAddress = [street, city, postal_code, countryName].filter(Boolean).join(', '); // TODO: Consider a more robust address formatting
    updateValue('address', fullAddress);
  }, [addressParts]);

  useEffect(() => {
    if (editingUser) {
      form.setMethod('put');
      form.setAction(route('users.update', editingUser.id));
      const addressArray = (editingUser.address || '').split(', ');
      const countryNameFromAddress = addressArray.length > 3 ? addressArray.pop() : '';
      const country = countries?.find(c => c.label === countryNameFromAddress);

      setAddressParts({
        street: addressArray[0] || '',
        city: addressArray[1] || '',
        postal_code: addressArray[2] || '',
        country_id: country ? country.value : null,
      });

      form.setData({
        avatar: editingUser.avatar || '',
        name: editingUser.name || '',
        job_title: editingUser.job_title || '',
        roles: editingUser.roles || '',
        phone: editingUser.phone || '',
        address: editingUser.address || '',
        email: editingUser.email || '',
        password: editingUser.password || '',
        password_confirmation: editingUser.password_confirmation || '',
      });
    } else {
      form.setMethod('post');
      form.setAction(route('users.store'));
      setAddressParts({
        street: '',
        city: '',
        postal_code: '',
        country_id: null,
      });
      form.setData({
        avatar: '',
        name: '',
        job_title: '',
        roles: [],
        phone: '',
        address: '',
        email: '',
        password: '',
        password_confirmation: '',
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

  const handleFileChange = file => {
    if (file) {
      updateValue('avatar', file);
    }
  };

  const handleRemoveAvatar = () => {
    updateValue('avatar', null);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const avatarSrc =
    form.data.avatar instanceof File
      ? URL.createObjectURL(form.data.avatar)
      : editingUser?.avatar || null;

  const columns = prepareColumns([
    { label: 'User', column: 'name' },
    { label: 'Role', sortable: false },
    { label: 'Email', column: 'email' },
    { label: 'Verified', column: 'verified' },
    { label: 'Phone', column: 'phone' },
    { label: 'Address', column: 'address' },
    {
      label: 'Actions',
      sortable: false,
      visible: actionColumnVisibility('user'),
    },
  ]);

  const rows = userData.length ? (
    userData.map(item => (
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
          {saved ? 'Saved ✓' : editingUser ? 'Update User' : 'Create User'}
        </Text>

        <Text
          fz='sm'
          c='dimmed'
        >
          {saved
            ? 'All changes have been successfully saved.'
            : editingUser
              ? 'Update User personal info or login credentials.'
              : 'Fill in the user’s profile and credentials to register a new user.'}
        </Text>
      </Stack>
    </Group>
  );

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
          Team members /
        </Text>
      </Breadcrumbs>
      <Title
        style={{ color: 'white' }}
        mb='lg'
      >
        List Of Team Members
      </Title>

      <Grid
        justify='space-between'
        align='center'
        mb='md'
      >
        <Grid.Col span='content'>
          <Group>
            {can('create user') && (
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
        title={TitleBar}
        centered
        draggable
        size='xl'
        zIndex={modalZIndex}
        closeButtonProps={{ style: { position: 'absolute', top: 12, right: 12 } }}
        overlayProps={{ backgroundOpacity: 0.45, blur: 6 }}
        transitionProps={{ transition: 'fade', duration: 200 }}
      >
        <Center>
          <Box
            w='95%'
            maw={1100}
            pb='xl'
            mt='lg'
          >
           <form onSubmit={e => submit(e, { onSuccess: () => handleClose() })}>
              <Grid
                gutter='xl'
                align='stretch'
              >
                {/* LEFT COLUMN - Main Info */}
                <Grid.Col span={12}>
                  <Paper>
                    <Stack spacing='md'>
                      {/* Avatar & Name Section */}
                      <Group
                        align='flex-start'
                        spacing='lg'
                      >
                        <div style={{ position: 'relative' }}>
                          <Tooltip
                            label='Upload new image'
                            withArrow
                          >
                            <Avatar
                              src={avatarSrc}
                              size={120}
                              color='blue'
                              radius='xl'
                              style={{ cursor: 'pointer', position: 'relative' }}
                              onClick={handleAvatarClick}
                              onMouseEnter={() => setShowUploadIcon(true)}
                              onMouseLeave={() => setShowUploadIcon(false)}
                            >
                              {!avatarSrc &&
                                (form.data.name ? (
                                  getInitials(form.data.name)
                                ) : (
                                  <IconUser size={50} />
                                ))}

                              {showUploadIcon && (
                                <div
                                  style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    backgroundColor: 'rgba(0,0,0,0.5)',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'background-color 0.2s ease',
                                  }}
                                >
                                  {avatarSrc ? (
                                    <IconTrash
                                      size={28}
                                      stroke={1.5}
                                      color='white'
                                      onClick={handleRemoveAvatar}
                                      style={{ cursor: 'pointer' }}
                                    />
                                  ) : (
                                    <IconUpload
                                      size={28}
                                      stroke={1.5}
                                      color='white'
                                    />
                                  )}
                                </div>
                              )}
                            </Avatar>
                          </Tooltip>

                          <input
                            ref={fileInputRef}
                            type='file'
                            accept='image/png,image/jpeg'
                            style={{ display: 'none' }}
                            onChange={e => handleFileChange(e.target.files[0])}
                          />
                        </div>

                        <Stack
                          spacing='xs'
                          style={{ flex: 1 }}
                        >
                          <TextInput
                            label='Name'
                            placeholder='User full name'
                            required
                            value={form.data.name}
                            onChange={e => updateValue('name', e.target.value)}
                            error={form.errors.name}
                          />
                          <Text
                            size='xs'
                            c='dimmed'
                            mt={-5}
                          >
                            If no image uploaded, we`ll fetch via{' '}
                            <Anchor
                              href='https://unavatar.io'
                              target='_blank'
                              opacity={0.6}
                            >
                              unavatar.io
                            </Anchor>
                          </Text>
                        </Stack>
                      </Group>

                      <TextInput
                        label='Job Title'
                        placeholder='e.g. mandor'
                        required
                        value={form.data.job_title}
                        onChange={e => updateValue('job_title', e.target.value)}
                        error={form.errors.job_title}
                      />

                      <TextInput
                        label='Phone'
                        placeholder='User phone number'
                        value={form.data.phone}
                        onChange={e => updateValue('phone', e.target.value)}
                        error={form.errors.phone}
                      />

                      <MultiSelect
                        label='Roles'
                        placeholder='Select role'
                        required
                        comboboxProps={comboboxProps}
                        value={form.data.roles}
                        onChange={values => updateValue('roles', values)}
                        data={getDropdownValues({ except: ['client'] })}
                        error={form.errors.roles}
                      />
                    </Stack>
                  </Paper>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Paper>
                    <Stack spacing='md'>
                      <Group spacing='xs'>
                        <IconRoad
                          stroke={2}
                          size={28}
                        />
                        <Title
                          order={4}
                          color='dimmed'
                        >
                          Address Information
                        </Title>
                      </Group>

                      <Divider />

                      <TextInput
                        label='Street Address'
                        placeholder='e.g., Jl. Jend. Sudirman No. 52'
                        value={addressParts.street}
                        onChange={e =>
                          setAddressParts(prev => ({ ...prev, street: e.target.value }))
                        }
                        error={form.errors.address}
                      />

                      <Group
                        grow
                        align='flex-end'
                      >
                        <TextInput
                          label='City'
                          placeholder='e.g., Jakarta'
                          value={addressParts.city}
                          onChange={e =>
                            setAddressParts(prev => ({ ...prev, city: e.target.value }))
                          }
                        />

                        <TextInput
                          label='Postal Code'
                          placeholder='e.g., 12190'
                          value={addressParts.postal_code}
                          onChange={e =>
                            setAddressParts(prev => ({ ...prev, postal_code: e.target.value }))
                          }
                        />
                      </Group>

                      <Select
                        label='Country'
                        placeholder='Select country'
                        searchable
                        comboboxProps={comboboxProps}
                        value={addressParts.country_id}
                        onChange={value =>
                          setAddressParts(prev => ({ ...prev, country_id: value }))
                        }
                        data={countries || []}
                        nothingFoundMessage='Country not found'
                      />
                    </Stack>
                  </Paper>
                </Grid.Col>

                {/* RIGHT COLUMN - Login Credentials */}
                <Grid.Col span={6}>
                  <Paper>
                    <Stack spacing='md'>
                      <Group
                        spacing='xs'
                        align='center'
                      >
                        {editingUser ? (
                          <TooltipFloating
                            label={
                             <Text>
                               Leave password fields empty to keep the current password
                             </Text>
                            }
                            withArrow
                            color='blue'
                            fz='xs'
                          >
                            <ActionIcon
                              variant='transparent'
                              color='blue'
                            >
                              <IconInfoCircle size={28} />
                            </ActionIcon>
                          </TooltipFloating>
                        ) : (
                          <IconKey
                            stroke={2}
                            color='gold'
                            size={28}
                          />
                        )}
                        <Title
                          order={4}
                          c='dimmed'
                        >
                          Login Credentials
                        </Title>
                      </Group>

                      <Divider />

                      <TextInput
                        label='Email'
                        placeholder='User email'
                        required
                        value={form.data.email}
                        onChange={e => updateValue('email', e.target.value)}
                        onBlur={() => form.validate('email')}
                        error={form.errors.email}
                        icon={<IconMail size={16} />}
                      />

                      <PasswordInput
                        label='Password'
                        placeholder='User password'
                        required={!editingUser}
                        value={form.data.password}
                        onChange={e => updateValue('password', e.target.value)}
                        error={form.errors.password}
                        icon={<IconLock size={16} />}
                      />

                      <PasswordInput
                        label='Confirm Password'
                        placeholder='Confirm password'
                        required={!editingUser}
                        value={form.data.password_confirmation}
                        onChange={e => updateValue('password_confirmation', e.target.value)}
                        error={form.errors.password_confirmation}
                        icon={<IconLock size={16} />}
                      />
                    </Stack>
                  </Paper>
                </Grid.Col>
              </Grid>
            </form>
          </Box>
        </Center>
      </Modal>
    </>
  );
};

UsersIndex.layout = page => <Layout title='Users'>{page}</Layout>;

export default UsersIndex;

import ArchivedFilterButton from '@/components/ArchivedFilterButton';
import Pagination from '@/components/Pagination';
import TableHead from '@/components/TableHead';
import TableRowEmpty from '@/components/TableRowEmpty';
import Layout from '@/layouts/MainLayout';
import { getInitials } from '@/utils/user';
import { reloadWithQuery } from '@/utils/route';
import { actionColumnVisibility, prepareColumns } from '@/utils/table';
import { usePage, router } from '@inertiajs/react';
import {
  Button,
  Avatar,
  Anchor,
  Divider,
  PasswordInput,
  Text,
  TextInput,
  Grid,
  Group,
  Title,
  Table,
  Center,
  Box,
  ActionIcon,
  Loader,
  rem,
  Stack,
  Tooltip,
  Select,
  Breadcrumbs,
  TooltipFloating,
} from '@mantine/core';
import {
  IconCheck,
  IconDeviceFloppy,
  IconKey,
  IconPlus,
  IconUpload,
  IconUser,
  IconTrash,
  IconRoad,
  IconInfoCircle,
} from '@tabler/icons-react';
import TableRow from './TableRow';
import Card from '@/components/Card';
import Modal from '@/components/Modal';
import useModal from '@/components/useModal';
import { useEffect, useRef, useState } from 'react';
import useForm from '@/hooks/useForm';

const ClientsIndex = () => {
  const {
    items,
    dropdowns: { countries },
  } = usePage().props;

  const fileInputRef = useRef(null);
  const { opened, open, close } = useModal();
  const [editingUser, setEditingUser] = useState(null);
  const sort = sort => reloadWithQuery(sort);
  const [saved, setSaved] = useState(false);
  const [showUploadIcon, setShowUploadIcon] = useState(false);
  const modalZIndex = 2200;
  const comboboxProps = { withinPortal: true, zIndex: modalZIndex + 200 };

  const [addressParts, setAddressParts] = useState({
    street: '',
    city: '',
    postal_code: '',
    country_id: null,
  });

  const [initialFormDataForComparison, setInitialFormDataForComparison] = useState({});

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
    const { street, city, postal_code, country_id } = addressParts;
    const countryLabel = countries?.find(c => c.value === country_id)?.label;
    const addressComponents = [street, city, postal_code, countryLabel].filter(Boolean);
    const fullAddress = addressComponents.length > 0 ? addressComponents.join(', ') : '';

    updateValue('address', fullAddress);
  }, [addressParts, countries]);

  useEffect(() => {
    if (editingUser) {
      const addressArray = (editingUser.address || '').split(', ');
      const countryName = addressArray.length > 3 ? addressArray.pop() : '';
      // eslint-disable-next-line no-unused-vars
      const country = countries?.find(c => c.label === countryName);

      setInitialFormDataForComparison({
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
      setInitialFormDataForComparison({
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
  }, [editingUser, countries]);

  const handleCreate = () => {
    form.reset();
    form.setMethod('post');
    form.setAction(route('clients.users.store'));
    setEditingUser(null);
    setAddressParts({ street: '', city: '', postal_code: '', country_id: null });
    open();
  };

  const handleEdit = user => {
    form.reset();
    form.setMethod('put');
    form.setAction(route('clients.users.update', user.id));
    setEditingUser(user);

    const addressArray = (user.address || '').split(', ');
    let street = '';
    let city = '';
    let postal_code = '';
    let countryName = '';

    if (addressArray.length >= 4) {
      countryName = addressArray.pop();
      postal_code = addressArray.pop();
      city = addressArray.pop();
      street = addressArray.join(', ');
    } else if (addressArray.length === 3) {
      postal_code = addressArray.pop();
      city = addressArray.pop();
      street = addressArray.join(', ');
    } else if (addressArray.length === 2) {
      city = addressArray.pop();
      street = addressArray.join(', ');
    } else if (addressArray.length === 1) {
      street = addressArray.join(', ');
    }

    const country = countries?.find(c => c.label === countryName);

    setAddressParts({
      street: street || '',
      city: city || '',
      postal_code: postal_code || '',
      country_id: country ? country.value : null,
    });

    // Perbarui form data
    form.setData({
      avatar: null,
      name: user.name || '',
      phone: user.phone || '',
      email: user.email || '',
      password: '',
      password_confirmation: '',
      companies: (user.companies || []).map(c => c.id.toString()),
    });

    open();
  };

  const handleSubmit = e => {
  e.preventDefault();

  const originalData = { ...form.data };

  const submitData = {
    ...form.data,
    avatar: form.data.avatar,
  };

  if (editingUser && !submitData.password) {
    delete submitData.password;
    delete submitData.password_confirmation;
  }

  form.setData(submitData);

  submit(e, {
    onSuccess: () => {
      setSaved(true);
      close();
      router.reload({ only: ['items'] });
    },
    onError: errors => console.error(errors),
    onFinish: () => {
      form.setData(originalData);
    },
  });
};


  const handleClose = () => {
    setEditingUser(null);
    close();
  };

  const handleFileChange = file => {
    if (file) {
      updateValue('avatar', file);
    } else {
      updateValue('avatar', null);
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

  const rows =
    items?.data?.length > 0 ? (
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

  const currentFormDataForComparison = {
    ...form.data,
    companies: Array.isArray(form.data.companies) ? form.data.companies.map(String) : [],
  };

  const hasChanged =
    JSON.stringify(currentFormDataForComparison) !== JSON.stringify(initialFormDataForComparison);

  useEffect(() => {
    if (saved) {
      const timeout = setTimeout(() => setSaved(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [saved]);

  const TitleBar = (
    <Group
      align='center'
      justify='flex-start'
      ml='lg'
      mt='sm'
      gap='md'
    >
      <ActionIcon
        onClick={handleSubmit}
        loading={form.processing}
        color={saved ? 'teal' : 'green'}
        radius='xl'
        disabled={!hasChanged && !form.processing}
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

      <Stack spacing={2}>
        <Text
          fz={rem(22)}
          fw={600}
        >
          {saved ? 'Saved ✓' : editingUser ? 'Update Client User' : 'Create Client User'}
        </Text>

        <Text
          fz='sm'
          c='dimmed'
        >
          {saved
            ? 'All changes have been successfully saved.'
            : editingUser
              ? 'Update client’s personal info, company relation, or login credentials.'
              : 'Fill in the client’s profile and credentials to register a new user.'}
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
        <Text c='dimmed'>Clients</Text>
        <Text
          c='white'
          fw={500}
        >
          Users
        </Text>
      </Breadcrumbs>

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
            <form onSubmit={handleSubmit}>
              <Grid
                gutter='xl'
                align='flex-start'
              >
                  <Grid.Col span={3}>
                    <div style={{ position: 'relative' }}>
                      <Tooltip
                        label='Upload new image'
                      >
                        <Avatar
                          src={avatarSrc}
                          size='150'
                          color='blue'
                          radius='xl'
                          style={{
                            cursor: 'pointer',
                            position: 'relative',
                          }}
                          onClick={handleAvatarClick}
                          onMouseEnter={() => setShowUploadIcon(true)}
                          onMouseLeave={() => setShowUploadIcon(false)}
                        >
                          {!avatarSrc &&
                            (form.data.name ? getInitials(form.data.name) : <IconUser size={50} />)}
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
                                  size={32}
                                  stroke={1.5}
                                  color='white'
                                  onClick={handleRemoveAvatar}
                                  style={{ cursor: 'pointer' }}
                                />
                              ) : (
                                <IconUpload
                                  size={32}
                                  stroke={1.5}
                                  color='white'
                                />
                              )}
                            </div>
                          )}
                        </Avatar>
                      </Tooltip>

                      {/* Hidden file input */}
                      <input
                        ref={fileInputRef}
                        type='file'
                        accept='image/png,image/jpeg'
                        style={{ display: 'none' }}
                        onChange={e => handleFileChange(e.target.files[0] || null)}
                      />
                    </div>
                  </Grid.Col>

                  {/* === Name Field Section === */}
                  <Grid.Col span={9}>
                    <TextInput
                      label='Name'
                      placeholder='User full name'
                      required={!editingUser}
                      value={form.data.name}
                      onChange={e => updateValue('name', e.target.value)}
                      error={form.errors.name}
                    />

                    <Text
                      size='xs'
                      c='dimmed'
                    >
                      If no image is uploaded, we will try to fetch it via{' '}
                      <Anchor
                        href='https://unavatar.io'
                        target='_blank'
                        opacity={0.6}
                      >
                        unavatar.io
                      </Anchor>{' '}
                      service.
                    </Text>
                    <TextInput
                      label='Phone'
                      placeholder='User phone number'
                      value={form.data.phone}
                      onChange={e => updateValue('phone', e.target.value)}
                      error={form.errors.phone}
                    />
                  </Grid.Col>
                <Grid.Col span={6}>
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
                      onChange={e => setAddressParts(prev => ({ ...prev, street: e.target.value }))}
                      error={form.errors.address}
                    />
                    <Grid mt='xs'>
                      <Grid.Col span={{ base: 12, sm: 6 }}>
                        <TextInput
                          label='City'
                          placeholder='e.g., Jakarta'
                          value={addressParts.city}
                          onChange={e =>
                            setAddressParts(prev => ({ ...prev, city: e.target.value }))
                          }
                        />
                      </Grid.Col>
                      <Grid.Col span={{ base: 12, sm: 6 }}>
                        <TextInput
                          label='Postal Code'
                          placeholder='e.g., 12190'
                          value={addressParts.postal_code}
                          onChange={e =>
                            setAddressParts(prev => ({ ...prev, postal_code: e.target.value }))
                          }
                        />
                      </Grid.Col>
                    </Grid>
                    <Select
                      label='Country'
                      placeholder='Select country'
                      mb='xl'
                      searchable
                      comboboxProps={comboboxProps}
                      value={addressParts.country_id}
                      onChange={value => setAddressParts(prev => ({ ...prev, country_id: value }))}
                      data={countries || []}
                      nothingFoundMessage='Country not found'
                    />
                  </Stack>
                </Grid.Col>

                {/* ================= Right Column: Login Credentials ================= */}
                <Grid.Col span={6}>
                  <Stack spacing='md'>
                    <Group
                      spacing='xs'
                      align='center'
                    >
                      {editingUser ? (
                        <TooltipFloating
                          label={
                            <Text>Leave password fields empty to keep the current password</Text>
                          }
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
                      required={!editingUser}
                      value={form.data.email}
                      onChange={e => updateValue('email', e.target.value)}
                      onBlur={() =>
                        form.errors.email && form.setData('errors', { ...form.errors, email: null })
                      }
                      error={form.errors.email}
                    />

                    <PasswordInput
                      label='Password'
                      placeholder={editingUser ? 'Fill to change password' : 'User password'}
                      required={!editingUser}
                      mt='xs'
                      value={form.data.password}
                      onChange={e => updateValue('password', e.target.value)}
                      error={form.errors.password}
                    />

                    <PasswordInput
                      label='Confirm password'
                      placeholder={editingUser ? 'Confirm new password' : 'Confirm password'}
                      required={!editingUser}
                      value={form.data.password_confirmation}
                      onChange={e => updateValue('password_confirmation', e.target.value)}
                      error={form.errors.password_confirmation}
                    />
                  </Stack>
                </Grid.Col>
              </Grid>
            </form>
          </Box>
        </Center>
      </Modal>
    </>
  );
};

ClientsIndex.layout = page => <Layout title='Clients'>{page}</Layout>;

export default ClientsIndex;

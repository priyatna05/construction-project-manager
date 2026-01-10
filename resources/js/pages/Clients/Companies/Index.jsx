import {
  Button,
  Grid,
  Group,
  Table,
  Title,
  TextInput,
  Select,
  ActionIcon,
  Loader,
  Stack,
  Text,
  rem,
  Center,
  Box,
  Breadcrumbs,
  Divider,
  Tooltip,
  Avatar,
} from '@mantine/core';
import {
  IconBuilding,
  IconBuildingBridge,
  IconCheck,
  IconDeviceFloppy,
  IconPlus,
  IconTrash,
  IconUpload,
  IconUsersGroup,
} from '@tabler/icons-react';
import { usePage } from '@inertiajs/react';
import { useEffect, useState, useRef } from 'react';

import ArchivedFilterButton from '@/components/ArchivedFilterButton';
import Pagination from '@/components/Pagination';
import TableHead from '@/components/TableHead';
import TableRowEmpty from '@/components/TableRowEmpty';
import Layout from '@/layouts/MainLayout';
import Card from '@/components/Card';
import TableRow from './TableRow';
import useModal from '@/components/useModal';
import Modal from '@/components/Modal';
import useForm from '@/hooks/useForm';
import ClientMultiSelect from '@/components/ClientMultiSelect';
import { getInitials } from '@/utils/user';
import { reloadWithQuery } from '@/utils/route';
import { actionColumnVisibility, prepareColumns } from '@/utils/table';

const ClientCompaniesIndex = () => {
  const {
    items,
    dropdowns: { clients, countries, currencies },
  } = usePage().props;

  const countriesData = countries
    ? Array.isArray(countries)
      ? countries.map(c => ({ value: String(c.id || c.value), label: c.name || c.label }))
      : Object.entries(countries).map(([value, label]) => ({ value: String(value), label }))
    : [];
  const currenciesData = currencies
    ? Array.isArray(currencies)
      ? currencies.map(c => ({ value: String(c.id || c.value), label: c.name || c.label }))
      : Object.entries(currencies).map(([value, label]) => ({ value: String(value), label }))
    : [];
  const { opened, open, close } = useModal();
  const [editingCompany, setEditingCompany] = useState(null);
  const [avatarSrc, setAvatarSrc] = useState(null);
  const [showUploadIcon, setShowUploadIcon] = useState(false);
  const fileInputRef = useRef(null);
  const sort = sort => reloadWithQuery(sort);
  const [saved, setSaved] = useState(false);
  const modalZIndex = 2200;
  const comboboxProps = { withinPortal: true, zIndex: modalZIndex + 200 };

  const initialValues = {
    name: '',
    email: '',
    phone: '',
    address: '',
    postal_code: '',
    city: '',
    country: '',
    currency: '',
    web: '',
    logo: null,
    clients: route().params?.user_id ? [String(route().params.user_id)] : [],
  };
  const [form, submit, updateValue] = useForm(
    'post',
    route('clients.companies.store'),
    initialValues
  );

  useEffect(() => {
    if (!editingCompany) {
      // Mode create
      form.setMethod('post');
      form.setAction(route('clients.companies.store'));
      form.reset();
      form.setData('logo', null);
      setAvatarSrc(null);
      return;
    }

    // Mode edit
    form.setMethod('put');
    form.setAction(route('clients.companies.update', editingCompany.id));

    const newData = {
      name: editingCompany.name ?? '',
      email: editingCompany.email ?? '',
      phone: editingCompany.phone ?? '',
      address: editingCompany.address ?? '',
      postal_code: editingCompany.postal_code ?? '',
      city: editingCompany.city ?? '',
      country: editingCompany.country?.id ? String(editingCompany.country.id) : '',
      currency: editingCompany.currency?.id ? String(editingCompany.currency.id) : '',
      web: editingCompany.web ?? '',
      clients: editingCompany.clients?.map(c => String(c.id)) ?? [],
      logo: null,
    };

    form.setData(newData);
    const existingAvatar =
      editingCompany.avatar?.url || editingCompany.logo_url || editingCompany.logo || null;
    setAvatarSrc(existingAvatar);
  }, [editingCompany]);

  const handleCreate = () => {
    setEditingCompany(null);
    open();
  };

  const handleEdit = item => {
    setEditingCompany(item);
    open();
  };

  const handleClose = () => {
    setEditingCompany(null);
    form.setData('logo', null);
    setAvatarSrc(null);
    close();
  };

  const handleAvatarClick = () => fileInputRef.current?.click();
  const handleFileChange = file => {
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarSrc(url);
      form.setData('logo', file);
    } else {
      setAvatarSrc(null);
      form.setData('logo', null);
    }
  };
  const handleRemoveAvatar = () => {
    setAvatarSrc(null);
    form.setData('logo', null);
  };

  const columns = prepareColumns([
    { label: 'Foto', sortable: false },
    { label: 'Clients', sortable: false },
    { label: 'Company', column: 'name' },
    { label: 'Currency', column: 'curency' },
    { label: 'Email', column: 'email' },
    { label: 'Phone', column: 'phone' },
    { label: 'Web', column: 'web' },
    { label: 'Address', column: 'address' },
    {
      label: 'Actions',
      sortable: false,
      visible: actionColumnVisibility('client company'),
    },
  ]);

  const rows = items.data.length ? (
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
  // Deteksi apakah ada perubahan dibanding data awal
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
      <ActionIcon
        onClick={handleSubmit}
        loading={form.processing}
        color={saved ? 'teal' : 'green'}
        radius='xl'
        size='xl'
        disabled={!hasChanged && !form.processing}
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
          {saved ? 'Saved ✓' : editingCompany ? 'Update Company' : 'Create Company'}
        </Text>

        <Text
          fz='sm'
          c='dimmed'
        >
          {saved
            ? 'All changes have been successfully saved.'
            : editingCompany
              ? 'Update the company details below.'
              : 'Fill in the company details below.'}
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
          Companies
        </Text>
      </Breadcrumbs>
      <Title
        style={{ color: 'white' }}
        mb='lg'
      >
        List of Client Companies
      </Title>

      <Grid
        justify='space-between'
        align='center'
        mb='md'
      >
        <Grid.Col span='content'>
          <Group>
            {can('create client company') && (
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
        opened={opened}
        onClose={handleClose}
        centered
        draggable
        size='auto'
        zIndex={modalZIndex}
        closeButtonProps={{ style: { position: 'absolute', top: 12, right: 12 } }}
        title={TitleBar}
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
            <form onSubmit={submit}>
              <Grid
                align='flex-start'
                mt='sm'
              >
                <Grid.Col span={3}>
                  <div style={{ position: 'relative' }}>
                    <Tooltip label='Upload new image'>
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
                          (form.data.name ? (
                            getInitials(form.data.name)
                          ) : (
                            <IconBuilding size={50} />
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
                <Grid.Col span={9}>
                  <Grid
                    align='flex-start'
                    gutter='sm'
                  >
                    <Grid.Col span={9}>
                      <TextInput
                        label='Name'
                        placeholder='Company name'
                        required
                        value={form.data.name}
                        onChange={e => updateValue('name', e.target.value)}
                        error={form.errors.name}
                      />
                    </Grid.Col>
                    <Grid.Col span={3}>
                      <Select
                        label='Default currency'
                        placeholder='Currency'
                        searchable
                        value={form.data.currency}
                        onChange={value => updateValue('currency', value)}
                        data={currenciesData}
                        comboboxProps={comboboxProps}
                        error={form.errors.currency}
                      />
                    </Grid.Col>
                    <Grid.Col span={12}>
                      <Grid gutter='sm'>
                        <Grid.Col span={6}>
                          <TextInput
                            label='Email'
                            placeholder='Email'
                            value={form.data.email}
                            onChange={e => updateValue('email', e.target.value)}
                            error={form.errors.email}
                          />
                        </Grid.Col>
                        <Grid.Col span={6}>
                          <TextInput
                            label='Phone'
                            placeholder='Phone'
                            value={form.data.phone}
                            onChange={e => updateValue('phone', e.target.value)}
                            error={form.errors.phone}
                          />
                        </Grid.Col>
                      </Grid>
                    </Grid.Col>
                  </Grid>
                </Grid.Col>

                <Grid.Col
                  span={12}
                  mt='lg'
                >
                  <Stack spacing='md'>
                    <Group
                      spacing='xs'
                      align='center'
                    >
                      <IconBuildingBridge size={28} />
                      <Title
                        order={4}
                        c='dimmed'
                      >
                        Address informations
                      </Title>
                    </Group>
                    <Divider />
                  </Stack>
                  <TextInput
                    label='Address'
                    placeholder='Address'
                    value={form.data.address}
                    onChange={e => updateValue('address', e.target.value)}
                    error={form.errors.address}
                  />
                </Grid.Col>

                <Grid.Col span={10}>
                  <TextInput
                    label='City'
                    placeholder='City'
                    value={form.data.city}
                    onChange={e => updateValue('city', e.target.value)}
                    error={form.errors.city}
                  />
                </Grid.Col>
                <Grid.Col span={2}>
                  <TextInput
                    label='Postal code'
                    placeholder='Postal code'
                    value={form.data.postal_code}
                    onChange={e => updateValue('postal_code', e.target.value)}
                    error={form.errors.postal_code}
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <Select
                    label='Country'
                    placeholder='Select country'
                    searchable
                    value={form.data.country}
                    onChange={value => updateValue('country', value)}
                    data={countriesData}
                    comboboxProps={comboboxProps}
                    error={form.errors.country}
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <TextInput
                    label='Web'
                    placeholder='Web'
                    value={form.data.web}
                    onChange={e => updateValue('web', e.target.value)}
                    error={form.errors.web}
                  />
                </Grid.Col>
                <Grid.Col
                  span={12}
                  mt='sm'
                >
                  <Stack spacing='md'>
                    <Group
                      spacing='xs'
                      align='center'
                    >
                      <IconUsersGroup size={28} />
                      <Title
                        order={4}
                        c='dimmed'
                      >
                        Teams
                      </Title>
                    </Group>
                    <Divider />
                    <ClientMultiSelect
                      label='Clients'
                      placeholder='Select clients'
                      value={form.data.clients}
                      onChange={values => updateValue('clients', values)}
                      clients={clients}
                      comboboxProps={comboboxProps}
                      error={form.errors.clients}
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

ClientCompaniesIndex.layout = page => <Layout title='Clients'>{page}</Layout>;

export default ClientCompaniesIndex;

import useForm from '@/hooks/useForm';
import Layout from '@/layouts/MainLayout';
import { usePage } from '@inertiajs/react';
import {
  Avatar,
  Breadcrumbs,
  Button,
  Card,
  Fieldset,
  Grid,
  Group,
  Image,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
} from '@mantine/core';
import { IconTrash, IconUpload } from '@tabler/icons-react';
import { useState, useRef } from 'react';
import { notifications } from '@mantine/notifications';

const CompanyEdit = () => {
  const {
    item,
    dropdowns: { countries, currencies },
  } = usePage().props;
  const [showUploadIcon, setShowUploadIcon] = useState(false);
  const fileInputRef = useRef(null);
  const [form, submit, updateValue] = useForm('post', route('settings.company.update'), {
    logo: null,
    name: item.name || '',
    address: item.address || '',
    postal_code: item.postal_code || '',
    city: item.city || '',
    country_id: item.country_id || '',
    currency_id: item.currency_id || '',
    email: item.email || '',
    phone: item.phone || '',
    web: item.web || '',
  });

  const handleFileChange = file => {
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        notifications.show({
          title: 'File too large',
          message: 'Please upload an image smaller than 2MB',
          color: 'red',
        });
        return;
      }
      updateValue('logo', file);
    } else {
      updateValue('logo', null);
    }
  };

  const handleRemoveAvatar = e => {
    e.stopPropagation();
    updateValue('logo', null);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

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
          My Companies
        </Text>
      </Breadcrumbs>
      <Card
        shadow='sm'
        padding='xl'
        radius='md'
        withBorder
      >
        <Grid
          justify='space-between'
          align='flex-end'
          gutter='xl'
          mb={35}
        >
          <Grid.Col span='auto'>
            <Title
              order={1}
              align='center'
            >
              My Companies
            </Title>
          </Grid.Col>
          <Grid.Col span='content'></Grid.Col>
        </Grid>

        <form
          onSubmit={e => {
            e.preventDefault();
            submit({
              forceFormData: true,
            });
          }}
        >
          {/* Logo & Name Section */}
          <Group
            align='flex-start'
            spacing='lg'
          >
            {/* Logo Upload Box */}
            <div
              style={{
                position: 'relative',
                width: 150,
                height: 150,
              }}
            >
              <Tooltip
                label='Upload new logo'
                withArrow
              >
                <Avatar
                  style={{
                    width: 150,
                    height: 100,
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    cursor: 'pointer',
                    position: 'relative',
                    opacity: item.logo || form.data.logo ? 1 : 0.6,
                  }}
                  onClick={handleAvatarClick}
                  onMouseEnter={() => setShowUploadIcon(true)}
                  onMouseLeave={() => setShowUploadIcon(false)}
                >
                  {/* Logo image */}
                  {item.logo || form.data.logo ? (
                    <Image
                      src={
                        form.data.logo === null ? item.logo : URL.createObjectURL(form.data.logo)
                      }
                      width={150}
                      height={150}
                      fit='cover'
                    />
                  ) : (
                    <Text
                      c='dimmed'
                      size='sm'
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        width: '100%',
                        textAlign: 'center',
                      }}
                    >
                      Company Logo (240×64)
                    </Text>
                  )}

                  {/* Hover overlay */}
                  {showUploadIcon && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background-color 0.2s ease',
                      }}
                    >
                      {item.logo || form.data.logo ? (
                        <IconTrash
                          size={28}
                          stroke={1.5}
                          color='white'
                          onClick={handleRemoveAvatar}
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

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type='file'
                accept='image/png,image/jpeg'
                style={{ display: 'none' }}
                onChange={e => handleFileChange(e.target.files?.[0] || null)}
              />

              <Text
                size='xs'
                c='dimmed'
                mt={5}
              >
                240px × 64px (aspect 15:4)
              </Text>
            </div>

            <Stack style={{ flex: 1 }}>
              <TextInput
                label='Name'
                placeholder='Company name'
                required
                value={form.data.name}
                onChange={e => updateValue('name', e.target.value)}
                error={form.errors.name}
                disabled={!can('edit owner company')}
              />

              <Select
                label='Default currency'
                placeholder='Select currency'
                required
                searchable
                value={form.data.currency_id?.toString()}
                onChange={e => updateValue('currency_id', e.target.value)}
                data={currencies}
                error={form.errors.currency_id}
                disabled={!can('edit owner company')}
              />
            </Stack>
          </Group>

          <SimpleGrid
            cols={{ base: 1, md: 2 }}
            spacing='xl'
            mt='xl'
          >
            <Fieldset
              legend='Location'
              mt='xl'
            >
              <TextInput
                label='Address'
                placeholder='Address'
                value={form.data.address}
                onChange={e => updateValue('address', e.target.value)}
                error={form.errors.address}
                disabled={!can('edit owner company')}
              />

              <Group grow>
                <TextInput
                  label='Postal code'
                  placeholder='Postal code'
                  mt='md'
                  value={form.data.postal_code}
                  onChange={e => updateValue('postal_code', e.target.value)}
                  error={form.errors.postal_code}
                  disabled={!can('edit owner company')}
                />

                <TextInput
                  label='City'
                  placeholder='City'
                  mt='md'
                  value={form.data.city}
                  onChange={e => updateValue('city', e.target.value)}
                  error={form.errors.city}
                  disabled={!can('edit owner company')}
                />
              </Group>

              <Select
                label='Country'
                placeholder='Select country'
                mt='md'
                searchable={true}
                value={form.data.country_id?.toString()}
                onChange={e => updateValue('country_id', e.target.value)}
                data={countries}
                error={form.errors.country_id}
                disabled={!can('edit owner company')}
              />
            </Fieldset>

            <Fieldset
              legend='Contact'
              mt='xl'
            >
              <Group grow>
                <TextInput
                  label='Email'
                  placeholder='Email'
                  value={form.data.email}
                  onChange={e => updateValue('email', e.target.value)}
                  error={form.errors.email}
                  disabled={!can('edit owner company')}
                />

                <TextInput
                  label='Phone'
                  placeholder='Phone'
                  value={form.data.phone}
                  onChange={e => updateValue('phone', e.target.value)}
                  error={form.errors.phone}
                  disabled={!can('edit owner company')}
                />
              </Group>

              <TextInput
                label='Web'
                placeholder='Web'
                mt='md'
                value={form.data.web}
                onChange={e => updateValue('web', e.target.value)}
                error={form.errors.web}
                disabled={!can('edit owner company')}
              />
            </Fieldset>
          </SimpleGrid>

          <Group
            justify='flex-end'
            mt='xl'
          >
            {can('edit owner company') && (
              <Button
                color='blue'
                type='submit'
                loading={form.processing}
              >
                Save
              </Button>
            )}
          </Group>
        </form>
      </Card>
    </>
  );
};

CompanyEdit.layout = page => <Layout title='My Company'>{page}</Layout>;

export default CompanyEdit;

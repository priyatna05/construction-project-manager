import useForm from '@/hooks/useForm';
import Layout from '@/layouts/MainLayout';
import { getInitials } from '@/utils/user';
import { usePage } from '@inertiajs/react';
import {
  Alert,
  Avatar,
  Breadcrumbs,
  Button,
  Card,
  Divider,
  Grid,
  Group,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconBriefcase,
  IconDeviceFloppy,
  IconInfoCircle,
  IconLock,
  IconMail,
  IconPhone,
  IconTrash,
  IconUpload,
  IconUser,
} from '@tabler/icons-react';
import { useRef, useState } from 'react';

const ProfileIndex = () => {
  const { user } = usePage().props;
  const fileInputRef = useRef(null);
  const [showUploadIcon, setShowUploadIcon] = useState(false);

  const [form, submit, updateValue] = useForm('post', route('account.profile.update', user.id), {
    _method: 'put',
    avatar: null,
    job_title: user.job_title || '',
    name: user.name,
    phone: user.phone || '',
    email: user.email,
    password: '',
    password_confirmation: '',
  });

  const handleFileChange = file => {
    if (file) {
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        notifications.show({
          title: 'File too large',
          message: 'Please upload an image smaller than 2MB',
          color: 'red',
        });
        return;
      }
      updateValue('avatar', file);
    } else {
      updateValue('avatar', null);
    }
  };

  const handleRemoveAvatar = e => {
    e.stopPropagation(); // Prevent triggering file input
    updateValue('avatar', null);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const avatarSrc =
    form.data.avatar instanceof File ? URL.createObjectURL(form.data.avatar) : user.avatar || null;

  return (
    <>
     <Breadcrumbs
            fz='sm'
            mb='xl'
            separator={<Text c='dimmed'>/</Text>}
          >
            <Text c='dimmed'>Account</Text>
            <Text
              c='white'
              fw={500}
            >
              Profile
            </Text>
          </Breadcrumbs>
      <Card
        shadow='sm'
        padding='xl'
        mt='lg'
        radius='md'
        withBorder
      >
        {/* Header Section */}
        <Group
          justify='space-between'
          mb='xl'
        >
          <div>
            <Title order={2}>My Profile</Title>
            <Text
              size='sm'
              c='dimmed'
              mt={4}
            >
              Update your personal information and account settings
            </Text>
          </div>
        </Group>

        <form
          onSubmit={e => {
            e.preventDefault();

            submit({
              forceFormData: true,
            });
          }}
        >
          <Grid gutter='xl'>
            {/* Avatar Section */}
            <Grid.Col span={{ base: 12, sm: 3, md: 2 }}>
              <Stack align='center'>
                <div style={{ position: 'relative' }}>
                  <Tooltip
                    label={avatarSrc ? 'Change avatar' : 'Upload avatar'}
                    withArrow
                    position='bottom'
                  >
                    <Avatar
                      src={avatarSrc}
                      size={150}
                      radius='xl'
                      style={{
                        cursor: 'pointer',
                        border: '3px solid var(--mantine-color-gray-3)',
                        transition: 'all 0.2s ease',
                      }}
                      onClick={handleAvatarClick}
                      onMouseEnter={() => setShowUploadIcon(true)}
                      onMouseLeave={() => setShowUploadIcon(false)}
                    >
                      {!avatarSrc &&
                        (form.data.name ? getInitials(form.data.name) : <IconUser size={60} />)}

                      {/* Hover Overlay */}
                      {showUploadIcon && (
                        <div
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            backgroundColor: 'rgba(0,0,0,0.6)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 'inherit',
                            transition: 'background-color 0.2s ease',
                          }}
                        >
                          {avatarSrc ? (
                            <IconTrash
                              size={36}
                              stroke={1.5}
                              color='white'
                              onClick={handleRemoveAvatar}
                              style={{ cursor: 'pointer' }}
                            />
                          ) : (
                            <IconUpload
                              size={36}
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
                    accept='image/png,image/jpeg,image/jpg'
                    style={{ display: 'none' }}
                    onChange={e => handleFileChange(e.target.files?.[0] || null)}
                  />
                </div>

                {/* Avatar Info Text */}
                <Text
                  size='xs'
                  c='dimmed'
                  ta='center'
                  maw={200}
                >
                  Click to upload or remove avatar
                  <br />
                  Max size: 2MB
                </Text>

                {form.errors.avatar && (
                  <Text
                    size='xs'
                    c='red'
                    ta='center'
                  >
                    {form.errors.avatar}
                  </Text>
                )}
              </Stack>
            </Grid.Col>

            {/* Form Section */}
            <Grid.Col span={{ base: 12, sm: 9, md: 10 }}>
              <Stack gap='md'>
                {/* Personal Information Section */}
                <div>
                  <Text
                    size='sm'
                    fw={600}
                    mb='xs'
                    c='dimmed'
                  >
                    PERSONAL INFORMATION
                  </Text>

                  <Grid gutter='md'>
                    <Grid.Col span={{ base: 12, md: 12 }}>
                      <TextInput
                        label='Full Name'
                        placeholder='Enter your full name'
                        required
                        value={form.data.name}
                        onChange={e => updateValue('name', e.target.value)}
                        error={form.errors.name}
                        leftSection={<IconUser size={16} />}
                      />
                      <TextInput
                        label='Job Title'
                        placeholder='e.g. Project Manager, Engineer'
                        required
                        mt='md'
                        value={form.data.job_title}
                        onChange={e => updateValue('job_title', e.target.value)}
                        error={form.errors.job_title}
                        leftSection={<IconBriefcase size={16} />}
                      />

                      <TextInput
                        label='Phone Number'
                        mt='md'
                        placeholder='e.g. 081234567890'
                        value={form.data.phone}
                        onChange={e => updateValue('phone', e.target.value)}
                        error={form.errors.phone}
                        leftSection={<IconPhone size={16} />}
                      />
                    </Grid.Col>
                  </Grid>
                </div>
                <Divider
                  label={
                    <Text
                      fw={600}
                      size='sm'
                    >
                      ACCOUNT SECURITY
                    </Text>
                  }
                  labelPosition='left'
                  mt='md'
                />

                {/* Password Section */}
                <div>
                  <Alert
                    icon={<IconInfoCircle size={16} />}
                    color='blue'
                    variant='light'
                    mb='md'
                  >
                    Leave password fields empty if you don`t want to change your password
                  </Alert>
                  <Grid gutter='md'>
                    <Grid.Col span={{ base: 12, md: 12 }}>
                      <TextInput
                        label='Email Address'
                        placeholder='your.email@example.com'
                        required
                        type='email'
                        value={form.data.email}
                        onChange={e => updateValue('email', e.target.value)}
                        onBlur={() => form.validate('email')}
                        error={form.errors.email}
                        leftSection={<IconMail size={16} />}
                      />
                      <PasswordInput
                        label='New Password'
                        mt='md'
                        placeholder='Enter new password'
                        value={form.data.password}
                        onChange={e => updateValue('password', e.target.value)}
                        error={form.errors.password}
                        leftSection={<IconLock size={16} />}
                      />
                      <PasswordInput
                        label='Confirm New Password'
                        mt='md'
                        placeholder='Confirm new password'
                        value={form.data.password_confirmation}
                        onChange={e => updateValue('password_confirmation', e.target.value)}
                        error={form.errors.password_confirmation}
                        leftSection={<IconLock size={16} />}
                      />
                    </Grid.Col>
                  </Grid>

                </div>

                {/* Action Buttons */}
                <Group
                  justify='flex-end'
                  mt='xl'
                >
                  <Button
                    variant='light'
                    color='gray'
                    onClick={() => form.reset()}
                    disabled={form.processing}
                  >
                    Cancel
                  </Button>
                  <Button
                    type='submit'
                    loading={form.processing}
                    leftSection={<IconDeviceFloppy size={16} />}
                  >
                    Save Changes
                  </Button>
                </Group>
              </Stack>
            </Grid.Col>
          </Grid>
        </form>
      </Card>
    </>
  );
};

ProfileIndex.layout = page => <Layout title='Profile'>{page}</Layout>;

export default ProfileIndex;

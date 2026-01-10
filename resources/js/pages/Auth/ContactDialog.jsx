import { useState } from 'react';
import { router } from '@inertiajs/react';
import {
  Dialog,
  TextInput,
  Textarea,
  Select,
  Button,
  Group,
  Stack,
  Text,
  Box,
  Divider,
} from '@mantine/core';
import {
  IconCheck,
  IconAlertCircle,
  IconMail,
  IconUser,
  IconBuilding,
  IconBriefcase,
  IconMessageCircle,
  IconPhone,
} from '@tabler/icons-react';
import { useComputedColorScheme } from '@mantine/core';

const DEFAULT_REQUEST_TYPE_OPTIONS = [
  { value: 'account', label: 'Account Creation' },
  { value: 'project', label: 'Project Request' },
  { value: 'both', label: 'Account & Project' },
  { value: 'consultation', label: 'Consultation' },
];

export default function ContactDialog({
  opened,
  resetAndClose,
  initialEmail = '',
  requestTypeOptions,
  initialRequestType = '',
}) {
  const resolvedRequestTypeOptions =
    Array.isArray(requestTypeOptions) && requestTypeOptions.length > 0
      ? requestTypeOptions
      : DEFAULT_REQUEST_TYPE_OPTIONS;
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: initialEmail,
    phone: '',
    company: '',
    requestType: initialRequestType,
    projectType: '',
    budget: '',
    message: '',
  });
  const scheme = useComputedColorScheme('light');
  const isDark = scheme === 'dark';
  const zIndexDialog = { zIndex: 2200 };

  const isFormValid =
    formData.name.trim() &&
    formData.email.trim() &&
    formData.requestType &&
    formData.message.trim();

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      await router.post(route('contact.store'), formData, {
        onSuccess: page => {
          const flash = page?.props?.flash;
          if (flash?.type === 'error') {
            setError({
              title: flash.title || 'Request failed',
              message: flash.message || 'Something went wrong. Please try again.',
            });
            return;
          }
          if (page?.props?.flash?.success || flash?.type === 'success') {
            setSuccess(true);
            setTimeout(() => {
              resetAndClose();
              handleResetForm();
              setSuccess(false);
              setFormData({
                name: '',
                email: initialEmail,
                phone: '',
                company: '',
                requestType: initialRequestType,
                projectType: '',
                budget: '',
                message: '',
              });
            }, 2000);
          }
        },
        onError: errors => {
          console.error('Validation errors:', errors);
          const firstError = Object.values(errors || {})[0];
          const message = Array.isArray(firstError) ? firstError[0] : firstError;
          setError({
            title: 'Validation failed',
            message: message || 'Please check the form and try again.',
          });
        },
      });
    } catch (error) {
      console.error('Error:', error);
      setError({
        title: 'Request failed',
        message: 'Something went wrong. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  // lokal reset form saja, tanpa menimpa prop
  const handleResetForm = () => {
    setSuccess(false);
    setError(null);
    setFormData({
      name: '',
      email: initialEmail,
      phone: '',
      company: '',
      requestType: initialRequestType,
      projectType: '',
      budget: '',
      message: '',
    });
  };

  const handleClose = () => {
    handleResetForm();
    resetAndClose();
  };

  return (
    <>
      <Dialog
        opened={opened}
        onClose={handleClose}
        withCloseButton={true}
        size='xl'
        radius='md'
        zIndex={2200}
        bg={isDark ? 'dark' : 'white'}
        position={{ bottom: 20, right: 20 }}
        transitionProps={{
          transition: 'slide-up',
          duration: 300,
          timingFunction: 'ease',
        }}
        styles={{
          root: {
            maxWidth: '600px',
            width: '90vw',
          },
          body: {
            padding: 0,
            backgroundColor: isDark ? 'transparent' : 'white',
          },
          content: {
            background: isDark
              ? 'linear-gradient(135deg, #0f172a 0%, #0b1224 100%)'
              : 'white',
            borderRadius: '12px',
            boxShadow: isDark ? '0 20px 40px rgba(0,0,0,0.45)' : '0 8px 32px rgba(0, 0, 0, 0.12)',
            border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e9ecef',
          },
        }}
      >
        {error ? (
          <Box style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <Box
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                backgroundColor: '#ffe3e3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
              }}
            >
              <IconAlertCircle
                size={40}
                color='#e03131'
                stroke={3}
              />
            </Box>
            <Text
              size='xl'
              fw={600}
              mb='xs'
            >
              {error?.title || 'Request failed'}
            </Text>
            <Text
              size='sm'
              c='dimmed'
              mb='xl'
            >
              {error?.message || 'Something went wrong. Please try again.'}
            </Text>
            <Button
              onClick={() => {
                handleClose();
              }}
              variant='light'
              size='md'
            >
              Close
            </Button>
          </Box>
        ) : success ? (
          <Box style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <Box
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                backgroundColor: '#d3f9d8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
              }}
            >
              <IconCheck
                size={40}
                color='#2b8a3e'
                stroke={3}
              />
            </Box>
            <Text
              size='xl'
              fw={600}
              mb='xs'
            >
              Request Sent!
            </Text>
            <Text
              size='sm'
              c='dimmed'
              mb='xl'
            >
              Our team will contact you via email within 24 hours.
            </Text>
            <Button
              onClick={resetAndClose}
              variant='light'
              size='md'
            >
              Close
            </Button>
          </Box>
        ) : (
          <>
            <Box>
              <Text
                size='xl'
                fw={600}
                mb='xs'
                c={isDark ? 'gray.0' : undefined}
              >
                Contact us
              </Text>
              <Text
                size='sm'
                c={isDark ? 'gray.3' : 'dimmed'}
              >
                Fill out the form for account request or project consultation
              </Text>
            </Box>

            <Stack gap='lg'>
              {/* Personal Information Section */}
              <Box>
                <Text
                  size='sm'
                  fw={500}
                  mb='md'
                  c={isDark ? 'gray.2' : 'gray.7'}
                >
                  Personal Data Information
                </Text>
                <Stack gap='md'>
                  <TextInput
                    placeholder='Your Full Name'
                    leftSection={
                      <IconUser
                        size={18}
                        stroke={1.5}
                      />
                    }
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    styles={{
                      input: {
                        border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #ced4da',
                        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'white',
                        color: isDark ? '#e2e8f0' : undefined,
                        '&:focus': {
                          borderColor: '#228be6',
                          borderWidth: '2px',
                        },
                        '&:hover': {
                          borderColor: isDark ? 'rgba(255,255,255,0.25)' : '#adb5bd',
                        },
                      },
                    }}
                  />

                  <Group grow>
                    <TextInput
                      placeholder='Email'
                      type='email'
                      leftSection={
                        <IconMail
                          size={18}
                          stroke={1.5}
                        />
                      }
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      styles={{
                        input: {
                          border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #ced4da',
                          backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'white',
                          color: isDark ? '#e2e8f0' : undefined,
                          '&:focus': {
                            borderColor: '#228be6',
                            borderWidth: '2px',
                          },
                          '&:hover': {
                            borderColor: isDark ? 'rgba(255,255,255,0.25)' : '#adb5bd',
                          },
                        },
                      }}
                    />

                    <TextInput
                      placeholder='Phone number'
                      leftSection={
                        <IconPhone
                          size={18}
                          stroke={1.5}
                        />
                      }
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      styles={{
                        input: {
                          border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #ced4da',
                          backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'white',
                          color: isDark ? '#e2e8f0' : undefined,
                          '&:focus': {
                            borderColor: '#228be6',
                            borderWidth: '2px',
                          },
                          '&:hover': {
                            borderColor: isDark ? 'rgba(255,255,255,0.25)' : '#adb5bd',
                          },
                        },
                      }}
                    />
                  </Group>

                  <TextInput
                    placeholder='Company name (optional)'
                    leftSection={
                      <IconBuilding
                        size={18}
                        stroke={1.5}
                      />
                    }
                    value={formData.company}
                    onChange={e => setFormData({ ...formData, company: e.target.value })}
                    styles={{
                      input: {
                        border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #ced4da',
                        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'white',
                        color: isDark ? '#e2e8f0' : undefined,
                        '&:focus': {
                          borderColor: '#228be6',
                          borderWidth: '2px',
                        },
                        '&:hover': {
                          borderColor: isDark ? 'rgba(255,255,255,0.25)' : '#adb5bd',
                        },
                      },
                    }}
                  />
                </Stack>
              </Box>

              <Divider />

              {/* Request Information Section */}
              <Box>
                <Text
                  size='sm'
                  fw={500}
                  mb='md'
                  c='gray.7'
                >
                  Detail Request
                </Text>
                <Stack gap='md'>
                  <Select
                    placeholder='Select request type'
                    data={resolvedRequestTypeOptions}
                    value={formData.requestType}
                    onChange={value => setFormData({ ...formData, requestType: value })}
                    comboboxProps={zIndexDialog}
                    styles={{
                      input: {
                        border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #ced4da',
                        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'white',
                        color: isDark ? '#e2e8f0' : undefined,
                        '&:focus': {
                          borderColor: '#228be6',
                          borderWidth: '2px',
                        },
                        '&:hover': {
                          borderColor: isDark ? 'rgba(255,255,255,0.25)' : '#adb5bd',
                        },
                      },
                    }}
                  />

                  {(formData.requestType === 'project' || formData.requestType === 'both') && (
                    <Group grow>
                      <Select
                        placeholder='Project Type'
                        comboboxProps={zIndexDialog}
                        leftSection={
                          <IconBriefcase
                            size={18}
                            stroke={1.5}
                          />
                        }
                        data={[
                          { value: 'residential', label: 'Residential Building' },
                          { value: 'commercial', label: 'Commercial Building' },
                          { value: 'industrial', label: 'Industrial Project' },
                          { value: 'infrastructure', label: 'Infrastructure Project' },
                          { value: 'renovation', label: 'Renovation / Remodeling' },
                          { value: 'custom', label: 'Custom Project' },
                        ]}
                        value={formData.projectType}
                        onChange={value => setFormData({ ...formData, projectType: value })}
                        styles={{
                          input: {
                            border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #ced4da',
                            backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'white',
                            color: isDark ? '#e2e8f0' : undefined,
                            '&:focus': {
                              borderColor: '#228be6',
                              borderWidth: '2px',
                            },
                            '&:hover': {
                              borderColor: isDark ? 'rgba(255,255,255,0.25)' : '#adb5bd',
                            },
                          },
                        }}
                      />

                      <Select
                        placeholder='Budget'
                        comboboxProps={zIndexDialog}
                        data={[
                          { value: '10-50', label: '< 50 Jt' },
                          { value: '50-100', label: '50-100 Jt' },
                          { value: '100-500', label: '100-500 Jt' },
                          { value: '500+', label: '> 500 Jt' },
                          { value: 'discuss', label: 'Diskusi' },
                        ]}
                        value={formData.budget}
                        onChange={value => setFormData({ ...formData, budget: value })}
                        styles={{
                          input: {
                            border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #ced4da',
                            backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'white',
                            color: isDark ? '#e2e8f0' : undefined,
                            '&:focus': {
                              borderColor: '#228be6',
                              borderWidth: '2px',
                            },
                            '&:hover': {
                              borderColor: isDark ? 'rgba(255,255,255,0.25)' : '#adb5bd',
                            },
                          },
                        }}
                      />
                    </Group>
                  )}

                  <Textarea
                    placeholder='Describe your needs...'
                    minRows={4}
                    autosize
                    maxRows={8}
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                    styles={{
                      wrapper: {
                        position: 'relative',
                      },
                      input: {
                        border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #ced4da',
                        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'white',
                        color: isDark ? '#e2e8f0' : undefined,
                        paddingLeft: '40px',
                        paddingTop: '12px',
                        paddingBottom: '12px',
                        fontSize: '14px',
                        lineHeight: '1.5',
                        '&:focus': {
                          borderColor: '#228be6',
                          borderWidth: '2px',
                          paddingLeft: '39px',
                        },
                        '&:hover': {
                          borderColor: isDark ? 'rgba(255,255,255,0.25)' : '#adb5bd',
                        },
                        '&::placeholder': {
                          color: isDark ? '#9ca3af' : '#adb5bd',
                        },
                      },
                    }}
                    leftSectionPointerEvents='none'
                    leftSection={
                      <IconMessageCircle
                        size={18}
                        stroke={1.5}
                        style={{
                          marginLeft: '12px',
                          color: '#868e96',
                        }}
                      />
                    }
                  />
                </Stack>
              </Box>

              <Group
                justify='space-between'
                mt='md'
              >
                <Text
                  size='xs'
                  c='dimmed'
                >
                  Response within 1x24 Hours
                </Text>
                <Group gap='sm'>
                  <Button
                    color='gray'
                    onClick={handleClose}
                    disabled={loading}
                  >
                    Cancle
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    loading={loading}
                    disabled={!isFormValid}
                    leftSection={<IconMail size={18} />}
                    color='green'
                  >
                    Send
                  </Button>
                </Group>
              </Group>
            </Stack>
          </>
        )}
      </Dialog>
    </>
  );
}

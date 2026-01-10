import {
  Modal,
  TextInput,
  Textarea,
  Group,
  Stack,
  Text,
  Box,
  Divider,
  Paper,
} from '@mantine/core';
import {
  IconUser,
  IconMail,
  IconBuilding,
  IconBriefcase,
  IconMessageCircle,
  IconPhone,
} from '@tabler/icons-react';

export default function ContactRequestModal({ opened, onClose, contactData }) {
  if (!contactData) return null;

  const budgetLabels = {
    '10-50': '< 50 Jt',
    '50-100': '50-100 Jt',
    '100-500': '100-500 Jt',
    '500+': '> 500 Jt',
    'discuss': 'To be discussed'
  };

  const requestTypeLabels = {
    'account': 'Pembuatan Akun Baru',
    'project': 'Permintaan Project',
    'both': 'Akun & Project',
    'consultation': 'Konsultasi'
  };

  const projectTypeLabels = {
    'residential': 'Residential Building',
    'commercial': 'Commercial Building',
    'industrial': 'Industrial Project',
    'infrastructure': 'Infrastructure Project',
    'renovation': 'Renovation / Remodeling',
    'custom': 'Custom Project'
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size='xl'
      radius='md'
      title="Contact Request Details"
      styles={{
        root: {
          maxWidth: '600px',
          width: '90vw',
        },
      }}
    >
      <Paper
        p='md'
        shadow='none'
        withBorder={false}
      >
        <Stack gap='lg'>
          {/* Personal Information Section */}
          <Box>
            <Text
              size='sm'
              fw={500}
              mb='md'
              c='gray.7'
            >
              Personal Data Information
            </Text>
            <Stack gap='md'>
              <TextInput
                label='Full Name'
                value={contactData.name || ''}
                readOnly
                leftSection={
                  <IconUser
                    size={18}
                    stroke={1.5}
                  />
                }
              />

              <Group grow>
                <TextInput
                  label='Email'
                  value={contactData.email || ''}
                  readOnly
                  leftSection={
                    <IconMail
                      size={18}
                      stroke={1.5}
                    />
                  }
                />

                <TextInput
                  label='Phone'
                  value={contactData.phone || 'Not provided'}
                  readOnly
                  leftSection={
                    <IconPhone
                      size={18}
                      stroke={1.5}
                    />
                  }
                />
              </Group>

              <TextInput
                label='Company'
                value={contactData.company || 'Not provided'}
                readOnly
                leftSection={
                  <IconBuilding
                    size={18}
                    stroke={1.5}
                  />
                }
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
              Detail Permintaan
            </Text>
            <Stack gap='md'>
              <TextInput
                label='Request Type'
                value={requestTypeLabels[contactData.requestType] || contactData.requestType || ''}
                readOnly
              />

              {(contactData.requestType === 'project' || contactData.requestType === 'both') && (
                <Group grow>
                  <TextInput
                    label='Project Type'
                    value={projectTypeLabels[contactData.projectType] || contactData.projectType || ''}
                    readOnly
                    leftSection={
                      <IconBriefcase
                        size={18}
                        stroke={1.5}
                      />
                    }
                  />

                  <TextInput
                    label='Budget'
                    value={budgetLabels[contactData.budget] || contactData.budget || ''}
                    readOnly
                  />
                </Group>
              )}

              <Textarea
                label='Message'
                value={contactData.message || ''}
                readOnly
                minRows={4}
                leftSection={
                  <IconMessageCircle
                    size={20}
                    stroke={1.5}
                  />
                }
              />
            </Stack>
          </Box>
        </Stack>
      </Paper>
    </Modal>
  );
}

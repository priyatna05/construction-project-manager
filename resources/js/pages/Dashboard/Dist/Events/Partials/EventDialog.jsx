import {
  ActionIcon,
  Box,
  Center,
  Grid,
  Group,
  Loader,
  MultiSelect,
  Select,
  Stack,
  Text,
  TextInput,
  rem,
} from '@mantine/core';
import RichTextEditor from '@/components/RichTextEditor';
import Modal from '@/components/Modal';
import { DateInput, TimeInput } from '@mantine/dates';
import {
  IconBible,
  IconCalendar,
  IconCheck,
  IconClock,
  IconDeviceFloppy,
  IconTypeface,
  IconUsers,
} from '@tabler/icons-react';
import { useRef } from 'react';
import { usePage } from '@inertiajs/react';

export default function EventDialog({
  opened,
  onClose,
  onSubmit,
  formData,
  formRef,
  processing,
  hasChanged,
  saved,
  setFormData,
  isEditing,
  selectedDate,
  onDateChange,
}) {
  const timeInputRef = useRef(null);
  const page = usePage();
  const { users = [], clients = [] } = page?.props ?? {};
  const usersData = Array.isArray(users)
    ? users.map(c => ({ value: String(c.id ?? c.value), label: c.name ?? c.label }))
    : Object.entries(users).map(([value, label]) => ({ value: String(value), label }));
  const clientsData = Array.isArray(clients)
    ? clients.map(c => ({ value: String(c.id ?? c.value), label: c.name ?? c.label }))
    : Object.entries(clients).map(([value, label]) => ({ value: String(value), label }));
  const selectData = [...usersData, ...clientsData];

  const pickerControl = (
    <ActionIcon
      variant='subtle'
      color='gray'
      onClick={() => timeInputRef.current?.showPicker?.()}
    >
      <IconClock
        size={16}
        stroke={1.5}
      />
    </ActionIcon>
  );

  const TitleBar = (
    <Group
      align='center'
      ml='lg'
      mt='sm'
    >
      {hasChanged && (
        <ActionIcon
          onClick={onSubmit}
          loading={processing}
          color={saved ? 'teal' : 'green'}
          radius='xl'
          size='xl'
          title='Save changes'
        >
          {processing ? (
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
          ml={6}
        >
          {saved ? 'Saved ✓' : isEditing ? 'Edit Event' : 'Add New Event'}
        </Text>

        <Text
          fz='sm'
          c='dimmed'
          ml={6}
        >
          {saved
            ? 'All changes have been successfully saved.'
            : isEditing
              ? 'Update event details such as title, type, or time.'
              : 'Fill out the form below to create a new event.'}
        </Text>
      </Stack>
    </Group>
  );

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      draggable
      title={TitleBar}
      centered
      radius='md'
      size='1200'
      closeButtonProps={{
        style: {
          position: 'absolute',
          top: 12,
          right: 12,
          background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)',
        },
      }}
      overlayProps={{ backgroundOpacity: 0.45, blur: 6 }}
      transitionProps={{ transition: 'fade', duration: 200 }}
    >
      <Center>
        <Box
          w='80%'
          pb='xl'
        >
          <form
            ref={formRef}
            onSubmit={onSubmit}
          >
            <Grid align='flex-start'>
              <Grid.Col span={10}>
                <TextInput
                  label='Title'
                  leftSection={<IconBible size={16} />}
                  placeholder='Enter event title'
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </Grid.Col>
              <Grid.Col span={2}>
                <Select
                  label='Type'
                  placeholder='Select Category Events'
                  leftSection={<IconTypeface size={16} />}
                  value={formData.type}
                  onChange={value => setFormData({ ...formData, type: value })}
                  data={[
                    { value: 'meeting', label: 'Meeting' },
                    { value: 'task', label: 'Task' },
                    { value: 'goal', label: 'Goal' },
                  ]}
                />
              </Grid.Col>
              <Grid.Col span={10}>
                <DateInput
                  label='Date'
                  leftSection={<IconCalendar size={16} />}
                  value={selectedDate}
                  valueFormat='DD MMMM YYYY'
                  onChange={value => value && onDateChange(value)}
                />
              </Grid.Col>
              <Grid.Col span={2}>
                <TimeInput
                  ref={timeInputRef}
                  leftSection={pickerControl}
                  leftSectionPointerEvents='all'
                  label='Time'
                  placeholder='e.g. 09:00'
                  value={formData.time}
                  onChange={e => setFormData({ ...formData, time: e.currentTarget.value })}
                />
              </Grid.Col>
              <Grid.Col span={12}>
                <MultiSelect
                  label='Notify Users'
                  mt='sm'
                  searchable
                  leftSection={<IconUsers size={16} />}
                  placeholder='Select users to notify'
                  value={formData.notifyUsers}
                  onChange={value => setFormData({ ...formData, notifyUsers: value })}
                  data={selectData}
                />
              </Grid.Col>
              <Grid.Col span={12}>
                <RichTextEditor
                  label='Description'
                  mt='sm'
                  placeholder='Add a description event'
                  value={formData.description}
                  onChange={value => setFormData({ ...formData, description: value || '' })}
                />
              </Grid.Col>
            </Grid>
          </form>
        </Box>
      </Center>
    </Modal>
  );
}

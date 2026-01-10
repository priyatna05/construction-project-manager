import { useState, useEffect, useMemo } from 'react';
import { usePage } from '@inertiajs/react';
import {
  Button,
  Card,
  ColorInput,
  Group,
  Table,
  Title,
  Text,
  Anchor,
  TextInput,
  Grid,
  Select,
  ActionIcon,
  Loader,
  Stack,
  rem,
  Center,
  Container,
  Box,
  Breadcrumbs,
} from '@mantine/core';
import { IconPlus, IconCheck, IconDeviceFloppy } from '@tabler/icons-react';
import * as TablerIcons from '@tabler/icons-react';

import Layout from '@/layouts/MainLayout';
import Modal from '@/components/Modal';
import useModal from '@/components/useModal';
import useForm from '@/hooks/useForm';
import Pagination from '@/components/Pagination';
import TableHead from '@/components/TableHead';
import TableRowEmpty from '@/components/TableRowEmpty';
import TableRow from './TableRow';
import ArchivedFilterButton from '@/components/ArchivedFilterButton';

import { reloadWithQuery } from '@/utils/route';
import { prepareColumns, actionColumnVisibility } from '@/utils/table';
import IconSelectOption from '@/components/IconSelectOption';

const toKebabCase = str =>
  (str &&
    str
      .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
      .map(x => x.toLowerCase())
      .join('_')) ||
  '';

const LabelsIndex = () => {
  const { items } = usePage().props;
  const { opened, open, close } = useModal();
  const [editingLabel, setEditingLabel] = useState(null);
  const [saved, setSaved] = useState(false);


  const [form, submit, updateValue] = useForm('post', route('settings.labels.store'), {
    type: '',
    name: '',
    slug: '',
    color: '#228BE6',
    icon: '',
  });

  const labelTypes = [
    { value: 'pt_status', label: 'Project/Task Status' },
    { value: 'ptb_status', label: 'Project/Task Billing Status' },
    { value: 'kontrak_label', label: 'Kontrak type project' },
    { value: 'task_relation', label: 'Task Relation' },
    { value: 'task_type_label', label: 'Task Type status' },
    { value: 'task_priority_label', label: 'Task Priority status' },
    { value: 'task_inventory_unit_label', label: 'Tasks/Inventory Unit' },
    { value: 'inventory_status_label', label: 'Inventory Status' },
    { value: 'inventory_type_label', label: 'Inventory Type' },
  ];

  const tablerIconOptions = useMemo(() => {
    const iconKeys = Object.keys(TablerIcons).filter(key => key.startsWith('Icon'));

    const options = iconKeys.map(key => ({
      value: key,
      label: key,
    }));
    return options;
  }, []);

  useEffect(() => {
    if (form.data.name) {
      const newSlug = toKebabCase(form.data.name);
      if (newSlug !== form.data.slug) {
        form.setData('slug', newSlug);
      }
    }
  }, [form.data.name]);

  useEffect(() => {
    if (editingLabel) {
      form.setData({
        type: editingLabel.type || '',
        name: editingLabel.name || '',
        slug: editingLabel.slug || '',
        color: editingLabel.color || '#228BE6',
        icon: editingLabel.icon || '',
      });
      form.setMethod('put');
      form.setAction(route('settings.labels.update', editingLabel.id));
    } else {
      form.setData({ type: '', name: '', slug: '', color: '#228BE6', icon: '' });
      form.setMethod('post');
      form.setAction(route('settings.labels.store'));
    }
    form.clearErrors();
  }, [editingLabel]);

  const handleCreate = () => {
    setEditingLabel(null);
    open();
  };

  const handleEdit = item => {
    setEditingLabel(item);
    open();
  };

  const handleClose = () => {
    setEditingLabel(null);
    form.reset();
    form.clearErrors();
    close();
  };

  useEffect(() => {
    if (route().params?.create && can('create label')) {
      handleCreate();
    }
  }, []);

  const sort = sort => reloadWithQuery(sort);

  const columns = prepareColumns([
    { label: 'Status for', sortable: false },
    { label: 'Labels', column: 'label' },
    { label: 'Actions', sortable: false, visible: actionColumnVisibility('label') },
  ]);

  const rows = items.data.length ? (
    items.data.map(item => (
      <TableRow
        key={item.id}
        item={item}
        onEdit={handleEdit}
      />
    ))
  ) : (
    <TableRowEmpty colSpan={columns.length} />
  );

  const [initialData, setInitialData] = useState(form.data);
  const hasChanged = JSON.stringify(form.data) !== JSON.stringify(initialData);
  const modalZIndex = 2200;
  const comboboxProps = { withinPortal: true, zIndex: modalZIndex + 200 };
  const popoverProps = { withinPortal: true, zIndex: modalZIndex + 200 };

  useEffect(() => {
    if (saved) {
      const timeout = setTimeout(() => setSaved(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [saved]);

  const handleSubmit = e => {
    e.preventDefault();

    form.submit({
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
          {saved ? 'Saved ✓' : editingLabel ? 'Update Status' : 'Create Status'}
        </Text>

        <Text
          fz='sm'
          c='dimmed'
        >
          {saved
            ? 'All changes have been successfully saved.'
            : editingLabel
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
        <Text c='dimmed'>Settings</Text>
        <Text
          c='white'
          fw={500}
        >
          Statuses
        </Text>
      </Breadcrumbs>
      <Title
        mb='lg'
        style={{ color: 'white' }}
      >
        List of labels
      </Title>

      <Grid
        justify='space-between'
        align='center'
      >
        <Grid.Col span='content'>
          <Group>
            {can('create label') && (
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
        mt='md'
      >
        <Table stickyHeader>
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
        key={editingLabel?.id || 'new'}
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
          <Container
            size={960}
            pb='xl'
            mt='lg'
          >
            <Box maw={600}>
              <form onSubmit={e => submit(e, { onSuccess: () => handleClose() })}>
                <Grid>
                  <Grid.Col span={12}>
                    <Select
                      label='Type used for'
                      placeholder='Select a label type'
                      required
                      searchable
                      comboboxProps={comboboxProps}
                      value={form.data.type}
                      onChange={value => form.setData('type', value || '')}
                      data={labelTypes}
                      error={form.errors.type}
                    />
                  </Grid.Col>
                  <Grid.Col span={12}>
                    <TextInput
                      label='Name'
                      placeholder='Label name'
                      required
                      value={form.data.name}
                      onChange={e => updateValue('name', e.target.value)}
                      error={form.errors.name}
                    />
                  </Grid.Col>

                  <Grid.Col span={5}>
                    <TextInput
                      label='Slug'
                      placeholder='Auto-generated from name'
                      required
                      disabled
                      value={form.data.slug}
                      readOnly
                      error={form.errors.slug}
                    />
                  </Grid.Col>
                  <Grid.Col span={3}>
                    <ColorInput
                      label='Color'
                      placeholder='Label color'
                      required
                      value={form.data.color}
                      onChange={color => updateValue('color', color)}
                      popoverProps={popoverProps}
                      swatches={[
                        '#343A40',
                        '#E03231',
                        '#C2255C',
                        '#9C36B5',
                        '#6741D9',
                        '#3B5BDB',
                        '#2771C2',
                        '#2A8599',
                        '#2B9267',
                        '#309E44',
                        '#66A810',
                        '#F08C00',
                        '#E7590D',
                      ]}
                      swatchesPerRow={7}
                      error={form.errors.color}
                    />
                  </Grid.Col>
                  <Grid.Col span={4}>
                    <Select
                      label='Icon'
                      placeholder='Search and select an icon'
                      searchable
                      value={form.data.icon}
                      onChange={icon => form.setData('icon', icon || '')}
                      data={tablerIconOptions}
                      renderOption={IconSelectOption}
                      comboboxProps={comboboxProps}
                      leftSection={
                        form.data.icon
                          ? (() => {
                              const IconComponent = TablerIcons[form.data.icon];
                              return IconComponent ? <IconComponent size={18} /> : null;
                            })()
                          : null
                      }
                      error={form.errors.icon}
                      nothingFoundMessage='No icon found'
                    />
                    <Text
                      size='xs'
                      c='dimend'
                    >
                      from {''}
                      <Anchor
                        href='https://tabler.io/icons'
                        target='_blank'
                        size='xs'
                      >
                        @tabler/icons-react
                      </Anchor>
                    </Text>
                  </Grid.Col>
                </Grid>
              </form>
            </Box>
          </Container>
        </Center>
      </Modal>
    </>
  );
};

LabelsIndex.layout = page => <Layout title='Labels'>{page}</Layout>;

export default LabelsIndex;

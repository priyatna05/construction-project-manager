import {
  Grid,
  TextInput,
  NumberInput,
  Group,
  Stack,
  Divider,
  Title,
  Text,
  Paper,
  ActionIcon,
  Loader,
  Switch,
  Button,
  Flex,
  Alert,
  Tooltip,
} from '@mantine/core';
import Modal from '@/components/Modal';
import { DateInput } from '@mantine/dates';
import { useForm, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import Dropzone from '@/components/Dropzone';
import RichTextEditor from '@/components/RichTextEditor';
import { IconCheck } from '@tabler/icons-react';
import { useState, useEffect, useMemo } from 'react';
import useAuthorization from '@/hooks/useAuthorization';
import { openConfirmModal } from '@/components/ConfirmModal';
import UserMultiSelect from '@/components/UserMultiSelect';
import StatusMultiSelect from '@/components/StatusMultiSelect';
import StatusSelect from '@/components/StatusSelect';

export default function EditProject({
  opened,
  onClose,
  project,
  dropdowns,
  currencySymbol,
  renderSelectOptionWithIcon,
  suggestion,
}) {
  const modalZIndex = 2200;
  const { can } = useAuthorization();

  const parseBackendDate = s => {
    if (!s) return null;

    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return null;
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  };

  const normalizeBudgetValue = value => {
    if (value === null || value === undefined || value === '') return '';
    const parsed = Number(value);
    return Number.isNaN(parsed) ? '' : parsed;
  };

  const initialFormValues = useMemo(
    () => ({
      name: project?.name || '',
      description: project?.description || '',
      start_date: parseBackendDate(project?.start_date),
      end_date: parseBackendDate(project?.end_date),
      budget_project_estimate: normalizeBudgetValue(project?.budget_project_estimate),
      type_id: project?.type?.slug || '',
      status_ids: project?.status?.map(s => s.slug) || [],
      users: project?.users?.map(u => u.id) || [],
      attachment_files: [],
      existing_attachments: (project?.attachments || []).map(att => ({
        ...att,
        is_main: att.is_main || false,
      })),
      deleted_attachments_ids: [],
      is_completed: Boolean(project?.is_completed),
      completed_at: project?.completed_at || null,
    }),
    [project]
  );

  const form = useForm(initialFormValues);
  const userOptions = useMemo(() => {
    const baseUsers = dropdowns?.users || [];
    const lookup = new Map(baseUsers.map(user => [String(user.value ?? user.id), user]));

    (project?.users || []).forEach(user => {
      const id = String(user.id);
      if (!lookup.has(id)) {
        lookup.set(id, {
          value: id,
          label: user.name,
          name: user.name,
          avatar: user.avatar ?? null,
        });
      }
    });

    return Array.from(lookup.values());
  }, [dropdowns?.users, project?.users]);

  const [hasChanged, setHasChanged] = useState(false);
  const [completionModalOpened, setCompletionModalOpened] = useState(false);
  const [saving, setSaving] = useState(false);
  const isLocked = Boolean(form.data.is_completed);
  const canEdit = can('edit project') && !isLocked;
  const completionLabel = useMemo(() => {
    const statuses = (form.data.status_ids || []).map(s => (s || '').toString().toLowerCase());
    if (form.data.is_completed) return 'Completed (locked)';
    if (statuses.includes('completed')) return 'Completed (pre-confirmed)';
    return 'Mark as completed';
  }, [form.data.is_completed, form.data.status_ids]);

  useEffect(() => {
    const formatLocalDate = d => {
      if (!d) return null;
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    const compareNonAttachmentFields = () => {
      const originalStart = project?.start_date
        ? formatLocalDate(new Date(project.start_date))
        : null;
      const originalEnd = project?.end_date ? formatLocalDate(new Date(project.end_date)) : null;
      const normalizeDateTime = value => {
        if (!value) return null;
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? null : date.toISOString();
      };
      const originalCompletedAt = normalizeDateTime(project?.completed_at);
      const formCompletedAt = normalizeDateTime(form.data.completed_at);

      const formStart = form.data.start_date ? formatLocalDate(form.data.start_date) : null;
      const formEnd = form.data.end_date ? formatLocalDate(form.data.end_date) : null;
      const normalizedFormBudget = normalizeBudgetValue(form.data.budget_project_estimate);
      const normalizedProjectBudget = normalizeBudgetValue(project?.budget_project_estimate);

      return (
        form.data.name !== (project?.name || '') ||
        form.data.description !== (project?.description || '') ||
        formStart !== originalStart ||
        formEnd !== originalEnd ||
        normalizedFormBudget !== normalizedProjectBudget ||
        form.data.type_id !== (project?.type?.slug || '') ||
        Boolean(form.data.is_completed) !== Boolean(project?.is_completed) ||
        formCompletedAt !== originalCompletedAt ||
        (form.data.status_ids || []).sort().join(',') !==
          (project?.status
            ?.map(s => s.slug)
            .sort()
            .join(',') || '') ||
        (form.data.users || []).map(Number).sort().join(',') !==
          (project?.users
            ?.map(u => u.id)
            .sort()
            .join(',') || '')
      );
    };

    const compareAttachmentFields = () => {
      if ((form.data.attachment_files || []).length > 0) {
        return true;
      }

      if ((form.data.deleted_attachments_ids || []).length > 0) {
        return true;
      }

      const originalIsMain = (project?.attachments || [])
        .map(att => att.is_main || false)
        .sort()
        .join(',');
      const currentIsMain = (form.data.existing_attachments || [])
        .map(att => att.is_main || false)
        .sort()
        .join(',');
      if (originalIsMain !== currentIsMain) {
        return true;
      }

      const currentExistingAttachmentIds = (form.data.existing_attachments || [])
        .filter(att => !form.data.deleted_attachments_ids.includes(att.id))
        .map(att => att.id)
        .sort()
        .join(',');

      const originalAttachmentIds = (project?.attachments || [])
        .map(att => att.id)
        .sort()
        .join(',');

      if (currentExistingAttachmentIds !== originalAttachmentIds) {
        return true;
      }

      return false;
    };

    const changed = compareNonAttachmentFields() || compareAttachmentFields();
    setHasChanged(changed);
  }, [form.data, project]);

  const removeAttachment = attachmentToRemove => {
    if (attachmentToRemove instanceof File) {
      form.setData(
        'attachment_files',
        form.data.attachment_files.filter(f => f !== attachmentToRemove)
      );
    } else {
      form.setData(
        'existing_attachments',
        form.data.existing_attachments.filter(att => att.id !== attachmentToRemove.id)
      );
      form.setData('deleted_attachments_ids', [
        ...form.data.deleted_attachments_ids,
        attachmentToRemove.id,
      ]);
    }
  };

  // --- LOGIC UNTUK MENGUBAH IS_MAIN ---
  const toggleMainAttachment = attachmentId => {
    form.setData(
      'existing_attachments',
      form.data.existing_attachments.map(att =>
        att.id === attachmentId ? { ...att, is_main: !att.is_main } : { ...att, is_main: false }
      )
    );
  };

  const buildPayload = overrideData => {
    const merged = { ...form.data, ...(overrideData || {}) };
    const normalizedBudget = normalizeBudgetValue(merged.budget_project_estimate);
    return {
      ...merged,
      budget_project_estimate: normalizedBudget === '' ? null : normalizedBudget,
      start_date: merged.start_date
        ? (function (d) {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${y}-${m}-${day}`;
          })(merged.start_date)
        : null,
      end_date: merged.end_date
        ? (function (d) {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${y}-${m}-${day}`;
          })(merged.end_date)
        : null,
      is_completed: Boolean(merged.is_completed),
      completed_at: merged.completed_at ? new Date(merged.completed_at).toISOString() : null,
    };
  };

  const submitProject = overrideData => {
    const payload = buildPayload(overrideData);
    setSaving(true);
    router.post(route('projects.update', project.id), payload, {
      preserveScroll: true,
      onSuccess: () => {
        router.reload();
        onClose();
      },
      onError: errors => {
        console.error('Project update failed', errors);
      },
      onFinish: () => {
        setSaving(false);
      },
    });
  };

  const handleSubmit = e => {
    e.preventDefault();
    submitProject();
  };

  const allAttachmentsForDisplay = [
    ...(form.data.existing_attachments || []),
    ...(form.data.attachment_files || []),
  ];

  const ensureStatuses = slugsToAdd => {
    const current = new Set(form.data.status_ids || []);
    slugsToAdd.forEach(slug => current.add(slug));
    return Array.from(current);
  };
  const removeStatuses = slugsToRemove => {
    const current = new Set(form.data.status_ids || []);
    slugsToRemove.forEach(slug => current.delete(slug));
    return Array.from(current);
  };

  const handleCompletionSwitch = nextValue => {
    if (nextValue) {
      form.setData('is_completed', true);
      setCompletionModalOpened(true);
      return;
    }
    openConfirmModal({
      type: 'warning',
      title: 'Unlock completed project',
      content:
        'This project has been locked because it has been marked as completed. Please enter your password to reopen it and allow changes.',
      confirmLabel: 'Unlock project',
      cancelLabel: 'Keep locked',
      requirePassword: true,
      onConfirm: () => {
        const statusIds = removeStatuses(['completed', 'done']);
        const overrides = {
          status_ids: statusIds,
          is_completed: false,
          completed_at: null,
        };
        form.setData('status_ids', statusIds);
        form.setData('is_completed', false);
        form.setData('completed_at', null);
        submitProject(overrides);
      },
    });
  };

  const handleConfirmComplete = () => {
    const statusIds = ensureStatuses(['completed', 'done']);
    const completedAt = new Date().toISOString();
    form.setData('status_ids', statusIds);
    form.setData('is_completed', true);
    form.setData('completed_at', completedAt);
    setCompletionModalOpened(false);
    submitProject({
      status_ids: statusIds,
      is_completed: true,
      completed_at: completedAt,
    });
  };

  const handlePreConfirm = () => {
    form.setData('status_ids', ensureStatuses(['completed']));
    form.setData('is_completed', false);
    form.setData('completed_at', null);
    setCompletionModalOpened(false);
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size='auto'
      radius='md'
      padding='xl'
      draggable
      zIndex={2200}
      closeButtonProps={{ style: { position: 'absolute', top: 12, right: 12 } }}
      title={
        <Stack spacing={4}>
          <Group
            align='center'
            spacing='sm'
          >
            {hasChanged && (
              <ActionIcon
                type='submit'
                onClick={handleSubmit}
                color='green'
                radius='xl'
                size='lg'
                aria-label='Save project'
              >
                {saving || form.processing ? (
                  <Loader
                    size='sm'
                    color='white'
                  />
                ) : (
                  <IconCheck size={20} />
                )}
              </ActionIcon>
            )}
            <Title order={3}>{hasChanged ? 'Save Project' : 'Edit Project'}</Title>
          </Group>
          <Text
            size='sm'
            c='dimmed'
          >
            {hasChanged
              ? 'You have unsaved changes. Click save to update project.'
              : 'Update project details, adjust timeline or reassign team members.'}
          </Text>
        </Stack>
      }
      overlayProps={{ backgroundOpacity: 0.45, blur: 6 }}
      transitionProps={{ transition: 'fade', duration: 200 }}
    >
      <form onSubmit={handleSubmit}>
        <Stack gap='xl'>
          {/* Section: Project Information */}
          <Paper
            withBorder
            p='md'
            radius='md'
          >
            <Flex
              justify='space-between'
              align='center'
              mb='xs'
              gap='md'
            >
              <Title order={5}>Project Information</Title>
              <Tooltip
                label={
                  isLocked
                    ? 'Project is locked. Use this switch to unlock (password required).'
                    : 'Toggle to mark project as completed (or unlock if already completed).'
                }
                withArrow
                position='top'
                zIndex={modalZIndex + 400}
                openDelay={200}
                closeDelay={150}
                withinPortal
              >
                <Flex align='center'>
                  <Switch
                    size='md'
                    checked={Boolean(form.data.is_completed)}
                    onChange={event => handleCompletionSwitch(event.currentTarget.checked)}
                    label={completionLabel}
                    disabled={!can('edit project')}
                  />
                </Flex>
              </Tooltip>
            </Flex>
            {isLocked && (
              <Alert
                color='yellow'
                radius='md'
                mb='sm'
              >
                This project has been locked after being confirmed as complete. Please unlock it
                first to make changes.
              </Alert>
            )}
            <Divider mb='md' />

            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  label='Project Name'
                  placeholder='Enter project name'
                  value={form.data.name}
                  onChange={e => form.setData('name', e.target.value)}
                  error={form.errors.name}
                  required
                  readOnly={!canEdit}
                  disabled={!canEdit}
                />
              </Grid.Col>

              <Grid.Col span={6}>
                <StatusSelect
                  label='Type Project'
                  placeholder='Pick type kontrak project'
                  searchable
                  clearable
                  comboboxProps={{ withinPortal: true, zIndex: modalZIndex + 200 }}
                  data={
                    dropdowns.types?.map(t => ({
                      value: t.slug,
                      label: t.name,
                      icon: t.icon,
                      color: t.color,
                    })) || []
                  }
                  value={form.data.type_id}
                  onChange={val => form.setData('type_id', val)}
                  error={form.errors.type_id}
                  renderOption={renderSelectOptionWithIcon}
                  readOnly={!canEdit}
                  disabled={!canEdit}
                />
              </Grid.Col>

              <Grid.Col span={12}>
                <RichTextEditor
                  label='Description'
                  placeholder='Describe the project goals, scope, or deliverables'
                  content={form.data.description}
                  onChange={val => form.setData('description', val)}
                  suggestion={suggestion}
                  error={form.errors.description}
                  readOnly={!canEdit}
                />
              </Grid.Col>
            </Grid>
          </Paper>

          {/* Section: Timeline & Budget */}
          <Paper
            withBorder
            p='md'
            radius='md'
          >
            <Title
              order={5}
              mb='xs'
            >
              Timeline & Budget
            </Title>
            <Divider mb='md' />

            <Grid>
              <Grid.Col span={6}>
                <DateInput
                  label='Start Date'
                  placeholder='Select project start'
                  valueFormat='DD MMM YYYY'
                  popoverProps={{ withinPortal: true, zIndex: modalZIndex + 200 }}
                  value={form.data.start_date}
                  onChange={date => form.setData('start_date', date)}
                  error={form.errors.start_date}
                  readOnly={!canEdit}
                  disabled={!canEdit}
                />
              </Grid.Col>

              <Grid.Col span={6}>
                <DateInput
                  label='End Date'
                  placeholder='Select project end'
                  valueFormat='DD MMM YYYY'
                  popoverProps={{ withinPortal: true, zIndex: modalZIndex + 200 }}
                  value={form.data.end_date}
                  onChange={date => form.setData('end_date', date)}
                  error={form.errors.end_date}
                  readOnly={!canEdit}
                  disabled={!canEdit}
                />
              </Grid.Col>

              <Grid.Col span={6}>
                <NumberInput
                  label='Budget Allocation'
                  placeholder='Enter total project budget'
                  min={0}
                  thousandSeparator='.'
                  decimalSeparator=','
                  decimalScale={2}
                  fixedDecimalScale
                  allowNegative={false}
                  prefix={`${currencySymbol} `}
                  value={form.data.budget_project_estimate}
                  onChange={val => form.setData('budget_project_estimate', val)}
                  error={form.errors.budget_project_estimate}
                  readOnly={!canEdit}
                  disabled={!canEdit}
                />
              </Grid.Col>
            </Grid>
          </Paper>

          {/* Section: Status & Team */}
          <Paper
            withBorder
            p='md'
            radius='md'
          >
            <Title
              order={5}
              mb='xs'
            >
              Status & Team
            </Title>
            <Divider mb='md' />

            <Grid>
              <Grid.Col span={6}>
                <StatusMultiSelect
                  label='Project Status'
                  placeholder='Select status'
                  statuses={dropdowns.status}
                  comboboxProps={{ withinPortal: true, zIndex: modalZIndex + 200 }}
                  value={form.data.status_ids || []}
                  onChange={val => form.setData('status_ids', val)}
                  error={form.errors.status_ids}
                  readOnly={!canEdit}
                  disabled={!canEdit}
                />
              </Grid.Col>

              <Grid.Col span={6}>
                <UserMultiSelect
                  label='Assign Users'
                  placeholder='Select team members'
                  users={userOptions}
                  comboboxProps={{ withinPortal: true, zIndex: modalZIndex + 200 }}
                  value={form.data.users?.map(id => id.toString()) || []}
                  onChange={val =>
                    form.setData(
                      'users',
                      val.map(v => parseInt(v))
                    )
                  }
                  error={form.errors.users}
                  readOnly={!canEdit}
                  disabled={!canEdit}
                />
              </Grid.Col>
            </Grid>
          </Paper>

          {/* Section: Attachments */}
          <Paper
            withBorder
            p='md'
            radius='md'
          >
            <Title
              order={5}
              mb='xs'
            >
              Attachments
            </Title>
            <Divider mb='md' />

            <Dropzone
              label='Project Attachments'
              selected={allAttachmentsForDisplay}
              onAddFiles={files =>
                form.setData('attachment_files', [...form.data.attachment_files, ...files])
              }
              onRemoveAttachment={removeAttachment}
              onToggleMain={toggleMainAttachment}
              project={project}
              readOnly={!canEdit}
            />
          </Paper>

          {/* Footer */}
          <Divider />
        </Stack>
      </form>
      <Modal
        opened={completionModalOpened}
        onClose={() => setCompletionModalOpened(false)}
        title={<Title order={3}>Complete Project Confirmation</Title>}
        padding='md'
        draggable
        overlayProps={{ backgroundOpacity: 0.45, blur: 6 }}
        transitionProps={{ transition: 'fade', duration: 200 }}
        closeButtonProps={{ style: { position: 'absolute', top: 12, right: 12 } }}
        zIndex={modalZIndex + 300}
      >
        <Stack spacing='sm'>
          <Text fw={500}>Are you sure you want to mark this project as completed?</Text>
          <Text
            size='sm'
            c='dimmed'
          >
            Confirming will set the project status to Completed and Done, and capture the completion
            time. The project will be locked from edits and notifications (in-app + email) will be
            sent to client and team. Choose pre-confirm if you only want to tag the project as
            Completed without finishing it yet.
          </Text>
          <Group
            justify='flex-end'
            mt='sm'
          >
            <Button
              variant='default'
              onClick={handlePreConfirm}
            >
              Pre-confirm
            </Button>
            <Button
              color='green'
              onClick={handleConfirmComplete}
            >
              Confirm Completion
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Modal>
  );
}

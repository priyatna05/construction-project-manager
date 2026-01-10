import { openConfirmModal } from '@/components/ConfirmModal';
import Dropzone from '@/components/Dropzone';
import RichTextEditor from '@/components/RichTextEditor';
import useTaskDrawerStore from '@/hooks/store/useTaskDrawerStore';
import useTasksStore from '@/hooks/store/useTasksStore';
import { useFlashStore } from '@/hooks/store/useFlashStore';
import useForm from '@/hooks/useForm';
import { usePage } from '@inertiajs/react';
import {
  Drawer,
  Flex,
  NumberInput,
  Select,
  Text,
  TextInput,
  rem,
  Switch,
  Group,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';
import { DateInput } from '@mantine/dates';
import { useEffect, useState, useMemo } from 'react';
import { money } from '@/utils/currency';
import LabelsDropdown from './LabelsDropdown';
import classes from './css/TaskDrawer.module.css';
import InvAllocations from './InvAllocations/Index';
import dayjs from '@/utils/dayjsConfig';

import {
  formatLabelsForDropdown,
  renderSelectOptionWithIcon,
} from '@/components/helperLabel';
import StatusSelect from '@/components/StatusSelect';
import UserMultiSelect from '@/components/UserMultiSelect';
import UserSelect from '@/components/UserSelect';

export function CreateTaskDrawer() {
  const {
    taskRelationLabels: relations = [],
    units,
    types,
    priorities,
    project,
    usersWithAccessToProject,
    taskGroups,
    taskDepends,
    availableResources,
    labels,
    currency,
    auth: { user },
    tasks = [],
    flash,
  } = usePage().props;
  const { create, closeCreateTask } = useTaskDrawerStore();
  const [manualWeight, setManualWeight] = useState(false);
  const [manualBudget, setManualBudget] = useState(false);
  const [hasChanged, setHasChanged] = useState(false);
  const [saved, setSaved] = useState(false);
  const [autoLag, setAutoLag] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Initial form data
  const nextTaskNumber = tasks.length > 0 ? Math.max(...tasks.map(t => t.number)) + 1 : 1;
  const initial = useMemo(
    () => ({
      group_id: create.group_id ? create.group_id.toString() : '',
      assigned_to_user_id: '',
      name: '',
      number: nextTaskNumber,
      description: '',
      start_date: null,
      end_date: null,
      unit: '',
      type: '',
      priority: '',
      volume: '',
      unit_cost_task: 0,
      budget_task_plan: 0,
      weight_task: 0,
      subscribed_users: [user.id.toString()],
      labels: [],
      attachment_files: [],
      inventories: [],
      depends_on_task_id: '',
      relation_type_id: '',
      lag_days: '',
    }),
    [create.group_id, nextTaskNumber, user.id]
  );

  const [form, , updateValue] = useForm(
    'post',
    route('projects.tasks.store', [route().params.project]),
    { ...initial }
  );

  const updateTaskInventories = allocatedInventories => {
    // For create task, just update the form data
    updateValue('inventories', allocatedInventories);
  };

  // --- Satu useEffect untuk semua hal terkait open drawer
  // FIX: Clear all fields setiap kali drawer dibuka untuk create new task, agar lebih clean dan menandakan sedang create new task
  useEffect(() => {
    if (create.opened) {
      // Reset form ke initial state setiap kali drawer dibuka, bukan hanya jika belum initialized
      form.setData({ ...initial });
      setIsSubmitting(false); // Reset submitting state
      return () => clearTimeout();
    }
  }, [create.opened, initial]);

  const drawerZIndex = 2200;
  const currencySymbol = currency?.symbol || '';
  const selectZIndex = drawerZIndex + 150;
  const comboboxProps = { withinPortal: true, zIndex: selectZIndex };
  const projectBudget = parseFloat(project.budget_project_estimate || 0);
  const totalAllocatedBudget = useMemo(
    () => tasks.reduce((sum, t) => sum + parseFloat(t.budget_task_plan || 0), 0),
    [tasks]
  );
  const availableBudget = Math.max(0, projectBudget - totalAllocatedBudget);
  const subtotal = useMemo(
    () => form.data.inventories.reduce((sum, i) => sum + (i.quantity || 0) * (i.unit_cost || 0), 0),
    [form.data.inventories]
  );
  const maxBudgetForNewTask = Math.max(0, availableBudget + subtotal);

  // --- Budget dan weight dihitung otomatis
  useEffect(() => {
    if (!manualBudget) {
      const subtotal = form.data.inventories.reduce(
        (sum, i) => sum + (i.quantity || 0) * (i.unit_cost || 0),
        0
      );
      const taskCost = (form.data.volume || 0) * (form.data.unit_cost_task || 0);
      updateValue('budget_task_plan', taskCost + subtotal);
    }
  }, [form.data.volume, form.data.unit_cost_task, form.data.inventories, manualBudget]);

  useEffect(() => {
    if (!manualWeight && projectBudget > 0) {
      const weight = (form.data.budget_task_plan / projectBudget) * 100;
      updateValue('weight_task', parseFloat(weight.toFixed(2)));
    }
  }, [form.data.budget_task_plan, manualWeight, projectBudget]);

  // -- auto-calc lag when autoLag enabled & start_date or dependsOnTask changes
  useEffect(() => {
    if (autoLag) return;
    const selectedDependency = taskDepends.find(
      t => t.id.toString() === form.data.depends_on_task_id?.toString()
    );
    if (!form.data.start_date || !selectedDependency?.end_date) {
      updateValue('lag_days', 0);
      return;
    }
    const start = dayjs(form.data.start_date).startOf('day');
    const end = dayjs(selectedDependency.end_date).startOf('day');
    const diff = start.diff(end, 'day');
    updateValue('lag_days', Math.max(0, diff));
  }, [form.data.start_date, form.data.depends_on_task_id, taskDepends, autoLag]);

  // --- Deteksi perubahan form
  useEffect(() => {
    const changed = Object.keys(initial).some(key => {
      if (key === 'attachment_files') return false;
      const cur = form.data[key];
      const init = initial[key];
      return JSON.stringify(cur) !== JSON.stringify(init);
    });
    setHasChanged(changed);
  }, [form.data, initial]);

  // --- Reset saved state after 2 seconds and close drawer
  useEffect(() => {
    if (saved) {
      const timeout = setTimeout(() => {
        setSaved(false);
        closeCreateTask();
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [saved, closeCreateTask]);

  // --- Reset isSubmitting when drawer closes
  useEffect(() => {
    if (!create.opened) {
      setIsSubmitting(false);
      setSaved(false); // Also reset saved state
    }
  }, [create.opened]);

  // --- Handle flash message from server
  useEffect(() => {
    if (flash && flash.type === 'success') {
      setSaved(true);
    }
  }, [flash]);

  // --- Fungsi tutup drawer
  const closeDrawer = (force = false) => {
    const unchanged = JSON.stringify(form.data) === JSON.stringify(initial);
    if (force || (unchanged && !form.processing)) {
      closeCreateTask();
    } else {
      openConfirmModal({
        zIndex: 10000,
        type: 'danger',
        title: 'Discard changes?',
        content: 'All unsaved changes will be lost.',
        confirmLabel: 'Discard',
        confirmProps: { color: 'red' },
        onConfirm: () => closeCreateTask(),
      });
    }
  };

  const relationOptions = relations.map(rel => ({
    value: rel.id.toString(),
    label: rel.name,
    icon: rel.icon,
    color: rel.color,
  }));
  const unitOptions = formatLabelsForDropdown(units);
  const typeOptions = formatLabelsForDropdown(types);
  const priorityOptions = formatLabelsForDropdown(priorities);

  const findLabelByValue = (value, labelList) => {
    if (value == null) return undefined;
    const valueStr = value.toString().trim().toLowerCase();
    return labelList.find(label => label.value.toString().trim().toLowerCase() === valueStr);
  };
  const selectedRelation = findLabelByValue(form.data.relation_type_id, relationOptions);

  const removeAttachment = file => {
    form.setData(
      'attachment_files',
      form.data.attachment_files.filter(f => f !== file)
    );
  };

  // picker date - with safe fallbacks
  const projectStartDate =
    project.start_date && dayjs(project.start_date).isValid()
      ? dayjs(project.start_date).tz('Asia/Jakarta').toDate()
      : new Date(); // fallback to today if invalid

  const projectEndDate =
    project.end_date && dayjs(project.end_date).isValid()
      ? dayjs(project.end_date).tz('Asia/Jakarta').toDate()
      : dayjs().add(1, 'year').toDate(); // fallback to 1 year from now if invalid

  // Ambil task dependency dan relasinya
  const selectedDependency = taskDepends.find(
    t => t.id.toString() === form.data.depends_on_task_id?.toString()
  );

  // --------------------
  // 🔸 LOGIC DENGAN DEPENDENCY - Wrapped in useMemo for proper React pattern
  // --------------------
  const [minStartDate, maxStartDate, minEndDate, maxEndDate] = useMemo(() => {
    // Default batas tanggal - ensure valid dates with safe fallbacks
    let minStart =
      projectStartDate && !isNaN(projectStartDate.getTime()) ? projectStartDate : new Date();
    let maxStart =
      projectEndDate && !isNaN(projectEndDate.getTime())
        ? projectEndDate
        : dayjs().add(1, 'year').toDate();
    let minEnd =
      form.data.start_date && !isNaN(new Date(form.data.start_date).getTime())
        ? new Date(form.data.start_date)
        : minStart;
    let maxEnd =
      projectEndDate && !isNaN(projectEndDate.getTime())
        ? projectEndDate
        : dayjs().add(1, 'year').toDate();

    if (selectedDependency && selectedDependency.start_date && selectedDependency.end_date) {
      // ✅ Normalize dates to midnight local time untuk avoid timezone issues
      const depStart = dayjs(selectedDependency.start_date).startOf('day').toDate();
      const depEnd = dayjs(selectedDependency.end_date).startOf('day').toDate();

      // Ensure dependency dates are valid
      if (!isNaN(depStart.getTime()) && !isNaN(depEnd.getTime())) {
        if (selectedRelation) {
          switch (selectedRelation.slug) {
            // ========================================
            // 1️⃣ FINISH TO START (FS)
            // Task baru mulai SETELAH dependency selesai
            // ========================================
            case 'finish_to_start':
            case 'blocking':
            case 'sequential':
              minStart = depEnd; // mulai minimal saat dependency selesai
              // Untuk create task, beri sedikit fleksibilitas - end date bisa dimulai dari depEnd
              minEnd = depEnd;
              break;

            // ========================================
            // 2️⃣ START TO START (SS)
            // Task baru mulai SETELAH dependency mulai
            // ========================================
            case 'start_to_start':
              minStart = depStart; // mulai minimal saat dependency mulai
              minEnd = form.data.start_date || depStart;
              break;

            // ========================================
            // 3️⃣ FINISH TO FINISH (FF)
            // Task baru selesai BERSAMAAN dengan dependency
            // ========================================
            case 'finish_to_finish':
              // Start date bebas (dalam range project)
              minStart = projectStartDate;
              maxStart = depEnd; // tidak boleh mulai setelah dep selesai

              // Untuk create task, beri fleksibilitas - end date bisa dekat dengan dep end
              // tapi jangan terlalu ketat (tidak force harus sama persis)
              minEnd = depEnd;
              maxEnd = dayjs(depEnd).add(30, 'day').toDate(); // beri buffer 30 hari
              break;

            // ========================================
            // 4️⃣ START TO FINISH (SF) - JARANG DIPAKAI
            // Task baru selesai SEBELUM/SAAT dependency mulai
            // ========================================
            case 'start_to_finish':
              // Start date bebas (dalam range project)
              minStart = projectStartDate;

              // Untuk create task, jangan terlalu ketat - beri fleksibilitas
              minEnd = form.data.start_date || projectStartDate;
              maxEnd = depStart; // tidak boleh selesai setelah dep mulai
              // Jika depStart sudah lewat, beri sedikit buffer ke depan
              if (maxEnd < new Date()) {
                maxEnd = dayjs().add(30, 'day').toDate();
              }
              break;

            // ========================================
            // 5️⃣ RELATED
            // Hanya menunjukkan hubungan, tidak ada constraint ketat
            // ========================================
            case 'related':
              // Tidak ada perubahan dari default project range
              minStart = projectStartDate;
              maxStart = projectEndDate;
              minEnd = form.data.start_date || projectStartDate;
              maxEnd = projectEndDate;
              break;

            default:
              // Fallback ke start_to_start jika ada dependency tapi relation tidak dikenal
              minStart = depStart;
              minEnd = form.data.start_date || depStart;
              break;
          }
        } else {
          // Default behavior when dependency is selected but no relation chosen: start_to_start
          minStart = depStart;
          minEnd = form.data.start_date || depStart;
        }
      }
    }

    // ========================================
    // 🔸 ADJUSTMENT: End date tidak boleh sebelum start date
    // ========================================
    if (form.data.start_date) {
      const selectedStartDate = new Date(form.data.start_date);
      if (!isNaN(selectedStartDate.getTime()) && selectedStartDate > minEnd) {
        minEnd = selectedStartDate;
      }
    }

    // ========================================
    // 🔸 SAFETY: Pastikan minEnd <= maxEnd, jika tidak fallback ke project range
    // ========================================
    if (minEnd > maxEnd) {
      minEnd = projectStartDate;
      maxEnd = projectEndDate;
    }

    // ========================================
    // 🔸 FINAL VALIDATION: Ensure all dates are valid Date objects
    // ========================================
    const safeMinStart = minStart && !isNaN(minStart.getTime()) ? minStart : new Date();
    const safeMaxStart =
      maxStart && !isNaN(maxStart.getTime()) ? maxStart : dayjs().add(1, 'year').toDate();
    const safeMinEnd = minEnd && !isNaN(minEnd.getTime()) ? minEnd : new Date();
    let safeMaxEnd = maxEnd && !isNaN(maxEnd.getTime()) ? maxEnd : dayjs().add(1, 'year').toDate();

    if (dayjs(safeMaxEnd).isSame(safeMinEnd, 'day')) {
      safeMaxEnd = dayjs(safeMaxEnd).add(1, 'day').toDate();
    }
    return [safeMinStart, safeMaxStart, safeMinEnd, safeMaxEnd];
  }, [
    projectStartDate,
    projectEndDate,
    form.data.start_date,
    selectedDependency,
    selectedRelation,
  ]);

  return (
    <>
      <Drawer
        opened={create.opened}
        onClose={closeDrawer}
        title={
          <div>
            <Group
              align='center'
              spacing='sm'
            >
              <Text
                component='span'
                fz={rem(28)}
                fw={600}
                ml={25}
                my='sm'
              >
                {saved ? 'Saved ✓' : hasChanged ? 'Save new task' : 'Add new task'}
              </Text>
              {hasChanged && !saved && (
                <Tooltip
                  label='Save'
                  withArrow
                  color='green'
                  zIndex={2200}
                  transitionProps={{ transition: 'pop', duration: 150 }}
                >
                  <ActionIcon
                    type='submit'
                    form='create-task-form'
                    loading={isSubmitting}
                    disabled={isSubmitting}
                    color='green'
                    radius='xl'
                    size='lg'
                  >
                    <IconCheck size={30} />
                  </ActionIcon>
                </Tooltip>
              )}
            </Group>
          </div>
        }
        position='right'
        size={1619}
        zIndex={drawerZIndex}
        overlayProps={{ backgroundOpacity: 0.55, blur: 3, zIndex: drawerZIndex }}
        closeButtonProps={{
          children: (
            <Tooltip
              label='Close'
              withArrow
              color='blue'
              position='left'
              zIndex={2200}
              transitionProps={{ transition: 'pop', duration: 150 }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0077FF, #00C896)',
                  width: '36px',
                  height: '36px',
                  minWidth: '36px',
                  minHeight: '36px',
                  boxShadow: '0 2px 8px rgba(0, 128, 128, 0.35)',
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                  flexShrink: 0,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'rotate(90deg) scale(1.1)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 128, 128, 0.55)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'rotate(0deg) scale(1)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 128, 128, 0.35)';
                }}
              >
                <IconX
                  size={18}
                  stroke={1.8}
                  color='white'
                />
              </div>
            </Tooltip>
          ),
        }}
        transitionProps={{
          transition: 'slide-left',
          duration: 850,
          timingFunction: 'cubic-bezier(0.25, 1, 0.5, 1)',
        }}
        styles={{
          content: {
            backgroundColor: 'white',
            color: '#333',
            padding: '1.5rem',
          },
          header: {
            backgroundColor: 'white',
          },
        }}
      >
        <form
          id='create-task-form'
          onSubmit={async e => {
            e.preventDefault();
            if (isSubmitting) return; // Prevent double submission

            setIsSubmitting(true);

            try {
              const formData = new FormData();
              Object.keys(form.data).forEach(key => {
                if (form.data[key] !== null && form.data[key] !== undefined) {
                  if (Array.isArray(form.data[key])) {
                    form.data[key].forEach((item, index) => {
                      if (typeof item === 'object' && item !== null) {
                        Object.keys(item).forEach(subKey => {
                          formData.append(`${key}[${index}][${subKey}]`, item[subKey] || '');
                        });
                      } else {
                        formData.append(`${key}[]`, item);
                      }
                    });
                  } else if (
                    typeof form.data[key] === 'object' &&
                    key !== 'start_date' &&
                    key !== 'end_date'
                  ) {
                    // Handle nested objects if any
                    formData.append(key, JSON.stringify(form.data[key]));
                  } else {
                    formData.append(key, form.data[key]);
                  }
                }
              });

              // Add CSRF token
              const csrfToken = document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute('content');
              if (csrfToken) {
                formData.append('_token', csrfToken);
              } else {
                console.error('CSRF token not found');
                throw new Error('CSRF token not found');
              }

              const url = route('projects.tasks.store', [route().params.project]);

              const response = await fetch(url, {
                method: 'POST',
                body: formData,
                headers: {
                  'X-Requested-With': 'XMLHttpRequest',
                  Accept: 'application/json',
                  'X-CSRF-TOKEN': csrfToken,
                },
              });

              const result = await response.json();

              if (response.ok) {
                // Handle flash message from JSON response
                if (result?.flash) {
                  const { setFlash } = useFlashStore.getState();
                  setFlash(result.flash);
                }
                // Add new task to store from JSON response
                if (result?.task) {
                  useTasksStore.getState().addTask(result.task);
                }
                // Set saved state - drawer will close automatically after 2 seconds via useEffect
                setSaved(true);
              } else {
                // Handle validation errors
                if (result.errors) {
                  form.setErrors(result.errors);
                } else if (result.message) {
                  console.error('Server error:', result.message);
                }
              }
            } catch (error) {
              console.error('Task creation failed:', error);
            } finally {
              setIsSubmitting(false);
            }
          }}
          className={classes.inner}
        >
          <div className={classes.content}>
            <TextInput
              label='Name'
              placeholder='Task name'
              description='A clear, descriptive name for this task'
              required
              data-autofocus
              value={form.data.name}
              onChange={e => updateValue('name', e.target.value)}
              error={form.errors.name}
            />

            <RichTextEditor
              mt='xl'
              placeholder='Task description'
              height={260}
              content={form.data.description}
              onChange={content => updateValue('description', content)}
              projectId={project?.id}
            />

            <Dropzone
              mt='xl'
              selected={form.data.attachment_files}
              onAddFiles={files =>
                form.setData('attachment_files', [...form.data.attachment_files, ...files])
              }
              onRemoveAttachment={removeAttachment}
              task={tasks}
            />

            <InvAllocations
              inventories={project.inventories}
              selected={form.data.inventories}
              onChange={updateTaskInventories}
              availableResources={availableResources}
            />
          </div>

          <div className={classes.sidebar}>
            <Group
              grow
              align='flex-start'
            >
              <Select
                label='Task group'
                placeholder='Select task group'
                description='Which group does this task belong to?'
                required
                comboboxProps={comboboxProps}
                value={form.data.group_id ? form.data.group_id.toString() : ''}
                onChange={value => updateValue('group_id', value)}
                data={taskGroups.map(i => ({
                  value: i.id.toString(),
                  label: i.name,
                }))}
                error={form.errors.group_id}
              />
              <StatusSelect
                label='Priority'
                placeholder='Select priority'
                description='How urgent is this task?'
                comboboxProps={comboboxProps}
                clearable
                value={form.data.priority ? form.data.priority.toString() : ''}
                onChange={value => updateValue('priority', value || '')}
                statuses={priorityOptions}
                renderOption={renderSelectOptionWithIcon}
                error={form.errors.priority}
              />
            </Group>
            <Group
              grow
              align='flex-start'
              mt='sm'
            >
              <Select
                label='Depends on Tasks'
                placeholder='Select Depends on task'
                description='Task that must be completed first'
                mt='md'
                searchable
                comboboxProps={comboboxProps}
                nothingFoundMessage='No task found'
                value={form.data.depends_on_task_id ? form.data.depends_on_task_id.toString() : ''}
                onChange={value => updateValue('depends_on_task_id', value)}
                data={taskDepends
                  .filter(
                    task => form.data.group_id && task.group_id.toString() === form.data.group_id
                  )
                  .map(task => ({
                    value: task.id.toString(),
                    label: `#${task.number} : ${task.name}`,
                  }))}
                error={form.errors.depends_on_task_id}
              />

              <StatusSelect
                label={
                  <Tooltip
                    label='Please select a dependency task first'
                    withArrow
                    zIndex={2200}
                  >
                    <Text fw={500} size='sm'>Task Relation</Text>
                  </Tooltip>
                }
                placeholder='Select relation'
                description='Link to a related or similar task'
                mt='md'
                clearable
                comboboxProps={comboboxProps}
                value={form.data.relation_type_id ? form.data.relation_type_id.toString() : ''}
                onChange={value => updateValue('relation_type_id', value)}
                statuses={relationOptions}
                renderOption={renderSelectOptionWithIcon}
                error={form.errors.relation_type_id}
                disabled={taskDepends.length === 0 || !form.data.depends_on_task_id}
                checkIconPosition='right'
              />
            </Group>

            <Group
              grow
              align='flex-start'
              mt='sm'
            >
              <NumberInput
                label={
                  <Flex
                    align='center'
                    justify='space-between'
                    gap='sm'
                  >
                    <Switch
                      checked={autoLag}
                      onChange={e => setAutoLag(e.currentTarget.checked)}
                      onClick={e => e.stopPropagation()}
                    />
                    <Tooltip
                      label={autoLag ? 'Disable manual duration' : 'Enable manual duration'}
                      withArrow
                      zIndex={2200}
                      position='top'
                    >
                      <span
                        style={{
                          fontSize: '14px',
                          fontWeight: 500,
                        }}
                      >
                        Durations
                      </span>
                    </Tooltip>
                  </Flex>
                }
                placeholder='Enter lag days'
                description='Number of days to wait after dependency completes'
                mt='md'
                disabled={!autoLag}
                value={form.data.lag_days || 0}
                onChange={value => updateValue('lag_days', value)}
                min={0}
                allowNegative={false}
                readOnly={!can('edit task')}
              />

              <NumberInput
                label={
                  <Flex
                    align='center'
                    justify='space-between'
                    gap='sm'
                  >
                    <Switch
                      size='sm'
                      checked={manualWeight}
                      onChange={e => setManualWeight(e.currentTarget.checked)}
                      onClick={e => e.stopPropagation()}
                    />
                    <Tooltip
                      label={manualWeight ? 'Disable manual weight' : 'Enable manual weight'}
                      withArrow
                      zIndex={2200}
                      position='top'
                    >
                      <span
                        style={{
                          fontSize: '14px',
                          fontWeight: 500,
                        }}
                      >
                        Weight (%)
                        <span
                          style={{
                            color: 'red',
                          }}
                        >
                          {' '}
                          *
                        </span>
                      </span>
                    </Tooltip>
                  </Flex>
                }
                placeholder='Enter weight percentage'
                description='Percentage reflecting impact'
                mt='md'
                fixedDecimalScale
                step={0.1}
                precision={0}
                value={form.data.weight_task || 0}
                onValueChange={values => updateValue('weight_task', values.floatValue)}
                error={form.errors.weight_task}
                disabled={!manualWeight}
              />
            </Group>

            <Group
              grow
              align='flex-start'
              mt='xs'
            >
              <StatusSelect
                label='Type'
                placeholder='Pick type task'
                description='Category or nature of this task'
                mt='md'
                clearable
                comboboxProps={comboboxProps}
                value={form.data.type ? form.data.type.toString() : ''}
                onChange={value => updateValue('type', value || '')}
                statuses={typeOptions}
                renderOption={renderSelectOptionWithIcon}
                error={form.errors.type}
                checkIconPosition='right'
              />

              <LabelsDropdown
                items={labels.filter(l => l.type === 'pt_status')}
                selected={form.data.labels}
                onChange={values => updateValue('labels', values)}
                mt='md'
              />
            </Group>

            <Group
              grow
              align='flex-start'
              mt='sm'
            >
              <DateInput
                clearable
                valueFormat='DD MMM YYYY'
                minDate={minStartDate}
                maxDate={maxStartDate}
                mt='md'
                label='Start date'
                popoverProps={{ withinPortal: true, zIndex: drawerZIndex + 100 }}
                description={
                  selectedDependency
                    ? `Must start on or after (${
                        selectedDependency.start_date
                          ? dayjs(selectedDependency.start_date).format('DD MMM YYYY')
                          : 'N/A'
                      })`
                    : 'When will this task begin?'
                }
                renderDay={date => {
                  const day = date.getDate();
                  const dateTime = date.getTime();

                  const parseLocal = s => {
                    if (!s) return null;
                    const dateOnly = String(s).split('T')[0];
                    const [y, m, d] = dateOnly.split('-');
                    return new Date(Number(y), Number(m) - 1, Number(d));
                  };

                  const depStart = selectedDependency
                    ? parseLocal(selectedDependency.start_date)
                    : null;
                  const depEnd = selectedDependency
                    ? parseLocal(selectedDependency.end_date)
                    : null;

                  let validRangeStart = project.start_date ? parseLocal(project.start_date) : null;
                  let validRangeEnd = project.end_date ? parseLocal(project.end_date) : null;

                  if (selectedDependency && selectedRelation) {
                    switch (selectedRelation.slug) {
                      case 'finish_to_start':
                      case 'blocking':
                      case 'sequential':
                        validRangeStart = depEnd;
                        break;
                      case 'start_to_start':
                        validRangeStart = depStart;
                        break;
                      case 'finish_to_finish':
                      case 'start_to_finish':
                        validRangeStart = depStart; // lebih longgar
                        break;
                      case 'related':
                        // tidak ubah apapun
                        break;
                    }
                  }

                  const isInRange =
                    validRangeStart &&
                    validRangeEnd &&
                    dateTime >= validRangeStart.getTime() &&
                    dateTime <= validRangeEnd.getTime();

                  const isBeforeStart = validRangeStart && dateTime < validRangeStart.getTime();
                  const isAfterEnd = validRangeEnd && dateTime > validRangeEnd.getTime();

                  const bgColor = isInRange
                    ? '#d4edda'
                    : isBeforeStart
                      ? '#e2e3e5'
                      : isAfterEnd
                        ? '#f8d7da'
                        : '#ffffff'; // default putih jika tidak ada kondisi

                  const tooltipLabel = isInRange
                    ? '✅ Good — within valid range'
                    : isBeforeStart
                      ? '⚠️ Too early — before dependency condition'
                      : isAfterEnd
                        ? '❌ Too late — exceeds project deadline'
                        : 'No constraints';

                  const circle = (
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 50,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: bgColor,
                        fontWeight: bgColor ? 'bold' : undefined,
                        cursor: tooltipLabel ? 'pointer' : 'default',
                      }}
                    >
                      {day}
                    </div>
                  );

                  return tooltipLabel ? (
                    <Tooltip
                      label={tooltipLabel}
                      zIndex={3200}
                    >
                      {circle}
                    </Tooltip>
                  ) : (
                    circle
                  );
                }}
                placeholder='Pick task start date'
                value={form.data.start_date}
                onChange={value => updateValue('start_date', value)}
                error={form.errors.start_date}
              />

              <DateInput
                clearable
                valueFormat='DD MMM YYYY'
                minDate={minEndDate}
                maxDate={maxEndDate}
                mt='md'
                label='End date'
                description='When should this task be completed?'
                placeholder='Pick task end date'
                value={form.data.end_date}
                popoverProps={{ withinPortal: true, zIndex: drawerZIndex + 100 }}
                onChange={value => updateValue('end_date', value)}
                error={form.errors.end_date}
                renderDay={date => {
                  const day = date.getDate();

                  // ✅ Pastikan semua date yang dibandingkan dalam bentuk Date dan valid
                  if (
                    !(minEndDate instanceof Date) ||
                    isNaN(minEndDate.getTime()) ||
                    !(maxEndDate instanceof Date) ||
                    isNaN(maxEndDate.getTime())
                  ) {
                    return (
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 50,
                        }}
                      >
                        {day}
                      </div>
                    );
                  }

                  // ✅ Normalize date dengan precision "day" dan zona waktu sama
                  const normalizedDate = dayjs(date).tz('Asia/Jakarta').startOf('day');
                  const normalizedMin = dayjs(minEndDate).tz('Asia/Jakarta').startOf('day');
                  const normalizedMax = dayjs(maxEndDate).tz('Asia/Jakarta').startOf('day');

                  const isInRange =
                    normalizedDate.isSameOrAfter(normalizedMin, 'day') &&
                    normalizedDate.isSameOrBefore(normalizedMax, 'day');

                  const isBefore = normalizedDate.isBefore(normalizedMin, 'day');
                  const isAfter = normalizedDate.isAfter(normalizedMax, 'day');

                  // ✅ Warna dan tooltip
                  const bgColor = isInRange
                    ? '#d4edda' // hijau lembut
                    : isBefore
                      ? '#e2e3e5' // abu-abu
                      : isAfter
                        ? '#f8d7da' // merah lembut
                        : '#ffffff'; // default putih

                  const tooltipLabel = isInRange
                    ? '✅ Within valid range'
                    : isBefore
                      ? '⚠️ Too early — before start or dependency'
                      : isAfter
                        ? '❌ Too late — exceeds allowed project range'
                        : 'No constraints';

                  // ✅ Elemen hari
                  const circle = (
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 50,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: bgColor,
                        fontWeight: isInRange ? 'bold' : undefined,
                        cursor: tooltipLabel ? 'pointer' : 'default',
                        transition: 'background-color 0.2s ease',
                      }}
                    >
                      {day}
                    </div>
                  );

                  return (
                    <Tooltip
                      label={tooltipLabel}
                      withArrow
                      zIndex={3200}
                    >
                      {circle}
                    </Tooltip>
                  );
                }}
              />
            </Group>

            <Group
              grow
              align='flex-start'
              mt='sm'
            >
              <NumberInput
                label='Volume'
                description='Total quantity or amount for this task'
                placeholder='Input Volume Tasks'
                mt='md'
                required
                fixedDecimalScale
                thousandSeparator='.'
                decimalSeparator=','
                allowNegative={false}
                step={0.5}
                value={form.data.volume || 0}
                onValueChange={values => updateValue('volume', values.floatValue)}
                error={form.errors.volume}
              />

              <StatusSelect
                label='Unit'
                placeholder='Pick value Unit'
                description='Unit of measurement (e.g., kg, m², hours)'
                mt='md'
                required
                clearable
                comboboxProps={comboboxProps}
                value={form.data.unit || ''}
                onChange={value => updateValue('unit', value || '')}
                statuses={unitOptions}
                renderOption={renderSelectOptionWithIcon}
                error={form.errors.unit}
                checkIconPosition='right'
              />
            </Group>

            <Group
              className='test'
              grow
              align='flex-start'
              mt='sm'
            >
              <NumberInput
                label={
                  <Flex
                    align='center'
                    gap='xs'
                  >
                    <span
                      style={{
                        fontSize: '14px',
                        fontWeight: 500,
                      }}
                    >
                      Unit Cost
                      {!manualBudget && (
                        <span
                          style={{
                            color: 'red',
                          }}
                        >
                          {' '}
                          *
                        </span>
                      )}
                    </span>
                  </Flex>
                }
                placeholder='Input Unit Cost'
                description={`Cost per ${form.data.unit || 'unit'} in ${currencySymbol}`}
                mt='lg'
                disabled={manualBudget}
                fixedDecimalScale
                thousandSeparator='.'
                decimalSeparator=','
                leftSection={<Text size='sm'>{currencySymbol}</Text>}
                allowNegative={false}
                step={0.5}
                value={form.data.unit_cost_task || 0}
                onValueChange={values => updateValue('unit_cost_task', values.floatValue)}
                error={manualBudget ? null : form.errors.unit_cost_task}
              />

              <NumberInput
                label={
                  <Flex
                    align='center'
                    gap='sm'
                  >
                    <Switch
                      size='sm'
                      checked={manualBudget}
                      onChange={e => setManualBudget(e.currentTarget.checked)}
                      onClick={e => e.stopPropagation()}
                    />
                    <Tooltip
                      label={manualBudget ? 'Disable manual budget' : 'Enable manual budget'}
                      withArrow
                      zIndex={2200}
                      position='top'
                    >
                      <span
                        style={{
                          fontSize: '14px',
                          fontWeight: 500,
                        }}
                      >
                        Budget allocated
                        <span
                          style={{
                            color: 'red',
                          }}
                        >
                          {' '}
                          *
                        </span>
                      </span>
                    </Tooltip>
                  </Flex>
                }
                placeholder='Enter task budget'
                mt='md'
                disabled={!manualBudget}
                fixedDecimalScale
                min={0}
                max={maxBudgetForNewTask}
                allowNegative={false}
                step={0.5}
                value={form.data.budget_task_plan || 0}
                onValueChange={values => updateValue('budget_task_plan', values.floatValue)}
                error={form.errors.budget_task_plan}
                thousandSeparator='.'
                decimalSeparator=','
                leftSection={<Text size='sm'>{currencySymbol}</Text>}
                leftSectionWidth={40}
                description={
                  <span
                    style={{
                      fontSize: '12px',
                      marginTop: '8px',
                    }}
                  >
                    Remaining project budget:{' '}
                    <span
                      style={{
                        color: form.data.budget_task_plan > availableBudget ? 'red' : '#868e96',
                      }}
                    >
                      {money(Math.round(availableBudget))}
                    </span>
                  </span>
                }
              />
            </Group>

            <Group
              grow
              align='flex-start'
              mt='sm'
            >
              <UserSelect
                label='Assignee'
                placeholder='Select assignee'
                description='Who is responsible for this task?'
                searchable
                comboboxProps={comboboxProps}
                mt='md'
                value={
                  form.data.assigned_to_user_id ? form.data.assigned_to_user_id.toString() : ''
                }
                onChange={value => updateValue('assigned_to_user_id', value)}
                users={usersWithAccessToProject.map(i => ({
                  value: i.id.toString(),
                  label: i.name,
                }))}
                error={form.errors.assigned_to_user_id}
              />

              <UserMultiSelect
                label='Subscribers'
                placeholder='Select subscribers'
                description='People who will receive updates'
                searchable
                mt='md'
                comboboxProps={comboboxProps}
                value={form.data.subscribed_users.map(id => id.toString())}
                onChange={values => updateValue('subscribed_users', values)}
                users={usersWithAccessToProject.map(i => ({
                  value: i.id.toString(),
                  label: i.name,
                }))}
                error={form.errors.subscribed_users}
              />
            </Group>
          </div>
        </form>
      </Drawer>
    </>
  );
}

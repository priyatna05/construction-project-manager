import { openConfirmModal } from '@/components/ConfirmModal';
import Dropzone from '@/components/Dropzone';
import RichTextEditor from '@/components/RichTextEditor';
import useTaskDrawerStore from '@/hooks/store/useTaskDrawerStore';
import useForm from '@/hooks/useForm';
import { usePage } from '@inertiajs/react';
import {
  Button,
  Drawer,
  Flex,
  MultiSelect,
  // NumberInput,
  Select,
  Text,
  TextInput,
  rem,
} from '@mantine/core';
import { NumericFormat } from 'react-number-format';
import { DateInput } from '@mantine/dates';
import { useEffect, useState } from 'react';
import { money } from '@/utils/currency';
import RelationDropdown from './RelationLabelDropdown';
import LabelsDropdown from './LabelsDropdown';
import classes from './css/TaskDrawer.module.css';
import ResourcesPlanner from './ResourcesPlanner';

export function CreateTaskDrawer() {
  const [currencySymbol, setCurrencySymbol] = useState('');
  const { create, closeCreateTask } = useTaskDrawerStore();
  const {
    project,
    usersWithAccessToProject,
    taskGroups,
    taskDepends,
    taskRelationLabels,
    availableResources,
    labels,
    currency,
    auth: { user },
    tasks = [],
  } = usePage().props;

  // Get the next task number by finding the maximum task number and adding 1
  const nextTaskNumber = tasks.length > 0 ? Math.max(...tasks.map(task => task.number)) + 1 : 1;

  const initial = {
    group_id: create.group_id ? create.group_id.toString() : '',
    assigned_to_user_id: '',
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    budget_task: 0,
    subscribed_users: [user.id.toString()],
    labels: [],
    attachments: [],
    inventories: [],
    number: nextTaskNumber,
    depends_on_task_id: '',
    relation_type_id: '',
  };

  const [form, submit, updateValue] = useForm(
    'post',
    route('projects.tasks.store', [route().params.project]),
    {
      ...initial,
    }
  );

  useEffect(() => {
    updateValue({ ...initial });
  }, [create.opened]);

  const closeDrawer = (force = false) => {
    if (force || (JSON.stringify(form.data) === JSON.stringify(initial) && !form.processing)) {
      closeCreateTask();
    } else {
      openConfirmModal({
        type: 'danger',
        title: 'Discard changes?',
        content: `All unsaved changes will be lost.`,
        confirmLabel: 'Discard',
        confirmProps: { color: 'red' },
        onConfirm: () => closeCreateTask(),
      });
    }
  };

  const removeAttachment = index => {
    const files = [...form.data.attachments];
    files.splice(index, 1);
    updateValue('attachments', files);
  };

  const projectStartDate = project.start_date ? new Date(project.start_date) : undefined;

  useEffect(() => {
    // Jika objek currency ada, update state simbolnya
    if (currency && currency.symbol) {
      setCurrencySymbol(currency.symbol);
    } else {
      // Jika tidak ada, pastikan simbolnya kosong
      setCurrencySymbol('');
    }
  }, [currency]);
  const projectBudget = parseFloat(project.budget_project || 0);
  const totalAllocatedBudget = tasks.reduce((sum, task) => {
    return sum + parseFloat(task.budget_task || 0);
  }, 0);
  const availableBudget = projectBudget - totalAllocatedBudget;
  const maxBudgetForNewTask = Math.max(0, availableBudget);

  return (
    <Drawer
      opened={create.opened}
      onClose={closeDrawer}
      title={
        <Text
          fz={rem(28)}
          fw={600}
          ml={25}
          my='sm'
        >
          Add new task
        </Text>
      }
      position='right'
      size={1000}
      overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
      transitionProps={{
        transition: 'slide-left',
        duration: 400,
        timingFunction: 'ease',
      }}
    >
      <form
        onSubmit={event =>
          submit(event, {
            onSuccess: () => closeDrawer(true),
            forceFormData: true,
          })
        }
        className={classes.inner}
      >
        <div className={classes.content}>
          <TextInput
            label='Name'
            placeholder='Task name'
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
            onChange={content => updateValue('description', content)}
          />

          <ResourcesPlanner
            inventories={project.inventories}
            selected={form.data.inventories}
            onChange={val => updateValue('inventories', val)}
            availableResources={availableResources}
          />

          <Dropzone
            mt='xl'
            selected={form.data.attachments}
            onChange={files => updateValue('attachments', files)}
            remove={index => removeAttachment(index)}
          />

          <Flex
            justify='space-between'
            mt='xl'
          >
            <Button
              variant='transparent'
              w={100}
              disabled={form.processing}
              onClick={closeDrawer}
            >
              Cancel
            </Button>

            <Button
              variant='white'
              type='submit'
              w={120}
              loading={form.processing}
            >
              Add task
            </Button>
          </Flex>
        </div>
        <div className={classes.sidebar}>
          <Select
            label='Task group'
            placeholder='Select task group'
            required
            value={form.data.group_id}
            onChange={value => updateValue('group_id', value)}
            data={taskGroups.map(i => ({
              value: i.id.toString(),
              label: i.name,
            }))}
            error={form.errors.group_id}
          />

          <Select
            label='Depends on Tasks'
            placeholder='Select Depends on task'
            mt='md'
            searchable
            nothingFoundMessage='No task found'
            value={form.data.depends_on_task_id}
            onChange={value => updateValue('depends_on_task_id', value)}
            data={taskDepends.map(task => ({
              value: task.id.toString(),
              label: task.name,
            }))}
            error={form.errors.depends_on_task_id}
          />

          <RelationDropdown
            items={taskRelationLabels}
            value={form.data.relation_type_id}
            onChange={val => updateValue('relation_type_id', val)}
            disabled={!form.data.depends_on_task_id}
            mt='md'
          />

          <DateInput
            clearable
            valueFormat='DD MMM YYYY'
            // Tanggal mulai task tidak boleh sebelum tanggal mulai proyek
            minDate={projectStartDate}
            // Tanggal mulai task tidak boleh setelah tanggal selesai task, ATAU setelah tanggal selesai proyek
            // maxDate={form.data.end_date || projectEndDate}
            mt='md'
            label='Start date'
            required
            placeholder='Pick task start date'
            value={form.data.start_date}
            onChange={value => updateValue('start_date', value)}
            error={form.errors.start_date}
          />

          <DateInput
            clearable
            valueFormat='DD MMM YYYY'
            // Tanggal selesai task tidak boleh sebelum tanggal mulai task, ATAU sebelum tanggal mulai proyek
            minDate={form.data.start_date || projectStartDate}
            // Tanggal selesai task tidak boleh setelah tanggal selesai proyek
            mt='md'
            label='End date'
            required
            placeholder='Pick task end date'
            value={form.data.end_date}
            onChange={value => updateValue('end_date', value)}
            error={form.errors.end_date}
          />

          <NumericFormat
            customInput={TextInput}
            label='Budget allocated'
            placeholder='Enter task budget'
            mt='md'
            required
            decimalScale={2}
            fixedDecimalScale
            min={0}
            max={maxBudgetForNewTask}
            allowNegative={false}
            step={0.5}
            value={form.data.budget_task}
            onChange={value => updateValue('budget_task', value)}
            error={form.errors.budget_task}
            leftSection={<Text size='sm'>{currencySymbol}</Text>}
            leftSectionWidth={40}
            description={
              <Text
                size='xs'
                mt={2}
              >
                Remaining project budget: {money(Math.round(availableBudget))}
              </Text>
            }
          />

          <LabelsDropdown
            items={labels}
            selected={form.data.labels}
            onChange={values => updateValue('labels', values)}
            filterTypes={['pt_status', 'ptb_status']}
            mt='md'
          />

          <Select
            label='Assignee'
            placeholder='Select assignee'
            searchable
            mt='md'
            value={form.data.assigned_to_user_id}
            onChange={value => updateValue('assigned_to_user_id', value)}
            data={usersWithAccessToProject.map(i => ({
              value: i.id.toString(),
              label: i.name,
            }))}
            error={form.errors.assigned_to_user_id}
          />

          <MultiSelect
            label='Subscribers'
            placeholder='Select subscribers'
            searchable
            mt='md'
            value={form.data.subscribed_users}
            onChange={values => updateValue('subscribed_users', values)}
            data={usersWithAccessToProject.map(i => ({
              value: i.id.toString(),
              label: i.name,
            }))}
            error={form.errors.subscribed_users}
          />
        </div>
      </form>
    </Drawer>
  );
}

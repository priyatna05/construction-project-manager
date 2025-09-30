import Dropzone from '@/components/Dropzone';
import RichTextEditor from '@/components/RichTextEditor';
import useTaskDrawerStore from '@/hooks/store/useTaskDrawerStore';
import useTasksStore from '@/hooks/store/useTasksStore';
import useWebSockets from '@/hooks/useWebSockets';
import { day } from '@/utils/datetime';
import { usePage } from '@inertiajs/react';
import {
  Breadcrumbs,
  Checkbox,
  Drawer,
  Group,
  MultiSelect,
  NumberInput,
  Select,
  Text,
  TextInput,
  rem,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import dayjs from 'dayjs';
import { useEffect, useRef, useState } from 'react';
import RelationDropdown from './RelationLabelDropdown';
import LabelsDropdown from './LabelsDropdown';
import Comments from './Comments';
import classes from './css/TaskDrawer.module.css';
import ResourcesPlanner from './ResourcesPlanner';
import DetailProgress from './DetailProgress';

export function EditTaskDrawer() {
  const editorRef = useRef(null);
  const [data, setData] = useState(defaultFormState());
  const [isInitialized, setIsInitialized] = useState(false);

  const { edit, closeEditTask } = useTaskDrawerStore();
  const { initTaskWebSocket } = useWebSockets();
  const {
    findTask,
    updateTaskProperty,
    updateTaskDependencies,
    updateTaskSubscribers,
    complete,
    deleteAttachment,
    uploadAttachments,
  } = useTasksStore();

  const task = findTask(edit.task.id);
  const {
    usersWithAccessToProject,
    taskGroups,
    taskDepends,
    taskRelationLabels,
    availableResources,
    labels,
    currency,
  } = usePage().props;

  // 🧼 RESET FORM saat drawer ditutup
  const resetForm = () => {
    setData(defaultFormState());
    setIsInitialized(false);
  };

  // 📥 INISIALISASI FORM sekali saat drawer dibuka
  const initializeForm = task => {
    const mainDependency = task?.dependencies?.[0];
    setData({
      group_id: task.group_id ?? '',
      assigned_to_user_id: task.assigned_to_user_id ?? '',
      name: task.name ?? '',
      description: task.description ?? '',
      start_date: task.start_date ? dayjs(task.start_date).toDate() : '',
      end_date: task.end_date ? dayjs(task.end_date).toDate() : '',
      budget_task: task.budget_task ?? 0,
      attachments: (task.attachments || []).map(a => a.id.toString()),
      subscribed_users: Array.isArray(task.subscribed_users)
        ? task.subscribed_users.filter(i => i?.id !== undefined).map(i => i.id.toString())
        : [],
      labels: (task.labels || []).map(l => l.id),
      depends_on_task_id: mainDependency?.id?.toString() ?? '',
      relation_type_id: mainDependency?.relation_type_id?.toString() ?? '',
      inventories: (task.allocated_inventories || [])
        .filter(alloc => alloc && alloc.inventory) // Pastikan inventory ada
        .map(allocation => {
          return {
            ...allocation.inventory, // Ambil semua data: id, name, unit, status, dll.
            quantity: allocation.quantity_allocated, // Timpa dengan kuantitas yang dialokasikan
            note: allocation.note,
          };
        }),
    });
    setIsInitialized(true);
  };

  // 🧠 Default state function
  function defaultFormState() {
    return {
      group_id: '',
      assigned_to_user_id: '',
      name: '',
      description: '',
      start_date: '',
      end_date: '',
      budget_task: 0,
      attachments: [],
      subscribed_users: [],
      labels: [],
      depends_on_task_id: '',
      relation_type_id: '',
      inventories: [],
    };
  }

  // 🔁 Jika drawer dibuka, inisialisasi task sekali
  useEffect(() => {
    if (!edit.opened || !task) return;
    if (!isInitialized) {
      initializeForm(task);
      initTaskWebSocket(task); // optional
    }
  }, [edit.opened, task, isInitialized]);

  // 🧼 Reset saat drawer ditutup
  useEffect(() => {
    if (!edit.opened) resetForm();
  }, [edit.opened]);

  // 📤 Jika `subscribed_users` berubah, update task
  useEffect(() => {
    updateTaskDependenciesHandler();
  }, [data.depends_on_task_id, data.relation_type_id]);

  useEffect(() => {
    const editor = editorRef.current;
    if (editor) {
      editor.setContent(data.description);
    }
  }, [data.description]);

  const updateValue = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }));

    const onBlurInputs = ['name', 'description', 'budget_task'];
    const dependencyFields = ['depends_on_task_id', 'relation_type_id'];
    if (onBlurInputs.includes(field) || dependencyFields.includes(field)) return;

    const valueToSend =
      ['start_date', 'end_date'].includes(field) && value instanceof Date
        ? dayjs(value).format('YYYY-MM-DD')
        : value;

    updateTaskProperty(task, field, valueToSend);
  };

  const onBlurUpdate = field => {
    const value = data[field];
    if (data.name.length > 0) {
      updateTaskProperty(task, field, value);
    }
  };

  const updateTaskDependenciesHandler = () => {
    if (!task) return;
    if (data.depends_on_task_id && data.relation_type_id) {
      updateTaskDependencies(task, data.depends_on_task_id, data.relation_type_id);
    } else if (!data.depends_on_task_id && data.relation_type_id) {
      updateTaskDependencies(task, null, null);
    }
  };
  const updateTaskInventories = allocatedInventories => {
    // Transform inventories to backend expected format
    const payload = allocatedInventories.map(item => ({
      inventory_id: item.id,
      quantity_allocated: item.quantity,
      note: item.note || item.notes || '',
    }));
    updateTaskProperty(task, 'allocated_inventories', payload);
  };

  // ⛔ Close drawer tanpa kehilangan data
  const onClose = () => {
    // (Opsional) bisa tambahkan logic konfirmasi jika ada perubahan belum disimpan
    closeEditTask();
  };

  // 💲 Optional: parsing simbol mata uang
  const currencySymbol = currency?.symbol || '';
  const projectStartDate = task?.project ? new Date(task.project.start_date) : undefined;

  if (!task) {
    return <div>🔄 Loading task...</div>;
  }

  return (
    <Drawer
      opened={edit.opened}
      onClose={onClose}
      title={
        <Group
          ml={25}
          my='sm'
          wrap='nowrap'
        >
          <Checkbox
            size='md'
            radius='xl'
            color='green'
            checked={task?.completed_at !== null}
            onChange={e => complete(task, e.currentTarget.checked)}
            className={can('complete task') ? classes.checkbox : classes.disabledCheckbox}
          />
          <Text
            fz={rem(27)}
            fw={600}
            lh={1.2}
            td={task?.completed_at !== null ? 'line-through' : null}
          >
            #{task?.number}: {task?.name}
          </Text>
        </Group>
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
      {task ? (
        <>
          <Breadcrumbs
            c='dark.3'
            ml={24}
            mb='xs'
            separator='I'
            separatorMargin='sm'
            styles={{ separator: { opacity: 0.3 } }}
          >
            <Text size='xs'>Task #{task.number}</Text>
            <Text size='xs'>
              Created by {task?.created_by_user?.name} on {day(task?.created_at)}
            </Text>
            <Text size='xs'>Progress : {task?.progress_task} %</Text>
            <Text size='xs'>Weight : {task?.weight_task}</Text>
            <Text size='xs'>Actual cost task : {task?.actual_cost}</Text>
          </Breadcrumbs>
          <form className={classes.inner}>
            <div className={classes.content}>
              <TextInput
                label='Name'
                placeholder='Task name'
                value={data.name}
                onChange={e => updateValue('name', e.target.value)}
                onBlur={() => onBlurUpdate('name')}
                error={data.name.length === 0}
                readOnly={!can('edit task')}
              />

              <RichTextEditor
                ref={editorRef}
                mt='xl'
                placeholder='Task description'
                height={100}
                onChange={content => updateValue('description', content)}
                onBlur={() => onBlurUpdate('description')}
                readOnly={!can('edit task')}
              />

              {can('edit task') && (
                <Dropzone
                  mt='xl'
                  selected={task.attachments}
                  onChange={files => uploadAttachments(task, files)}
                  remove={index => deleteAttachment(task, index)}
                  task={task}
                />
              )}
              {/* need adjustment*/}
              {can('edit task') && (
              <ResourcesPlanner
                selected={data.inventories}
                onChange={val => {
                  updateValue('inventories', val);
                  updateTaskInventories(val);
                }}
                availableResources={availableResources}
              />
              )}

              {can('view comments') && <Comments task={task} />}
            </div>
            <div className={classes.sidebar}>
              <Select
                label='Task group'
                placeholder='Select task group'
                allowDeselect={false}
                searchable
                required
                nothingFoundMessage='no task group found'
                value={data.group_id.toString()}
                onChange={value => updateValue('group_id', value)}
                data={taskGroups.map(i => ({
                  value: i.id.toString(),
                  label: i.name,
                }))}
                readOnly={!can('edit task')}
              />

              <Select
                label='Depends on Tasks'
                placeholder='Select Depence on task'
                mt='md'
                searchable
                clearable
                // disabled={!data.group_id}
                nothingFoundMessage={data.group_id ? 'no task found' : 'select a group first'}
                value={data.depends_on_task_id}
                onChange={value => updateValue('depends_on_task_id', value || null)}
                data={taskDepends
                  .filter(task => task.group_id.toString() === data.group_id.toString())
                  .sort((a, b) => a.number - b.number)
                  .map(task => ({
                    value: task.id.toString(),
                    label: `#${task.number} : ${task.name}`,
                  }))}
                readOnly={!can('edit task')}
              />

              <RelationDropdown
                label='Related Tasks'
                mt='md'
                items={taskRelationLabels}
                value={data.relation_type_id ?? ''}
                onChange={val => updateValue('relation_type_id', val)}
                // disabled={!data.depends_on_task_id}
                readOnly={!can('edit task')}
              />

              <DateInput
                label='Start date'
                placeholder='Pick task start date'
                valueFormat='DD MMM YYYY'
                mt='md'
                clearable
                required
                minDate={projectStartDate}
                value={data.start_date}
                onChange={value => updateValue('start_date', value)}
                onBlur={() => onBlurUpdate('start_date')}
                readOnly={!can('edit task')}
              />

              <DateInput
                clearable
                valueFormat='DD MMM YYYY'
                minDate={data.start_date || projectStartDate}
                mt='md'
                label='End date'
                required
                placeholder='Pick task End date'
                value={data.end_date}
                onChange={value => updateValue('end_date', value)}
                onBlur={() => onBlurUpdate('end_date')}
                readOnly={!can('edit task')}
              />

              <NumberInput
                label='Budget allocated'
                mt='md'
                decimalScale={2}
                fixedDecimalScale
                value={data.budget_task}
                min={0}
                allowNegative={false}
                step={0.5}
                precision={2}
                prefix={currencySymbol}
                required
                onChange={value => updateValue('budget_task', value)}
                onBlur={() => onBlurUpdate('budget_task')}
                readOnly={!can('edit task')}
                error={data.budget_task < 0}
              />

              <LabelsDropdown
                items={labels}
                selected={data.labels}
                onChange={values => updateValue('labels', values)}
                filterTypes={['pt_status', 'ptb_status']}
                mt='md'
                readOnly={!can('edit task')}
              />

              <Select
                label='Assignee'
                placeholder='Select assignee'
                searchable
                mt='md'
                value={data.assigned_to_user_id?.toString()}
                onChange={value => updateValue('assigned_to_user_id', value)}
                data={usersWithAccessToProject.map(i => ({
                  value: i.id.toString(),
                  label: i.name,
                }))}
                readOnly={!can('edit task')}
              />

              <MultiSelect
                label='Subscribers'
                placeholder={!data.subscribed_users.length ? 'Select subscribers' : null}
                mt='md'
                searchable
                clearable
                value={data.subscribed_users}
                onChange={values => {
                  if (!edit.opened) return;
                  const safeArray = Array.isArray(values) ? values : [];
                  updateValue('subscribed_users', safeArray);
                  updateTaskSubscribers(task, safeArray);
                }}
                data={usersWithAccessToProject.map(i => ({
                  value: i.id.toString(),
                  label: i.name,
                }))}
                readOnly={!can('edit task')}
              />

              <DetailProgress />
            </div>
          </form>
        </>
      ) : (
        <></>
      )}
    </Drawer>
  );
}

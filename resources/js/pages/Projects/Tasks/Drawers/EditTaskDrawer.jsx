import Dropzone from '@/components/Dropzone';
import RichTextEditor from '@/components/RichTextEditor';
import useTaskDrawerStore from '@/hooks/store/useTaskDrawerStore';
import useTasksStore from '@/hooks/store/useTasksStore';
import useWebSockets from '@/hooks/useWebSockets';
import { useFlashStore } from '@/hooks/store/useFlashStore';
import { day } from '@/utils/datetime';
import { usePage } from '@inertiajs/react';
import {
  Breadcrumbs,
  Checkbox,
  Drawer,
  Group,
  NumberInput,
  Select,
  Text,
  TextInput,
  rem,
  Flex,
  Switch,
  Tooltip,
  Divider,
  Box,
  Tabs,
  Grid,
  Title,
  Stack,
  Input,
  Badge,
  Indicator,
  Loader,
  Center,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import dayjs from 'dayjs';
import { money } from '@/utils/currency';
import { useEffect, useRef, useState, useMemo } from 'react';
import LabelsDropdown from './LabelsDropdown';
import Comments from './Comments';
import classes from './css/TaskDrawer.module.css';
import InvAllocations from './InvAllocations/Index';
import WorkReports from './WorkReports/Index';
import PerformanceTasks from './PerformanceTasks';
import {
  formatLabelsForDropdown,
  renderSelectOptionWithIcon,
} from '@/components/helperLabel';
import {
  IconCalendar,
  IconFileAnalytics,
  IconBox,
  IconBuildingBridge,
  IconInfoCircleFilled,
  IconTags,
  IconUsers,
  IconCalendarEvent,
  IconRuler,
  IconScale,
  IconWallet,
  IconX,
  IconCameraPin,
  IconActivity,
  IconMessageCircle,
  IconSettings,
} from '@tabler/icons-react';
import { getInitials } from '@/utils/user';
import UserSelect from '@/components/UserSelect';
import UserMultiSelect from '@/components/UserMultiSelect';
import StatusSelect from '@/components/StatusSelect';

export function EditTaskDrawer() {
  const editorRef = useRef(null);
  const [data, setData] = useState(defaultFormState());
  const [isInitialized, setIsInitialized] = useState(false);
  const updateTimeout = useRef(null);

  const { edit, closeEditTask } = useTaskDrawerStore();
  const { initTaskWebSocket, initProjectWebSocket } = useWebSockets();
  const { clearFlash } = useFlashStore();
  const {
    findTask,
    updateTaskProperty,
    updateTaskDependencies,
    updateTaskSubscribers,
    complete,
    uploadAttachments,
    deleteAttachment,
    updateTaskInventories: updateTaskInventoriesStore,
  } = useTasksStore();

  const task = findTask(edit.task.id);
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
    tasks = [],
  } = usePage().props;
  const drawerZIndex = 2200;
  const currencySymbol = currency?.symbol || '';
  const selectZIndex = drawerZIndex + 150;
  const comboboxProps = { withinPortal: true, zIndex: selectZIndex };
  const [manualWeight, setManualWeight] = useState(false);
  const [autoLag, setAutoLag] = useState(false);
  const [manualBudget, setManualBudget] = useState(false);
  const projectBudget = parseFloat(project.budget_project_estimate || 0);
  const totalAllocatedBudget = useMemo(
    () => tasks.reduce((sum, t) => sum + parseFloat(t.budget_task_plan || 0), 0),
    [tasks]
  );
  const availableBudget = Math.max(0, projectBudget - totalAllocatedBudget);

  // Debug: Log relations data
  const messageCount = task?.comments_count ?? 0;
  const workCount = task?.workReports_count ?? 0;
  const { url } = usePage(); // Ambil URL saat ini
  const searchParams = new URLSearchParams(url.split('?')[1]);
  const initialTab = searchParams.get('tab') || 'general';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [pendingApproval, setPendingApproval] = useState(null);
  const isLocked = Boolean(task?.project_is_completed ?? task?.project?.is_completed);
  const canCompleteTask = can('complete task');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const workReportId = urlParams.get('work_report_id');
    const tab = urlParams.get('tab') || 'general';

    if (workReportId) {
      // Simpan info pending approval
      setPendingApproval({ workReportId, tab });

      // Set tab ke work jika belum
      if (tab !== 'work') {
        setActiveTab('work');
      }
    } else {
      // Clear pending approval jika tidak ada work_report_id
      setPendingApproval(null);
    }
  }, [window.location.search, task]);

  // 🧼 RESET FORM saat drawer ditutup
  const resetForm = () => {
    setData(defaultFormState());
    setIsInitialized(false); // Tandai bahwa form belum diinisialisasi
    setManualWeight(false); // Reset juga state lokal lainnya
  };

  // 📥 INISIALISASI FORM sekali saat drawer dibuka
  const initializeForm = task => {
    if (!task || !relations || relations.length === 0) return; // Safety check

    const mainDependency = task?.dependencies?.[0];

    const relationValue =
      mainDependency?.relation_type_id &&
      relations.some(r => r.id === mainDependency.relation_type_id)
        ? mainDependency.relation_type_id.toString()
        : '';

    setData({
      group_id: task.group_id ?? '',
      assigned_to_user_id: task.assigned_to_user_id ?? '',
      name: task.name ?? '',
      description: task.description ?? '',
      start_date: task.start_date ? dayjs(task.start_date).toDate() : null,
      end_date: task.end_date ? dayjs(task.end_date).toDate() : null,
      budget_task_plan: task.budget_task_plan ?? 0,
      weight_task: task.weight_task ?? 0,
      volume: task.volume ?? '',
      unit_cost_task: task.unit_cost_task ?? '',
      unit: task.unit?.slug ?? '',
      type: task.type?.slug ?? '',
      priority: task.priority?.slug ?? '',
      depends_on_task_id: mainDependency?.id?.toString() ?? '',
      relation: relationValue,
      lag_days: mainDependency?.lag_days ?? 0,
      attachment_files: task.attachment_files || [],
      subscribed_users: Array.isArray(task.subscribed_users)
        ? task.subscribed_users.filter(i => i?.id !== undefined).map(i => i.id.toString())
        : [],
      labels: (task.labels || []).map(l => l.id),
      inventories: (task.allocated_inventories || [])
        .filter(alloc => alloc && alloc.inventory)
        .map(allocation => ({
          ...allocation.inventory,
          quantity: allocation.quantity_allocated,
          note: allocation.note || allocation.notes,
        })),
    });

    setIsInitialized(true);

    // Initialize project WebSocket for real-time inventory updates
    if (task.project_id) {
      initProjectWebSocket({ id: task.project_id });
    }
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
      budget_task_plan: 0,
      weight_task: 0,
      volume: '',
      unit_cost_task: '',
      unit: '',
      type: '',
      priority: '',
      attachment_files: [],
      subscribed_users: [],
      labels: [],
      depends_on_task_id: '',
      relation: '',
      lag_days: 0,
      inventories: [],
      lastInventoryUpdate: 0,
      lastAttachmentUpdate: 0,
    };
  }

  // 🔁 Jika drawer dibuka, inisialisasi task sekali
  useEffect(() => {
    // Hanya jalankan saat drawer DIBUKA dan form BELUM diinisialisasi.
    if (edit.opened && !isInitialized) {
      clearFlash(); // hapus notifikasi lama
      // Pastikan `task` sudah ada datanya sebelum inisialisasi
      if (task?.id && relations && relations.length > 0) {
        initializeForm(task);
        initTaskWebSocket(task);
      }
    } else if (!edit.opened) {
      // Saat drawer ditutup, reset semuanya.
      resetForm();
    }
  }, [edit.opened, isInitialized, task, relations]); // Bergantung pada `task` dan `relations` untuk memastikan data terbaru digunakan

  // Ensure fields are cleared for new task creation
  useEffect(() => {
    if (edit.opened && !task.id && !isInitialized) {
      setData(defaultFormState());
    }
  }, [edit.opened, task?.id, isInitialized]);

  // -- auto-calc lag when autoLag enabled & start_date or dependsOnTask changes
  useEffect(() => {
    if (autoLag) return;
    const selectedDependency = taskDepends.find(
      t => t.id.toString() === data.depends_on_task_id?.toString()
    );
    if (!data.start_date || !selectedDependency?.end_date) {
      updateValue('lag_days', 0);
      return;
    }
    const start = dayjs(data.start_date).startOf('day');
    const end = dayjs(selectedDependency.end_date).startOf('day');
    const diff = start.diff(end, 'day');
    updateValue('lag_days', Math.max(0, diff));
  }, [data.start_date, data.depends_on_task_id, taskDepends, autoLag]);

  // 📤 Jika `subscribed_users` berubah, update task
  useEffect(() => {
    updateTaskDependenciesHandler(true); // Skip flash for initial load
  }, [data.depends_on_task_id, data.relation]);

  // 🔄 Sync inventories from store when task updates (e.g., via WebSocket)
  useEffect(() => {
    if (task && task.allocated_inventories) {
      const storeInventories = task.allocated_inventories
        .filter(alloc => alloc && alloc.inventory)
        .map(allocation => ({
          ...allocation.inventory,
          quantity: allocation.quantity_allocated,
          note: allocation.note || allocation.notes, // Handle both 'note' and 'notes' fields
        }));

      // Only update if different to avoid infinite loops and check timestamp
      setData(prev => {
        const currentInventories = prev.inventories || [];
        const isDifferent = JSON.stringify(currentInventories) !== JSON.stringify(storeInventories);
        const lastUpdate = prev.lastInventoryUpdate || 0;
        const timeSinceLastUpdate = Date.now() - lastUpdate;

        // Only sync if data is different and it's been more than 3 seconds since last local update
        if (isDifferent && timeSinceLastUpdate > 3000) {
          // console.log('Syncing inventories from store:', storeInventories);
          return { ...prev, inventories: storeInventories, lastInventoryUpdate: Date.now() };
        }
        return prev;
      });
    }
  }, [task?.allocated_inventories]);

  // 🔄 Sync attachment_files from store when task updates (e.g., via WebSocket)
  useEffect(() => {
    if (task && task.attachment_files) {
      const storeAttachments = task.attachment_files.map(attachment => ({
        ...attachment,
        url: attachment.url || attachment.path,
        thumb_url: attachment.thumb_url || attachment.thumb,
      }));

      // Only update if different to avoid infinite loops and check timestamp
      setData(prev => {
        const currentAttachments = prev.attachment_files || [];
        const isDifferent = JSON.stringify(currentAttachments) !== JSON.stringify(storeAttachments);
        const lastUpdate = prev.lastAttachmentUpdate || 0;
        const timeSinceLastUpdate = Date.now() - lastUpdate;

        // Only sync if data is different and it's been more than 3 seconds since last local update
        if (isDifferent && timeSinceLastUpdate > 3000) {
          // console.log('Syncing attachments from store:', storeAttachments);
          return { ...prev, attachment_files: storeAttachments, lastAttachmentUpdate: Date.now() };
        }
        return prev;
      });
    }
  }, [task?.attachment_files]);

  useEffect(() => {
    const editor = editorRef.current;
    if (editor) {
      editor.setContent(data.description);
    }
  }, [data.description]);

  // Calculate budget_task_plan dynamically
  useEffect(() => {
    const sumSubtotals = data.inventories.reduce(
      (sum, item) => sum + (item.quantity || 0) * (item.unit_cost || 0),
      0
    );
    const taskCost = (data.volume || 0) * (data.unit_cost_task || 0);
    const totalBudget = taskCost + sumSubtotals;
    setData(prev => ({ ...prev, budget_task_plan: totalBudget }));
  }, [data.volume, data.unit_cost_task, data.inventories]);

  useEffect(() => {
    // keluar lebih awal jika manualWeight aktif
    if (manualWeight) return;

    const projectBudget = Number(project?.budget_project_estimate) || 0;
    const taskBudget = Number(data?.budget_task_plan) || 0;

    if (projectBudget > 0) {
      const weight = (taskBudget / projectBudget) * 100;
      updateValue('weight_task', Number(weight.toFixed(2)));
    } else {
      updateValue('weight_task', 0);
    }
  }, [data?.budget_task_plan, project?.budget_project_estimate, manualWeight]);

  const updateValue = (field, value, skipUpdate = true) => {
    setData(prev => ({ ...prev, [field]: value }));

    if (skipUpdate) return;

    // Skip flash for certain fields that are updated automatically
    const skipFlashFields = ['lag_days'];

    // Debounce the update
    if (updateTimeout.current) {
      clearTimeout(updateTimeout.current);
    }

    // If date is cleared, send null immediately to backend
    if (['start_date', 'end_date'].includes(field) && (value === null || value === '')) {
      updateTaskProperty(task, field, null, null, skipFlashFields.includes(field));
      return;
    }

    updateTimeout.current = setTimeout(() => {
      const onBlurInputs = ['name', 'description'];
      const dependencyFields = ['depends_on_task_id', 'relation_type_id', 'relation'];
      if (onBlurInputs.includes(field) || dependencyFields.includes(field)) return;

      const valueToSend =
        ['start_date', 'end_date'].includes(field) && value instanceof Date
          ? dayjs(value).format('YYYY-MM-DD')
          : value;

      // Send the field update
      updateTaskProperty(task, field, valueToSend, null, skipFlashFields.includes(field));

      // If field affects budget, also send budget update immediately
      const budgetAffectingFields = ['volume', 'unit_cost_task'];
      if (budgetAffectingFields.includes(field)) {
        // Calculate current budget from data
        const sumSubtotals = data.inventories.reduce(
          (sum, item) => sum + (item.quantity || 0) * (item.unit_cost || 0),
          0
        );
        const taskCost =
          (field === 'volume' ? value : data.volume || 0) *
          (field === 'unit_cost_task' ? value : data.unit_cost_task || 0);
        const totalBudget = taskCost + sumSubtotals;
        updateTaskProperty(task, 'budget_task_plan', totalBudget, null, true); // Skip flash for budget updates
      }
    }, 1000); // 1 second delay
  };

  const onBlurUpdate = async field => {
    const value = data[field];
    if ((data.name || '').length > 0) {
      const normalizedValue =
        ['start_date', 'end_date'].includes(field) && value instanceof Date
          ? dayjs(value).format('YYYY-MM-DD')
          : value;

      await updateTaskProperty(task, field, normalizedValue);
      // If it's a new task and name was updated, close the drawer on success
      if (field === 'name' && !task.id) {
        closeEditTask();
      }
    }
  };

  const updateTaskDependenciesHandler = (skipFlash = false) => {
    if (!task) return;
    if (data.depends_on_task_id && data.relation) {
      updateTaskDependencies(
        task,
        data.depends_on_task_id,
        data.relation,
        data.lag_days,
        skipFlash
      );
    } else if (!data.depends_on_task_id && data.relation) {
      updateTaskDependencies(task, null, null, 0, skipFlash);
    }
  };

  const updateTaskInventories = (allocatedInventories, skipFlash = false) => {
    // Update form state for instant UI feedback with timestamp
    setData(prev => ({
      ...prev,
      inventories: allocatedInventories,
      lastInventoryUpdate: Date.now(),
    }));

    // Send to backend
    updateTaskInventoriesStore(task, allocatedInventories, skipFlash);

    // Also update budget since inventories affect budget
    const sumSubtotals = allocatedInventories.reduce(
      (sum, item) => sum + (item.quantity || 0) * (item.unit_cost || 0),
      0
    );
    const taskCost = (data.volume || 0) * (data.unit_cost_task || 0);
    const totalBudget = taskCost + sumSubtotals;
    updateTaskProperty(task, 'budget_task_plan', totalBudget);
  };

  // ⛔ Close drawer tanpa kehilangan data
  const onClose = () => {
    // (Opsional) bisa tambahkan logic konfirmasi jika ada perubahan belum disimpan
    closeEditTask();
  };
  const relationOptions = relations.map(rel => ({
    value: rel.id.toString(),
    label: rel.name,
    icon: rel.icon,
    color: rel.color,
    slug: rel.slug,
  }));
  const unitOptions = formatLabelsForDropdown(units);
  const typeOptions = formatLabelsForDropdown(types);
  const priorityOptions = formatLabelsForDropdown(priorities);

  const findLabelByValue = (value, labelList) => {
    if (value == null) return undefined;
    const valueStr = value.toString().trim().toLowerCase();
    return (labelList || []).find(
      label => label.value.toString().trim().toLowerCase() === valueStr
    );
  };
  const selectedRelation = findLabelByValue(data.relation, relationOptions);

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
    t => t.id.toString() === data.depends_on_task_id?.toString()
  );

  // --------------------
  // 🔸 LOGIC DENGAN DEPENDENCY - Wrapped in useMemo for proper React pattern
  // --------------------
  const [minStartDate, maxStartDate, minEndDate, maxEndDate] = useMemo(() => {
    // Default batas tanggal - ensure valid dates
    let minStart =
      projectStartDate && !isNaN(projectStartDate.getTime()) ? projectStartDate : new Date();
    let maxStart = projectEndDate && !isNaN(projectEndDate.getTime()) ? projectEndDate : new Date();
    let minEnd =
      data.start_date && !isNaN(new Date(data.start_date).getTime())
        ? new Date(data.start_date)
        : projectStartDate;
    let maxEnd = projectEndDate && !isNaN(projectEndDate.getTime()) ? projectEndDate : new Date();

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
              minEnd = depEnd; // otomatis end date juga setelah dep selesai
              break;

            // ========================================
            // 2️⃣ START TO START (SS)
            // Task baru mulai SETELAH dependency mulai
            // ========================================
            case 'start_to_start':
              minStart = depStart; // mulai minimal saat dependency mulai
              minEnd = data.start_date || depStart;
              break;

            // ========================================
            // 3️⃣ FINISH TO FINISH (FF)
            // Task baru selesai BERSAMAAN dengan dependency
            // ========================================
            case 'finish_to_finish':
              // Start date bebas (dalam range project)
              minStart = projectStartDate;
              maxStart = depEnd; // tidak boleh mulai setelah dep selesai

              // End date HARUS sama dengan dep end
              minEnd = depEnd;
              maxEnd = depEnd;
              break;

            // ========================================
            // 4️⃣ START TO FINISH (SF) - JARANG DIPAKAI
            // Task baru selesai SEBELUM/SAAT dependency mulai
            // ========================================
            case 'start_to_finish':
              // Start date bebas (dalam range project)
              minStart = projectStartDate;

              // End date HARUS sebelum/saat dep mulai
              minEnd = data.start_date || projectStartDate;
              maxEnd = depStart; // tidak boleh selesai setelah dep mulai
              break;

            // ========================================
            // 5️⃣ RELATED
            // Hanya menunjukkan hubungan, tidak ada constraint ketat
            // ========================================
            case 'related':
              // Tidak ada perubahan dari default project range
              minStart = projectStartDate;
              maxStart = projectEndDate;
              minEnd = data.start_date || projectStartDate;
              maxEnd = projectEndDate;
              break;

            default:
              // Fallback ke start_to_start jika ada dependency tapi relation tidak dikenal
              minStart = depStart;
              minEnd = data.start_date || depStart;
              break;
          }
        } else {
          // Default behavior when dependency is selected but no relation chosen: start_to_start
          minStart = depStart;
          minEnd = data.start_date || depStart;
        }
      }
    }

    // ========================================
    // 🔸 ADJUSTMENT: End date tidak boleh sebelum start date
    // ========================================
    if (data.start_date) {
      const selectedStartDate = new Date(data.start_date);
      if (!isNaN(selectedStartDate.getTime()) && selectedStartDate > minEnd) {
        minEnd = selectedStartDate;
      }
    }

    return [minStart, maxStart, minEnd, maxEnd];
  }, [projectStartDate, projectEndDate, data.start_date, selectedDependency, selectedRelation]);

  return (
    <Drawer
      opened={edit.opened}
      onClose={onClose}
      zIndex={drawerZIndex}
      title={
        <Box>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginLeft: '25px',
                marginBottom: '0.5rem',
                flexWrap: 'nowrap',
              }}
            >
              <Tooltip
                label={
                  canCompleteTask
                    ? 'Completed a task'
                    : 'You do not have permission to complete tasks.'
                }
                withArrow
                zIndex={2200}
              >
                <Checkbox
                  size='md'
                  radius='xl'
                  color='green'
                  checked={task?.completed_at !== null}
                  onChange={e => complete(task, e.currentTarget.checked)}
                  disabled={!canCompleteTask}
                  className={canCompleteTask ? classes.checkbox : classes.disabledCheckbox}
                />
              </Tooltip>
              <Text
                fz={rem(27)}
                fw={600}
                lh={1.2}
                td={task?.completed_at !== null ? 'line-through' : null}
                ml='sm'
              >
                #{task?.number}: {task?.name}
              </Text>
            </div>
            <Breadcrumbs
              c='dark.3'
              ml={64}
              mb='xs'
              separator='I'
              separatorMargin='sm'
              styles={{ separator: { opacity: 0.3 } }}
            >
              {task?.completed_at && <Text size='xs'>Completed At {day(task?.completed_at)}</Text>}
              <Text size='xs'>
                Created by {task?.created_by_user?.name} on {day(task?.created_at)}
              </Text>
            </Breadcrumbs>
          </div>
        </Box>
      }
      position='right'
      size='auto'
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
      {task ? (
        <Tabs
          value={activeTab}
          onChange={setActiveTab}
        >
          <Tabs.List grow>
            <Tabs.Tab
              value='general'
              leftSection={<IconSettings size={30} />}
            >
              General information
            </Tabs.Tab>
            <Tabs.Tab
              value='time'
              leftSection={<IconCalendar size={30} />}
            >
              Timeline and Budget
            </Tabs.Tab>
            <Tabs.Tab
              value='resource'
              leftSection={<IconBox size={30} />}
            >
              Resources
            </Tabs.Tab>
            <Tabs.Tab
              value='messages'
              leftSection={
                <Indicator
                  inline
                  label={messageCount > 99 ? '99+' : messageCount}
                  size={16}
                  offset={4}
                  color='blue'
                  disabled={messageCount === 0}
                >
                  <IconMessageCircle size={30} />
                </Indicator>
              }
            >
              Messages
            </Tabs.Tab>
            <Tabs.Tab
              value='work'
              leftSection={
                <Indicator
                  inline
                  label={workCount > 99 ? '99+' : workCount}
                  size={16}
                  offset={4}
                  color='blue'
                  disabled={workCount === 0}
                >
                  <IconFileAnalytics size={30} />
                </Indicator>
              }
            >
              Work Reports
            </Tabs.Tab>

            {/**need adjustment for indicator on tabs */}
            <Tabs.Tab
              value='performance'
              leftSection={
                <Indicator
                  inline
                  label={`${Math.round(task?.progress_task || 0)}%`}
                  size={16}
                  offset={4}
                  color={
                    task?.progress_task >= 100
                      ? 'green'
                      : task?.progress_task >= 50
                        ? 'blue'
                        : 'orange'
                  }
                  withBorder
                >
                  <IconActivity size={30} />
                </Indicator>
              }
            >
              Analitics
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value='general'>
            <Box
              mx='auto'
              mt='xl'
              pb='xl'
              ml='lg'
              mr='lg'
            >
              <Grid gutter='xl'>
                {/* === LEFT COLUMN: Basic Information === */}
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Title
                    order={5}
                    mb='xs'
                  >
                    <Group
                      gap='xs'
                      align='center'
                    >
                      <IconInfoCircleFilled
                        size={18}
                        color='var(--mantine-color-blue-6)'
                      />
                      <span>Basic Information</span>
                    </Group>
                  </Title>
                  <Text
                    size='sm'
                    c='dimmed'
                    mb='sm'
                  >
                    Main details of the task.
                  </Text>
                  <Divider mb='md' />

                  <TextInput
                    label='Task Name'
                    placeholder='Enter task name'
                    description='A clear, descriptive name for this task'
                    value={data.name || ''}
                    onChange={e => updateValue('name', e.target.value)}
                    onBlur={() => onBlurUpdate('name')}
                    error={(data.name || '').length === 0 ? 'Task name is required' : null}
                    readOnly={!can('edit task')}
                    disabled={isLocked}
                    withAsterisk
                  />

                  <Box mt='md'>
                    <Input.Label mb='xs'>Description</Input.Label>
                    <Text
                      size='xs'
                      c='dimmed'
                      mb='xs'
                    >
                      Detailed information about the task objectives, requirements, and deliverables
                    </Text>
                    <RichTextEditor
                      ref={editorRef}
                      placeholder='Describe the task in detail...'
                      height={400}
                      content={data.description}
                      onChange={content => updateValue('description', content)}
                      onBlur={() => onBlurUpdate('description')}
                      readOnly={isLocked || !can('edit task')}
                      projectId={project?.id}
                    />
                  </Box>
                </Grid.Col>

                {/* === RIGHT SIDE: Wrapper for Organization, Classification & People === */}
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Grid gutter='xl'>
                    {/* Organization */}
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <Title
                        order={5}
                        mb='xs'
                      >
                        <Group
                          gap='xs'
                          align='center'
                        >
                          <IconBuildingBridge
                            size={18}
                            color='var(--mantine-color-blue-6)'
                          />
                          <span>Organization</span>
                        </Group>
                      </Title>
                      <Text
                        size='sm'
                        c='dimmed'
                      >
                        organization of work.
                      </Text>
                      <Divider
                        mb='md'
                        mt='sm'
                      />

                      <Select
                        label='Task Group'
                        placeholder='Select task group'
                        description='Which group does this task belong to?'
                        allowDeselect={false}
                        searchable
                        clearable
                        nothingFoundMessage='No task group found'
                        comboboxProps={comboboxProps}
                        value={data.group_id?.toString()}
                        onChange={value => updateValue('group_id', value)}
                        data={taskGroups.map(i => ({
                          value: i.id.toString(),

                          label: i.name,
                        }))}
                        readOnly={!can('edit task')}
                        disabled={isLocked}
                        withAsterisk
                      />

                      <Select
                        label='Depends on Task'
                        placeholder='Select dependency'
                        description='Task that must be completed first'
                        mt='md'
                        searchable
                        clearable
                        comboboxProps={comboboxProps}
                        nothingFoundMessage={
                          data.group_id ? 'No task found' : 'Select a group first'
                        }
                        value={data.depends_on_task_id}
                        onChange={value => updateValue('depends_on_task_id', value || null)}
                        data={taskDepends
                          .filter(
                            depTask =>
                              data.group_id && // Check if data.group_id exists
                              depTask.group_id && // Check if depTask.group_id exists
                              depTask.group_id.toString() === data.group_id.toString()
                          )
                          .sort((a, b) => a.number - b.number)
                          .map(depTask => ({
                            value: depTask.id.toString(),
                            label: `#${depTask.number} : ${depTask.name}`,
                          }))}
                        readOnly={!can('edit task')}
                        disabled={isLocked}
                      />

                      <StatusSelect
                        label='Task Relation'
                        placeholder='Select relation'
                        description='Link to a related or similar task'
                        mt='md'
                        comboboxProps={comboboxProps}
                        value={data.relation ?? ''}
                        onChange={value => {
                          updateValue('relation', value);
                        }}
                        statuses={relationOptions}
                        renderOption={renderSelectOptionWithIcon}
                        readOnly={!can('edit task')}
                        disabled={taskDepends.length === 0 || !data.depends_on_task_id || isLocked}
                      />

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
                              disabled={isLocked}
                            />
                            <Tooltip
                              label={
                                isLocked
                                  ? 'Locked'
                                  : autoLag
                                    ? 'Disable input manual'
                                    : 'Enable input manual'
                              }
                              withArrow
                              zIndex={2200}
                              position='top'
                            >
                              <Text
                                size='sm'
                                fw={500}
                              >
                                Durations
                              </Text>
                            </Tooltip>
                          </Flex>
                        }
                        placeholder='Enter lag days'
                        description='Number of days to wait after dependency completes'
                        mt='md'
                        disabled={!autoLag || isLocked}
                        value={data.lag_days || 0}
                        onChange={value => {
                          updateValue('lag_days', value);
                        }}
                        min={0}
                        allowNegative={false}
                        readOnly={!can('edit task')}
                      />
                    </Grid.Col>

                    {/* Classification */}
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <Title
                        order={5}
                        mb='xs'
                      >
                        <Group
                          gap='xs'
                          align='center'
                        >
                          <IconTags
                            size={18}
                            color='var(--mantine-color-blue-6)'
                          />
                          <span>Classification</span>
                        </Group>
                      </Title>
                      <Text
                        size='sm'
                        c='dimmed'
                        mb='sm'
                      >
                        categorize and track.
                      </Text>
                      <Divider
                        mb='md'
                        mt='md'
                      />

                      <StatusSelect
                        label='Type'
                        placeholder='Select task type'
                        description='Category or nature of this task'
                        mt='md'
                        clearable
                        comboboxProps={comboboxProps}
                        value={data.type ?? ''}
                        onChange={value => updateValue('type', value)}
                        statuses={typeOptions}
                        renderOption={renderSelectOptionWithIcon}
                        readOnly={!can('edit task')}
                        disabled={isLocked}
                      />

                      <Box mt='md'>
                        <LabelsDropdown
                          items={labels.filter(l => l.type === 'pt_status')}
                          selected={data.labels}
                          onChange={values => updateValue('labels', values)}
                          readOnly={isLocked || !can('edit task')}
                        />
                      </Box>

                      <StatusSelect
                        label='Priority'
                        placeholder='Select priority'
                        description='How urgent is this task?'
                        mt='md'
                        clearable
                        comboboxProps={comboboxProps}
                        value={data.priority ?? ''}
                        onChange={val => updateValue('priority', val)}
                        statuses={priorityOptions}
                        renderOption={renderSelectOptionWithIcon}
                        readOnly={!can('edit task')}
                        disabled={isLocked}
                      />
                    </Grid.Col>

                    {/* People - Full width below Organization & Classification */}
                    <Grid.Col span={12}>
                      <Title
                        order={5}
                        mb='xs'
                        style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                      >
                        <IconUsers
                          size={18}
                          color='var(--mantine-color-blue-6)'
                        />
                        Team
                      </Title>
                      <Text
                        size='sm'
                        c='dimmed'
                      >
                        Team members responsible and subscribers.
                      </Text>
                      <Divider
                        mb='md'
                        mt='sm'
                      />

                      <Grid gutter='md'>
                        <Grid.Col span={{ base: 12, sm: 6 }}>
                          <UserSelect
                            label='Assignee'
                            placeholder='Select assignee'
                            description='Who is responsible for this task?'
                            searchable
                            clearable
                            comboboxProps={comboboxProps}
                            value={data.assigned_to_user_id?.toString()}
                            onChange={value => updateValue('assigned_to_user_id', value, false)}
                            data={usersWithAccessToProject.map(i => ({
                              value: i.id.toString(),
                              label: i.name,
                              avatar: i.avatar,
                              initial: getInitials(i.name),
                            }))}
                            readOnly={!can('edit task')}
                            disabled={isLocked}
                          />
                        </Grid.Col>

                        <Grid.Col span={{ base: 12, sm: 6 }}>
                          <UserMultiSelect
                            label='Subscribers'
                            placeholder={
                              !(data.subscribed_users || []).length
                                ? 'Select subscribers'
                                : undefined
                            }
                            description='People who will receive updates about this task'
                            searchable
                            clearable
                            comboboxProps={comboboxProps}
                            value={data.subscribed_users || []}
                            onChange={values => {
                              if (!edit.opened) return;
                              const safeArray = Array.isArray(values) ? values : [];
                              updateValue('subscribed_users', safeArray);
                              updateTaskSubscribers(task, safeArray);
                            }}
                            users={usersWithAccessToProject.map(i => ({
                              value: i.id.toString(),
                              label: i.name,
                              avatar: i.avatar,
                              initial: getInitials(i.name),
                            }))}
                            readOnly={!can('edit task')}
                            disabled={isLocked}
                          />
                        </Grid.Col>
                      </Grid>
                    </Grid.Col>
                  </Grid>
                </Grid.Col>
              </Grid>
            </Box>
          </Tabs.Panel>

          <Tabs.Panel value='time'>
            <Box
              mx='auto'
              mt='xl'
              pb='xl'
              ml='lg'
              mr='lg'
            >
              <Stack gap='xl'>
                {/* === DATE SECTION === */}
                <Box>
                  <Title
                    order={5}
                    mb='xs'
                  >
                    <Group
                      gap='xs'
                      align='center'
                    >
                      <IconCalendarEvent
                        size={18}
                        color='var(--mantine-color-blue-6)'
                      />
                      <span>Schedule</span>
                    </Group>
                  </Title>
                  <Text
                    size='sm'
                    c='dimmed'
                    mb='sm'
                  >
                    Set important task milestones and their expected completion dates.
                  </Text>
                  <Divider
                    mb='md'
                    mt='md'
                  />

                  <Grid gutter='md'>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <DateInput
                        label='Start Date'
                        placeholder='Pick task start date'
                        description={
                          selectedDependency
                            ? `Must start on or after "${selectedDependency.name}" (${dayjs(
                                selectedDependency.start_date
                              ).format('DD MMM YYYY')})`
                            : 'When will this task begin?'
                        }
                        valueFormat='DD MMM YYYY'
                        minDate={minStartDate}
                        maxDate={maxStartDate}
                        popoverProps={{ withinPortal: true, zIndex: drawerZIndex + 100 }}
                        value={data.start_date}
                        clearable
                        onChange={value => updateValue('start_date', value)}
                        onBlur={() => onBlurUpdate('start_date')}
                        readOnly={!can('edit task')}
                        disabled={isLocked}
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

                          let validRangeStart = project.start_date
                            ? parseLocal(project.start_date)
                            : null;
                          let validRangeEnd = project.end_date
                            ? parseLocal(project.end_date)
                            : null;

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
                                validRangeStart = depStart;
                                break;
                              case 'related':
                                break;
                            }
                          }

                          const isInRange =
                            validRangeStart &&
                            validRangeEnd &&
                            dateTime >= validRangeStart.getTime() &&
                            dateTime <= validRangeEnd.getTime();

                          const isBeforeStart =
                            validRangeStart && dateTime < validRangeStart.getTime();
                          const isAfterEnd = validRangeEnd && dateTime > validRangeEnd.getTime();

                          const bgColor = isInRange
                            ? '#d4edda'
                            : isBeforeStart
                              ? '#e2e3e5'
                              : isAfterEnd
                                ? '#f8d7da'
                                : undefined;

                          const tooltipLabel = isInRange
                            ? '✅ Good — within valid range'
                            : isBeforeStart
                              ? '⚠️ Too early — before dependency condition'
                              : isAfterEnd
                                ? '❌ Too late — exceeds project deadline'
                                : null;

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
                      />
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <DateInput
                        label='End Date'
                        placeholder='Pick task end date'
                        description='When should this task be completed?'
                        valueFormat='DD MMM YYYY'
                        clearable
                        minDate={minEndDate}
                        maxDate={maxEndDate}
                        popoverProps={{ withinPortal: true, zIndex: drawerZIndex + 100 }}
                        value={data.end_date}
                        onChange={value => updateValue('end_date', value)}
                        onBlur={() => onBlurUpdate('end_date')}
                        readOnly={!can('edit task')}
                        disabled={isLocked}
                        renderDay={date => {
                          const day = date.getDate();

                          // ✅ Safe date validation and normalization
                          let bgColor = undefined;
                          let tooltipLabel = null;

                          try {
                            const normalizedDate = dayjs(date).startOf('day');

                            if (
                              minEndDate &&
                              !isNaN(minEndDate.getTime()) &&
                              maxEndDate &&
                              !isNaN(maxEndDate.getTime())
                            ) {
                              const normalizedMin = dayjs(minEndDate).startOf('day');
                              const normalizedMax = dayjs(maxEndDate).startOf('day');

                              const isInRange =
                                normalizedDate.isSameOrAfter(normalizedMin) &&
                                normalizedDate.isSameOrBefore(normalizedMax);
                              const isBefore = normalizedDate.isBefore(normalizedMin);
                              const isAfter = normalizedDate.isAfter(normalizedMax);

                              bgColor = isInRange
                                ? '#d4edda' // hijau lembut
                                : isBefore
                                  ? '#e2e3e5' // abu untuk terlalu awal
                                  : isAfter
                                    ? '#f8d7da' // merah untuk terlalu akhir
                                    : undefined;

                              tooltipLabel = isInRange
                                ? '✅ Good — within valid range'
                                : isBefore
                                  ? '⚠️ Too early — before start date or dependency'
                                  : isAfter
                                    ? '❌ Too late — exceeds project deadline or constraint'
                                    : null;
                            }
                          } catch (error) {
                            // If date processing fails, render without styling
                            console.warn('Date processing error in renderDay:', error);
                          }

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
                              withArrow
                              zIndex={3200}
                            >
                              {circle}
                            </Tooltip>
                          ) : (
                            circle
                          );
                        }}
                      />
                    </Grid.Col>
                  </Grid>
                </Box>

                {/* === VOLUME & UNIT SECTION === */}
                <Box>
                  <Title
                    order={5}
                    mb='xs'
                  >
                    <Group
                      gap='xs'
                      align='center'
                    >
                      <IconRuler
                        size={18}
                        color='var(--mantine-color-blue-6)'
                      />
                      <span>Volume & Measurement</span>
                    </Group>
                  </Title>
                  <Text
                    size='sm'
                    c='dimmed'
                    mb='sm'
                  >
                    Specify the tasks volume, unit of measurement, and related details for accurate
                    tracking.
                  </Text>
                  <Divider
                    mb='md'
                    mt='sm'
                  />
                  <Grid gutter='md'>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <NumberInput
                        label='Volume'
                        placeholder='Enter volume quantity'
                        description='Total quantity or amount for this task'
                        fixedDecimalScale
                        thousandSeparator='.'
                        decimalSeparator=','
                        allowNegative={false}
                        step={0.5}
                        value={data.volume || 0}
                        onChange={value => updateValue('volume', value)}
                        onBlur={() => onBlurUpdate('volume')}
                        readOnly={!can('edit task')}
                        disabled={isLocked}
                      />
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <StatusSelect
                        label='Unit'
                        clearable
                        placeholder='Select measurement unit'
                        description='Unit of measurement (e.g., kg, m², hours)'
                        value={data.unit ?? ''}
                        onChange={value => updateValue('unit', value)}
                        statuses={unitOptions}
                        comboboxProps={comboboxProps}
                        renderOption={renderSelectOptionWithIcon}
                        readOnly={!can('edit task')}
                        disabled={isLocked}
                      />
                    </Grid.Col>
                  </Grid>
                </Box>

                {/* === WEIGHT & COST SECTION === */}
                <Box>
                  <Title
                    order={5}
                    mb='xs'
                  >
                    <Group
                      gap='xs'
                      align='center'
                    >
                      <IconScale
                        size={18}
                        color='var(--mantine-color-blue-6)'
                      />
                      <span>Weight & Cost</span>
                    </Group>
                  </Title>
                  <Text
                    size='sm'
                    c='dimmed'
                    mb='sm'
                  >
                    Specify the task’s weight, cost details, and any relevant measurements.
                  </Text>
                  <Divider
                    mb='md'
                    mt='sm'
                  />
                  <Grid gutter='md'>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <NumberInput
                        label={
                          <Flex
                            align='center'
                            gap='xs'
                          >
                            <Switch
                              size='sm'
                              checked={manualWeight}
                              onChange={e => setManualWeight(e.currentTarget.checked)}
                              onClick={e => e.stopPropagation()}
                              disabled={isLocked}
                            />
                            <Tooltip
                              label={
                                isLocked
                                  ? 'Locked'
                                  : manualWeight
                                    ? 'Disable input manual weight'
                                    : 'Enable input manual weight'
                              }
                              withArrow
                              zIndex={2200}
                              position='top'
                            >
                              <Text
                                size='sm'
                                fw={500}
                              >
                                Weight (%)
                                <Text
                                  span
                                  c='red'
                                >
                                  {' '}
                                  *
                                </Text>
                              </Text>
                            </Tooltip>
                          </Flex>
                        }
                        placeholder='Enter weight percentage'
                        description='Percentage reflecting impact'
                        fixedDecimalScale
                        step={0.1}
                        precision={1}
                        value={data.weight_task || 0}
                        onChange={value => updateValue('weight_task', value)}
                        error={data?.errors?.weight_task || null}
                        disabled={!manualWeight}
                        readOnly={!can('edit task')}
                      />
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <NumberInput
                        label='Unit Cost'
                        placeholder='Enter cost per unit'
                        description={`Cost per ${data.unit || 'unit'} in ${currencySymbol}`}
                        fixedDecimalScale
                        thousandSeparator='.'
                        decimalSeparator=','
                        allowNegative={false}
                        step={0.5}
                        min={0}
                        leftSection={<Text size='sm'>{currencySymbol}</Text>}
                        value={data.unit_cost_task || 0}
                        onChange={value => updateValue('unit_cost_task', value)}
                        onBlur={() => onBlurUpdate('unit_cost_task')}
                        readOnly={!can('edit task')}
                        disabled={isLocked}
                      />
                    </Grid.Col>
                  </Grid>
                </Box>

                {/* === BUDGET SECTION === */}
                <Box>
                  <Title
                    order={5}
                    mb='xs'
                  >
                    <Group
                      gap='xs'
                      align='center'
                    >
                      <IconWallet
                        size={18}
                        color='var(--mantine-color-blue-6)'
                      />
                      <span>Budget Summary</span>
                    </Group>
                  </Title>
                  <Text
                    size='sm'
                    c='dimmed'
                    mb='sm'
                  >
                    Overview of the budget allocation, expenses, and remaining funds for this task.
                  </Text>
                  <Divider
                    mb='md'
                    mt='sm'
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
                          disabled={isLocked}
                        />
                        <Tooltip
                          label={
                            isLocked
                              ? 'Locked'
                              : manualBudget
                                ? 'Disable input manual budget'
                                : 'Enable input manual budget'
                          }
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
                            color: data.budget_task_plan > availableBudget ? 'red' : '#868e96',
                          }}
                        >
                          {money(Math.round(availableBudget))}
                        </span>
                      </span>
                    }
                    disabled={!manualBudget}
                    fixedDecimalScale
                    value={data.budget_task_plan}
                    min={0}
                    allowNegative={false}
                    step={0.5}
                    precision={2}
                    leftSection={<Text size='sm'>{currencySymbol}</Text>}
                    leftSectionWidth={40}
                    thousandSeparator='.'
                    decimalSeparator=','
                    onChange={value => updateValue('budget_task_plan', value)}
                    onBlur={() => onBlurUpdate('budget_task_plan')}
                    readOnly={!can('edit task')}
                    error={data.budget_task_plan < 0}
                    styles={{
                      input: {
                        fontWeight: 600,
                        fontSize: rem(16),
                      },
                    }}
                  />
                </Box>
              </Stack>
            </Box>
          </Tabs.Panel>

          <Tabs.Panel value='resource'>
            <Box
              mx='auto'
              mt='lg'
              pb='xl'
              ml='lg'
              mr='lg'
            >
              {/* === INVENTORY ALLOCATION SECTION === */}
              <Box mb='xl'>
                <InvAllocations
                  inventories={project.inventories}
                  selected={data.inventories}
                  onChange={updateTaskInventories}
                  availableResources={availableResources}
                  disabled={!can('edit task')}
                  isLocked={isLocked}
                />
              </Box>

              {/* === FILE ATTACHMENTS SECTION === */}
              <Box>
                <Group mb='xs'>
                  <IconCameraPin
                    size={30}
                    color='blue'
                    style={{ flexShrink: 0 }}
                  />
                  <Flex direction='column'>
                    <Group
                      align='center'
                      gap='xs'
                      mt='md'
                    >
                      <Title order={5}>Attachments</Title>
                      <Badge
                        variant='light'
                        size='sm'
                      >
                        {(data.attachment_files || []).length} file(s)
                      </Badge>
                    </Group>

                    <Text
                      size='sm'
                      c='dimmed'
                      mb='md'
                    >
                      Upload documents, images, or files related to this task
                    </Text>
                  </Flex>
                </Group>

                <Divider mb='md' />

                <Dropzone
                  selected={data.attachment_files || []}
                  onAddFiles={async files => {
                    // Gabungkan file baru ke state with timestamp
                    setData(prev => ({
                      ...prev,
                      attachment_files: [...(prev.attachment_files || []), ...files],
                      lastAttachmentUpdate: Date.now(),
                    }));

                    // Kirim langsung ke backend
                    await uploadAttachments(task, files);
                  }}
                  onRemoveAttachment={async file => {
                    // Cari index file di attachment_files
                    const index = (data.attachment_files || []).findIndex(f => f.id === file.id);

                    if (index !== -1) {
                      // Hapus dari state with timestamp
                      setData(prev => ({
                        ...prev,
                        attachment_files: (prev.attachment_files || []).filter(
                          f => f.id !== file.id
                        ),
                        lastAttachmentUpdate: Date.now(),
                      }));

                      // Hapus di backend
                      await deleteAttachment(task, index);
                    }
                  }}
                  task={task}
                  disabled={!can('edit task')}
                  isLocked={isLocked}
                />
              </Box>
            </Box>
          </Tabs.Panel>

          <Tabs.Panel value='messages'>
            <Box
              mx='auto'
              pb='xl'
              ml='lg'
              mr='lg'
            >
              {can('view comments') ? (
                <Comments task={task} />
              ) : (
                <Box
                  p='xl'
                  style={{ textAlign: 'center' }}
                >
                  <Text c='dimmed'>You don`t have permission to view comments</Text>
                </Box>
              )}
            </Box>
          </Tabs.Panel>

          <Tabs.Panel value='work'>
            <Box
              mx='auto'
              mt='lg'
              pb='xl'
              ml='lg'
              mr='lg'
            >
              <WorkReports
                projectId={project.id}
                taskId={task.id}
                pendingApproval={pendingApproval}
                onApprovalHandled={() => setPendingApproval(null)}
                taskStartDate={task.start_date ? new Date(task.start_date) : null}
                taskEndDate={task.end_date ? new Date(task.end_date) : null}
                taskUnit={task.unit?.name || task.unit_label?.name || ''}
                taskName={task.name}
                taskVolume={task.volume || 0}
                allocatedInventories={task.allocated_inventories || []}
                isLocked={isLocked}
              />
            </Box>
          </Tabs.Panel>
          <Tabs.Panel value='performance'>
            <Box
              mx='auto'
              mt='lg'
              pb='xl'
              ml='lg'
              mr='lg'
            >
              <PerformanceTasks task={task} />
            </Box>
          </Tabs.Panel>
        </Tabs>
      ) : (
        <Center h={300}>
          <Loader
            color='teal'
            size='lg'
          />
        </Center>
      )}
    </Drawer>
  );
}

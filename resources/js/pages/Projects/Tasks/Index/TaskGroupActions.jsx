import { openConfirmModal } from '@/components/ConfirmModal';
import { ActionIcon, Group, Menu, rem, Text, Tooltip, Badge } from '@mantine/core';
import {
  IconAdjustmentsDown,
  IconAdjustmentsUp,
  IconArchive,
  IconArchiveOff,
  IconEye,
  IconPencil,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';
import { useForm } from 'laravel-precognition-react-inertia';
import EditTasksGroupModal from './Modals/EditTasksGroupModal';
import { useState } from 'react';
import useTaskDrawerStore from '@/hooks/store/useTaskDrawerStore';
import { motion, AnimatePresence } from 'framer-motion';
import TaskGroupDetails from './TaskGroupDetails';
import Modal from '@/components/Modal';

export default function TaskGroupActions({ group, tasks, ...props }) {
  const [detailModalOpened, setDetailModalOpened] = useState(false);
  const [menuOpened, setMenuOpened] = useState(false);
  const { openCreateTask } = useTaskDrawerStore();
  const isLocked = Boolean(group?.project?.is_completed);

  const archiveForm = useForm(
    'delete',
    route('projects.task-groups.destroy', [group.project_id, group.id])
  );
  const restoreForm = useForm(
    'post',
    route('projects.task-groups.restore', [group.project_id, group.id])
  );
  const deleteForm = useForm(
    'delete',
    route('projects.task-groups.forceDelete', [group.project_id, group.id])
  );

  const openArchiveModal = () => {
    const hasTasks = group.tasks && group.tasks.length > 0;

    openConfirmModal({
      type: 'warning',
      title: 'Archive Task Group',
      confirmLabel: 'Archive',
      confirmProps: { color: 'orange' },
      deleteForm: archiveForm,
      formOptions: () => ({
        preserveScroll: true,
        data: hasTasks ? { archive_all: true } : {},
      }),
      content: (
        <div style={{ lineHeight: 1.6 }}>
          {hasTasks ? (
            <>
              <Text>
                The task group <b>{group.name}</b> contains the following task
                {group.tasks.length > 1 ? 's' : ''}:
              </Text>

              <ul style={{ margin: '8px 0 12px 20px', padding: 0 }}>
                {group.tasks.slice(0, 5).map(task => (
                  <li key={task.id}>
                    <Text size='sm'>{task.name}</Text>
                  </li>
                ))}
                {group.tasks.length > 5 && (
                  <Text
                    size='xs'
                    c='dimmed'
                  >
                    ...and {group.tasks.length - 5} more
                  </Text>
                )}
              </ul>

              <Text
                c='orange'
                fw={500}
                size='xs'
              >
                Archiving this task group will also archive all tasks listed above.
              </Text>
              <Text mt='xs'>Are you sure you want to continue?</Text>
            </>
          ) : (
            <Text>
              Are you sure you want to archive the task group <b>{group.name}</b>?
            </Text>
          )}
        </div>
      ),
    });
  };

  const openRestoreModal = () =>
    openConfirmModal({
      type: 'info',
      title: 'Restore Task Group',
      confirmLabel: 'Restore',
      confirmProps: { color: 'blue' },
      deleteForm: restoreForm,
      content: (
        <div style={{ lineHeight: 1.6 }}>
          <Text>
            You are about to restore the task group <b>{group.name}</b>.
          </Text>

          {group.tasks && group.tasks.length > 0 && (
            <>
              <Text mt='sm'>
                The following task{group.tasks.length > 1 ? 's' : ''} will also be restored:
              </Text>
              <ul style={{ margin: '8px 0 12px 20px', padding: 0 }}>
                {group.tasks.slice(0, 5).map(task => (
                  <li key={task.id}>
                    <Text size='sm'>{task.name}</Text>
                  </li>
                ))}
                {group.tasks.length > 5 && (
                  <Text
                    size='xs'
                    c='dimmed'
                  >
                    ...and {group.tasks.length - 5} more
                  </Text>
                )}
              </ul>
            </>
          )}

          <Text mt='xs'>Do you want to proceed?</Text>
        </div>
      ),
    });

  const openDeleteModal = () => {
    const hasTasks = group.tasks && group.tasks.length > 0;

    openConfirmModal({
      type: 'danger',
      title: 'Delete Task Group',
      confirmLabel: 'Delete',
      requirePassword: true,
      confirmProps: { color: 'red' },
      deleteForm: deleteForm,
      content: (
        <div style={{ lineHeight: 1.6 }}>
          {hasTasks ? (
            <>
              <Text>
                The task group <b>{group.name}</b> contains the following task
                {group.tasks.length > 1 ? 's' : ''}:
              </Text>

              <ul style={{ margin: '8px 0 12px 20px', padding: 0 }}>
                {group.tasks.slice(0, 5).map(task => (
                  <li key={task.id}>
                    <Text size='sm'>{task.name}</Text>
                  </li>
                ))}
                {group.tasks.length > 5 && (
                  <Text
                    size='xs'
                    c='dimmed'
                  >
                    ...and {group.tasks.length - 5} more
                  </Text>
                )}
              </ul>

              <Text
                c='red'
                fw={10}
                size='xs'
              >
                Deleting this task group will also permanently delete all tasks listed above. This
                action cannot be undone.
              </Text>
              <Text mt='xs'>Are you sure you want to continue?</Text>
            </>
          ) : (
            <Text>
              Are you sure you want to permanently delete the task group <b>{group.name}</b>? This
              action cannot be undone.
            </Text>
          )}
        </div>
      ),
    });
  };

  const openEditModal = () => EditTasksGroupModal(group);
  const openDetailModal = () => setDetailModalOpened(true);
  const closeDetailModal = () => setDetailModalOpened(false);

  return (
    <>
      <Group
        gap={0}
        justify='flex-end'
        {...props}
      >
        {((can('archive task group') && !group.archived_at && !route().params.archived) ||
          (can('restore task group') && (group.archived_at || route().params.archived)) ||
          can('delete task group') ||
          (can('edit task group') && !group.archived_at && !route().params.archived)) && (
          <Menu
            withArrow
            position='bottom-end'
            shadow='md'
            transitionProps={{ duration: 150, transition: 'pop-top-right' }}
            opened={menuOpened}
            onChange={setMenuOpened}
          >
            <Menu.Target>
              <Tooltip
                label='actions'
                color='blue'
                withArrow
              >
                <ActionIcon
                  variant='subtle'
                  component={motion.button}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                >
                  <AnimatePresence
                    mode='wait'
                    initial={false}
                  >
                    {menuOpened ? (
                      <motion.div
                        key='up'
                        initial={{ rotate: 90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: -90, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <IconAdjustmentsUp
                          style={{ width: rem(22), height: rem(22) }}
                          stroke={1.5}
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        key='down'
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <IconAdjustmentsDown
                          style={{ width: rem(22), height: rem(22) }}
                          stroke={1.5}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </ActionIcon>
              </Tooltip>
            </Menu.Target>

            <Menu.Dropdown>
              {!route().params.archived && can('create task') && !isLocked && (
                <Menu.Item
                  leftSection={
                    <IconPlus
                      style={{ width: rem(18), height: rem(18) }}
                      stroke={2}
                    />
                  }
                  color='blue'
                  onClick={() => openCreateTask(group.id)}
                >
                  Add task
                </Menu.Item>
              )}
              {can('archive task group') && !route().params.archived && !isLocked && (
                <Menu.Item
                  leftSection={
                    <IconArchive
                      style={{ width: rem(16), height: rem(16) }}
                      stroke={1.5}
                    />
                  }
                  color='orange'
                  onClick={openArchiveModal}
                >
                  Archive
                </Menu.Item>
              )}

              {can('delete task group') && !isLocked &&(
                <Menu.Item
                  leftSection={
                    <IconTrash
                      style={{ width: rem(16), height: rem(16) }}
                      stroke={1.5}
                    />
                  }
                  color='red'
                  onClick={openDeleteModal}
                >
                  Delete
                </Menu.Item>
              )}
              {can('edit task group') && !route().params.archived && !isLocked && (
                <Menu.Item
                  leftSection={
                    <IconPencil
                      style={{ width: rem(16), height: rem(16) }}
                      stroke={1.5}
                    />
                  }
                  color='green'
                  onClick={openEditModal}
                >
                  Edit
                </Menu.Item>
              )}
              <Menu.Item
                leftSection={
                  <IconEye
                    style={{ width: rem(16), height: rem(16) }}
                    stroke={1.5}
                  />
                }
                onClick={openDetailModal}
              >
                Details
              </Menu.Item>
              {/* ... */}
              {can('restore task group') && route().params.archived && !isLocked && (
                <Menu.Item
                  leftSection={
                    <IconArchiveOff
                      style={{ width: rem(16), height: rem(16) }}
                      stroke={1.5}
                    />
                  }
                  color='blue'
                  onClick={openRestoreModal}
                >
                  Restore
                </Menu.Item>
              )}
            </Menu.Dropdown>
          </Menu>
        )}
      </Group>
      <Modal
        size='auto'
        draggable
        zIndex={2200}
        opened={detailModalOpened}
        onClose={closeDetailModal}
        overlayProps={{ backgroundOpacity: 0.0, blur: 0 }}
        closeButtonProps={{ style: { position: 'absolute', top: 12, right: 12 } }}
        title={
          <Group
            justify='space-between'
            mb='sm'
            ml='md'
          >
            <div>
              <Text fw={700}>Task Group {group?.name || '-'} Details</Text>
              <Text
                size='sm'
                c='dimmed'
              >
                Project: {group?.project?.code} - {group?.project?.name || '-'}
              </Text>
              <Group
                gap='xs'
                mt='sm'
              >
                <Badge color='blue'>Tasks: {(tasks || group?.tasks || []).length}</Badge>
                <Badge color='green'>Progress: {Math.round(group?.progress_group || 0)}%</Badge>
              </Group>
            </div>
          </Group>
        }
      >
        <TaskGroupDetails
          group={group}
          tasks={tasks}
        />
      </Modal>
    </>
  );
}

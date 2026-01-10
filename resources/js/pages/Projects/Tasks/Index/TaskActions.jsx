import { openConfirmModal } from '@/components/ConfirmModal';
import { ActionIcon, Group, Menu, rem, Tooltip } from '@mantine/core';
import {
  IconAdjustmentsDown,
  IconAdjustmentsUp,
  IconArchive,
  IconArchiveOff,
  IconEyeBolt,
  IconTrash,
} from '@tabler/icons-react';
import { useForm } from 'laravel-precognition-react-inertia';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import useTaskDrawerStore from '@/hooks/store/useTaskDrawerStore';

export default function TaskActions({ task, ...props }) {
  const [menuOpened, setMenuOpened] = useState(false);
  const isLocked = Boolean(task?.project_is_completed ?? task?.project?.is_completed);

  const archiveForm = useForm(
    'delete',
    route('projects.tasks.destroy', { project: task.project_id, task: task.id })
  );
  const restoreForm = useForm(
    'post',
    route('projects.tasks.restore', { project: task.project_id, task: task.id })
  );
  const deleteForm = useForm(
    'delete',
    route('projects.tasks.forceDelete', { project: task.project_id, task: task.id })
  );

  const { openEditTask } = useTaskDrawerStore();
  const openManageModal = () => {
    openEditTask(task);
  };

  const openArchiveModal = () =>
    openConfirmModal({
      type: 'danger',
      title: 'Archive task',
      content: `Are you sure you want to archive this task "${task.name}"?`,
      confirmLabel: 'Archive',
      confirmProps: { color: 'orange' },
      deleteForm: archiveForm,
    });

  const openRestoreModal = () =>
    openConfirmModal({
      type: 'info',
      title: 'Restore task',
      content: `Are you sure you want to restore this task "${task.name}"?`,
      confirmLabel: 'Restore',
      confirmProps: { color: 'blue' },
      deleteForm: restoreForm,
    });

  const openDeleteModal = () =>
    openConfirmModal({
      type: 'danger',
      title: 'Delete task',
      content: `Are you sure you want to permanently delete this task "${task.name}"? This action cannot be undone.`,
      confirmLabel: 'Delete',
      requirePassword: true,
      confirmProps: { color: 'red' },
      deleteForm: deleteForm,
    });

  return (
    <Group
      gap={0}
      justify='flex-end'
      {...props}
    >
      {((can('archive task') && !route().params.archived) ||
        (can('restore task') && route().params.archived)) && (
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
            {can('restore task') && route().params.archived && !isLocked && (
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
            {can('edit task') && !route().params.archived && (
              <Menu.Item
                leftSection={
                  <IconEyeBolt
                    style={{ width: rem(16), height: rem(16) }}
                    stroke={1.5}
                  />
                }
                color='green'
                onClick={openManageModal}
              >
                Open
              </Menu.Item>
            )}
            {can('archive task') && !route().params.archived && !isLocked && (
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
            {can('delete task') && !isLocked && (
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
          </Menu.Dropdown>
        </Menu>
      )}
    </Group>
  );
}

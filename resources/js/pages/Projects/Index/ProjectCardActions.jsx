import { openConfirmModal } from '@/components/ConfirmModal';
import { useForm } from 'laravel-precognition-react-inertia';
import { ActionIcon, Menu, rem, Tooltip } from '@mantine/core';
import {
  IconArchive,
  IconTrash,
  IconArchiveOff,
  IconPencil,
  IconUsers,
  IconAdjustmentsDown,
  IconAdjustmentsUp,
} from '@tabler/icons-react';
import UserAccessModal from './Modals/UserAccessModal';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export default function ProjectCardActions({ item, onEdit }) {
  const [menuOpened, setMenuOpened] = useState(false);
  const archiveForm = useForm('delete', route('projects.destroy', [item, item.id]));
  const restoreForm = useForm('post', route('projects.restore', [item, item.id]));
  const forceDeleteForm = useForm('delete', route('projects.forceDelete', [item, item.id]));

  const isArchived = route().params.archived;
  const isLocked = Boolean(item?.is_completed);

  const canEditUserAccess = can('edit project user access');
  const canEdit = can('edit project');
  const canRestore = can('restore project');
  const canArchive = can('archive project');
  const canForceDelete = can('force delete project');

  const openUserAccess = () => {
    UserAccessModal(item);
  };

  const handleEditClick = e => {
    e.stopPropagation();
    onEdit?.();
  };

  const handleUserAccessClick = e => {
    e.stopPropagation();
    openUserAccess();
  };

  const handleArchiveClick = e => {
    e.stopPropagation();
    openConfirmModal({
      type: 'danger',
      title: 'Archive project',
      content: `Are you sure you want to archive the project "${item.name}"? This action will prevent users from accessing it.`,
      confirmLabel: 'Archive',
      confirmProps: { color: 'orange' },
      deleteForm: archiveForm,
    });
  };

  const handleRestoreClick = e => {
    e.stopPropagation();
    openConfirmModal({
      type: 'info',
      title: 'Restore project',
      content: `Are you sure you want to restore the project "${item.name}"?`,
      confirmLabel: 'Restore',
      confirmProps: { color: 'blue' },
      deleteForm: restoreForm,
    });
  };

  const handleDeleteClick = e => {
    e.stopPropagation();
    openConfirmModal({
      type: 'danger',
      title: 'Delete project',
      content: `Are you sure you want to permanently delete the project "${item.name}"? This action cannot be undone.`,
      confirmLabel: 'Delete',
      requirePassword: true,
      confirmProps: { color: 'red' },
      deleteForm: forceDeleteForm,
    });
  };

  const shouldShowMenu = canEditUserAccess || canEdit || canRestore || canArchive || canForceDelete;

  return shouldShowMenu ? (
    <Menu
      withArrow
      position='bottom-end'
      shadow='md'
      transitionProps={{ duration: 100, transition: 'pop-top-right' }}
      offset={{ mainAxis: 3, alignmentAxis: 5 }}
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
        {canEditUserAccess && !isLocked && (
          <Menu.Item
            leftSection={
              <IconUsers
                style={{ width: rem(16), height: rem(16) }}
                stroke={1.5}
              />
            }
            onClick={handleUserAccessClick}
          >
            User access
          </Menu.Item>
        )}
        {canEdit && (
          <Menu.Item
            leftSection={
              <IconPencil
                style={{ width: rem(16), height: rem(16) }}
                stroke={1.5}
              />
            }
            color='blue'
            onClick={handleEditClick}
          >
            Edit
          </Menu.Item>
        )}
        {canRestore && isArchived && (
          <Menu.Item
            leftSection={
              <IconArchiveOff
                style={{ width: rem(16), height: rem(16) }}
                stroke={1.5}
              />
            }
            color='blue'
            onClick={handleRestoreClick}
          >
            Restore
          </Menu.Item>
        )}
        {canArchive && !isArchived && (
          <Menu.Item
            leftSection={
              <IconArchive
                style={{ width: rem(16), height: rem(16) }}
                stroke={1.5}
              />
            }
            color='orange'
            onClick={handleArchiveClick}
          >
            Archive
          </Menu.Item>
        )}
        {canForceDelete && (
          <Menu.Item
            leftSection={
              <IconTrash
                style={{ width: rem(16), height: rem(16) }}
                stroke={1.5}
              />
            }
            color='red'
            onClick={handleDeleteClick}
          >
            Delete
          </Menu.Item>
        )}
      </Menu.Dropdown>
    </Menu>
  ) : null;
}

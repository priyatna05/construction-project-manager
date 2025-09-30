import { openConfirmModal } from '@/components/ConfirmModal';
import useForm from '@/hooks/useForm';
import { ActionIcon, Menu, rem } from '@mantine/core';
import {
  IconArchive,
  IconTrash,
  IconArchiveOff,
  IconDots,
  IconPencil,
  IconUsers,
} from '@tabler/icons-react';
import UserAccessModal from './Modals/UserAccessModal';

export default function ProjectCardActions({ item, onEdit }) {
  const [archiveForm] = useForm('delete', route('projects.destroy', item.id));
  const [restoreForm] = useForm('post', route('projects.restore', item.id));
  const [forceDeleteForm] = useForm('delete', route('projects.forceDelete', item.id));

  const isArchived = route().params.archived;

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
      onConfirm: () => archiveForm.submit({ preserveScroll: true }),
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
      onConfirm: () => restoreForm.submit({ preserveScroll: true }),
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
      onConfirm: password => {
        forceDeleteForm.submit({
          data: { password },
          preserveScroll: true,
        });
      },
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
    >
      <Menu.Target>
        <ActionIcon
          variant='subtle'
          color='gray'
          title='Project actions'
          aria-label='Project actions'
        >
          <IconDots
            style={{ width: rem(20), height: rem(20) }}
            stroke={1.5}
          />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        {canEditUserAccess && (
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

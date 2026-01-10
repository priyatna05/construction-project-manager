import { ActionIcon, Group, rem, Tooltip } from '@mantine/core';
import {
  IconArchive,
  IconArchiveOff,
  IconPencil,
  IconTrash,
} from '@tabler/icons-react';
import { openConfirmModal } from '@/components/ConfirmModal';
import { useForm } from 'laravel-precognition-react-inertia';

export default function TableRowActions({
  item,
  editPermission,
  archivePermission,
  restorePermission,
  deletePermission,
  archive = {},
  restore = {},
  destroy = {},
  onEdit,
}) {
  const isArchived = !!route().params.archived;

  const archiveSubmit = useForm('delete', route(archive?.route, item.id));
  const restoreSubmit = useForm('post', route(restore?.route, item.id));
  const deleteSubmit = useForm('delete', route(destroy?.route, item.id));
  const archivedFlag =
    route().params.archived ?? new URLSearchParams(window.location.search || '').get('archived');
  const archivedParam = archivedFlag ? { archived: archivedFlag } : {};
  const formOptions = { preserveScroll: true, data: archivedParam };

  const canEdit = can(editPermission);
  const canArchive = can(archivePermission);
  const canRestore = can(restorePermission);
  const canDelete = !!destroy?.route && can(deletePermission);

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit?.(item);
  };

  const handleArchive = (e) => {
    e.stopPropagation();
    openConfirmModal({
      type: 'danger',
      title: archive.title,
      content: archive.content,
      confirmLabel: archive.confirmLabel,
      confirmProps: { color: 'orange' },
      deleteForm: archiveSubmit,
      formOptions,
    });
  };

  const handleRestore = (e) => {
    e.stopPropagation();
    openConfirmModal({
      type: 'info',
      title: restore.title,
      content: restore.content,
      confirmLabel: restore.confirmLabel,
      confirmProps: { color: 'blue' },
      deleteForm: restoreSubmit,
      formOptions,
    });
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    openConfirmModal({
      type: 'danger',
      title: destroy.title,
      content: destroy.content,
      confirmLabel: destroy.confirmLabel,
      requirePassword: true,
      confirmProps: { color: 'red' },
      deleteForm: deleteSubmit,
      formOptions,
    });
  };

  return (
    <Group gap="xs" justify="flex-start" wrap="nowrap">
  {canEdit && !isArchived && (
    <Tooltip label="Edit" color='blue' withArrow>
      <ActionIcon variant="subtle" color="blue" onClick={handleEdit}>
        <IconPencil style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
      </ActionIcon>
    </Tooltip>
  )}

  {canArchive && !isArchived && (
    <Tooltip label="Archive" color='orange' withArrow>
      <ActionIcon variant="subtle" color="orange" onClick={handleArchive}>
        <IconArchive style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
      </ActionIcon>
    </Tooltip>
  )}

  {canRestore && isArchived && (
    <Tooltip label="Restore" color='green' withArrow>
      <ActionIcon variant="subtle" color="green" onClick={handleRestore}>
        <IconArchiveOff style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
      </ActionIcon>
    </Tooltip>
  )}

  {canDelete && isArchived && (
    <Tooltip label="Delete" color='red' withArrow>
      <ActionIcon variant="subtle" color="red" onClick={handleDelete}>
        <IconTrash style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
      </ActionIcon>
    </Tooltip>
  )}
</Group>
  );
}

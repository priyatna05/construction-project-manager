import { ActionIcon, Group, Menu, rem } from '@mantine/core';
import {
  IconArchive,
  IconArchiveOff,
  IconDots,
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
  children,
}) {
  const isArchived = !!route().params.archived;

  const archiveForm = useForm('delete', route(archive?.route, item.id));
  const restoreForm = useForm('post', route(restore?.route, item.id));
  const deleteForm = useForm('delete', route(destroy?.route, item.id));

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
      onConfirm: () => archiveForm.submit({ preserveScroll: true }),
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
      onConfirm: () => restoreForm.submit({ preserveScroll: true }),
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
      onConfirm: (password) =>
        deleteForm.submit({ data: { password }, preserveScroll: true }),
    });
  };

  const shouldShowMenu = (canArchive || canRestore) && item.name !== 'client';

  return (
    <Group gap={0} justify="flex-end" wrap="nowrap">
      {children}

      {canEdit && !isArchived && (
        <ActionIcon variant="subtle" color="blue" onClick={handleEdit}>
          <IconPencil style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
        </ActionIcon>
      )}

      {shouldShowMenu && (
        <Menu
          withArrow
          position="bottom-end"
          shadow="md"
          transitionProps={{ duration: 100, transition: 'pop-top-right' }}
          offset={{ mainAxis: 3, alignmentAxis: 5 }}
        >
          <Menu.Target>
            <ActionIcon variant="subtle" color="gray">
              <IconDots style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
            </ActionIcon>
          </Menu.Target>

          <Menu.Dropdown>
            {canRestore && isArchived && (
              <Menu.Item
                leftSection={
                  <IconArchiveOff style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
                }
                color="blue"
                onClick={handleRestore}
              >
                Restore
              </Menu.Item>
            )}

            {canArchive && !isArchived && (
              <Menu.Item
                leftSection={
                  <IconArchive style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
                }
                color="orange"
                onClick={handleArchive}
              >
                Archive
              </Menu.Item>
            )}

            {canDelete && !isArchived && (
              <Menu.Item
                leftSection={
                  <IconTrash style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
                }
                color="red"
                onClick={handleDelete}
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

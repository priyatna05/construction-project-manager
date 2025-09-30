import { openConfirmModal } from '@/components/ConfirmModal';
import {
  ActionIcon,
  Group,
  Menu,
  rem,
  Text,
  SimpleGrid,
  Paper,
  RingProgress,
  Badge,
} from '@mantine/core';
import {
  IconArchive,
  IconArchiveOff,
  IconDots,
  IconEye,
  IconPencil,
  IconTrash,
} from '@tabler/icons-react';
import { useForm } from 'laravel-precognition-react-inertia';
import EditTasksGroupModal from './Modals/EditTasksGroupModal';
import Modal from '@/components/Modal';
import { money } from '@/utils/currency';
import { dateSlash } from '@/utils/datetime';
import { useState } from 'react';

function TaskGroupDetailsContent({ group }) {
  return (
    <Paper
      p='md'
      shadow='xs'
    >
      <SimpleGrid
        cols={2}
        spacing='md'
      >
        <div>
          <Text
            size='xs'
            c='dimmed'
          >
            Name
          </Text>
          <Text fw={500}>{group.name || 'N/A'}</Text>
        </div>
        <div>
          <Text
            size='xs'
            c='dimmed'
          >
            Project ID
          </Text>
          <Text fw={500}>{group.project_id}</Text>
        </div>
        <div>
          <Text
            size='xs'
            c='dimmed'
          >
            Project code
          </Text>
          <Text fw={500}>{group.code_project}</Text>
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <Text
            size='xs'
            c='dimmed'
          >
            Description
          </Text>
          <Text>{group.description || 'No description'}</Text>
        </div>
        <div>
          <Text
            size='xs'
            c='dimmed'
          >
            Start Date
          </Text>
          <Text>{group.start_date ? dateSlash(group.start_date) : 'N/A'}</Text>
        </div>
        <div>
          <Text
            size='xs'
            c='dimmed'
          >
            End Date
          </Text>
          <Text>{group.end_date ? dateSlash(group.end_date) : 'N/A'}</Text>
        </div>
        <div>
          <Text
            size='xs'
            c='dimmed'
          >
            Budget
          </Text>
          <Text>{group.budget_group ? money(group.budget_group) : 'N/A'}</Text>
        </div>
        <div>
          <Text
            size='xs'
            c='dimmed'
          >
            Weight
          </Text>
          <Text>{group.weight_group !== null ? `${group.weight_group}%` : 'N/A'}</Text>
        </div>
      </SimpleGrid>
      <Group
        mt='md'
        justify='center'
      >
        <RingProgress
          label={
            <Text
              c='blue'
              fw={700}
              ta='center'
              size='xl'
            >{`${Math.round(group.progress_group || 0)}%`}</Text>
          }
          sections={[{ value: group.progress_group || 0, color: 'blue' }]}
          size={120}
          thickness={12}
          roundCaps
        />
        <Text
          size='sm'
          c='dimmed'
          mt='xs'
        >
          Progress
        </Text>
      </Group>
      {group.archived_at && (
        <Badge
          color='gray'
          mt='md'
        >
          Archived on {dateSlash(group.archived_at)}
        </Badge>
      )}
    </Paper>
  );
}

export default function TaskGroupActions({ group, ...props }) {
  const [detailModalOpened, setDetailModalOpened] = useState(false);

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

  const openArchiveModal = () =>
    openConfirmModal({
      type: 'danger',
      title: 'Archive task group',
      content: `Are you sure you want to archive this "${group.name}"?`,
      confirmLabel: 'Archive',
      confirmProps: { color: 'orange' },
      onConfirm: () => archiveForm.submit({ preserveScroll: true }),
    });

  const openRestoreModal = () =>
    openConfirmModal({
      type: 'info',
      title: 'Restore task group',
      content: `Are you sure you want to restore this "${group.name}"?`,
      confirmLabel: 'Restore',
      confirmProps: { color: 'blue' },
      onConfirm: () => restoreForm.submit({ preserveScroll: true }),
    });

  const openDeleteModal = () =>
    openConfirmModal({
      type: 'danger',
      title: 'Delete task group',
      content: `Are you sure you want to delete this "${group.name}"? This action cannot be undone.`,
      confirmLabel: 'Delete',
      requirePassword: true,
      confirmProps: { color: 'red' },
      onConfirm: password => {
        deleteForm.submit({
          data: { password },
          preserveScroll: true,
        });
      },
    });

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
            withinPortal
            shadow='md'
            transitionProps={{ duration: 100, transition: 'pop-top-right' }}
            offset={{ mainAxis: 3, alignmentAxis: 5 }}
          >
            <Menu.Target>
              <ActionIcon
                variant='subtle'
                color='gray'
              >
                <IconDots
                  style={{ width: rem(20), height: rem(20) }}
                  stroke={1.5}
                />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              {can('archive task group') && !route().params.archived && (
                <Menu.Item
                  leftSection={
                    <IconArchive
                      style={{ width: rem(16), height: rem(16) }}
                      stroke={1.5}
                    />
                  }
                  color='red'
                  onClick={openArchiveModal}
                >
                  Archive
                </Menu.Item>
              )}

              {can('delete task group') && (
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
              {can('edit task group') && !route().params.archived && (
                <Menu.Item
                  leftSection={
                    <IconPencil
                      style={{ width: rem(16), height: rem(16) }}
                      stroke={1.5}
                    />
                  }
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
              {can('restore task group') && route().params.archived && (
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
        opened={detailModalOpened}
        onClose={closeDetailModal}
        title={`Details for: ${group.name}`}
        // size="lg" // atau prop lain yang didukung komponen Modal Anda
      >
        <TaskGroupDetailsContent group={group} />
      </Modal>
    </>
  );
}

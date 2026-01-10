import ArchivedFilterButton from '@/components/ArchivedFilterButton';
import ClearFiltersButton from '@/components/ClearFiltersButton';
import useTaskDrawerStore from '@/hooks/store/useTaskDrawerStore';
import useTaskFiltersStore from '@/hooks/store/useTaskFiltersStore';
import usePreferences from '@/hooks/usePreferences';
import { usePage } from '@inertiajs/react';
import CreateTasksGroupModal from './Modals/CreateTasksGroupModal';
import { ActionIcon, Button, Grid, Group, Text, Tooltip, Menu } from '@mantine/core';
import {
  IconFilter,
  IconFilterCog,
  IconLayoutKanban,
  IconLayoutList,
  IconPlus,
  IconLayoutGridAdd,
  IconListDetails,
} from '@tabler/icons-react';
import ProjectHeaderBudget from './ProjectHeaderBudget';
import { useEffect, useState } from 'react';

export default function Header({ onEditProject }) {
  const { project } = usePage().props;
  const { tasksView, setTasksView } = usePreferences();
  const { openDrawer, hasUrlParams } = useTaskFiltersStore();
  const { openCreateTask } = useTaskDrawerStore();
  const usingFilters = hasUrlParams(['archived']);
  const isLocked = Boolean(project?.is_completed);
  const [headerCollapsed, setHeaderCollapsed] = useState(false);

  useEffect(() => {
    // Auto collapse header when entering kanban, expand on list view
    setHeaderCollapsed(tasksView === 'kanban');
  }, [tasksView]);

  const hideBudgetHeader = tasksView === 'kanban' && headerCollapsed;

  return (
    <Grid justify='space-between'>
      {!hideBudgetHeader && (
        <Grid.Col>
          <ProjectHeaderBudget
            project={project}
            onEdit={onEditProject}
          />
        </Grid.Col>
      )}

      {/* === Tengah: Menu dan Filter === */}
      <Grid.Col
        span='content'
        mt='xl'
      >
        <Group spacing='sm'>
          {/* Status Archived */}
          {project.archived_at && (
            <Text
              size='sm'
              fw={500}
              c='red.8'
            >
              (Archived)
            </Text>
          )}

          {/* Tombol Add New */}
          {can('create task group') &&
            can('create task') &&
            !isLocked && (
              <Menu
                shadow='md'
                width={220}
                position='bottom-start'
              >
                <Menu.Target>
                  <Button
                    leftSection={<IconPlus size={14} />}
                    variant='default'
                    radius='xl'
                  >
                    Add New...
                  </Button>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item
                    leftSection={<IconLayoutGridAdd size={14} />}
                    onClick={CreateTasksGroupModal}
                  >
                    Task Group
                  </Menu.Item>
                  <Menu.Item
                    leftSection={<IconListDetails size={14} />}
                    onClick={() => openCreateTask()}
                  >
                    Task
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            )}

          {/* Filter Button */}
          <ActionIcon.Group>
            {tasksView === 'kanban' && (
              <Tooltip
                label={headerCollapsed ? 'Show detail project' : 'Hide detail project'}
                openDelay={500}
                withArrow
                color='green'
              >
                <ActionIcon
                  variant={headerCollapsed ? 'default' : 'filled'}
                  size='lg'
                  onClick={() => setHeaderCollapsed(prev => !prev)}
                >
                  <IconListDetails
                    style={{ width: '60%', height: '60%' }}
                    stroke={1.5}
                  />
                </ActionIcon>
              </Tooltip>
            )}
            {tasksView === 'kanban' && (
              <Tooltip
                label='Filters'
                openDelay={500}
                withArrow
                color='green'
              >
                <ActionIcon
                  variant='filled'
                  size='lg'
                  onClick={() => openDrawer()}
                >
                  {usingFilters ? (
                    <IconFilterCog
                      style={{ width: '60%', height: '60%' }}
                      stroke={1.5}
                    />
                  ) : (
                    <IconFilter
                      style={{ width: '60%', height: '60%' }}
                      stroke={1.5}
                    />
                  )}
                </ActionIcon>
              </Tooltip>
            )}
            {usingFilters && <ClearFiltersButton />}
            { can('view archived tasks') && can('view archived task groups') && (
              <ArchivedFilterButton />
            )}
            </ActionIcon.Group>
        </Group>
      </Grid.Col>

      {/* === Kanan: Switch View (List/Kanban) === */}
      <Grid.Col
        span='content'
        mt='xl'
      >
        <Group>
          <ActionIcon.Group>
            <Tooltip
              label='List view'
              openDelay={250}
              withArrow
              color='green'
            >
              <ActionIcon
                size='lg'
                variant={tasksView === 'list' ? 'filled' : 'default'}
                onClick={() => setTasksView('list')}
              >
                <IconLayoutList style={{ width: '40%', height: '40%' }} />
              </ActionIcon>
            </Tooltip>

            <Tooltip
              label='Kanban view'
              openDelay={250}
              withArrow
              color='green'
            >
              <ActionIcon
                size='lg'
                variant={tasksView === 'kanban' ? 'filled' : 'default'}
                onClick={() => setTasksView('kanban')}
              >
                <IconLayoutKanban style={{ width: '45%', height: '45%' }} />
              </ActionIcon>
            </Tooltip>
          </ActionIcon.Group>
        </Group>
      </Grid.Col>
    </Grid>
  );
}

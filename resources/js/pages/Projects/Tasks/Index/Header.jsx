import ArchivedFilterButton from '@/components/ArchivedFilterButton';
import ClearFiltersButton from '@/components/ClearFiltersButton';
import useTaskDrawerStore from '@/hooks/store/useTaskDrawerStore';
import useTaskFiltersStore from '@/hooks/store/useTaskFiltersStore';
import usePreferences from '@/hooks/usePreferences';
import { usePage, Link } from '@inertiajs/react';
import CreateTasksGroupModal from './Modals/CreateTasksGroupModal';
import {
  ActionIcon,
  Button,
  UnstyledButton,
  Grid,
  Group,
  Text,
  Title,
  Select,
  Stack,
  Tooltip,
  Popover,
  Menu,
} from '@mantine/core';
import {
  IconFilter,
  IconFilterCog,
  IconLayoutKanban,
  IconLayoutList,
  IconPlus,
  IconLayoutGridAdd,
  IconListDetails,
} from '@tabler/icons-react';
import { dateSlash, convertDurationFromDays, getUnitLabel } from '@/utils/datetime';
import { money } from '@/utils/currency';
import { useState } from 'react';
// import { stripHtml } from "@/utils/convertHtml";

export default function Header() {
  const { project } = usePage().props;
  const { tasksView, setTasksView } = usePreferences();
  const { openDrawer } = useTaskFiltersStore();
  const { openCreateTask } = useTaskDrawerStore();
  const { hasUrlParams } = useTaskFiltersStore();
  const usingFilters = hasUrlParams(['archived']);
  const [durationUnit, setDurationUnit] = useState('day');
  const [popoverOpened, setPopoverOpened] = useState(false);
  const durationInUnit = convertDurationFromDays(project.duration, durationUnit);

  return (
    <Grid
      justify='space-between'
      align='end'
    >
      <Grid.Col span='content'>
        <Group
          mb='lg'
          c='white'
        >
          <Stack
            spacing='xs'
            mb='md'
            w='100%'
          >
            <Tooltip
              label='Click to detail proyek'
              withArrow
            >
              <Link
                href={route('projects.detail', project.id)}
                style={{ textDecoration: 'none', display: 'block', maxWidth: '100%' }}
              >
                <Title
                  order={1}
                  style={{
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'color 0.2s',
                    whiteSpace: 'normal',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    maxWidth: '100%',
                    lineHeight: 1.3,
                  }}
                >
                  {project.name}
                </Title>
              </Link>
            </Tooltip>
            {/* {project.description && (
        <Text size="md">
          {stripHtml(project.description)}
        </Text>
      )} */}
            <Group spacing='md'>
              {project.clientCompany?.name && <Text>Client: {project.clientCompany.name}</Text>}
            </Group>
            <Group spacing='md'>
              {project.start_date && <Text>Start: {dateSlash(project.start_date)}</Text>}
              {project.end_date && <Text>End: {dateSlash(project.end_date)}</Text>}
              {/* Durasi dengan filter dan icon */}
              <Popover
                opened={popoverOpened}
                onClose={() => setPopoverOpened(false)}
                position='bottom'
                withArrow
                trapFocus={false}
                closeOnClickOutside
              >
                <Popover.Target>
                  <UnstyledButton onClick={() => setPopoverOpened(o => !o)}>
                    <Group>
                      {/* <IconFilter size={16} /> */}
                      <Text
                        size='sm'
                        fw={500}
                      >
                        Duration: {durationInUnit} {getUnitLabel(durationUnit, durationInUnit)}
                      </Text>
                    </Group>
                  </UnstyledButton>
                </Popover.Target>

                <Popover.Dropdown>
                  <Select
                    label='Filter Duration'
                    size='xs'
                    data={[
                      { value: 'day', label: 'Day' },
                      { value: 'week', label: 'Week' },
                      { value: 'month', label: 'Month' },
                    ]}
                    value={durationUnit}
                    onChange={val => {
                      setDurationUnit(val);
                      setPopoverOpened(false);
                    }}
                  />
                </Popover.Dropdown>
              </Popover>

              {project.budget_project && (
                <Text>Budget: {money(Math.round(project.budget_project))}</Text>
              )}
            </Group>
          </Stack>
        </Group>
        <Group>
          {project.archived_at && (
            <Text
              size='sm'
              fw={500}
              c='red.8'
            >
              (Archived)
            </Text>
          )}
          <Menu
            shadow='md'
            width={200}
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
              {!route().params.archived && can('create task group') && (
                <Menu.Item
                  leftSection={<IconLayoutGridAdd size={14} />}
                  onClick={CreateTasksGroupModal}
                >
                  Task Group
                </Menu.Item>
              )}

              {can('create task') && (
                <Menu.Item
                  leftSection={<IconListDetails size={14} />}
                  onClick={() => openCreateTask()}
                >
                  Task
                </Menu.Item>
              )}
            </Menu.Dropdown>
          </Menu>
          <ActionIcon.Group>
            {tasksView === 'kanban' && (
              <Tooltip
                label='Filters'
                openDelay={500}
                withArrow
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
          </ActionIcon.Group>
          <ArchivedFilterButton />
        </Group>
      </Grid.Col>
      <Grid.Col span='content'>
        <Group>
          <Group
            mr='sm'
            gap={10}
          >
            <ActionIcon.Group>
              <ActionIcon
                size='lg'
                variant={tasksView === 'list' ? 'filled' : 'default'}
                onClick={() => setTasksView('list')}
              >
                <Tooltip
                  label='List view'
                  openDelay={250}
                  withArrow
                >
                  <IconLayoutList style={{ width: '40%', height: '40%' }} />
                </Tooltip>
              </ActionIcon>
              <ActionIcon
                size='lg'
                variant={tasksView === 'kanban' ? 'filled' : 'default'}
                onClick={() => setTasksView('kanban')}
              >
                <Tooltip
                  label='Kanban view'
                  openDelay={250}
                  withArrow
                >
                  <IconLayoutKanban style={{ width: '45%', height: '45%' }} />
                </Tooltip>
              </ActionIcon>
            </ActionIcon.Group>
          </Group>
        </Group>
      </Grid.Col>
    </Grid>
  );
}

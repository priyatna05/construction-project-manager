import ArchivedFilterButton from '@/components/ArchivedFilterButton';
import EmptyWithIcon from '@/components/EmptyWithIcon';
import TableHead from '@/components/TableHead';
import Pagination from '@/components/Pagination';
import TableRowEmpty from '@/components/TableRowEmpty';
import { actionColumnVisibility, prepareColumns } from '@/utils/table';
import useAuthorization from '@/hooks/useAuthorization';
import Layout from '@/layouts/MainLayout';
import { usePage } from '@inertiajs/react';
import {
  Button,
  Card,
  Center,
  Flex,
  Grid,
  Group,
  ActionIcon,
  Tooltip,
  Title,
  Table,
} from '@mantine/core';
import { IconPlus, IconSearch, IconLayoutGrid, IconList } from '@tabler/icons-react';
import ProjectCard from './Index/ProjectCard';
import { useState } from 'react';
import ProjectCreate from './Create';
import ProjectList from './Index/ProjectList';

const ProjectsIndex = () => {
  const { items, dropdowns } = usePage().props;

  const [viewMode, setViewMode] = useState('card');
  const { isAdmin, can } = useAuthorization();
  const [createModalOpened, setCreateModalOpened] = useState(false);
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const openEditModal = project => {
    setSelectedProject(project);
    setEditModalOpened(true);
  };
  const closeEditModal = () => {
    setSelectedProject(null);
    setEditModalOpened(false);
  };

  const columns = prepareColumns([
    { label: 'Code Project', sortable: false },
    { label: 'Name', column: 'name' },
    { label: 'Client', sortable: false },
    { label: 'Team', column: 'team' },
    { label: 'Completed tasks', sortable: false },
    { label: 'status', sortable: false },
    {
      label: 'Actions',
      sortable: false,
      visible: actionColumnVisibility('user'),
    },
  ]);

  return (
    <>
      <Grid
        justify='space-between'
        align='center'
      >
        <Grid.Col span='content'>
          <Title
            style={{ color: 'white' }}
            mb='lg'
          >
            List Of Project
          </Title>
          <Group>
            {can('create project') && (
              <Button
                leftSection={<IconPlus size={14} />}
                radius='xl'
                variant='default'
                onClick={() => setCreateModalOpened(true)}
              >
                Create
              </Button>
            )}
            {isAdmin() && <ArchivedFilterButton />}
            <Group>
              <Tooltip
                label='Card View'
                withArrow
              >
                <ActionIcon
                  variant={viewMode === 'card' ? 'filled' : 'default'}
                  color='blue'
                  onClick={() => setViewMode('card')}
                  size='lg'
                >
                  <IconLayoutGrid size={18} />
                </ActionIcon>
              </Tooltip>

              <Tooltip
                label='List View'
                withArrow
              >
                <ActionIcon
                  variant={viewMode === 'list' ? 'filled' : 'default'}
                  color='blue'
                  onClick={() => setViewMode('list')}
                  size='lg'
                >
                  <IconList size={18} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Group>
        </Grid.Col>
      </Grid>
      {createModalOpened && (
        <ProjectCreate
          dropdowns={dropdowns}
          opened={createModalOpened}
          setOpen={setCreateModalOpened}
        />
      )}
      {editModalOpened && selectedProject && (
        <ProjectCreate
          project={selectedProject}
          dropdowns={dropdowns}
          opened={editModalOpened}
          setOpen={closeEditModal}
        />
      )}

      {items.length ? (
        viewMode === 'card' ? (
          <Flex
            mt='xl'
            gap='lg'
            justify='flex-start'
            align='flex-start'
            direction='row'
            wrap='wrap'
          >
            {items.map(item => (
              <ProjectCard
                item={item}
                key={item.id}
                onEdit={() => openEditModal(item)}
              />
            ))}
          </Flex>
        ) : (
          <Card
            shadow='sm'
            withBorder
            my='lg'
          >
            <Table
              stickyHeader
              highlightOnHover
              style={{ tableLayout: 'auto' }}
            >
              <TableHead columns={columns} />
              <Table.Tbody>
                {items.length ? (
                  items.map(item => (
                    <ProjectList
                      item={item}
                      key={item.id}
                      onEdit={() => openEditModal(item)}
                    />
                  ))
                ) : (
                  <TableRowEmpty colSpan={columns.length} />
                )}
              </Table.Tbody>
            </Table>

            <Pagination
            // current={items.meta.current_page}
            // pages={items.meta.last_page}
            />
          </Card>
        )
      ) : (
        <Center mih={400}>
          <EmptyWithIcon
            title='No projects found'
            description='or you do not have access to any of them'
            icon={IconSearch}
          />
        </Center>
      )}
    </>
  );
};

ProjectsIndex.layout = page => <Layout title='Projects'>{page}</Layout>;

export default ProjectsIndex;

import EmptyWithIcon from '@/components/EmptyWithIcon';
import TableHead from '@/components/TableHead';
import TableRowEmpty from '@/components/TableRowEmpty';
import { actionColumnVisibility, prepareColumns } from '@/utils/table';
import useAuthorization from '@/hooks/useAuthorization';
import Layout from '@/layouts/MainLayout';
import { usePage, useForm, Link } from '@inertiajs/react';
import {
  Button,
  Card,
  Center,
  Flex,
  Grid,
  Group,
  ActionIcon,
  Title,
  Table,
  Breadcrumbs,
  Text,
  Menu,
  Tooltip,
} from '@mantine/core';
import {
  IconPlus,
  IconSearch,
  IconLayoutGrid,
  IconList,
  IconFilter,
  IconArchive,
  IconSortAscending,
  IconSortDescending,
} from '@tabler/icons-react';
import ProjectCard from './Index/ProjectCard';
import { useEffect, useState } from 'react';
import CreateProject from './Create';
import EditProject from './Edit';
import ProjectList from './Index/ProjectList';
import { useDidUpdate, useDisclosure } from '@mantine/hooks';
import { reloadWithQuery, reloadWithoutQueryParams } from '@/utils/route';
import { getFrameworkDropdownData } from '@/utils/selectFramework';
import { getIcon, renderSelectOptionWithIcon } from '@/components/helperLabel';

const ProjectsIndex = () => {
  const { items, dropdowns } = usePage().props;
  const [viewMode, setViewMode] = useState('card');
  const { isAdmin, can } = useAuthorization();
  const [createModalOpened, setCreateModalOpened] = useState(false);
  const [selected, { toggle }] = useDisclosure(route().params?.archived !== undefined);
  const [autoEditHandled, setAutoEditHandled] = useState(false);

  useDidUpdate(() => {
    if (selected) reloadWithQuery({ archived: 1 });
    else reloadWithoutQueryParams({ exclude: ['archived'] });
  }, [selected]);

  const form = useForm({
    name: '',
    description: '',
    client_company_id: '',
    start_date: null,
    end_date: null,
    budget_project_estimate: '',
    users: [],
    attachment_files: [],
    generate_task_groups: '',
    type_id: '',
    status_ids: [],
  });

  const updateValue = (key, value) => {
    form.setData(key, value);
  };

  const removeAttachment = attachmentToRemove => {
    if (attachmentToRemove instanceof File) {
      form.setData(
        'attachment_files',
        form.data.attachment_files.filter(f => f !== attachmentToRemove)
      );
    } else {
      form.setData(
        'attachment_files',
        form.data.attachment_files.filter(f => f !== attachmentToRemove)
      );
    }
  };

  const suggestion = '';
  const existingProjectNames = items.map(p => p.name);
  const selectedType = dropdowns.types.find(t => t.slug === form.data.type_id);
  const currencySymbol = 'Rp';

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

  // Auto-open edit modal when redirected with ?edit_project=ID
  useEffect(() => {
    if (autoEditHandled) return;
    const params = new URLSearchParams(window.location.search);
    const editId = params.get('edit_project');
    if (!editId) return;
    const projectToEdit = items.find(p => String(p.id) === String(editId));
    if (projectToEdit) {
      openEditModal(projectToEdit);
      setAutoEditHandled(true);
    }
  }, [items, autoEditHandled]);

  const columns = prepareColumns([
    { label: 'Code Project', sortable: false },
    { label: 'Name', column: 'name' },
    { label: 'Client', sortable: false },
    { label: 'Team', column: 'team' },
    { label: 'Completed tasks', sortable: false },
    { label: 'status', sortable: false },
    { label: 'Contract', sortable: false },
    { label: 'Attachments', sortable: 'attachments' },
    {
      label: 'Actions',
      sortable: false,
      visible: actionColumnVisibility('user'),
    },
  ]);

  return (
    <>
      <Breadcrumbs
        fz={14}
        mb={30}
        separator={<Text c='white'>/</Text>}
      >
        <Link
          href={route('projects.index')}
          style={{ textDecoration: 'none' }}
        >
          <Text
            c='white'
            fw={500}
          >
            Projects
          </Text>
        </Link>
        {selected && (
          <Text
            c='white'
            fw={500}
          >
            Data Project Archived
          </Text>
        )}
      </Breadcrumbs>
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
            <Group>
              <ActionIcon.Group>
                <Tooltip
                  label='Card View'
                  position='top'
                  withArrow
                >
                <ActionIcon
                  size='lg'
                  onClick={() => setViewMode('card')}
                  variant={selected ? 'filled' : 'default'}
                  color={selected ? 'green' : ''}
                >
                  <IconLayoutGrid size={14} />
                </ActionIcon>
                </Tooltip>
                <Tooltip
                  label='List View'
                  position='top'
                  withArrow
                >
                <ActionIcon
                  size='lg'
                  onClick={() => setViewMode('list')}
                  variant={selected ? 'default' : 'default'}
                  color={selected ? 'white' : ''}
                  >
                  <IconList size={14} />
                </ActionIcon>
                  </Tooltip>
                  <Tooltip
                    label='Archive'
                    position='top'
                    withArrow
                  >
                {isAdmin() && (
                  <ActionIcon
                    size='lg'
                    onClick={toggle}
                    variant={selected ? 'filled' : 'default'}
                    color={selected ? 'red' : ''}
                    >
                    <IconArchive size={14} />
                  </ActionIcon>
                )}
                </Tooltip>
                <Menu
                  shadow='md'
                  width={200}
                  trigger='hover'
                  openDelay={100}
                  closeDelay={400}
                  withArrow
                  position='right-start'
                  offset={4}
                  transitionProps={{ transition: 'pop', duration: 150 }}
                >
                  <Menu.Target>
                    <ActionIcon
                      variant={selected ? 'filled' : 'default'}
                      color={selected ? 'blue' : ''}
                      size='lg'
                    >
                      <IconFilter
                        size={20}
                        stroke={3}
                      />
                    </ActionIcon>
                  </Menu.Target>

                  <Menu.Dropdown>
                    <Menu.Label>Filtered Menu</Menu.Label>
                    <Menu.Divider />
                    <Menu.Label>Sort by Name</Menu.Label>
                    <Menu.Item
                      leftSection={<IconSortAscending size={14} />}
                      onClick={() => reloadWithQuery({ sort: { name: 'asc' } }, true)}
                    >
                      A-Z
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<IconSortDescending size={14} />}
                      onClick={() => reloadWithQuery({ sort: { name: 'desc' } }, true)}
                    >
                      Z-A
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Label>Sort by Status</Menu.Label>
                    {dropdowns.status.map(s => (
                      <Menu.Item
                        key={s.id}
                        onClick={() => reloadWithQuery({ status: s.id })}
                        leftSection={getIcon(s.icon)}
                      >
                        {s.name}
                      </Menu.Item>
                    ))}
                  </Menu.Dropdown>
                </Menu>
              </ActionIcon.Group>
            </Group>
          </Group>
        </Grid.Col>
      </Grid>
      {createModalOpened && (
        <CreateProject
          opened={createModalOpened}
          onClose={() => setCreateModalOpened(false)}
          dropdowns={dropdowns}
          project={null}
          can={can}
          form={form}
          currencySymbol={currencySymbol}
          updateValue={updateValue}
          onRemoveAttachment={removeAttachment}
          getFrameworkDropdownData={getFrameworkDropdownData}
          selectedType={selectedType}
          getIcon={getIcon}
          renderSelectOptionWithIcon={renderSelectOptionWithIcon}
          suggestion={suggestion}
          existingProjectNames={existingProjectNames}
        />
      )}
      {editModalOpened && selectedProject && (
        <EditProject
          opened={editModalOpened}
          onClose={closeEditModal}
          project={selectedProject}
          dropdowns={dropdowns}
          currencySymbol={currencySymbol}
          renderSelectOptionWithIcon={renderSelectOptionWithIcon}
          suggestion={suggestion}
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
          </Card>
        )
      ) : (
        <Center mih={400}>
          <EmptyWithIcon
            title={<Text c='white'>No projects found</Text>}
            description={<Text c='white'>or you do not have access to any of them</Text>}
            icon={IconSearch}
          />
        </Center>
      )}
    </>
  );
};

ProjectsIndex.layout = page => <Layout title='Projects'>{page}</Layout>;

export default ProjectsIndex;

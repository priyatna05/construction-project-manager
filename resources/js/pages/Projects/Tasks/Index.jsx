import { EmptyResult } from '@/components/EmptyResult';
import useTaskFiltersStore from '@/hooks/store/useTaskFiltersStore';
import useTaskGroupsStore from '@/hooks/store/useTaskGroupsStore';
import useTaskDrawerStore from '@/hooks/store/useTaskDrawerStore';
import useTasksStore from '@/hooks/store/useTasksStore';
import usePreferences from '@/hooks/usePreferences';
import useWebSockets from '@/hooks/useWebSockets';
import Layout from '@/layouts/MainLayout';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { usePage, Link } from '@inertiajs/react';
import { Breadcrumbs, Grid, Text } from '@mantine/core';
import { useEffect, useState } from 'react';
import { CreateTaskDrawer } from './Drawers/CreateTaskDrawer';
import { EditTaskDrawer } from './Drawers/EditTaskDrawer';
import ArchivedItems from './Index/Archive/ArchivedItems';
import Filters from './Index/Filters';
import FiltersDrawer from './Index/FiltersDrawer';
import Header from './Index/Header';
import TaskGroup from './Index/TaskGroup';
import classes from './css/Index.module.css';
import EditProject from '../Edit';
import { renderSelectOptionWithIcon } from '@/components/helperLabel';

const TasksIndex = () => {
  const page = usePage();
  const { project, taskGroups, groupedTasks, openedTask, dropdowns, currency } = page.props;
  const allTasks = Object.values(groupedTasks).flat();
  const { edit, openEditTask } = useTaskDrawerStore();
  const { groups, setGroups, reorderGroup } = useTaskGroupsStore();
  const { tasks, setTasks, reorderTask, moveTask } = useTasksStore();
  const { filters, syncFromUrl } = useTaskFiltersStore();
  const { initProjectWebSocket } = useWebSockets();
  const { tasksView } = usePreferences();
  const canReorderTasks = can('reorder task');
  const canReorderGroups = can('reorder task group');

  const [initialTaskOpened, setInitialTaskOpened] = useState(false);
  const [editProjectModalOpened, setEditProjectModalOpened] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const selectedGroupIds = new Set((filters.groups || []).map(Number));
  const hasGroupFilter = selectedGroupIds.size > 0;
  const hasOtherFilters =
    (filters.assignees || []).length > 0 ||
    (filters.labels || []).length > 0 ||
    !!(filters.due_date?.not_set || filters.due_date?.overdue) ||
    !!filters.status;
  const filteredGroups = groups.filter(group => {
    const key = String(group.id);
    const groupTasks = tasks[group.id] || tasks[key] || [];
    const inGroupSelection = !hasGroupFilter || selectedGroupIds.has(Number(group.id));

    if (!inGroupSelection) return false;
    if (hasOtherFilters && !hasGroupFilter) {
      return groupTasks.length > 0;
    }
    return true;
  });

  const openEditProjectModal = proj => {
    setSelectedProject(proj || project);
    setEditProjectModalOpened(true);
  };

  const closeEditProjectModal = () => {
    setSelectedProject(null);
    setEditProjectModalOpened(false);
  };

  useEffect(() => {
    setGroups(taskGroups);
    setTasks(groupedTasks);

    if (openedTask && !initialTaskOpened) {
      setTimeout(() => openEditTask(openedTask), 50);
      setInitialTaskOpened(true);
    }
  }, [project.id, openedTask?.id, taskGroups, groupedTasks]);

  useEffect(() => {
    syncFromUrl();
  }, [page.url]);

  useEffect(() => {
    return initProjectWebSocket(project);
  }, [project.id]);

  const onDragEnd = ({ source, destination }) => {
    if (!destination) {
      return;
    }
    const isTaskDrag =
      source.droppableId.includes('tasks') && destination.droppableId.includes('tasks');
    if (isTaskDrag) {
      if (!canReorderTasks) {
        return;
      }
      if (source.droppableId === destination.droppableId) {
        reorderTask(source, destination);
      } else {
        moveTask(source, destination);
      }
    } else {
      if (!canReorderGroups) {
        return;
      }
      reorderGroup(source.index, destination.index);
    }
  };

  return (
    <>
      <Breadcrumbs
        fz='sm'
        mb='xl'
        separator={<Text c='dimmed'>/</Text>}
      >
        <Link
          href={route('projects.index')}
          style={{ textDecoration: 'none' }}
        >
        <Text c='dimmed'>Projects</Text>
        </Link>
        <Text
          c='white'
          fw={500}
        >
          Tasks
        </Text>
      </Breadcrumbs>
      <Header onEditProject={openEditProjectModal} />
      <CreateTaskDrawer />
      {edit.opened && <EditTaskDrawer key={edit.task.id} />}
      {editProjectModalOpened && selectedProject && (
        <EditProject
          opened={editProjectModalOpened}
          onClose={closeEditProjectModal}
          project={selectedProject}
          dropdowns={dropdowns}
          currencySymbol={currency?.symbol || 'Rp'}
          renderSelectOptionWithIcon={renderSelectOptionWithIcon}
          suggestion=''
        />
      )}

      <Grid
        columns={12}
        gutter={100}
        mt='xl'
        className={`${tasksView}-view`}
      >
        {!route().params.archived ? (
          <Grid.Col span={tasksView === 'list' ? 9 : 12}>
            {groups.length > 0 ? (
              filteredGroups.length > 0 ? (
                <>
                  <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable
                      droppableId='groups'
                      direction={tasksView === 'list' ? 'vertical' : 'horizontal'}
                      type='group'
                    >
                      {provided => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                        >
                          <div className={classes.viewport}>
                            {filteredGroups.map((group, index) => {
                              const key = String(group.id);
                              const groupTasks = tasks[group.id] || tasks[key] || [];
                              return (
                                <TaskGroup
                                  key={group.id}
                                  index={index}
                                  group={group}
                                  tasks={groupTasks}
                                  allTasks={allTasks}
                                />
                              );
                            })}
                            {provided.placeholder}
                          </div>
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                </>
              ) : (
                <EmptyResult
                  title='No tasks match current filters'
                  description='Try clearing or adjusting your filters to see tasks here.'
                />
              )
            ) : (
              <EmptyResult
                title='This project has no tasks yet'
                description='Click on "Add group" or "task" to create the first one.'
              />
            )}
          </Grid.Col>
        ) : (
          <Grid.Col span={tasksView === 'list' ? 9 : 12}>
            <ArchivedItems
              groups={groups}
              tasks={tasks}
            />
          </Grid.Col>
        )}
        {tasksView === 'list' ? (
          <Grid.Col span={3}>
            <Filters />
          </Grid.Col>
        ) : (
          <FiltersDrawer />
        )}
      </Grid>
    </>
  );
};

TasksIndex.layout = page => {
  const title = page.props.project?.name || 'Default Title';
  return <Layout title={title}>{page}</Layout>;
};

export default TasksIndex;

import { EmptyResult } from '@/components/EmptyResult';
import useTaskFiltersStore from '@/hooks/store/useTaskFiltersStore';
import useTaskGroupsStore from '@/hooks/store/useTaskGroupsStore';
import useTaskDrawerStore from '@/hooks/store/useTaskDrawerStore';
import useTasksStore from '@/hooks/store/useTasksStore';
import usePreferences from '@/hooks/usePreferences';
import useWebSockets from '@/hooks/useWebSockets';
import Layout from '@/layouts/MainLayout';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { usePage } from '@inertiajs/react';
import { Grid } from '@mantine/core';
import { useEffect, useState } from 'react';
import { CreateTaskDrawer } from './Drawers/CreateTaskDrawer';
import { EditTaskDrawer } from './Drawers/EditTaskDrawer';
import ArchivedItems from './Index/Archive/ArchivedItems';
import Filters from './Index/Filters';
import FiltersDrawer from './Index/FiltersDrawer';
import Header from './Index/Header';
import TaskGroup from './Index/TaskGroup';
import classes from './css/Index.module.css';

const TasksIndex = () => {
  const { project, taskGroups, groupedTasks, openedTask } = usePage().props;
  const allTasks = Object.values(groupedTasks).flat();
  const { edit, openEditTask } = useTaskDrawerStore();
  const { groups, setGroups, reorderGroup } = useTaskGroupsStore();
  const { tasks, setTasks, reorderTask, moveTask } = useTasksStore();
  const { hasUrlParams } = useTaskFiltersStore();
  const { initProjectWebSocket } = useWebSockets();
  const { tasksView } = usePreferences();

  const [initialTaskOpened, setInitialTaskOpened] = useState(false);
  const usingFilters = hasUrlParams();

  useEffect(() => {
    setGroups(taskGroups);
    setTasks(groupedTasks);

    if (openedTask && !initialTaskOpened) {
      setTimeout(() => openEditTask(openedTask), 50);
      setInitialTaskOpened(true);
    }
  }, [project.id, openedTask?.id, taskGroups, groupedTasks]);

  useEffect(() => {
    return initProjectWebSocket(project);
  }, [project.id]);

  const onDragEnd = ({ source, destination }) => {
    if (!destination) {
      return;
    }
    if (source.droppableId.includes('tasks') && destination.droppableId.includes('tasks')) {
      if (source.droppableId === destination.droppableId) {
        reorderTask(source, destination);
      } else {
        moveTask(source, destination);
      }
    } else {
      reorderGroup(source.index, destination.index);
    }
  };

  return (
    <>
      <Header />
      <CreateTaskDrawer />
      {edit.opened && <EditTaskDrawer key={edit.task.id} />}
      <Grid
        columns={12}
        gutter={50}
        mt='xl'
        className={`${tasksView}-view`}
      >
        {!route().params.archived ? (
          <Grid.Col span={tasksView === 'list' ? 9 : 12}>
            {groups.length > 0 ? (
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
                          {groups
                            .filter(
                              group =>
                                !usingFilters || (usingFilters && tasks[group.id]?.length > 0)
                            )
                            .map((group, index) => (
                              <TaskGroup
                                key={group.id}
                                index={index}
                                group={group}
                                tasks={tasks[group.id] || []}
                                allTasks={allTasks}
                              />
                            ))}
                          {provided.placeholder}
                        </div>
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </>
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

import { useState, useEffect } from 'react';
import Layout from '@/layouts/MainLayout';
import { Tabs, rem } from '@mantine/core';
import { IconCalendarEvent, IconFileAnalytics } from '@tabler/icons-react';
import classes from './css/Index.module.css';
import AnalyticsDashboard from './AnalyticsDashboard';
import CalendarIndex from './Dist/Events/Calendar';
import useWebSockets from '@/hooks/useWebSockets';
import { usePage } from '@inertiajs/react';

const Dashboard = ({
  projects: initialProjects,
  // criticalPathTasks: initialCriticalPathTasks,
  // teamMembers,
  calendarEvents,
  recentComments,
  recentlyAssignedTasks,
  overdueTasks
}) => {
  const { auth } = usePage().props;
  const iconStyle = { width: rem(16), height: rem(16) };
  const isClient = auth?.user?.roles?.includes('client');
  const canShowEvents = !isClient || auth?.user?.has_projects;

  const [projects, setProjects] = useState(initialProjects);
  // eslint-disable-next-line no-unused-vars
  // const [criticalPathTasks, setCriticalPathTasks] = useState(initialCriticalPathTasks);
  // TODO: Tambahkan state lain jika perlu diperbarui secara real-time (e.g., comments, tasks)

  const { initProjectWebSocket } = useWebSockets();

  useEffect(() => {
    const leaves = initialProjects.map(project => initProjectWebSocket(project.id, (updatedRecord) => {
        setProjects(currentProjects =>
            currentProjects.map(p => p.id === updatedRecord.id ? { ...p, ...updatedRecord.data } : p)
        );
    }));

    return () => {
      leaves.forEach(leave => leave && leave());
    };
  }, [initialProjects, initProjectWebSocket]);

  return (
    <Tabs
      defaultValue='analytics'
      variant='outline'
      classNames={{
        root: classes.tabs,
        tabs: classes.tabsContainer,
        tab: classes.tab,
        panel: classes.panel,
      }}
    >
      <Tabs.List>
        <Tabs.Tab value='analytics' leftSection={<IconFileAnalytics style={iconStyle} />}>
          Analytics & Performance
        </Tabs.Tab>

        {canShowEvents && (
          <Tabs.Tab
            value='events'
            leftSection={<IconCalendarEvent style={iconStyle} />}
          >
            Calendar & Events
          </Tabs.Tab>
        )}

      </Tabs.List>

      <Tabs.Panel value='analytics'>
        <AnalyticsDashboard
          projects={projects}
          // criticalPathTasks={criticalPathTasks}
          // teamMembers={teamMembers}
          recentComments={recentComments}
          recentlyAssignedTasks={recentlyAssignedTasks}
          overdueTasks={overdueTasks}
        />
      </Tabs.Panel>

      {canShowEvents && (
        <Tabs.Panel value='events'>
          <CalendarIndex calendarEvents={calendarEvents} />
        </Tabs.Panel>
      )}

    </Tabs>
  );
};

Dashboard.layout = page => <Layout title='Dashboard'>{page}</Layout>;

export default Dashboard;

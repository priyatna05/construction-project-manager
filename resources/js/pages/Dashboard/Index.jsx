import { useState, useEffect } from 'react';
import Layout from '@/layouts/MainLayout';
import { Tabs, rem, Box, Text, Title } from '@mantine/core';
import { IconFileAnalytics, IconCalendarEvent, IconNotebook } from '@tabler/icons-react';
import classes from './css/Index.module.css';
import AnalyticsDashboard from './AnalyticsDashboard';
import CalendarIndex from './Cards/Calendar';
import useWebSockets from '@/hooks/useWebSockets';

const NotesPanelPlaceholder = () => (
  <Box p='xl'>
    <Title order={3}>Workspace Catatan</Title>
    <Text c='dimmed' mt='sm'>
      Area ini dapat diintegrasikan dengan editor Tiptap untuk membuat catatan proyek, risalah
      rapat, atau daftar tugas pribadi yang terhubung dengan entitas proyek.
    </Text>
  </Box>
);

// Mendapatkan semua props dari server-side (Inertia)
const Dashboard = ({
  projects: initialProjects,
  criticalPathTasks: initialCriticalPathTasks,
  teamMembers,
  calendarEvents,
  recentComments,
  recentlyAssignedTasks,
  overdueTasks
}) => {
  const iconStyle = { width: rem(16), height: rem(16) };

  // State untuk data yang akan diperbarui secara real-time
  const [projects, setProjects] = useState(initialProjects);
  // eslint-disable-next-line no-unused-vars
  const [criticalPathTasks, setCriticalPathTasks] = useState(initialCriticalPathTasks);
  // TODO: Tambahkan state lain jika perlu diperbarui secara real-time (e.g., comments, tasks)

  const { initProjectWebSocket } = useWebSockets();

  useEffect(() => {
    // Inisialisasi WebSocket untuk setiap proyek
    const leaves = initialProjects.map(project => initProjectWebSocket(project.id, (updatedRecord) => {
        // Logika untuk memperbarui state ketika data baru diterima dari WebSocket
        // Contoh: Memperbarui state 'projects'
        setProjects(currentProjects =>
            currentProjects.map(p => p.id === updatedRecord.id ? { ...p, ...updatedRecord.data } : p)
        );
        // TODO: Tambahkan logika untuk memperbarui state lain sesuai event
    }));

    return () => {
      leaves.forEach(leave => leave && leave());
    };
  }, [initialProjects, initProjectWebSocket]);

  return (
    <Tabs
      defaultValue='analytics'
      classNames={{
        root: classes.tabs,
        list: classes.tabsList,
        tab: classes.tab,
        panel: classes.panel,
      }}
    >
      <Tabs.List>
        <Tabs.Tab value='analytics' leftSection={<IconFileAnalytics style={iconStyle} />}>
          Analytics & Performance
        </Tabs.Tab>
        <Tabs.Tab value='events' leftSection={<IconCalendarEvent style={iconStyle} />}>
          Calendar & Events
        </Tabs.Tab>
        <Tabs.Tab value='notes' leftSection={<IconNotebook style={iconStyle} />}>
          Notes
        </Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value='analytics'>
        <AnalyticsDashboard
          projects={projects}
          criticalPathTasks={criticalPathTasks}
          teamMembers={teamMembers}
          recentComments={recentComments}
          recentlyAssignedTasks={recentlyAssignedTasks}
          overdueTasks={overdueTasks} // <-- Teruskan prop ini
        />
      </Tabs.Panel>

      <Tabs.Panel value='events'>
        <CalendarIndex calendarEvents={calendarEvents} />
      </Tabs.Panel>

      <Tabs.Panel value='notes'>
        <NotesPanelPlaceholder />
      </Tabs.Panel>
    </Tabs>
  );
};

Dashboard.layout = page => <Layout title='Dashboard'>{page}</Layout>;

export default Dashboard;

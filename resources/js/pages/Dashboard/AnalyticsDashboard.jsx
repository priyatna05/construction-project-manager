import { useEffect, useState } from 'react';
import { Grid, Title, LoadingOverlay, Box, Center, Text, Group, Paper, Button } from '@mantine/core';
import { Carousel } from '@mantine/carousel';
import '@mantine/carousel/styles.css';
import { IconFile3d, IconFolderOff, IconMail } from '@tabler/icons-react';
import { usePage } from '@inertiajs/react';
import ProjectPerformanceChartCard from './Dist/ProjectPerformanceCard';
import useAuthorization from '@/hooks/useAuthorization';
import ContactDialog from '@/pages/Auth/ContactDialog';

import OverallStats from './Dist/OverallStats';
import RecentComments from './Dist/RecentComments';
import RecentlyAssignedTasks from './Dist/RecentlyAssignedTasks';
import OverdueTasks from './Dist/OverdueTasks';
import OverViewProjects from './Dist/ProjectView/OverViewProjects';

export default function AnalyticsDashboard({
  projects,
  recentComments,
  recentlyAssignedTasks,
  overdueTasks,
}) {
  const { isAdmin, isManager, isTeamMember} = useAuthorization();
  const { auth } = usePage().props;
  const canViewProjects = isAdmin() || isManager();
  const canView = isAdmin() || isManager() || isTeamMember();
  const safeProjects = Array.isArray(projects) ? projects : [];
  const initialEmail = auth?.user?.email || '';
  const [contactOpened, setContactOpened] = useState(false);
  const contactRequestOptions = [
    { value: 'project', label: 'Project Request' },
    { value: 'consultation', label: 'Consultation' },
  ];

  const [stats, setStats] = useState({
    totalProjects: 0,
    completedProjects: 0,
    totalBudget: 0,
    totalEAC: 0,
    budgetVariance: 0,
    avgCpiActive: null,
    avgSpiActive: null,
    overdueTasksCount: 0,
    completionRate: null,
    completedTasks: 0,
    totalTasks: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (safeProjects.length > 0) {
      const totalProjects = safeProjects.length;
      const completedProjects = safeProjects.filter(project => project.is_completed).length;
      const activeProjects = safeProjects.filter(project => !project.is_completed);

      const totalBudget = safeProjects.reduce(
        (sum, p) => sum + (parseFloat(p.budget_project_estimate) || 0),
        0
      );
      const totalEAC = safeProjects.reduce((sum, p) => sum + (parseFloat(p.eac) || 0), 0);
      const budgetVariance = totalEAC - totalBudget;
      const cpiValues = activeProjects
        .map(project => Number(project.cpi))
        .filter(value => Number.isFinite(value));
      const spiValues = activeProjects
        .map(project => Number(project.spi))
        .filter(value => Number.isFinite(value));
      const avgCpiActive = cpiValues.length
        ? cpiValues.reduce((sum, value) => sum + value, 0) / cpiValues.length
        : null;
      const avgSpiActive = spiValues.length
        ? spiValues.reduce((sum, value) => sum + value, 0) / spiValues.length
        : null;
      const totalTasks = safeProjects.reduce(
        (sum, project) => sum + (Number(project.all_tasks_count) || 0),
        0
      );
      const completedTasks = safeProjects.reduce(
        (sum, project) => sum + (Number(project.completed_tasks_count) || 0),
        0
      );
      const completionRate = totalTasks > 0 ? completedTasks / totalTasks : null;
      const overdueTasksCount = Array.isArray(overdueTasks) ? overdueTasks.length : 0;

      setStats({
        totalProjects,
        completedProjects,
        totalBudget,
        totalEAC,
        budgetVariance,
        avgCpiActive,
        avgSpiActive,
        overdueTasksCount,
        completionRate,
        completedTasks,
        totalTasks,
      });
      setIsLoading(false);
    } else {
      const overdueTasksCount = Array.isArray(overdueTasks) ? overdueTasks.length : 0;

      setStats({
        totalProjects: 0,
        completedProjects: 0,
        totalBudget: 0,
        totalEAC: 0,
        budgetVariance: 0,
        avgCpiActive: null,
        avgSpiActive: null,
        overdueTasksCount,
        completionRate: null,
        completedTasks: 0,
        totalTasks: 0,
      });
      setIsLoading(false);
    }
  }, [safeProjects, overdueTasks]);

  const handleManage = id => {
    console.log('Kelola Proyek:', id);
  };

  return (
    <Box
      pos='relative'
      p='md'
    >
      <LoadingOverlay
        visible={isLoading}
        zIndex={100}
        overlayProps={{ radius: 'sm', blur: 2 }}
      />
      <Grid gutter='xl'>
        {canViewProjects && (
          <Grid.Col span={12}>
          <OverallStats stats={stats} />
        </Grid.Col>
        )}
        {canViewProjects && (
          <Grid.Col
          span={12}
          >
          <OverViewProjects projects={safeProjects} />
        </Grid.Col>
        )}

        <Grid.Col
          span={12}
        >
          <Paper
            radius='lg'
            withBorder
          >
            <Box
              p='lg'
              style={{ borderBottom: '1px solid var(--mantine-color-dark-4)' }}
            >
              <Group justify='space-between'>
                <Group gap='sm'>
                  <Box
                    w={4}
                    h={30}
                    bg='blue.5'
                    style={{ borderRadius: 'var(--mantine-radius-xl)' }}
                  />
                  <IconFile3d size={32} />
                  <Title
                    order={2}
                  >
                    Project
                  </Title>
                </Group>
              </Group>
            </Box>

            {safeProjects.length === 0 ? (
              <Center h={240}>
                <Box ta='center' maw={420} mx='auto'>
                  <IconFolderOff
                    size={48}
                  />
                  <Text
                    mt='md'
                    fw={600}
                  >
                   No projects have been assigned yet
                  </Text>
                  <Text
                    mt='xs'
                    size='sm'
                    c='dimmed'
                  >
                    You currently have no projects assigned. Please contact your administrator or manager for assistance.
                  </Text>
                  <Group
                    justify='center'
                    mt='md'
                  >
                    <Button
                      variant='light'
                      leftSection={<IconMail size={16} />}
                      onClick={() => setContactOpened(true)}
                    >
                     Contact admin/manager
                    </Button>
                  </Group>
                </Box>
              </Center>
            ) : (
              <Box p='lg' mt='md' ml='md'>
                <Carousel
                  slideSize={{ base: '100%', sm: '50%', md: '33.333%' }}
                  slideGap='md'
                  withIndicators
                  loop
                  align='start'
                >
                  {safeProjects.map(project => (
                    <Carousel.Slide key={project.id}>
                      <ProjectPerformanceChartCard
                        project={project}
                        onManage={handleManage}
                      />
                    </Carousel.Slide>
                  ))}
                </Carousel>
              </Box>
            )}
          </Paper>
        </Grid.Col>

        {canView && (
          <>
            <Grid.Col span={{ base: 12, lg: 4 }}>
              <OverdueTasks tasks={overdueTasks} />
            </Grid.Col>
            <Grid.Col span={{ base: 12, lg: 4 }}>
              <RecentlyAssignedTasks tasks={recentlyAssignedTasks} />
            </Grid.Col>
            <Grid.Col span={{ base: 12, lg: 4 }}>
              <RecentComments comments={recentComments} />
            </Grid.Col>
          </>
        )}
      </Grid>
      <ContactDialog
        opened={contactOpened}
        resetAndClose={() => setContactOpened(false)}
        initialEmail={initialEmail}
        requestTypeOptions={contactRequestOptions}
      />
    </Box>
  );
}

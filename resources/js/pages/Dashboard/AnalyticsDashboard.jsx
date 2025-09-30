import { useState, useEffect } from 'react';
import { Grid, Title, LoadingOverlay, Box, Divider } from '@mantine/core';
import { Carousel } from '@mantine/carousel'; // <-- Impor Carousel
import '@mantine/carousel/styles.css';
import ProjectPerformanceChartCard from './Cards/ProjectPerformanceCard';

import OverallStats from './Cards/OverallStats';
import CriticalPathTasks from './Cards/CriticalPathTasks';
import ResourceWorkloadChart from './Cards/ResourceWorkloadChart';
import RecentComments from './Cards/RecentComments';
import RecentlyAssignedTasks from './Cards/RecentlyAssignedTasks';
import OverdueTasks from './Cards/OverdueTasks';

// Komponen helper untuk judul seksi yang konsisten
const SectionTitle = ({ children }) => (
  <Title order={3} mb="md" c='white'>{children}</Title>
);

export default function AnalyticsDashboard({ projects, criticalPathTasks, teamMembers, recentComments, recentlyAssignedTasks, overdueTasks }) {
  const [stats, setStats] = useState({ totalBudget: 0, totalEAC: 0, atRiskProjects: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (projects && projects.length > 0) {
      const totalBudget = projects.reduce((sum, p) => sum + (p.budget_project || 0), 0);
      const totalEAC = projects.reduce((sum, p) => sum + (p.eac || 0), 0);
      const atRiskProjects = projects.filter(p => p.cpi < 0.9 || p.spi < 0.9).length;

      setStats({ totalBudget, totalEAC, atRiskProjects });
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [projects]);

  const handleView = (id) => {
    console.log('Lihat Detail:', id);
  };

  const handleManage = (id) => {
    console.log('Kelola Proyek:', id);
  };

  const handleExport = (id) => {
    console.log('Ekspor:', id);
  };

  return (
    <Box pos='relative' p="md">
      <LoadingOverlay visible={isLoading} zIndex={100} overlayProps={{ radius: 'sm', blur: 2 }} />

      <Grid gutter="xl">
        <Grid.Col span={12}>
          <OverallStats stats={stats} projectCount={projects.length} />
        </Grid.Col>

       <Grid.Col span={12} mb="xl">
  <SectionTitle>Project Performance Overview</SectionTitle>
  <Divider mb="lg" />
   <Carousel
      slideSize={{ base: '100%', sm: '50%', md: '33.333%' }}
      slideGap="md"
      withIndicators
      loop
      align="start"
    >
      {projects.map((project) => (
        <Carousel.Slide key={project.id}>
          <ProjectPerformanceChartCard
            project={project}
            onView={handleView}
            onManage={handleManage}
            onExport={handleExport}
          />
        </Carousel.Slide>
      ))}
    </Carousel>
</Grid.Col>

        {/* AKHIR BAGIAN CAROUSEL */}

        {/* Layout untuk daftar tugas */}
        <Grid.Col span={{ base: 12, lg: 4 }}>
            <OverdueTasks tasks={overdueTasks} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 4 }}>
            <CriticalPathTasks tasks={criticalPathTasks} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 4 }}>
           <RecentlyAssignedTasks tasks={recentlyAssignedTasks} />
        </Grid.Col>

        {/* Layout untuk Chart dan Komentar */}
        <Grid.Col span={{ base: 12, lg: 7 }}>
            <SectionTitle>Resource & Workload Analysis</SectionTitle>
            <ResourceWorkloadChart data={teamMembers} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 5 }}>
            <SectionTitle>Recent Activity</SectionTitle>
            <RecentComments comments={recentComments} />
        </Grid.Col>
      </Grid>
    </Box>
  );
}

import { Card, Text, Group, SimpleGrid, ThemeIcon, Stack } from '@mantine/core';
import {
  IconBuildingWarehouse,
  IconChartPie,
  IconCircleCheck,
  IconClockExclamation,
  IconFolder,
  IconGauge,
  IconScale,
} from '@tabler/icons-react';
import { formatCurrency } from '@/utils/currency';

const StatCard = ({ title, value, icon, color, description }) => (
  <Card withBorder p="md" radius="md">
    <Group>
      <ThemeIcon color={color} variant="light" size={42} radius="md">
        {icon}
      </ThemeIcon>
      <Stack gap={0}>
        <Text c="dimmed" tt="uppercase" fw={700} fz="xs">
          {title}
        </Text>
        <Text fw={700} fz="xl">
          {value}
        </Text>
        {description && <Text fz="xs" c="dimmed">{description}</Text>}
      </Stack>
    </Group>
  </Card>
);

export default function OverallStats({ stats }) {
  const isOverBudget = stats.budgetVariance > 0;
  const budgetVarianceLabel =
    stats.budgetVariance > 0 ? 'Over budget' : stats.budgetVariance < 0 ? 'Under budget' : 'On budget';
  const completionRateLabel =
    stats.completionRate != null ? `${(stats.completionRate * 100).toFixed(1)}%` : '-';

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
      <StatCard
        title="Total Projects"
        value={stats.totalProjects}
        icon={<IconFolder size={24} />}
        color="blue"
      />
      <StatCard
        title="Completed Projects"
        value={stats.completedProjects}
        icon={<IconCircleCheck size={24} />}
        color="teal"
      />
      <StatCard
        title="Total Portfolio Budget"
        value={formatCurrency(stats.totalBudget)}
        icon={<IconScale size={24} />}
        color="gray"
      />
      <StatCard
        title="Projected Total Cost"
        value={formatCurrency(stats.totalEAC)}
        icon={<IconBuildingWarehouse size={24} />}
        color={isOverBudget ? 'red' : 'teal'}
      />
      <StatCard
        title="Budget Variance"
        value={formatCurrency(stats.budgetVariance)}
        icon={<IconScale size={24} />}
        color={isOverBudget ? 'red' : 'teal'}
        description={budgetVarianceLabel}
      />
      <StatCard
        title="Avg CPI (Active)"
        value={stats.avgCpiActive != null ? stats.avgCpiActive.toFixed(2) : '-'}
        icon={<IconGauge size={24} />}
        color="indigo"
        description={`Avg SPI: ${stats.avgSpiActive != null ? stats.avgSpiActive.toFixed(2) : '-'}`}
      />
      <StatCard
        title="Overdue Tasks"
        value={stats.overdueTasksCount}
        icon={<IconClockExclamation size={24} />}
        color={stats.overdueTasksCount > 0 ? 'orange' : 'teal'}
      />
      <StatCard
        title="Completion Rate"
        value={completionRateLabel}
        icon={<IconChartPie size={24} />}
        color="blue"
        description={`Tasks completed: ${stats.completedTasks}/${stats.totalTasks}`}
      />
    </SimpleGrid>
  );
}

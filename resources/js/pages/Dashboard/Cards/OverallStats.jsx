import { Card, Text, Group, SimpleGrid, ThemeIcon, Stack } from '@mantine/core';
import { IconBuildingWarehouse, IconScale, IconAlertTriangle, IconActivity } from '@tabler/icons-react';

const formatCurrency = value =>
  'Rp ' + new Intl.NumberFormat('id-ID', { maximumFractionDigits: 1 }).format(value / 1_000_000) + ' Jt';

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

export default function OverallStats({ stats, projectCount }) {
  const isOverBudget = stats.totalEAC > stats.totalBudget;

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
      <StatCard
        title="Active Projects"
        value={projectCount}
        icon={<IconActivity size={24} />}
        color="blue"
      />
      <StatCard
        title="Total Portfolio Budget"
        value={formatCurrency(stats.totalBudget)}
        icon={<IconScale size={24} />}
        color="gray"
      />
      <StatCard
        title="Projected Total Cost (EAC)"
        value={formatCurrency(stats.totalEAC)}
        icon={<IconBuildingWarehouse size={24} />}
        color={isOverBudget ? 'red' : 'teal'}
        description={isOverBudget ? "Potensi melebihi budget" : "Sesuai ekspektasi"}
      />
      <StatCard
        title="At-Risk Projects"
        value={`${stats.atRiskProjects} project(s)`}
        icon={<IconAlertTriangle size={24} />}
        color={stats.atRiskProjects > 0 ? 'orange' : 'teal'}
        description="CPI or SPI < 0.9"
      />
    </SimpleGrid>
  );
}

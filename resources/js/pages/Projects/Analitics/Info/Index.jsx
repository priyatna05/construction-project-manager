import { Badge, Box, Collapse, Divider, Group, Paper, SimpleGrid, Text, ThemeIcon, Title } from "@mantine/core";
import {
  IconChartBar,
  IconChevronDown,
  IconInfoCircle,
  IconGitBranch,
  IconTrendingUp,
} from "@tabler/icons-react";
import { useState } from "react";

import CoreIndikator from "./CoreIndikator";
import CostVarianceInfo from "./CostVarianceInfo";
import ScheduleVarianceInfo from "./ScheduleVarianceInfo";
import CostPerformanceIndexInfo from "./CostPerformanceIndexInfo";
import SchedulePerformanceIndexInfo from "./SchedulePerformanceIndexInfo";
import EstimateAtCompletionInfo from "./EstimateAtCompletionInfo";
import TimeEstimateAtCompletionInfo from "./TimeEstimateAtCompletionInfo";
import VarianceAtCompletionTable from "./VarianceAtCompletionTable";
import TaskDependencyTypesTable from "./TaskDependencyTypesTable";

function SectionCard({ id, opened, onToggle, color, Icon, title, subtitles, badge, children }) {
  return (
    <Paper withBorder radius="md" p="md" mb="md">
      {/* Header card */}
      <Group
        justify="space-between"
        align="center"
        onClick={() => onToggle(id)}
        style={{ cursor: "pointer" }}
      >
        <Group gap="sm" align="center">
          <ThemeIcon color={color} size="lg" radius="md" variant="light">
            <Icon size={20} />
          </ThemeIcon>
           <div>
          <Title order={3} c={`${color}.7`}>
            {title}
          </Title>
          {opened && <Text size="sm" c="dimmed">{subtitles}</Text>}
           </div>
        </Group>
          <Group gap="sm" align="center" style={{ pointerEvents: "none" }}>
           {opened && badge}
          <Box
            style={{
              transform: opened ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 150ms ease",
            }}
          >
            <IconChevronDown size={30} />
          </Box>
        </Group>
      </Group>

      {/* Content collapse */}
      <Collapse in={opened}>
        <Box mt="md">{children}</Box>
      </Collapse>
    </Paper>
  );
}

export default function Index() {
  const sections = [
    {
      key: "core",
      color: "green",
      Icon: IconTrendingUp,
      title: "Core EVM Indicators",
      subtitles: "Foundation of Earned Value Management Analysis",
      badge: (
      <Badge color="blue" variant="light" size="lg">
        BAC = Total Planned Budget
      </Badge>
    ),
      children: <CoreIndikator />,
    },
    {
      key: "variance",
      color: "orange",
      Icon: IconInfoCircle,
      title: "Variance Analysis",
      subtitles: "Cost and Schedule Variance Insights",
      badge: (
        <>
      <Badge color="green" variant="light" size="lg">
        CV = EV − AC
      </Badge>
      <Badge color="orange" variant="light" size="lg">
        SV = EV − PV
      </Badge>
        </>
    ),
      children: (
        <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
          <CostVarianceInfo />
          <ScheduleVarianceInfo />
        </SimpleGrid>
      ),
    },
    {
      key: "indices",
      color: "violet",
      Icon: IconChartBar,
      title: "Performance Indices",
      subtitles: "Measuring Cost and Schedule Efficiency",
      badge: (
        <>
      <Badge color="green" variant="light" size="lg">
        CPI = EV / AC
      </Badge>
      <Badge color="orange" variant="light" size="lg">
        SPI = EV / PV
      </Badge>
        </>
    ),
      children: (
        <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
          <CostPerformanceIndexInfo />
          <SchedulePerformanceIndexInfo />
        </SimpleGrid>
      ),
    },
    {
      key: "estimates",
      color: "cyan",
      Icon: IconTrendingUp,
      title: "Completion Estimates",
      subtitles: "Forecasting Project Completion Costs and Timelines",
      badge: (
        <>
      <Badge color="green" variant="light" size="lg">
        EAC = BAC / CPI
      </Badge>
      <Badge color="orange" variant="light" size="lg">
        TEAC = Original Duration / SPI
      </Badge>
        </>
    ),
      children: (
        <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
          <EstimateAtCompletionInfo />
          <TimeEstimateAtCompletionInfo />
        </SimpleGrid>
      ),
    },
    {
      key: "vac",
      color: "grape",
      Icon: IconChartBar,
      title: "Final Variance Analysis",
      subtitles: "Variance at Completion (VAC) Overview",
      badge: (
      <Badge color="grape" variant="light" size="lg">
        VAC = BAC − EAC
      </Badge>
    ),
      children: <VarianceAtCompletionTable />,
    },
    {
      key: "deps",
      color: "indigo",
      Icon: IconGitBranch,
      title: "Task Dependencies",
      subtitles: "Understanding Task Dependency Types",
      badge: (
      <Badge color="indigo" variant="light" size="lg">
        Task Dependency Types
      </Badge>
    ),
      children: <TaskDependencyTypesTable />,
    },
  ];

  // accordion: hanya satu terbuka
  const [openedKey, setOpenedKey] = useState("core");

  const toggle = (key) => {
    setOpenedKey((prev) => (prev === key ? null : key));
  };

  return (
    <Paper p="xl">
      {/* Header */}
      <Box mb="xl">
        <Group gap="sm" mb="md">
          <ThemeIcon color="blue" size="xl" radius="md" variant="light">
            <IconChartBar size={28} />
          </ThemeIcon>
          <div>
            <Title order={2} c="blue.7">
              Project Analytics Information Hub
            </Title>
            <Text size="sm" c="dimmed">
              Comprehensive guide to EVM metrics and project management concepts
            </Text>
          </div>
        </Group>
        <Divider />
      </Box>

      {/* Sections as long cards */}
      {sections.map((s) => (
        <SectionCard
          key={s.key}
          id={s.key}
          opened={openedKey === s.key}
          onToggle={toggle}
          color={s.color}
          Icon={s.Icon}
          title={s.title}
          subtitles={s.subtitles}
          badge={s.badge}
        >
          {s.children}
        </SectionCard>
      ))}
    </Paper>
  );
}

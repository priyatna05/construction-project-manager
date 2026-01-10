import { Table, Text, Group, Badge, Stack, ThemeIcon, Box, Divider, RingProgress } from "@mantine/core";
import { IconTrendingUp, IconTrendingDown, IconMinus, IconCheck } from "@tabler/icons-react";

export default function CostPerformanceIndexInfo() {
  const data = [
    {
      nomor: 1,
      nilai: "> 1",
      keterangan: "Good and efficient cost performance (under budget)",
      badgeColor: "green",
      icon: IconTrendingUp,
      status: "efficient",
      progress: 100,
      ringValue: 85,
    },
    {
      nomor: 2,
      nilai: "= 1",
      keterangan: "Good cost performance (on budget)",
      badgeColor: "yellow",
      icon: IconMinus,
      status: "on-track",
      progress: 75,
      ringValue: 50,
    },
    {
      nomor: 3,
      nilai: "< 1",
      keterangan: "Poor cost performance (over budget)",
      badgeColor: "red",
      icon: IconTrendingDown,
      status: "inefficient",
      progress: 25,
      ringValue: 25,
    },
  ];

  const rows = data.map((row) => (
    <Table.Tr key={row.nomor}>
      <Table.Td ta="center">
        <ThemeIcon color={row.badgeColor} size="md" radius="xl" variant="light">
          <row.icon size={16} />
        </ThemeIcon>
      </Table.Td>
      <Table.Td ta="center">
        <Stack gap={8} align="center">
          <Badge color={row.badgeColor} size="lg" radius="sm" variant="light">
            {row.nilai}
          </Badge>
          <RingProgress
            size={40}
            thickness={4}
            sections={[{ value: row.ringValue, color: row.badgeColor }]}
            style={{ opacity: 0.8 }}
          />
        </Stack>
      </Table.Td>
      <Table.Td>
        <Stack gap={4}>
          <Text size="sm" fw={500}>{row.keterangan}</Text>
          <Text size="xs" c="dimmed">
            {row.status === "efficient" && "💰 Cost savings achieved"}
            {row.status === "on-track" && "⚖️ Budget aligned"}
            {row.status === "inefficient" && "⚠️ Budget overrun risk"}
          </Text>
        </Stack>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Box>

      <Divider mb="lg" />

      <Table
        highlightOnHover
        withColumnBorders
        verticalSpacing="lg"
        horizontalSpacing="lg"
        striped
        withTableBorder
      >
        <Table.Thead>
          <Table.Tr style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
            <Table.Th style={{ textAlign: "center", width: '80px' }}>
              <Text fw={600} size="sm">Status</Text>
            </Table.Th>
            <Table.Th style={{ textAlign: "center", width: '140px' }}>
              <Text fw={600} size="sm">CPI Value</Text>
            </Table.Th>
            <Table.Th>
              <Text fw={600} size="sm">Efficiency Analysis</Text>
            </Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>

      <Box mt="lg" p="md" bg="teal.0" style={{ borderRadius: '8px', border: '1px solid var(--mantine-color-teal-2)' }}>
        <Group gap="xs">
          <IconCheck size={16} color="var(--mantine-color-teal-6)" />
          <Text size="sm" c="teal.7" fw={500}>
            Budget Efficiency Insight:
          </Text>
        </Group>
        <Text size="sm" c="teal.8" mt={4}>
          CPI measures how efficiently the project is using its budget by comparing earned value to actual costs. Values above 1.0 indicate cost efficiency, while values below 1.0 signal potential budget overruns.
        </Text>
      </Box>
    </Box>
  );
}

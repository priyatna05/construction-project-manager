import { Table, Text, Group, Badge, Stack, ThemeIcon, Box, Divider, Progress } from "@mantine/core";
import { IconClock, IconClockPause, IconClockCheck, IconCheck } from "@tabler/icons-react";

export default function ScheduleVarianceInfo() {
  const data = [
    {
      nomor: 1,
      nilai: "+",
      keterangan: "Actual schedule is ahead of the planned schedule (Faster)",
      badgeColor: "green",
      icon: IconClockCheck,
      status: "ahead",
      progress: 100,
    },
    {
      nomor: 2,
      nilai: "-",
      keterangan: "Actual schedule is behind the planned schedule (Delayed)",
      badgeColor: "red",
      icon: IconClockPause,
      status: "delayed",
      progress: 25,
    },
    {
      nomor: 3,
      nilai: "0",
      keterangan: "Actual schedule matches the planned schedule (On Time)",
      badgeColor: "yellow",
      icon: IconClock,
      status: "on-time",
      progress: 75,
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
          <Progress
            value={row.progress}
            color={row.badgeColor}
            size="sm"
            w={60}
            style={{ opacity: 0.7 }}
          />
        </Stack>
      </Table.Td>
      <Table.Td>
        <Stack gap={4}>
          <Text size="sm" fw={500}>{row.keterangan}</Text>
          <Text size="xs" c="dimmed">
            {row.status === "ahead" && "🚀 Project ahead of schedule"}
            {row.status === "delayed" && "⚠️ Schedule slippage detected"}
            {row.status === "on-time" && "✅ On track with timeline"}
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
            <Table.Th style={{ textAlign: "center", width: '120px' }}>
              <Text fw={600} size="sm">SV Value</Text>
            </Table.Th>
            <Table.Th>
              <Text fw={600} size="sm">Schedule Analysis</Text>
            </Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>

      <Box mt="lg" p="md" bg="orange.0" style={{ borderRadius: '8px', border: '1px solid var(--mantine-color-orange-2)' }}>
        <Group gap="xs">
          <IconCheck size={16} color="var(--mantine-color-orange-6)" />
          <Text size="sm" c="orange.7" fw={500}>
            Schedule Performance Insight:
          </Text>
        </Group>
        <Text size="sm" c="orange.8" mt={4}>
          SV measures the difference between earned value and planned value, providing critical insights into schedule adherence and timeline performance throughout project execution.
        </Text>
      </Box>
    </Box>
  );
}

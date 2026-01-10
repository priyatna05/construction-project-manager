import { Table, Text, Group, Badge, Stack, ThemeIcon, Box, Divider, RingProgress } from "@mantine/core";
import { IconClockPause, IconClockCheck, IconCheck } from "@tabler/icons-react";

export default function TimeEstimateAtCompletionInfo() {
  const data = [
    {
      nomor: 1,
      nilai: "TEAC > 1",
      keterangan: "The project is expected to be completed later than scheduled (delayed).",
      badgeColor: "red",
      icon: IconClockPause,
      status: "delayed",
      ringValue: 25,
    },
    {
      nomor: 2,
      nilai: "TEAC < 1",
      keterangan: "The project is expected to be completed earlier than scheduled (ahead of time).",
      badgeColor: "green",
      icon: IconClockCheck,
      status: "ahead",
      ringValue: 85,
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
            {row.status === "delayed" && "⏰ Schedule extension expected"}
            {row.status === "ahead" && "⚡ Early completion possible"}
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
              <Text fw={600} size="sm">TEAC Value</Text>
            </Table.Th>
            <Table.Th>
              <Text fw={600} size="sm">Duration Projection</Text>
            </Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>

      <Box mt="lg" p="md" bg="lime.0" style={{ borderRadius: '8px', border: '1px solid var(--mantine-color-lime-2)' }}>
        <Group gap="xs">
          <IconCheck size={16} color="var(--mantine-color-lime-6)" />
          <Text size="sm" c="lime.7" fw={500}>
            Duration Projection Insight:
          </Text>
        </Group>
        <Text size="sm" c="lime.8" mt={4}>
          TEAC forecasts the total time required to complete the project based on current schedule performance. Values above 1.0 indicate expected delays, while values below 1.0 suggest potential early completion.
        </Text>
      </Box>
    </Box>
  );
}

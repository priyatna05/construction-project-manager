import { Table, Text, Group, Badge, Stack, ThemeIcon, Box, Divider, RingProgress } from "@mantine/core";
import { IconTrendingDown, IconTrendingUp, IconCheck } from "@tabler/icons-react";

export default function EstimateAtCompletionInfo() {
  const data = [
    {
      nomor: 1,
      nilai: "EAC > BAC",
      keterangan: "The project is expected to exceed the planned budget.",
      badgeColor: "red",
      icon: IconTrendingDown,
      status: "over-budget",
      ringValue: 25,
    },
    {
      nomor: 2,
      nilai: "EAC < BAC",
      keterangan: "The project is expected to be completed under the planned budget.",
      badgeColor: "green",
      icon: IconTrendingUp,
      status: "under-budget",
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
            {row.status === "over-budget" && "💸 Potential budget overrun"}
            {row.status === "under-budget" && "💰 Expected cost savings"}
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
              <Text fw={600} size="sm">EAC Value</Text>
            </Table.Th>
            <Table.Th>
              <Text fw={600} size="sm">Budget Projection</Text>
            </Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>

      <Box mt="lg" p="md" bg="cyan.0" style={{ borderRadius: '8px', border: '1px solid var(--mantine-color-cyan-2)' }}>
        <Group gap="xs">
          <IconCheck size={16} color="var(--mantine-color-cyan-6)" />
          <Text size="sm" c="cyan.7" fw={500}>
            Cost Projection Insight:
          </Text>
        </Group>
        <Text size="sm" c="cyan.8" mt={4}>
          EAC provides a forecast of the total project cost at completion, accounting for current performance trends. When EAC exceeds BAC, it signals potential budget overruns requiring immediate corrective action.
        </Text>
      </Box>
      </Box>
  );
}

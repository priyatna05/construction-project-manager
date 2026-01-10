import { Table, Text, Group, Badge, Stack, ThemeIcon, Box, Divider, RingProgress } from "@mantine/core";
import { IconTrendingUp, IconTrendingDown, IconCheck } from "@tabler/icons-react";

export default function VarianceAtCompletionTable() {
  const data = [
    {
      nomor: 1,
      nilai: "VaC > 0",
      keterangan:
        "The project is expected to be completed under the allocated budget.",
      badgeColor: "green",
      icon: IconTrendingUp,
      status: "under-budget",
      ringValue: 85,
    },
    {
      nomor: 2,
      nilai: "VaC < 0",
      keterangan:
        "The project is expected to exceed the allocated budget.",
      badgeColor: "red",
      icon: IconTrendingDown,
      status: "over-budget",
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
            {row.status === "under-budget" && "💰 Positive budget variance"}
            {row.status === "over-budget" && "⚠️ Negative budget variance"}
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
              <Text fw={600} size="sm">VaC Value</Text>
            </Table.Th>
            <Table.Th>
              <Text fw={600} size="sm">Budget Variance Analysis</Text>
            </Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>

      <Box mt="lg" p="md" bg="grape.0" style={{ borderRadius: '8px', border: '1px solid var(--mantine-color-grape-2)' }}>
        <Group gap="xs">
          <IconCheck size={16} color="var(--mantine-color-grape-6)" />
          <Text size="sm" c="grape.7" fw={500}>
            Final Variance Insight:
          </Text>
        </Group>
        <Text size="sm" c="grape.8" mt={4}>
          VaC represents the expected cost variance at project completion. Positive values indicate cost savings, while negative values signal potential budget overruns that may require corrective actions.
        </Text>
      </Box>
   </Box>
  );
}

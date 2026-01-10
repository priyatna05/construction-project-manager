import { Table, Text, Group, Badge, Stack, ThemeIcon, Box, Divider } from "@mantine/core";
import { IconCalculator, IconTrendingUp, IconCalendarTime, IconInfoCircle } from "@tabler/icons-react";

export default function CoreIndikator() {
  const data = [
    {
      nomor: 1,
      indikator: "ACWP",
      alias: "(Actual Cost of Work Performed)",
      formula: "ACWP = Total Project Expenditures up to a Certain Time Duration",
      deskripsi:
        "Represents the total actual expenditures incurred up to a specific point in time.",
      sumber:
        "Derived from financial/accounting reports (including labor, materials, equipment, and other costs).",
      badgeColor: "blue",
      icon: IconCalculator,
    },
    {
      nomor: 2,
      indikator: "BCWP",
      alias: "(Actual Cost of Work Performed)",
      formula: "BCWP = (% Actual Work Completed × BAC)",
      deskripsi:
        "Represents the budgeted cost of the work actually completed during a given time period.",
      sumber:
        "Indicates the earned value of the project — comparing it against ACWP shows cost performance.",
      badgeColor: "teal",
      icon: IconTrendingUp,
    },
    {
      nomor: 3,
      indikator: "BCWS",
      alias: "(Budgeted Cost of Work Scheduled)",
      formula: "BCWS = (% Planned Work × BAC)",
      deskripsi:
        "Represents the budgeted cost of the work scheduled to be completed by a specific date.",
      sumber:
        "Used as a benchmark for schedule performance; shows how much value should have been earned by now.",
      badgeColor: "orange",
      icon: IconCalendarTime,
    },
  ];

  const rows = data.map((row) => (
    <Table.Tr key={row.nomor}>
      <Table.Td ta="center">
        <ThemeIcon color={row.badgeColor} size="md" radius="xl" variant="light">
          <row.icon size={16} />
        </ThemeIcon>
      </Table.Td>
      <Table.Td>
        <Stack gap={4}>
          <Badge color={row.badgeColor} size="sm" radius="sm" variant="light">
            {row.indikator}
          </Badge>
          <Text size="xs" c="dimmed" fw={500}>
            {row.alias}
          </Text>
        </Stack>
      </Table.Td>
      <Table.Td>
        <Text fw={600} size="sm" c={row.badgeColor}>
          {row.formula}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{row.deskripsi}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm" c="dimmed" style={{ fontStyle: 'italic' }}>
          {row.sumber}
        </Text>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <>
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
            <Table.Th style={{ textAlign: "center", width: '60px' }}>
              <Text fw={600} size="sm">Type</Text>
            </Table.Th>
            <Table.Th>
              <Text fw={600} size="sm">Indicator</Text>
            </Table.Th>
            <Table.Th>
              <Text fw={600} size="sm">Formula</Text>
            </Table.Th>
            <Table.Th>
              <Text fw={600} size="sm">Description</Text>
            </Table.Th>
            <Table.Th>
              <Text fw={600} size="sm">Source</Text>
            </Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>

      <Box mt="lg" p="md" bg="blue.0" style={{ borderRadius: '8px', border: '1px solid var(--mantine-color-blue-2)' }}>
        <Group gap="xs">
          <IconInfoCircle size={16} color="var(--mantine-color-blue-6)" />
          <Text size="sm" c="blue.7" fw={500}>
            Key Insight:
          </Text>
        </Group>
        <Text size="sm" c="blue.8" mt={4}>
          These core indicators (AC, EV, PV) form the foundation of EVM analysis, enabling comprehensive evaluation of project cost and schedule performance through systematic measurement and comparison.
        </Text>
      </Box>
    </>
  );
}

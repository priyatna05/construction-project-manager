import { Table, Text, Group, Badge, Stack, ThemeIcon, Box, Divider, Tooltip } from "@mantine/core";
import { IconArrowRight, IconLink, IconGitBranch, IconNetwork, IconList, IconCheck, IconBlocks, IconRelationOneToOne } from "@tabler/icons-react";

export default function TaskDependencyTypesTable() {
  const data = [
    {
      nomor: "1",
      tipe: "SS",
      hubungan: "Start to Start",
      keterangan:
        "Both activities start at the same time — the successor task cannot start before the predecessor starts.",
      highlight: "Tasks begin simultaneously",
      badgeColor: "teal",
      icon: IconArrowRight,
      tooltip: "Parallel start dependency",
    },
    {
      nomor: "2",
      tipe: "SF",
      hubungan: "Start to Finish",
      keterangan:
        "The successor task cannot finish until the predecessor task has started.",
      highlight: "Successor finish depends on predecessor start",
      badgeColor: "orange",
      icon: IconLink,
      tooltip: "Reverse dependency",
    },
    {
      nomor: "3",
      tipe: "FS",
      hubungan: "Finish to Start",
      keterangan:
        "The most common dependency — the successor task cannot start until the predecessor task is completed.",
      highlight: "Standard sequential dependency",
      badgeColor: "blue",
      icon: IconGitBranch,
      tooltip: "Classic dependency",
    },
    {
      nomor: "4",
      tipe: "FF",
      hubungan: "Finish to Finish",
      keterangan:
        "Both activities must finish at the same time — the successor cannot finish before the predecessor finishes.",
      highlight: "Tasks finish simultaneously",
      badgeColor: "violet",
      icon: IconNetwork,
      tooltip: "Parallel finish dependency",
    },
    {
      nomor: "5",
      tipe: "BL",
      hubungan: "Blocking",
      keterangan:
        "The successor task is blocked until the predecessor task is fully resolved or completed.",
      highlight: "Successor cannot proceed until predecessor is done",
      badgeColor: "red",
      icon: IconBlocks,
      tooltip: "Hard dependency",
    },
    {
      nomor: "6",
      tipe: "SQ",
      hubungan: "Sequential",
      keterangan:
        "Tasks must follow a specific sequence — each task starts after the previous task finishes.",
      highlight: "Tasks follow strict sequence",
      badgeColor: "pink",
      icon: IconList,
      tooltip: "Ordered sequence",
    },
    {
      nomor: "7",
      tipe: "RL",
      hubungan: "Related",
      keterangan:
        "Tasks are related but have no strict dependency — start/end dates can be independent.",
      highlight: "Tasks are loosely related",
      badgeColor: "gray",
      icon: IconRelationOneToOne,
      tooltip: "Soft dependency",
    },
  ];

  const rows = data.map((row) => (
    <Table.Tr key={row.nomor}>
      <Table.Td ta="center">
        <Text fw={600} size="sm">{row.nomor}</Text>
      </Table.Td>
      <Table.Td ta="center">
        <Tooltip label={row.tooltip} withArrow>
          <ThemeIcon color={row.badgeColor} size="md" radius="xl" variant="light">
            <row.icon size={16} />
          </ThemeIcon>
        </Tooltip>
      </Table.Td>
      <Table.Td ta="center">
        <Badge color={row.badgeColor} size="lg" radius="sm" variant="light">
          {row.tipe}
        </Badge>
      </Table.Td>
      <Table.Td fw={500} c="dark.7">{row.hubungan}</Table.Td>
      <Table.Td>
        <Stack gap={4}>
          <Text size="sm" fw={500}>{row.keterangan}</Text>
          <Text size="xs" c="dimmed" style={{ fontStyle: 'italic' }}>
            {row.highlight}
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
            <Table.Th style={{ textAlign: "center", width: '60px' }}>
              <Text fw={600} size="sm">No.</Text>
            </Table.Th>
            <Table.Th style={{ textAlign: "center", width: '80px' }}>
              <Text fw={600} size="sm">Icon</Text>
            </Table.Th>
            <Table.Th style={{ textAlign: "center", width: '100px' }}>
              <Text fw={600} size="sm">Code</Text>
            </Table.Th>
            <Table.Th style={{ width: '180px' }}>
              <Text fw={600} size="sm">Relationship Type</Text>
            </Table.Th>
            <Table.Th>
              <Text fw={600} size="sm">Description & Key Points</Text>
            </Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>

      <Box mt="lg" p="md" bg="indigo.0" style={{ borderRadius: '8px', border: '1px solid var(--mantine-color-indigo-2)' }}>
        <Group gap="xs">
          <IconCheck size={16} color="var(--mantine-color-indigo-6)" />
          <Text size="sm" c="indigo.7" fw={500}>
            Dependency Management Insight:
          </Text>
        </Group>
        <Text size="sm" c="indigo.8" mt={4}>
          Understanding task dependencies is crucial for effective project scheduling. These relationship types (SS, SF, FS, FF, BL, SQ, RL) help project managers create realistic timelines and identify critical paths in Gantt charts and project networks.
        </Text>
      </Box>
   </Box>
  );
}

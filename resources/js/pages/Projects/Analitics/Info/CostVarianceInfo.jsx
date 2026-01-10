import { Table, Text, Group, Badge, Stack, ThemeIcon, Box, Divider, Progress } from '@mantine/core';
import { IconTrendingDown, IconTrendingUp, IconMinus, IconCheck } from '@tabler/icons-react';

export default function CostVarianceInfo() {
  const data = [
    {
      nomor: 1,
      nilai: '+',
      keterangan: 'Earned value is greater than actual cost (Cost saving)',
      badgeColor: 'green',
      icon: IconTrendingUp,
      status: 'positive',
      progress: 100,
    },
    {
      nomor: 2,
      nilai: '-',
      keterangan: 'Earned value is less than actual cost (Over budget)',
      badgeColor: 'red',
      icon: IconTrendingDown,
      status: 'negative',
      progress: 25,
    },
    {
      nomor: 3,
      nilai: '0',
      keterangan: 'Earned value equals actual cost (On plan)',
      badgeColor: 'yellow',
      icon: IconMinus,
      status: 'neutral',
      progress: 75,
    },
  ];

  const rows = data.map(row => (
    <Table.Tr key={row.nomor}>
      <Table.Td ta='center'>
        <ThemeIcon
          color={row.badgeColor}
          size='md'
          radius='xl'
          variant='light'
        >
          <row.icon size={16} />
        </ThemeIcon>
      </Table.Td>
      <Table.Td ta='center'>
        <Stack
          gap={8}
          align='center'
        >
          <Badge
            color={row.badgeColor}
            size='lg'
            radius='sm'
            variant='light'
          >
            {row.nilai}
          </Badge>
          <Progress
            value={row.progress}
            color={row.badgeColor}
            size='sm'
            w={60}
            style={{ opacity: 0.7 }}
          />
        </Stack>
      </Table.Td>
      <Table.Td>
        <Stack gap={4}>
          <Text
            size='sm'
            fw={500}
          >
            {row.keterangan}
          </Text>
          <Text
            size='xs'
            c='dimmed'
          >
            {row.status === 'positive' && '✅ Indicates cost efficiency'}
            {row.status === 'negative' && '⚠️ Requires attention'}
            {row.status === 'neutral' && 'ℹ️ Monitor closely'}
          </Text>
        </Stack>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Box>
      <Divider mb='lg' />
      <Table
        highlightOnHover
        withColumnBorders
        verticalSpacing='lg'
        horizontalSpacing='lg'
        striped
        withTableBorder
      >
        <Table.Thead>
          <Table.Tr style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
            <Table.Th style={{ textAlign: 'center', width: '60px' }}>
              <Text
                fw={600}
                size='sm'
              >
                Status
              </Text>
            </Table.Th>
            <Table.Th>
              <Text
                fw={600}
                size='sm'
              >
                CV Value
              </Text>
            </Table.Th>
            <Table.Th>
              <Text
                fw={600}
                size='sm'
              >
                Performance Analysis
              </Text>
            </Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>

      <Box
        mt='lg'
        p='md'
        bg='green.0'
        style={{ borderRadius: '8px', border: '1px solid var(--mantine-color-green-2)' }}
      >
        <Group gap='xs'>
          <IconCheck
            size={16}
            color='var(--mantine-color-green-6)'
          />
          <Text
            size='sm'
            c='green.7'
            fw={500}
          >
            Cost Performance Insight:
          </Text>
        </Group>
        <Text
          size='sm'
          c='green.8'
          mt={4}
        >
          CV measures the difference between earned value and actual costs, providing clear
          indicators of cost efficiency and budget performance throughout the project lifecycle.
        </Text>
      </Box>
    </Box>
  );
}

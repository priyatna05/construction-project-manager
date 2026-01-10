import { Box, Divider, Group, Stack, Text } from '@mantine/core';

export default function TooltipProject({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) return null;

  const point = payload[0].payload || {};
  const hasNumber = value => typeof value === 'number' && !Number.isNaN(value);
  const formatCount = value => (Number.isFinite(value) ? value : 0);

  return (
    <Box
      bg='white'
      p='sm'
      shadow='md'
      radius='md'
      style={{ border: '1px solid var(--mantine-color-gray-3)' }}
    >
      <Text
        fw={700}
        size='sm'
        mb={6}
      >
        {label}
      </Text>

      <Stack gap={4}>
        <Group justify='space-between'>
          <Text size='xs' c='dimmed'>
            Created
          </Text>
          <Text
            size='xs'
            fw={700}
          >
            {formatCount(point.created)}
          </Text>
        </Group>
        <Group justify='space-between'>
          <Text size='xs' c='dimmed'>
            Completed
          </Text>
          <Text
            size='xs'
            fw={700}
          >
            {formatCount(point.completed)}
          </Text>
        </Group>
        <Group justify='space-between'>
          <Text size='xs' c='dimmed'>
            Active
          </Text>
          <Text
            size='xs'
            fw={700}
          >
            {formatCount(point.active)}
          </Text>
        </Group>
        <Group justify='space-between'>
          <Text size='xs' c='dimmed'>
            At-risk
          </Text>
          <Text
            size='xs'
            fw={700}
          >
            {formatCount(point.atRisk)}
          </Text>
        </Group>
        <Group justify='space-between'>
          <Text size='xs' c='dimmed'>
            On-track
          </Text>
          <Text
            size='xs'
            fw={700}
          >
            {formatCount(point.onTrack)}
          </Text>
        </Group>

        <Divider my={4} />

        <Group justify='space-between'>
          <Text size='xs' c='dimmed'>
            Avg CPI
          </Text>
          <Text size='xs' fw={700}>
            {hasNumber(point.avgCpi) ? point.avgCpi.toFixed(2) : '-'}
          </Text>
        </Group>
        <Group justify='space-between'>
          <Text size='xs' c='dimmed'>
            Avg SPI
          </Text>
          <Text size='xs' fw={700}>
            {hasNumber(point.avgSpi) ? point.avgSpi.toFixed(2) : '-'}
          </Text>
        </Group>
      </Stack>
    </Box>
  );
}

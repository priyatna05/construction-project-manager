import { Paper, Text, Group, Stack, Box, useMantineColorScheme } from '@mantine/core';
import { formatCurrency } from '@/utils/currency';

export const CustomTooltip = ({ active, payload }) => {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  if (!active || !payload || !payload.length) return null;

  return (
    <Paper
      p="sm"
      radius="md"
      withBorder
      shadow="lg"
      style={{
        backgroundColor: isDark ? 'rgba(30, 30, 30, 0.9)' : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(6px)',
        borderColor: isDark ? 'var(--mantine-color-dark-4)' : 'var(--mantine-color-gray-2)',
        minWidth: 180,
      }}
    >
      {/* Tanggal */}
      <Text
        size="sm"
        fw={700}
        mb="xs"
        c={isDark ? 'gray.0' : 'dark.7'}
      >
        {payload[0].payload.displayDate}
      </Text>

      {/* Nilai series */}
      <Stack gap={4}>
        {payload.map((entry, index) => (
          <Group key={index} justify="space-between" gap="xs">
            <Group gap={6}>
              <Box
                w={10}
                h={10}
                style={{
                  backgroundColor: entry.color,
                  borderRadius: '50%',
                }}
              />
              <Text size="xs" c={isDark ? 'gray.3' : 'dark.5'}>
                {entry.name}
              </Text>
            </Group>
            <Text
              size="xs"
              fw={600}
              c={isDark ? 'gray.0' : 'dark.7'}
            >
              {formatCurrency(entry.value)}
            </Text>
          </Group>
        ))}
      </Stack>
    </Paper>
  );
};

export default CustomTooltip;

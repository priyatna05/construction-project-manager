import {
  Box,
  Text,
  Group,
  Stack,
  Paper,
  Badge,
  ThemeIcon,
} from '@mantine/core';
import {
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';

export default function MatricCard({ icon: Icon, label, value, subvalue, trend, color }) {
  return (
    <Paper
      p='xl'
      radius='lg'
      withBorder
      style={{
        background: `linear-gradient(135deg, var(--mantine-color-${color}-6) 0%, var(--mantine-color-${color}-8) 100%)`,
        border: 'none',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decoration */}
      <Box
        style={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 150,
          height: 150,
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
        }}
      />
      <Box
        style={{
          position: 'absolute',
          bottom: -40,
          left: -40,
          width: 100,
          height: 100,
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '50%',
        }}
      />

      <Box style={{ position: 'relative', zIndex: 1 }}>
        <Group
          justify='space-between'
          mb='md'
        >
          <ThemeIcon
            size='xl'
            radius='md'
            variant='white'
            color={color}
          >
            <Icon size={24} />
          </ThemeIcon>
          {trend !== undefined && (
            <Badge
              size='lg'
              variant='light'
              color={trend > 0 ? 'teal' : trend < 0 ? 'red' : 'gray'}
              leftSection={
                trend > 0 ? (
                  <TrendingUp size={14} />
                ) : trend < 0 ? (
                  <TrendingDown size={14} />
                ) : (
                  <Minus size={14} />
                )
              }
            >
              {Math.abs(trend * 100).toFixed(1)}%
            </Badge>
          )}
        </Group>

        <Stack gap='xs'>
          <Text
            size='sm'
            fw={500}
            c='white'
            opacity={0.8}
            tt='uppercase'
          >
            {label}
          </Text>
          <Text
            size='xl'
            fw={700}
            c='white'
          >
            {value}
          </Text>
          {subvalue && (
            <Text
              size='xs'
              c='white'
              opacity={0.7}
            >
              {subvalue}
            </Text>
          )}
        </Stack>
      </Box>
    </Paper>
  );
}


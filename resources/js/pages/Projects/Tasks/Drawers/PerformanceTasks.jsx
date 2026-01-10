import { Paper, Text, Group, Stack, Title, Grid, Box, Divider } from '@mantine/core';
import { useEffect, useRef, useState } from 'react';
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
  AreaChart,
} from 'recharts';

export default function PerformanceTasks({ task }) {
  const chartContainerRef = useRef(null);
  const [hasChartSize, setHasChartSize] = useState(false);

  useEffect(() => {
    const node = chartContainerRef.current;
    if (!node) {
      return undefined;
    }

    const updateSize = () => {
      const { width, height } = node.getBoundingClientRect();
      setHasChartSize(width > 0 && height > 0);
    };

    updateSize();

    let observer;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => updateSize());
      observer.observe(node);
    } else {
      window.addEventListener('resize', updateSize);
    }

    return () => {
      if (observer) {
        observer.disconnect();
      } else {
        window.removeEventListener('resize', updateSize);
      }
    };
  }, []);
  const chartData = [
    { day: 'Start', progress: 0, date: task?.start_date },
    {
      day: 'Now',
      progress: task?.progress_task ?? 0,
      date: new Date().toISOString().split('T')[0],
    },
    { day: 'Target', progress: 100, date: task?.end_date },
  ];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value || 0);
  };

  return (
    <Box mx='auto' mt='xl' pb='xl'>
        {/* Header */}
        <Box>
          <Group justify='space-between' mb='xs'>
            <Title order={5}>Task Performance</Title>
          </Group>
          <Text size='sm' c='dimmed'>
            Track progress and performance metrics for Task #{task?.number} - {task?.name}
          </Text>
          <Divider mb='md' mt='sm'/>
        </Box>

        {/* Chart Section */}
        <Paper shadow='xs' p='xl' radius='md' mb='xl' withBorder>
          <Title order={6} mb='md'>Progress Timeline</Title>
          <div
            ref={chartContainerRef}
            style={{ width: '100%', height: 300, minWidth: 0, minHeight: 200 }}
          >
            {hasChartSize ? (
              <ResponsiveContainer width='100%' height='100%' minWidth={0} minHeight={200}>
                <AreaChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 30 }}
                >
                  <defs>
                    <linearGradient id='colorProgress' x1='0' y1='0' x2='0' y2='1'>
                      <stop offset='5%' stopColor='#3b82f6' stopOpacity={0.3} />
                      <stop offset='95%' stopColor='#3b82f6' stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
                  <XAxis
                    dataKey='day'
                    tickFormatter={(value, index) => {
                      const date = chartData[index]?.date;
                      const formattedDate = date ? new Date(date).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'short'
                      }) : '';
                      return `${value}\n${formattedDate}`;
                    }}
                    interval={0}
                    tick={{ fontSize: 12 }}
                    height={60}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip
                    zIndex={2200}
                    formatter={(value) => [`${value}%`, 'Progress']}
                    labelFormatter={(label, payload) => {
                      if (payload && payload[0]) {
                        const date = payload[0].payload.date;
                        return `${label} - ${new Date(date).toLocaleDateString('id-ID')}`;
                      }
                      return label;
                    }}
                  />
                  <Area
                    type='monotone'
                    dataKey='progress'
                    stroke='#3b82f6'
                    strokeWidth={3}
                    fill='url(#colorProgress)'
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : null}
          </div>
        </Paper>

        {/* Metrics Cards */}
        <Grid gutter='md'>
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Paper shadow='xs' p='md' radius='md' withBorder>
              <Stack gap='xs'>
                <Text size='xs' c='dimmed' tt='uppercase' fw={600}>
                  Current Progress
                </Text>
                <Text size='xl' fw={700} c='blue'>
                  {task?.progress_task || 0}%
                </Text>
                <Text size='xs' c='dimmed'>
                  of total task completion
                </Text>
              </Stack>
            </Paper>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Paper shadow='xs' p='md' radius='md' withBorder>
              <Stack gap='xs'>
                <Text size='xs' c='dimmed' tt='uppercase' fw={600}>
                  Task Weight
                </Text>
                <Text size='xl' fw={700} c='violet'>
                  {task?.weight_task || 'N/A'}
                  {task?.weight_task && '%'}
                </Text>
                <Text size='xs' c='dimmed'>
                  importance in project
                </Text>
              </Stack>
            </Paper>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Paper shadow='xs' p='md' radius='md' withBorder>
              <Stack gap='xs'>
                <Text size='xs' c='dimmed' tt='uppercase' fw={600}>
                  Actual Cost
                </Text>
                <Text size='xl' fw={700} c='teal'>
                  {task?.budget_task_actual ? formatCurrency(task.budget_task_actual) : 'N/A'}
                </Text>
                <Text size='xs' c='dimmed'>
                  total expenses
                </Text>
              </Stack>
            </Paper>
          </Grid.Col>
        </Grid>

        {/* Additional Info */}
        <Paper shadow='xs' p='md' radius='md' mt='xl' withBorder>
          <Title order={6} mb='md'>Timeline Details</Title>
          <Grid gutter='md'>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <Text size='xs' c='dimmed' mb={4}>Start Date</Text>
              <Text size='sm' fw={500}>
                {task?.start_date
                  ? new Date(task.start_date).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })
                  : 'Not set'}
              </Text>
            </Grid.Col>
            {/* jika tidak sesuai berikan tampilan red */}
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <Text size='xs' c='dimmed' mb={4}>Current Date</Text>
              <Text size='sm' fw={500}>
                {new Date().toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </Text>
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 4 }}>
              <Text size='xs' c='dimmed' mb={4}>Target Date</Text>
              <Text size='sm' fw={500}>
                {task?.end_date
                  ? new Date(task.end_date).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })
                  : 'Not set'}
              </Text>
            </Grid.Col>
          </Grid>
        </Paper>
    </Box>
  );
}

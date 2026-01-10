import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Text,
  Group,
  Stack,
  Paper,
  Progress,
  ActionIcon,
  SegmentedControl,
  ThemeIcon,
  Grid,
  Container,
  Title,
  RingProgress,
  Center,
} from '@mantine/core';
import {
  ChartNoAxesCombined,
  Maximize2,
  Activity,
  DollarSign,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react';
import ChartComponent from './ChartComponent';
import { money, formatCompact } from '@/utils/currency';
import FullSizeChart from './FullSizeChart';
import { useDisclosure } from '@mantine/hooks';
import MatricCard from './MatricCard';

// Calculate metrics
function calculateMetrics(data) {
  if (data.length === 0)
    return { CPI: 0, SPI: 0, CV: 0, SV: 0, EAC: 0, VAC: 0, EV: 0, PV: 0, AC: 0, BAC: 0 };

  const latest = data[data.length - 1];
  const BAC = latest.BAC || 0;
  const CPI = latest.AC === 0 ? 0 : latest.EV / latest.AC;
  const SPI = latest.PV === 0 ? 0 : latest.EV / latest.PV;
  const CV = latest.EV - latest.AC;
  const SV = latest.EV - latest.PV;
  const EAC = CPI === 0 ? 0 : latest.AC + (BAC - latest.EV) / CPI;
  const VAC = BAC - EAC;

  return { CPI, SPI, CV, SV, EAC, VAC, ...latest };
}

export default function EvmChart({ projectId }) {
  const [timePeriod, setTimePeriod] = useState('month');
  const [opened, { open, close }] = useDisclosure(false);
  const [chartData, setChartData] = useState([]);

  // Fetch data EVM secara real-time
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/projects/${projectId}/evm-records?period=${timePeriod}`);
        setChartData(response.data);
      } catch (error) {
        console.error('Error fetching EVM data:', error);
      }
    };

    if (projectId) {
      fetchData();
    }

    // Polling setiap 30 detik untuk update real-time
    const interval = setInterval(fetchData, 30000);

    return () => clearInterval(interval);
  }, [projectId, timePeriod]);

  const handleTimePeriodChange = value => {
    setTimePeriod(value);
  };

  // Hitung metrics dari data real-time
  const metrics = calculateMetrics(chartData);
  const progressPercent = metrics.BAC > 0 ? (metrics.EV / metrics.BAC) * 100 : 0;

  return (
    <Box
      style={{
        minHeight: '100vh',
        background:
          'linear-gradient(135deg, var(--mantine-color-white-9) 0%, var(--mantine-color-white-7) 100%)',
        padding: 'var(--mantine-spacing-xl)',
      }}
    >
      <Container size='xl'>
        {/* Header */}
        <Group
          justify='space-between'
          mb='xl'
        >
          <Box mb='sm'>
            <Box
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <ChartNoAxesCombined
                size={38}
                color='var(--mantine-color-green-6)'
              />
              <Title
                order={2}
                c='black'
                mb={0}
              >
                EVM Performance
              </Title>
            </Box>

            <Text
              size='lg'
              c='dimmed'
            >
              Real-time project performance tracking and analysis
            </Text>
          </Box>
        </Group>

        {/* Progress Bar */}
        <Paper
          p='md'
          radius='lg'
          withBorder
          mb='xl'
          bg='white.8'
        >
          <Group
            justify='space-between'
            mb='xs'
          >
            <Text
              size='sm'
              fw={500}
              c='black'
            >
              Overall Progress
            </Text>
            <Text
              size='lg'
              fw={700}
              c='black'
            >
              {progressPercent}%
            </Text>
          </Group>
          <Progress
            value={progressPercent}
            size='lg'
            radius='xl'
            animated
            striped
            color='blue'
          />
        </Paper>

        {/* Key Metrics */}
        <Grid
          grow
          mb='xl'
          gutter='lg'
        >
          <Grid.Col span='auto'>
            <MatricCard
              icon={DollarSign}
              label='Budget At Completion'
              value={money(Math.abs(metrics.BAC))}
              color='green'
              subvalue={'Total Cost of Work Without Tax'}
            />
          </Grid.Col>
          <Grid.Col span='auto'>
            <MatricCard
              icon={Activity}
              label='Cost Performance'
              value={metrics.CPI}
              subvalue={metrics.CPI >= 1 ? 'Under Budget' : 'Over Budget'}
              trend={metrics.CPI - 1}
              color={metrics.CPI >= 1 ? 'green' : 'red'}
            />
          </Grid.Col>
          <Grid.Col span='auto'>
            <MatricCard
              icon={Clock}
              label='Schedule Performance'
              value={metrics.SPI}
              subvalue={metrics.SPI >= 1 ? 'Ahead of Schedule' : 'Behind Schedule'}
              trend={metrics.SPI - 1}
              color={metrics.SPI >= 1 ? 'blue' : 'orange'}
            />
          </Grid.Col>
          <Grid.Col span='auto'>
            <MatricCard
              icon={DollarSign}
              label='Cost Variance'
              value={formatCompact(Math.abs(metrics.CV))}
              subvalue={metrics.CV >= 0 ? 'Cost Savings' : 'Cost Overrun'}
              color={metrics.CV >= 0 ? 'teal' : 'pink'}
            />
          </Grid.Col>
          <Grid.Col span='auto'>
            <MatricCard
              icon={Calendar}
              label='Schedule Variance'
              value={money(Math.abs(metrics.SV))}
              subvalue={metrics.SV >= 0 ? 'Time Savings' : 'Time Overrun'}
              color={metrics.SV >= 0 ? 'indigo' : 'yellow'}
            />
          </Grid.Col>
        </Grid>

        {/* Chart Section */}
        <Paper
          radius='lg'
          withBorder
          mb='xl'
          bg='white'
        >
          {/* Chart Header */}
          <Box
            p='lg'
            style={{ borderBottom: '1px solid var(--mantine-color-dark-4)' }}
          >
            <Group justify='space-between'>
              <Group gap='sm'>
                <Box
                  w={4}
                  h={30}
                  bg='blue.5'
                  style={{ borderRadius: 'var(--mantine-radius-xl)' }}
                />
                <Title
                  order={2}
                  c='black'
                >
                  Performance Trends
                </Title>
                <ActionIcon
                  size='xl'
                  radius='md'
                  variant='transparent'
                  gradient={{ from: 'blue', to: 'indigo', deg: 45 }}
                  onClick={open}
                >
                  <Maximize2 size={22} />
                </ActionIcon>
              </Group>

              <SegmentedControl
                value={timePeriod}
                onChange={setTimePeriod}
                data={[
                  { label: 'Daily', value: 'day' },
                  { label: 'Weekly', value: 'week' },
                  { label: 'Monthly', value: 'month' },
                ]}
                color='blue'
                size='md'
                radius='md'
              />
            </Group>
          </Box>

          {/* Chart */}
          <Box p='lg'>
            <ChartComponent
              height={420}
              data={chartData}
            />
          </Box>

          {/* Legend Info */}
          <Box
            p='lg'
            style={{
              borderTop: '1px solid var(--mantine-color-dark-4)',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Group
              justify='center'
              gap='xl'
              wrap='wrap'
            >
              {[
                {
                  color: 'var(--mantine-color-indigo-5)',
                  label: 'PV (Planned Value)',
                  desc: 'Budget that should be spent',
                },
                {
                  color: 'var(--mantine-color-blue-5)',
                  label: 'EV (Earned Value)',
                  desc: 'Assess the work completed',
                },
                {
                  color: 'var(--mantine-color-teal-5)',
                  label: 'AC (Actual Cost)',
                  desc: 'Actual costs incurred',
                },
              ].map(item => (
                <Group
                  key={item.label}
                  align='center'
                  gap='sm'
                  style={{
                    minWidth: 220,
                    justifyContent: 'center',
                  }}
                >
                  <Box
                    w={14}
                    h={14}
                    bg={item.color}
                    style={{ borderRadius: '50%' }}
                  />
                  <Stack
                    gap={0}
                    align='flex-start'
                    style={{ lineHeight: 1.2 }}
                  >
                    <Text
                      size='sm'
                      fw={600}
                      c='black'
                    >
                      {item.label}
                    </Text>
                    <Text
                      size='xs'
                      c='dimmed'
                    >
                      {item.desc}
                    </Text>
                  </Stack>
                </Group>
              ))}
            </Group>
          </Box>
        </Paper>

        {/* Additional Insights */}
        <Grid gutter='lg'>
          {/* Current Values */}
          <Grid.Col span={{ base: 12, lg: 4 }}>
            <Paper
              p='lg'
              radius='lg'
              withBorder
              bg='white'
              h='100%'
            >
              <Group
                mb='lg'
                gap='sm'
              >
                <ThemeIcon
                  size='lg'
                  radius='md'
                  color='blue'
                  variant='light'
                >
                  <DollarSign size={20} />
                </ThemeIcon>
                <Title
                  order={3}
                  c='black'
                >
                  Current Values
                </Title>
              </Group>
              <Stack gap='md'>
                {[
                  { label: 'Planned Value', value: metrics.PV, color: 'indigo' },
                  { label: 'Earned Value', value: metrics.EV, color: 'blue' },
                  { label: 'Actual Cost', value: metrics.AC, color: 'teal' },
                ].map(item => (
                  <Paper
                    key={item.label}
                    p='md'
                    radius='md'
                    bg='white'
                    withBorder
                  >
                    <Group justify='space-between'>
                      <Text
                        size='sm'
                        c='dimmed'
                      >
                        {item.label}
                      </Text>
                      <Text
                        size='md'
                        fw={700}
                        c={`${item.color}.4`}
                      >
                        {money(item.value)}
                      </Text>
                    </Group>
                  </Paper>
                ))}
              </Stack>
            </Paper>
          </Grid.Col>

          {/* Forecast */}
          <Grid.Col span={{ base: 12, lg: 4 }}>
            <Paper
              p='lg'
              radius='lg'
              withBorder
              bg='white'
              h='100%'
            >
              <Group
                mb='lg'
                gap='sm'
              >
                <ThemeIcon
                  size='lg'
                  radius='md'
                  color='violet'
                  variant='light'
                >
                  <Activity size={20} />
                </ThemeIcon>
                <Title
                  order={3}
                  c='black'
                >
                  Project Forecast
                </Title>
              </Group>
              <Stack gap='md'>
                <Paper
                  p='lg'
                  radius='md'
                  bg='white'
                  withBorder
                >
                  <Text
                    size='xs'
                    tt='uppercase'
                    c='dimmed'
                    mb='xs'
                  >
                    Estimate at Completion
                  </Text>
                  <Text
                    size='xl'
                    fw={700}
                    c='black'
                  >
                    {money(metrics.EAC)}
                  </Text>
                </Paper>
                <Paper
                  p='lg'
                  radius='md'
                  bg='white'
                  withBorder
                >
                  <Text
                    size='xs'
                    tt='uppercase'
                    c='dimmed'
                    mb='xs'
                  >
                    Variance at Completion
                  </Text>
                  <Text
                    size='xl'
                    fw={700}
                    c={metrics.VAC >= 0 ? 'green.4' : 'red.4'}
                  >
                    {money(Math.abs(metrics.VAC))}
                  </Text>
                  <Text
                    size='xs'
                    c='dimmed'
                    mt={4}
                  >
                    {metrics.VAC >= 0 ? 'Under Budget' : 'Over Budget'}
                  </Text>
                </Paper>
              </Stack>
            </Paper>
          </Grid.Col>

          {/* Project Health */}
          <Grid.Col span={{ base: 12, lg: 4 }}>
            <Paper
              p='lg'
              radius='lg'
              withBorder
              bg='white'
              h='100%'
            >
              <Group
                mb='lg'
                gap='sm'
              >
                <ThemeIcon
                  size='lg'
                  radius='md'
                  color='yellow'
                  variant='light'
                >
                  <AlertCircle size={20} />
                </ThemeIcon>
                <Title
                  order={3}
                  c='black'
                >
                  Project Health
                </Title>
              </Group>
              <Center style={{ minHeight: 180 }}>
                <Stack
                  align='center'
                  gap='lg'
                >
                  <RingProgress
                    size={140}
                    thickness={12}
                    roundCaps
                    sections={[
                      {
                        value: 100,
                        color:
                          metrics.CPI >= 1 && metrics.SPI >= 1
                            ? 'green'
                            : metrics.CPI >= 0.9 && metrics.SPI >= 0.9
                              ? 'yellow'
                              : 'red',
                      },
                    ]}
                    label={
                      <Center>
                        {metrics.CPI >= 1 && metrics.SPI >= 1 ? (
                          <CheckCircle
                            size={48}
                            color='var(--mantine-color-green-5)'
                          />
                        ) : (
                          <AlertCircle
                            size={48}
                            color={
                              metrics.CPI >= 0.9 && metrics.SPI >= 0.9
                                ? 'var(--mantine-color-yellow-5)'
                                : 'var(--mantine-color-red-5)'
                            }
                          />
                        )}
                      </Center>
                    }
                  />
                  <Text
                    size='xl'
                    fw={700}
                    c={
                      metrics.CPI >= 1 && metrics.SPI >= 1
                        ? 'green.4'
                        : metrics.CPI >= 0.9 && metrics.SPI >= 0.9
                          ? 'yellow.4'
                          : 'red.4'
                    }
                  >
                    {metrics.CPI >= 1 && metrics.SPI >= 1
                      ? 'HEALTHY'
                      : metrics.CPI >= 0.9 && metrics.SPI >= 0.9
                        ? 'ATTENTION'
                        : 'AT RISK'}
                  </Text>
                </Stack>
              </Center>
            </Paper>
          </Grid.Col>
        </Grid>
      </Container>
      <FullSizeChart
        opened={opened}
        onClose={close}
        timePeriod={timePeriod}
        chartData={chartData}
        onTimePeriodChange={handleTimePeriodChange}
      />
    </Box>
  );
}

import { useEffect, useMemo, useState } from 'react';
import {
  ActionIcon,
  Badge,
  Box,
  Divider,
  Group,
  Paper,
  ScrollArea,
  SegmentedControl,
  Table,
  Text,
  Title,
} from '@mantine/core';
import { IconAnalyze, IconExternalLink, IconLock } from '@tabler/icons-react';
import dayjs from '@/utils/dayjsConfig';
import { formatCompact } from '@/utils/currency';
import ChartProject from './ChartProject';
import { Link } from '@inertiajs/react';


const PERIOD_CONFIG = {
  day: { unit: 'day', count: 30 },
  week: { unit: 'week', count: 12 },
  month: { unit: 'month', count: 12 },
  year: { unit: 'year', count: 5 },
};

const formatPeriodLabel = (date, period) => {
  switch (period) {
    case 'day':
      return date.format('DD MMM');
    case 'week': {
      const week = String(date.week()).padStart(2, '0');
      return `W${week} ${date.year()}`;
    }
    case 'month':
      return date.format('MMM YYYY');
    case 'year':
      return date.format('YYYY');
    default:
      return date.format('DD MMM');
  }
};

const formatPeriodKey = (date, period) => {
  switch (period) {
    case 'week':
      return `${date.year()}-W${String(date.week()).padStart(2, '0')}`;
    case 'month':
      return date.format('YYYY-MM');
    case 'year':
      return date.format('YYYY');
    default:
      return date.format('YYYY-MM-DD');
  }
};

const parseDate = value => (value ? dayjs(value) : null);

const parseNumber = value => {
  if (value === null || value === undefined || value === '') return null;
  const numberValue = Number(value);
  return Number.isNaN(numberValue) ? null : numberValue;
};

const isValidNumber = value => typeof value === 'number' && !Number.isNaN(value);

const buildProjectPeriodData = (projects, period) => {
  const config = PERIOD_CONFIG[period] || PERIOD_CONFIG.month;
  const safeProjects = Array.isArray(projects) ? projects : [];
  const now = dayjs();

  const normalizedProjects = safeProjects.map(project => {
    const createdAt = parseDate(project.created_at || project.start_date);
    const startAt = parseDate(project.start_date || project.created_at);
    const completedAt = project.completed_at
      ? parseDate(project.completed_at)
      : project.is_completed && project.end_date
        ? parseDate(project.end_date)
        : null;

    return {
      id: project.id,
      name: project.name || 'Unnamed project',
      isLocked: Boolean(project.is_completed),
      createdAt,
      startAt,
      completedAt,
      cpi: parseNumber(project.cpi),
      spi: parseNumber(project.spi),
      ev: parseNumber(project.ev),
      pv: parseNumber(project.pv),
      ac: parseNumber(project.ac),
    };
  });

  const results = [];

  for (let index = config.count - 1; index >= 0; index -= 1) {
    const cursor = now.subtract(index, config.unit);
    const start = cursor.startOf(config.unit);
    const end = cursor.endOf(config.unit);

    const bucket = {
      key: formatPeriodKey(start, period),
      label: formatPeriodLabel(start, period),
      start,
      end,
      created: 0,
      completed: 0,
      active: 0,
      atRisk: 0,
      onTrack: 0,
      avgCpi: null,
      avgSpi: null,
      projects: [],
    };

    const cpiValues = [];
    const spiValues = [];

    normalizedProjects.forEach(project => {
      const { createdAt, startAt, completedAt, cpi, spi } = project;

      if (
        createdAt &&
        createdAt.isSameOrAfter(start, 'day') &&
        createdAt.isSameOrBefore(end, 'day')
      ) {
        bucket.created += 1;
      }

      if (
        completedAt &&
        completedAt.isSameOrAfter(start, 'day') &&
        completedAt.isSameOrBefore(end, 'day')
      ) {
        bucket.completed += 1;
      }

      const activeAtEnd =
        startAt &&
        startAt.isSameOrBefore(end, 'day') &&
        (!completedAt || completedAt.isAfter(end, 'day'));

      if (activeAtEnd) {
        bucket.active += 1;

        const isAtRisk = (isValidNumber(cpi) && cpi < 1) || (isValidNumber(spi) && spi < 1);
        const isOnTrack = isValidNumber(cpi) && isValidNumber(spi) && cpi >= 1 && spi >= 1;

        if (isAtRisk) bucket.atRisk += 1;
        if (isOnTrack) bucket.onTrack += 1;

        if (isValidNumber(cpi)) cpiValues.push(cpi);
        if (isValidNumber(spi)) spiValues.push(spi);
      }

      const existsDuring =
        startAt &&
        startAt.isSameOrBefore(end, 'day') &&
        (!completedAt || completedAt.isSameOrAfter(start, 'day'));

      if (existsDuring) {
        const completedByEnd = completedAt && completedAt.isSameOrBefore(end, 'day');

        bucket.projects.push({
          id: project.id,
          name: project.name,
          status: completedByEnd ? 'Completed' : 'Active',
          isLocked: project.isLocked,
          cpi,
          spi,
          ev: project.ev,
          pv: project.pv,
          ac: project.ac,
        });
      }
    });

    bucket.avgCpi = cpiValues.length
      ? cpiValues.reduce((sum, value) => sum + value, 0) / cpiValues.length
      : null;
    bucket.avgSpi = spiValues.length
      ? spiValues.reduce((sum, value) => sum + value, 0) / spiValues.length
      : null;

    bucket.projects.sort((a, b) => {
      if (a.status === b.status) return a.name.localeCompare(b.name);
      return a.status === 'Active' ? -1 : 1;
    });

    results.push(bucket);
  }

  return results;
};

const formatRangeLabel = (start, end) =>
  `${start.format('DD MMM YYYY')} - ${end.format('DD MMM YYYY')}`;

export default function OverViewProjects({ projects }) {

  const safeProjects = Array.isArray(projects) ? projects : [];
  const [timePeriod, setTimePeriod] = useState('month');
  const [selectedPeriodKey, setSelectedPeriodKey] = useState(null);

  const chartData = useMemo(
    () => buildProjectPeriodData(safeProjects, timePeriod),
    [safeProjects, timePeriod]
  );

  useEffect(() => {
    if (chartData.length === 0) {
      setSelectedPeriodKey(null);
      return;
    }

    setSelectedPeriodKey(currentKey => {
      if (currentKey && chartData.some(item => item.key === currentKey)) {
        return currentKey;
      }
      return chartData[chartData.length - 1].key;
    });
  }, [chartData]);

  const selectedPeriod =
    chartData.find(item => item.key === selectedPeriodKey) || chartData[chartData.length - 1];

  return (
    <Paper
      radius='lg'
      withBorder
    >
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
            <IconAnalyze size={32} />
            <Title
              order={2}
            >
              Projects Performance Overview
            </Title>
          </Group>

          <SegmentedControl
            value={timePeriod}
            onChange={setTimePeriod}
            data={[
              { label: 'Daily', value: 'day' },
              { label: 'Weekly', value: 'week' },
              { label: 'Monthly', value: 'month' },
              { label: 'Yearly', value: 'year' },
            ]}
            color='blue'
            size='md'
            radius='md'
          />
        </Group>
      </Box>
      <Box p='lg'>
        <ChartProject
          height={450}
          data={chartData}
          selectedKey={selectedPeriodKey}
          onSelectPeriod={period => setSelectedPeriodKey(period?.key || null)}
        />
      </Box>
      <Divider />
      <Box p='lg'>
        {selectedPeriod ? (
          <>
            <Group
              justify='space-between'
              align='center'
              mb='sm'
              wrap='wrap'
            >
              <Title
                order={4}
                c='black'
              >
                Period Detail: {selectedPeriod.label}
              </Title>
              <Text
                size='xs'
                c='dimmed'
              >
                {formatRangeLabel(selectedPeriod.start, selectedPeriod.end)}
              </Text>
            </Group>

            <Group
              gap='xs'
              mb='md'
              wrap='wrap'
            >
              <Badge
                color='blue'
                variant='light'
              >
                Created: {selectedPeriod.created}
              </Badge>
              <Badge
                color='teal'
                variant='light'
              >
                Completed: {selectedPeriod.completed}
              </Badge>
              <Badge
                color='gray'
                variant='light'
              >
                Active: {selectedPeriod.active}
              </Badge>
              <Badge
                color='red'
                variant='light'
              >
                At-risk: {selectedPeriod.atRisk}
              </Badge>
              <Badge
                color='green'
                variant='light'
              >
                On-track: {selectedPeriod.onTrack}
              </Badge>
              <Badge
                color='indigo'
                variant='light'
              >
                Avg CPI:{' '}
                {isValidNumber(selectedPeriod.avgCpi) ? selectedPeriod.avgCpi.toFixed(2) : '-'}
              </Badge>
              <Badge
                color='indigo'
                variant='light'
              >
                Avg SPI:{' '}
                {isValidNumber(selectedPeriod.avgSpi) ? selectedPeriod.avgSpi.toFixed(2) : '-'}
              </Badge>
            </Group>

            {selectedPeriod.projects.length === 0 ? (
              <Text
                size='sm'
                c='dimmed'
              >
                No projects found in this period.
              </Text>
            ) : (
              <ScrollArea type='auto'>
                <Table
                  striped
                  highlightOnHover
                  withTableBorder
                  withColumnBorders
                  verticalSpacing='sm'
                  style={{ minWidth: 900 }}
                >
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Project</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>CPI</Table.Th>
                      <Table.Th>SPI</Table.Th>
                      <Table.Th>EV</Table.Th>
                      <Table.Th>PV</Table.Th>
                      <Table.Th>AC</Table.Th>
                      <Table.Th>Lock</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {selectedPeriod.projects.map(project => (
                      <Table.Tr key={project.id}>
                        <Table.Td>{project.name}</Table.Td>
                        <Table.Td>
                          <Badge
                            color={project.status === 'Completed' ? 'teal' : 'blue'}
                            variant='light'
                          >
                            {project.status}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          {isValidNumber(project.cpi) ? project.cpi.toFixed(2) : '-'}
                        </Table.Td>
                        <Table.Td>
                          {isValidNumber(project.spi) ? project.spi.toFixed(2) : '-'}
                        </Table.Td>
                        <Table.Td>
                          {isValidNumber(project.ev) ? formatCompact(project.ev) : '-'}
                        </Table.Td>
                        <Table.Td>
                          {isValidNumber(project.pv) ? formatCompact(project.pv) : '-'}
                        </Table.Td>
                        <Table.Td>
                          {isValidNumber(project.ac) ? formatCompact(project.ac) : '-'}
                        </Table.Td>
                        <Table.Td>
                          {project.isLocked ? (
                            <Badge
                              color='gray'
                              variant='light'
                            >
                              <Group gap={4}>
                                <IconLock size={12} />
                                <Text size='xs'>Locked</Text>
                              </Group>
                            </Badge>
                          ) : (
                            <Text
                              size='xs'
                              c='dimmed'
                            >
                              -
                            </Text>
                          )}
                        </Table.Td>
                        <Table.Td>
                           <ActionIcon
                        variant='light'
                        color='blue'
                        component={Link}
                        href={route('projects.tasks', project.id)}
                        aria-label={`Open ${project.name}`}
                      >
                        <IconExternalLink size={16} />
                      </ActionIcon>
                      </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </ScrollArea>
            )}
          </>
        ) : (
          <Text
            size='sm'
            c='dimmed'
          >
            No period data available.
          </Text>
        )}
      </Box>
    </Paper>
  );
}

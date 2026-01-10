import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Bar,
  Cell,
  ComposedChart,
  Legend,
  Line,
} from 'recharts';
import { Center, Text } from '@mantine/core';
import TooltipProject from './TooltipProject';

export default function ChartProject({ height, data, onSelectPeriod, selectedKey }) {
  const safeData = Array.isArray(data) ? data : [];
  const getOpacity = entry => (selectedKey && entry.key !== selectedKey ? 0.3 : 1);

  const handleClick = event => {
    const payload = event?.activePayload?.[0]?.payload || event?.payload;
    if (payload && onSelectPeriod) {
      onSelectPeriod(payload);
    }
  };

  if (safeData.length === 0) {
    return (
      <Center h={height}>
        <Text size='sm' c='dimmed'>
          No data available yet.
        </Text>
      </Center>
    );
  }

  return (
    <ResponsiveContainer
      width='100%'
      height={height}
    >
      <ComposedChart
        data={safeData}
        margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
        onClick={handleClick}
      >
        <CartesianGrid
          strokeDasharray='3 3'
          stroke='var(--mantine-color-dark-4)'
          opacity={0.3}
        />
        <XAxis
          dataKey='label'
          tick={{ fontSize: 12, fill: 'var(--mantine-color-dark-2)' }}
          stroke='var(--mantine-color-dark-3)'
          label={{
            position: 'insideBottom',
            offset: -5,
            fill: 'var(--mantine-color-dark-3)',
            fontSize: 12,
          }}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 12, fill: 'var(--mantine-color-dark-2)' }}
          stroke='var(--mantine-color-dark-3)'
          label={{
            value: 'Total project',
            angle: -90,
            position: 'insideLeft',
            fill: 'var(--mantine-color-dark-3)',
            fontSize: 12,
          }}
        />
        <Tooltip content={<TooltipProject />} />
        <Legend verticalAlign='top' />
        <Bar
          dataKey='created'
          name='Created'
          fill='var(--mantine-color-blue-6)'
          radius={[4, 4, 0, 0]}
          barSize={18}
        >
          {safeData.map(entry => (
            <Cell
              key={`created-${entry.key}`}
              fillOpacity={getOpacity(entry)}
            />
          ))}
        </Bar>
        <Bar
          dataKey='completed'
          name='Completed'
          fill='var(--mantine-color-teal-6)'
          radius={[4, 4, 0, 0]}
          barSize={18}
        >
          {safeData.map(entry => (
            <Cell
              key={`completed-${entry.key}`}
              fillOpacity={getOpacity(entry)}
            />
          ))}
        </Bar>
        <Bar
          dataKey='active'
          name='Active'
          fill='var(--mantine-color-gray-7)'
          radius={[4, 4, 0, 0]}
          barSize={18}
        >
          {safeData.map(entry => (
            <Cell
              key={`active-${entry.key}`}
              fillOpacity={getOpacity(entry)}
            />
          ))}
        </Bar>
        <Line
          type='monotone'
          dataKey='atRisk'
          name='At-risk'
          stroke='var(--mantine-color-red-6)'
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        />
        <Line
          type='monotone'
          dataKey='onTrack'
          name='On-track'
          stroke='var(--mantine-color-green-6)'
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

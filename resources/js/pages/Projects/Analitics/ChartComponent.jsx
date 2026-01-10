import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import CustomTooltip from './CustomTooltip';

export default function ChartComponent({ height, data }) {
  return (
    <ResponsiveContainer
      width='100%'
      height={height}
    >
      <AreaChart
        data={data}
        margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
      >
        <defs>
          <linearGradient
            id='colorPV'
            x1='0'
            y1='0'
            x2='0'
            y2='1'
          >
            <stop
              offset='5%'
              stopColor='var(--mantine-color-indigo-5)'
              stopOpacity={0.3}
            />
            <stop
              offset='95%'
              stopColor='var(--mantine-color-indigo-5)'
              stopOpacity={0}
            />
          </linearGradient>
          <linearGradient
            id='colorEV'
            x1='0'
            y1='0'
            x2='0'
            y2='1'
          >
            <stop
              offset='5%'
              stopColor='var(--mantine-color-blue-5)'
              stopOpacity={0.3}
            />
            <stop
              offset='95%'
              stopColor='var(--mantine-color-blue-5)'
              stopOpacity={0}
            />
          </linearGradient>
          <linearGradient
            id='colorAC'
            x1='0'
            y1='0'
            x2='0'
            y2='1'
          >
            <stop
              offset='5%'
              stopColor='var(--mantine-color-teal-5)'
              stopOpacity={0.3}
            />
            <stop
              offset='95%'
              stopColor='var(--mantine-color-teal-5)'
              stopOpacity={0}
            />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray='3 3'
          stroke='var(--mantine-color-dark-4)'
          opacity={0.3}
        />
        <XAxis
          dataKey='displayDate'
          tick={{ fontSize: 12, fill: 'var(--mantine-color-dark-2)' }}
          stroke='var(--mantine-color-dark-3)'
        />
        <YAxis
          tickFormatter={value => {
            if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
            if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
            return value;
          }}
          tick={{ fontSize: 12, fill: 'var(--mantine-color-dark-2)' }}
          stroke='var(--mantine-color-dark-3)'
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type='monotone'
          dataKey='PV'
          stroke='var(--mantine-color-indigo-5)'
          strokeWidth={3}
          fill='url(#colorPV)'
          name='Planned Value'
          dot={{ fill: 'var(--mantine-color-indigo-5)', r: 4, strokeWidth: 2, stroke: '#fff' }}
          activeDot={{ r: 6, strokeWidth: 2 }}
        />
        <Area
          type='monotone'
          dataKey='EV'
          stroke='var(--mantine-color-blue-5)'
          strokeWidth={3}
          fill='url(#colorEV)'
          name='Earned Value'
          dot={{ fill: 'var(--mantine-color-blue-5)', r: 4, strokeWidth: 2, stroke: '#fff' }}
          activeDot={{ r: 6, strokeWidth: 2 }}
        />
        <Area
          type='monotone'
          dataKey='AC'
          stroke='var(--mantine-color-teal-5)'
          strokeWidth={3}
          fill='url(#colorAC)'
          name='Actual Cost'
          dot={{ fill: 'var(--mantine-color-teal-5)', r: 4, strokeWidth: 2, stroke: '#fff' }}
          activeDot={{ r: 6, strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

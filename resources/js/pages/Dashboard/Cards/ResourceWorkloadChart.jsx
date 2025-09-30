import { Card, Title, Text, Box } from '@mantine/core';
import { BarChart } from '@mantine/charts';

export default function ResourceWorkloadChart({ data }) {
  return (
    <Card
      withBorder
      p='lg'
      radius='md'
      style={{ height: '100%' }}
    >
      <Title order={4}>Beban Kerja Tim</Title>
      <Text
        fz='sm'
        c='dimmed'
        mb='md'
      >
        Perbandingan jumlah tugas dengan kapasitas tim.
      </Text>
      <Box h={300}>
        <BarChart
          h='100%'
          data={data}
          dataKey='name'
          type='stacked'
          tooltipAnimationDuration={200}
          series={[
            { name: 'tasks', color: 'blue.6', label: 'Tugas Diberikan' },
            { name: 'capacity', color: 'gray.3', label: 'Kapasitas' },
          ]}
        />
      </Box>
    </Card>
  );
}

import { Box, Group, Modal, SegmentedControl, Stack, Text, Title } from '@mantine/core';
import ChartComponent from './ChartComponent';

export default function FullSizeChart({ opened, onClose, timePeriod, onTimePeriodChange, chartData }) {

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size='100%'
      title='EVM Chart - Full View'
      centered
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
            <Title
              order={2}
              c='black'
            >
              Performance Trends
            </Title>
          </Group>

          <SegmentedControl
            value={timePeriod}
            onChange={onTimePeriodChange}
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
      <ChartComponent height={600} data={chartData}/>

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
              desc: 'Budget yang seharusnya dihabiskan',
            },
            {
              color: 'var(--mantine-color-blue-5)',
              label: 'EV (Earned Value)',
              desc: 'Nilai pekerjaan yang selesai',
            },
            {
              color: 'var(--mantine-color-teal-5)',
              label: 'AC (Actual Cost)',
              desc: 'Biaya aktual yang dikeluarkan',
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
    </Modal>
  );
}

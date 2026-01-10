import { Group, Paper, ThemeIcon, Text, Title } from '@mantine/core';
import { IconCalendarEvent, IconTargetArrow } from '@tabler/icons-react';

export default function StatsSummary({ total, upcoming }) {
  return (
    <Group grow>
      <Paper
        withBorder
        radius="md"
        p="md"
      >
        <Group justify="space-between">
          <div>
            <Text size="xs" fw={600}>
              Total events
            </Text>
            <Title order={2}>{total}</Title>
          </div>
          <ThemeIcon size={50} radius="md" color="grape">
            <IconCalendarEvent size={28} />
          </ThemeIcon>
        </Group>
      </Paper>

      <Paper
        withBorder
        radius="md"
        p="md"
      >
        <Group justify="space-between">
          <div>
            <Text size="xs" fw={600}>
              Upcoming
            </Text>
            <Title order={2}>{upcoming}</Title>
          </div>
          <ThemeIcon size={50} radius="md" color="green">
            <IconTargetArrow size={28} />
          </ThemeIcon>
        </Group>
      </Paper>
    </Group>
  );
}

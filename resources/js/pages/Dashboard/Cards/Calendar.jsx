import { useState } from 'react';
import { Calendar, DatesProvider } from '@mantine/dates';
import { Indicator, Grid, Paper, Title, Text, Stack, Button, Group, Divider, Badge, ThemeIcon, ScrollArea, Center } from '@mantine/core';
import { IconPlus, IconCalendarEvent, IconClipboardCheck, IconTargetArrow } from '@tabler/icons-react';
import dayjs from 'dayjs';

function getEventTypeProps(type) {
  switch (type) {
    case 'meeting':
      return { icon: IconCalendarEvent, color: 'blue', label: 'Meeting' };
    case 'task':
      return { icon: IconClipboardCheck, color: 'green', label: 'Task' };
    case 'goal':
      return { icon: IconTargetArrow, color: 'violet', label: 'Goal' };
    default:
      return { icon: IconCalendarEvent, color: 'gray', label: 'Event' };
  }
}

export default function CalendarIndex({ calendarEvents }) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const eventsForSelectedDate = calendarEvents.filter(event =>
    dayjs(event.date).isSame(selectedDate, 'day')
  );

  const renderCalendarDay = date => {
    const dayHasEvents = calendarEvents.some(event => dayjs(event.date).isSame(date, 'day'));
    return (
      <Indicator size={6} color="blue" offset={-2} disabled={!dayHasEvents}>
        <div>{date.getDate()}</div>
      </Indicator>
    );
  };

  const handleAddEvent = () => {
    // Placeholder for Add Event functionality
    console.log('Add Event button clicked');
  };

  return (
    <DatesProvider settings={{ locale: 'id' }}>
      <Grid gutter="xl">
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Paper withBorder p="md" radius="md">
            <Calendar
              value={selectedDate}
              onChange={setSelectedDate}
              renderDay={renderCalendarDay}
              size="xl"
            />
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Paper withBorder radius="md" p="md" style={{ height: '100%' }}>
            <Group justify="space-between" mb="sm">
              <Title order={4}>{dayjs(selectedDate).format('dddd, D MMMM YYYY')}</Title>
              <Button leftSection={<IconPlus size={16} />} size="xs" variant="light" onClick={handleAddEvent}>
                Add Event
              </Button>
            </Group>
            <Divider my="sm" />
            <ScrollArea h={450}>
              {eventsForSelectedDate.length > 0 ? (
                <Stack gap="md" mt="md">
                  {eventsForSelectedDate.map(event => {
                    const { icon: Icon, color, label } = getEventTypeProps(event.type);
                    return (
                      <Group key={event.id} spacing="xs">
                        <ThemeIcon color={color} variant="light" size="lg" radius="md">
                          <Icon size={18} />
                        </ThemeIcon>
                        <div>
                          <Text fw={500}>{event.title}</Text>
                          <Badge color={color} variant="light" size="xs">
                            {label}
                          </Badge>
                        </div>
                      </Group>
                    );
                  })}
                </Stack>
              ) : (
                <Center h={400}>
                  <Text c="dimmed" ta="center">
                    Tidak ada agenda di tanggal ini.
                  </Text>
                </Center>
              )}
            </ScrollArea>
          </Paper>
        </Grid.Col>
      </Grid>
    </DatesProvider>
  );
}

import { Calendar } from '@mantine/dates';
import { Badge, Group, Paper, Text, Title } from '@mantine/core';
import dayjs from 'dayjs';

export default function AgendaCalendar({ selectedDate, onChange, events }) {
  const renderCalendarDay = date => {
    const eventCount = events.filter(event => dayjs(event.date).isSame(date, 'day')).length;
    const dayHasEvents = eventCount > 0;
    const isToday = dayjs(date).isSame(new Date(), 'day');
    const isSelected = dayjs(date).isSame(selectedDate, 'day');

    return (
      <div
        onClick={() => onChange(date)}
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        <Badge
          color={dayHasEvents ? 'blue' : 'gray'}
          variant={dayHasEvents ? 'light' : 'outline'}
          size='md'
          radius='xl'
          styles={{
            root: {
              minWidth: 38,
              height: 38,
              justifyContent: 'center',
              border: 'none',
              backgroundColor: isSelected ? '#e0e7ff' : undefined,
              color: isToday ? '#1c7ed6' : undefined,
              fontWeight: isToday ? 700 : 600,
              transition: 'all 0.15s ease',
              overflow: 'visible',
              position: 'relative',
              '&:hover': {
                backgroundColor: '#dbeafe',
                color: '#1d4ed8',
                transform: 'translateY(-1px)',
              },
            },
          }}
        >
          {date.getDate()}
          {eventCount > 0 && (
            <Badge
              color='indigo'
              size='xs'
              radius='xl'
              variant='filled'
              style={{
                position: 'absolute',
                top: -6,
                right: -8,
                minWidth: 18,
                height: 18,
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 10,
                lineHeight: 1,
                boxShadow: '0 0 0 2px #fff',
              }}
            >
              {eventCount}
            </Badge>
          )}
        </Badge>
      </div>
    );
  };

  return (
    <>
      <Group
        justify='space-between'
        align='center'
      >
        <div>
          <Title
            order={3}
            fw={700}
          >
            Agenda Calendar
          </Title>
          <Text
            size='sm'
            c='dimmed'
            mt={4}
          >
            Pick a date to review and manage your schedule
          </Text>
        </div>
        <Badge
          variant='gradient'
          gradient={{ from: 'indigo', to: 'cyan' }}
          radius='md'
          size='lg'
          style={{ textTransform: 'capitalize' }}
        >
          {dayjs(selectedDate ?? new Date()).format('dddd, DD MMMM YYYY')}
        </Badge>
      </Group>
      <Paper
        p='md'
        size='auto'
      >
        <Calendar
          value={selectedDate}
          onChange={onChange}
          renderDay={renderCalendarDay}
          size='auto'
          w='100%'
          weekdayFormat='dddd'
          monthsListFormat='MMMM'
          yearsListFormat='YYYY'
          styles={theme => ({
            month: { width: '100%' },
            monthRow: { height: 74, minHeight: 74 },
            monthCell: {
              height: 74,
              minHeight: 74,
              padding: 10,
              transition: 'all 0.2s ease',
            },
            monthsList: {
              width: '100%',
              tableLayout: 'fixed',
              marginTop: 8,
              marginLeft: 50,
            },
            monthsListRow: {
              height: 74,
              minHeight: 74,
              fontSize: 100,
              padding: 50,
              transition: 'all 0.2s ease',
            },
            monthsListCell: {
              height: 74,
              minHeight: 74,
              fontSize: 100,
              padding: 50,
              transition: 'all 0.2s ease',
            },

            yearsList: {
              width: '100%',
              tableLayout: 'fixed',
              marginTop: 8,
              marginLeft: 50,
            },
            yearsListRow: {
              height: 74,
              fontSize: 100,
              fontWeight: 700,
              minHeight: 74,
              paddingLeft: 100,
              transition: 'all 0.2s ease',
            },
            yearsListCell: {
              height: 74,
              fontSize: 100,
              fontWeight: 700,
              minHeight: 74,
              padding: 50,
              transition: 'all 0.2s ease',
            },
            calendarHeader: {
              fontSize: 16,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            },
            calendarHeaderControl: {
              height: 42,
              width: 42,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            },
            calendarHeaderLevel: {
              height: 42,
              minHeight: 42,
              fontSize: 25,
              fontWeight: 700,
              paddingInline: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            },
            pickerControl: {
              height: 46,
              minHeight: 46,
              width: '100%',
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 700,
              border: `1px solid ${theme.colors.indigo[1]}`,
              transition: 'all 0.15s ease',
              '&[data-selected]': {
                backgroundColor: theme.colors.indigo[5],
                borderColor: theme.colors.indigo[6],
              },
              '&:hover': {
                backgroundColor: theme.colors.indigo[0],
              },
            },
            weekday: {
              fontWeight: 600,
              padding: 8,
              paddingLeft: 0,
              color: '#495057',
              fontSize: 16,
              textAlign: 'center',
              textTransform: 'uppercase',
            },
            day: {
              borderRadius: 10,
              fontSize: 16,
              aspectRatio: '1 / 1',
              paddingLeft: 35,
              fontWeight: 700,
              color: '#111827',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              '&:hover': {
                backgroundColor: '#e0e7ff',
                transform: 'scale(1.04)',
              },
            },
          })}
        />
      </Paper>
    </>
  );
}

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DatesProvider } from '@mantine/dates';
import { Grid, Paper, Stack } from '@mantine/core';
import dayjs from 'dayjs';
import axios from 'axios';
import { useFlashStore } from '@/hooks/store/useFlashStore';
import AgendaCalendar from './Partials/AgendaCalendar';
import DayEventsList from './Partials/DayEventsList';
import EventDialog from './Partials/EventDialog';
import StatsSummary from './Partials/StatsSummary';
import { usePage } from '@inertiajs/react';
import { openConfirmModal } from '@/components/ConfirmModal';

const STORAGE_KEY = 'dashboard.calendarEvents';
const baseFormState = {
  title: '',
  type: 'meeting',
  time: '',
  description: '',
  notifyUsers: [],
};

export default function CalendarIndex({ calendarEvents: serverEvents = [] }) {
  const page = usePage();
  const { users = [], clients = [] } = page?.props ?? {};
  const { setFlash } = useFlashStore();

  const peopleLookup = useMemo(() => {
    const normalizeOption = option => ({
      id: String(option.id ?? option.value),
      name: option.name ?? option.label ?? '',
      avatarUrl: option.avatar ?? option.avatarUrl ?? null,
    });

    const fromCollection = collection =>
      Array.isArray(collection)
        ? collection.map(normalizeOption)
        : Object.entries(collection).map(([value, label]) => normalizeOption({ value, label }));

    const merged = [...fromCollection(users), ...fromCollection(clients)];
    return merged.reduce((acc, person) => {
      if (person.id) acc[person.id] = person;
      return acc;
    }, {});
  }, [clients, users]);

  const resolveNotifyUsers = useCallback(
    (list = []) => {
      if (!Array.isArray(list)) return [];
      return list.map(entry => {
        const id = String(entry?.id ?? entry?.value ?? entry);
        const fallback = peopleLookup[id];
        const name = entry?.name ?? entry?.label ?? fallback?.name ?? `User ${id}`;
        const avatarUrl = entry?.avatarUrl ?? entry?.avatar ?? fallback?.avatarUrl ?? null;
        return { id, name, avatarUrl };
      });
    },
    [peopleLookup]
  );

  const toNotifyIds = useCallback(
    (list = []) =>
      Array.isArray(list) ? list.map(item => String(item?.id ?? item?.value ?? item)) : [],
    []
  );

  const hydrateEvents = useCallback(
    (items = []) =>
      items.map(event => ({
        ...event,
        time: event?.time || '',
        description: event?.description || '',
        date: event?.date ? new Date(event.date) : new Date(),
        notifyUsers: resolveNotifyUsers(Array.isArray(event?.notifyUsers) ? event.notifyUsers : []),
      })),
    [resolveNotifyUsers]
  );

  const inertiaEvents = useMemo(
    () => hydrateEvents(page?.props?.calendarEvents ?? serverEvents),
    [hydrateEvents, page?.props?.calendarEvents, serverEvents]
  );
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [modalOpened, setModalOpened] = useState(false);
  const formRef = useRef(null);
  const [saved, setSaved] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState(baseFormState);
  const [processing, setProcessing] = useState(false);
  const [bootstrapped, setBootstrapped] = useState(false);
  const hasHydrated = useRef(false);
  const closeTimerRef = useRef(null);
  const initialDateRef = useRef(selectedDate);

  useEffect(() => {
    if (typeof window === 'undefined' || hasHydrated.current) return;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setCalendarEvents(hydrateEvents(JSON.parse(stored)));
        setBootstrapped(true);
        hasHydrated.current = true;
        return;
      } catch (error) {
        console.warn('Failed to parse stored calendar events', error);
      }
    }
    setCalendarEvents(inertiaEvents.length ? inertiaEvents : hydrateEvents());
    setBootstrapped(true);
    hasHydrated.current = true;
  }, [hydrateEvents, inertiaEvents]);

  useEffect(() => {
    if (typeof window === 'undefined' || !bootstrapped) return;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        calendarEvents.map(event => ({
          ...event,
          date: event.date instanceof Date ? event.date.toISOString() : event.date,
        }))
      )
    );
  }, [calendarEvents, bootstrapped]);
  const initialData = useMemo(() => {
    if (editingEvent) {
      return {
        title: editingEvent.title || '',
        type: editingEvent.type || 'meeting',
        time: editingEvent.time || '',
        description: editingEvent.description || '',
        notifyUsers: toNotifyIds(editingEvent.notifyUsers || []),
      };
    }
    return baseFormState;
  }, [editingEvent, toNotifyIds]);

  const normalizeData = useCallback(
    (data) => ({
      title: data.title || '',
      type: data.type || 'meeting',
      time: data.time || '',
      description: data.description || '',
      notifyUsers: toNotifyIds(data.notifyUsers).sort(),
    }),
    [toNotifyIds]
  );

  const hasChanged = useMemo(() => {
    const currentData = normalizeData(formData);
    const compareData = normalizeData(initialData);
    const dateChanged = initialDateRef.current
      ? !dayjs(selectedDate).isSame(initialDateRef.current, 'day')
      : false;
    return dateChanged || JSON.stringify(currentData) !== JSON.stringify(compareData);
  }, [formData, initialData, normalizeData, selectedDate]);

  const eventsForSelectedDate = useMemo(
    () => calendarEvents.filter((event) => dayjs(event.date).isSame(selectedDate, 'day')),
    [calendarEvents, selectedDate]
  );

  const totalEvents = calendarEvents.length;
  const upcomingEvents = calendarEvents.filter((event) => dayjs(event.date).isAfter(dayjs(), 'day')).length;

  const handleOpenModal = (event = null) => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setSaved(false);
    const dateToUse = event?.date ? new Date(event.date) : selectedDate ?? new Date();
    initialDateRef.current = dateToUse;
    setSelectedDate(dateToUse);
    if (event) {
      setEditingEvent(event);
      setFormData({
        title: event.title,
        type: event.type,
        time: event.time,
        description: event.description,
        notifyUsers: toNotifyIds(event.notifyUsers || []),
      });
    } else {
      setEditingEvent(null);
      setFormData(baseFormState);
    }
    setModalOpened(true);
  };

  const handleCloseModal = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setModalOpened(false);
    setEditingEvent(null);
    setFormData(baseFormState);
    setSaved(false);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) return;
    const notifyUsers = resolveNotifyUsers(formData.notifyUsers);
    const notifyUserIds = toNotifyIds(formData.notifyUsers);

    const payload = {
      title: formData.title,
      type: formData.type,
      date: selectedDate,
      time: formData.time,
      description: formData.description,
      notifyUsers: notifyUserIds,
    };

    setProcessing(true);

    try {
      let sent = 0;
      let failed = 0;

      if (notifyUserIds.length > 0) {
        try {
          const { data } = await axios.post(route('events.notify'), payload);
          sent = data?.sent ?? 0;
          failed = data?.failed ?? 0;
        } catch (error) {
          failed = notifyUserIds.length;
          setFlash({
            type: 'error',
            title: 'Email notification gagal',
            message:
              'Kredensial SMTP belum valid. Event tetap disimpan, tapi email tidak terkirim.',
          });
          console.error('Failed to send event notifications', error);
        }
      }

      if (editingEvent) {
        setCalendarEvents((events) =>
          events.map((event) =>
            event.id === editingEvent.id
              ? { ...event, ...formData, notifyUsers, date: selectedDate }
              : event
          )
        );
      } else {
        const newEvent = {
          id: Date.now(),
          ...formData,
          notifyUsers,
          date: selectedDate,
        };
        setCalendarEvents((events) => [...events, newEvent]);
      }
      setSaved(true);
      if (notifyUserIds.length > 0) {
        const anyFail = failed > 0;
        setFlash({
          type: anyFail ? 'warning' : 'success',
          title: anyFail ? 'Email terkirim sebagian' : 'Email terkirim',
          message: anyFail
            ? `Berhasil kirim ke ${sent}, gagal ${failed}. Cek konfigurasi SMTP.`
            : `Berhasil kirim ke ${sent} penerima.`,
        });
      }
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
      closeTimerRef.current = setTimeout(() => {
        closeTimerRef.current = null;
        handleCloseModal();
      }, 700);
    } catch (error) {
      console.error('Failed to save event', error);
      setFlash({
        type: 'error',
        title: 'Gagal menyimpan event',
        message: 'Terjadi masalah saat menyimpan event. Coba lagi.',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = (eventId) => {
   openConfirmModal({
      type: 'danger',
      title: 'Delete event?',
      content: 'Are you sure you want to delete this event? This action cannot be undone.',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      confirmProps: { color: 'red' },
      onConfirm: () => {
        setCalendarEvents((events) => events.filter((event) => event.id !== eventId));
      },
    });
  };

  return (
    <DatesProvider settings={{ locale: 'en' }}>
      <Stack gap="lg" p="md">
        <StatsSummary total={totalEvents} upcoming={upcomingEvents} />

        <Grid gutter="xl" align="stretch">
          <Grid.Col span={{ base: 12, lg: 8 }}>
            <Paper
              withBorder
              radius="md"
              p="xl"
              style={{
                height: '100%',
                minHeight: 580,
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              <AgendaCalendar selectedDate={selectedDate} onChange={setSelectedDate} events={calendarEvents} />
            </Paper>
          </Grid.Col>

          <Grid.Col span={{ base: 12, lg: 4 }}>
            <DayEventsList
              date={selectedDate}
              events={eventsForSelectedDate}
              onAdd={() => handleOpenModal()}
              onEdit={(event) => handleOpenModal(event)}
              onDelete={handleDelete}
            />
          </Grid.Col>
        </Grid>

        <EventDialog
          opened={modalOpened}
          formRef={formRef}
          processing={processing}
          hasChanged={hasChanged}
          saved={saved}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          formData={formData}
          setFormData={setFormData}
          isEditing={Boolean(editingEvent)}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />
      </Stack>
    </DatesProvider>
  );
}

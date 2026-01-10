import Notification from '@/components/Notification';
import useNotificationsStore from '@/hooks/store/useNotificationsStore';
import ContainerBox from '@/layouts/ContainerBox';
import Layout from '@/layouts/MainLayout';
import { day, diffForHumans } from '@/utils/datetime';
import { redirectToUrl } from '@/utils/route';
import { usePage } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import {
  Center,
  Group,
  Stack,
  Text,
  Title,
  UnstyledButton,
  Badge,
  Paper,
  ActionIcon,
  Menu,
  Indicator,
  Box,
  ThemeIcon,
  Transition,
  rem,
  Button,
  Tooltip,
  Breadcrumbs,
  ScrollArea,
  Dialog,
} from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import {
  IconBell,
  IconBellOff,
  IconCheck,
  IconChecks,
  IconDots,
  IconEye,
  IconFilter,
  IconMailOpened,
  IconTrash,
  IconClock,
  IconCalendar,
} from '@tabler/icons-react';
import { useState } from 'react';
import classes from './css/Index.module.css';
import { useDisclosure } from '@mantine/hooks';

const NotificationsIndex = () => {
  const { groups } = usePage().props;
  const { markAsRead } = useNotificationsStore();
  const [opened, { open, close }] = useDisclosure(false);
  const [loading, setLoading] = useState(false);
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const dates = Object.keys(groups);
  const [filter, setFilter] = useState('all');

  const totalNotifications = dates.reduce((acc, date) => acc + groups[date].length, 0);
  const unreadCount = dates.reduce(
    (acc, date) => acc + groups[date].filter(n => n.read_at === null).length,
    0
  );

  const openNotif = notification => {
    if (notification.read_at === null) markAsRead(notification);
    redirectToUrl(notification.link);
  };

  const getFilteredGroups = () => {
    if (filter === 'all') return groups;

    const filtered = {};
    dates.forEach(date => {
      const filteredNotifications = groups[date].filter(notification => {
        if (filter === 'unread') return notification.read_at === null;
        if (filter === 'read') return notification.read_at !== null;
        return true;
      });
      if (filteredNotifications.length > 0) {
        filtered[date] = filteredNotifications;
      }
    });
    return filtered;
  };

  const filteredGroups = getFilteredGroups();
  const filteredDates = Object.keys(filteredGroups);

  const markAllAsRead = () => {
    dates.forEach(date => {
      groups[date].forEach(notification => {
        if (notification.read_at === null) {
          markAsRead(notification);
        }
      });
    });
  };

  const handleDelete = async (notificationItem) => {
    setLoading(true);
    try {
      await router.delete(route('notifications.destroy', notificationItem.id));
      close();
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Breadcrumbs
        fz={14}
        mb={30}
        separator={<Text c='white'>/</Text>}
      >
        <Text
          c='white'
          fw={500}
        >
          Notifications /
        </Text>
      </Breadcrumbs>
      {/* Header Section */}
      <Paper
        p='xl'
        mb='xl'
        radius='md'
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(66, 153, 225, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)'
            : 'linear-gradient(135deg, rgba(66, 153, 225, 0.05) 0%, rgba(147, 51, 234, 0.05) 100%)',

          border: 'none',
          boxShadow: 'none',
        }}
      >
        <Group
          justify='space-between'
          align='flex-start'
        >
          <Box>
            <Group
              gap='md'
              mb='xs'
            >
              <Tooltip
                label={`Total ${totalNotifications} Notifications`}
                color='blue'
                withArrow
              >
                <Indicator
                  inline
                  label={`${totalNotifications}`}
                  size={22}
                  color='blue'
                >
                  <ThemeIcon
                    size='xl'
                    radius='md'
                    variant='gradient'
                    gradient={{ from: 'green', to: 'violet', deg: 135 }}
                  >
                    <IconBell style={{ width: rem(24), height: rem(24) }} />
                  </ThemeIcon>
                </Indicator>
              </Tooltip>
              <Box>
                <Title
                  order={1}
                  c={isDark ? 'white' : 'white'}
                >
                  Notifications
                </Title>
                <Text
                  size='sm'
                  c='rgba(255, 255, 255, 0.6)'
                  mt={4}
                >
                  Stay updated with your latest activities
                </Text>
              </Box>
            </Group>
            <Group
              gap='xs'
              mt='md'
            >
              {unreadCount > 0 && (
                <Badge
                  variant='gradient'
                  gradient={{ from: 'orange', to: 'red', deg: 90 }}
                  size='lg'
                  leftSection={<IconMailOpened size={14} />}
                >
                  {unreadCount} Unread
                </Badge>
              )}
            </Group>
          </Box>

          {/* Actions */}
          <Group gap='sm'>
            {/* Filter Menu */}
            <Menu
              shadow='md'
              width={200}
            >
              <Menu.Target>
                <Tooltip
                  color='blue'
                  label='Filter notifications'
                  withArrow
                >
                  <ActionIcon
                    variant='gradient'
                    size='lg'
                    color={filter !== 'all' ? 'green' : 'green'}
                  >
                    <IconFilter size={18} />
                  </ActionIcon>
                </Tooltip>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>Filter by status</Menu.Label>
                <Menu.Item
                  leftSection={<IconBell size={16} />}
                  onClick={() => setFilter('all')}
                  color={filter === 'all' ? 'blue' : undefined}
                >
                  All Notifications
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconMailOpened size={16} />}
                  onClick={() => setFilter('unread')}
                  color={filter === 'unread' ? 'orange' : undefined}
                >
                  Unread Only
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconEye size={16} />}
                  onClick={() => setFilter('read')}
                  color={filter === 'read' ? 'gray' : undefined}
                >
                  Read Only
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>

            {/* Mark All as Read */}
            {unreadCount > 0 && (
              <Tooltip
                color='blue'
                label='Mark all as read'
                withArrow
              >
                <ActionIcon
                  variant='gradient'
                  size='lg'
                  onClick={markAllAsRead}
                  color={filter !== 'all' ? 'green' : 'green'}
                >
                  <IconChecks size={16} />
                </ActionIcon>
              </Tooltip>
            )}
          </Group>
        </Group>
      </Paper>

      <ContainerBox
        maw={10000}
        style={{
          border: 'none',
          boxShadow: 'none',
        }}
      >
        <ScrollArea>
          {filteredDates.length ? (
            <Stack gap='xl'>
              {filteredDates.map((date, dateIndex) => (
                <Transition
                  key={date}
                  mounted={true}
                  transition='fade-up'
                  duration={400}
                  timingFunction='ease'
                  delay={dateIndex * 50}
                >
                  {styles => (
                    <Box style={styles}>
                      {/* Date Header */}
                      <Paper
                        p='md'
                        mb='md'
                        radius='md'
                        style={{
                          backgroundColor: isDark
                            ? 'var(--mantine-color-dark-1)'
                            : 'var(--mantine-color-gray-4)',
                          borderLeft: `4px solid ${isDark ? 'var(--mantine-color-blue-5)' : 'var(--mantine-color-blue-6)'}`,
                        }}
                      >
                        <Group
                          justify='space-between'
                          align='center'
                        >
                          <Group gap='xl'>
                            <ThemeIcon
                              size='md'
                              radius='md'
                              variant='light'
                              color='blue'
                            >
                              <Group
                                gap={8}
                                align='center'
                              >
                                <Tooltip
                                  label={`${
                                    filteredGroups[date].length === 1
                                      ? 'notification'
                                      : 'notifications'
                                  }`}
                                  color='green'
                                  withArrow
                                >
                                  <Indicator
                                    inline
                                    label={`${filteredGroups[date].length}`}
                                    size={22}
                                    color='blue'
                                  >
                                    <IconCalendar style={{ width: rem(30), height: rem(30) }} />
                                  </Indicator>
                                </Tooltip>
                              </Group>
                            </ThemeIcon>

                            <Box>
                              <Text
                                fw={800}
                                size='lg'
                                c={isDark ? 'white' : 'dark.7'}
                              >
                                {day(date)}
                              </Text>
                              <Group gap={4}>
                                <IconClock
                                  size={12}
                                  color='var(--mantine-color-dimmed)'
                                />
                                <Text
                                  size='xs'
                                  c='dimmed'
                                >
                                  {diffForHumans(filteredGroups[date][0].created_at)}
                                </Text>
                              </Group>
                            </Box>
                          </Group>
                        </Group>
                      </Paper>

                      {/* Notifications List */}
                      <Stack gap='sm'>
                        {filteredGroups[date].map((item, itemIndex) => (
                          <Transition
                            key={item.id}
                            mounted={true}
                            transition='slide-right'
                            duration={300}
                            timingFunction='ease'
                            delay={itemIndex * 30}
                          >
                            {itemStyles => (
                              <Paper
                                style={{
                                  ...itemStyles,
                                  position: 'relative',
                                  overflow: 'hidden',
                                  transition: 'all 0.3s ease',
                                }}
                                radius='md'
                                withBorder
                                onMouseEnter={e => {
                                  e.currentTarget.style.transform = 'translateX(8px)';
                                  e.currentTarget.style.boxShadow = isDark
                                    ? '0 8px 24px rgba(0,0,0,0.4)'
                                    : '0 8px 24px rgba(0,0,0,0.08)';
                                  e.currentTarget.style.borderColor = isDark
                                    ? 'var(--mantine-color-blue-5)'
                                    : 'var(--mantine-color-blue-3)';
                                }}
                                onMouseLeave={e => {
                                  e.currentTarget.style.transform = 'translateX(0)';
                                  e.currentTarget.style.boxShadow = 'none';
                                  e.currentTarget.style.borderColor = isDark
                                    ? 'var(--mantine-color-dark-4)'
                                    : 'var(--mantine-color-gray-3)';
                                }}
                              >
                                {/* Unread Indicator Bar */}
                                {item.read_at === null && (
                                  <Box
                                    style={{
                                      position: 'absolute',
                                      left: 0,
                                      top: 0,
                                      bottom: 0,
                                      width: 4,
                                      background:
                                        'linear-gradient(180deg, #f59e0b 0%, #ef4444 100%)',
                                    }}
                                  />
                                )}

                                <UnstyledButton
                                  onClick={() => openNotif(item)}
                                  style={{
                                    display: 'block',
                                    width: '100%',
                                    opacity: item.read_at ? 0.6 : 1,
                                  }}
                                  className={classes.notification}
                                >
                                  <Group
                                    p='md'
                                    justify='space-between'
                                    align='flex-start'
                                    wrap='nowrap'
                                  >
                                    <Group
                                      align='flex-start'
                                      gap='md'
                                      style={{ flex: 1 }}
                                    >
                                      {/* Content */}
                                      <Box style={{ flex: 1, minWidth: 0 }}>
                                        <Notification
                                          title={item.title}
                                          description={item.description}
                                          datetime={item.created_at}
                                          read={item.read_at !== null}
                                          type={item.data?.type}
                                        />
                                      </Box>
                                    </Group>

                                    {/* Actions Menu */}
                                    <Menu
                                      shadow='md'
                                      width={200}
                                      position='bottom-end'
                                    >
                                      <Menu.Target>
                                        <ActionIcon
                                          variant='subtle'
                                          color='gray'
                                          onClick={e => e.stopPropagation()}
                                        >
                                          <IconDots size={16} />
                                        </ActionIcon>
                                      </Menu.Target>
                                      <Menu.Dropdown>
                                        <Menu.Item
                                          leftSection={
                                            item.read_at ? (
                                              <IconMailOpened size={16} />
                                            ) : (
                                              <IconCheck size={16} />
                                            )
                                          }
                                          onClick={e => {
                                            e.stopPropagation();
                                            if (item.read_at === null) markAsRead(item);
                                          }}
                                          disabled={item.read_at !== null}
                                        >
                                          Mark as read
                                        </Menu.Item>
                                        <Menu.Divider />
                                        <Menu.Item
                                          leftSection={<IconTrash size={16} />}
                                          color='red'
                                          onClick={e => {
                                            e.stopPropagation();
                                            open();
                                          }}
                                        >
                                          Delete
                                        </Menu.Item>
                                      </Menu.Dropdown>
                                    </Menu>

                                    {/* Delete Confirmation Dialog */}
                                    <Dialog
                                      opened={opened}
                                      withCloseButton={false}
                                      onClose={close}
                                      closeOnEscape={false}
                                    >
                                      <Text
                                        size='sm'
                                        fw={500}
                                        mb='xs'
                                      >
                                        Confirm deletion
                                      </Text>
                                      <Text
                                        size='sm'
                                        c='dimmed'
                                        mb='md'
                                      >
                                        Are you sure you want to delete this notification? This
                                        action cannot be undone.
                                      </Text>

                                      <Group
                                        justify='flex-end'
                                        mt='md'
                                      >
                                        <Button
                                          variant='default'
                                          onClick={close}
                                        >
                                          Cancel
                                        </Button>
                                        <Button
                                          color='red'
                                          loading={loading}
                                          onClick={() => handleDelete(item)}
                                        >
                                          Delete
                                        </Button>
                                      </Group>
                                    </Dialog>
                                  </Group>
                                </UnstyledButton>
                              </Paper>
                            )}
                          </Transition>
                        ))}
                      </Stack>
                    </Box>
                  )}
                </Transition>
              ))}
            </Stack>
          ) : (
            <Transition
              mounted={true}
              transition='fade'
              duration={400}
            >
              {styles => (
                <Center
                  mih={300}
                  style={styles}
                >
                  <Stack
                    align='center'
                    gap='md'
                  >
                    <ThemeIcon
                      size={80}
                      radius='xl'
                      variant='light'
                      color='white'
                    >
                      <IconBellOff style={{ width: rem(40), height: rem(40) }} />
                    </ThemeIcon>
                    <Box style={{ textAlign: 'center' }}>
                      <Text
                        size='xl'
                        fw={600}
                        c={isDark ? 'white' : 'white'}
                        mb='xs'
                      >
                        {filter === 'all' ? 'No notifications yet' : `No ${filter} notifications`}
                      </Text>
                      <Text
                        size='sm'
                        c='rgba(255, 255, 255, 0.6)'
                        maw={400}
                      >
                        {filter === 'all'
                          ? "You're all caught up! New notifications will appear here."
                          : `Try changing the filter to see ${filter === 'unread' ? 'all' : 'unread'} notifications.`}
                      </Text>
                    </Box>
                    {filter !== 'all' && (
                      <Button
                        variant='light'
                        leftSection={<IconFilter size={16} />}
                        onClick={() => setFilter('all')}
                      >
                        Show all notifications
                      </Button>
                    )}
                  </Stack>
                </Center>
              )}
            </Transition>
          )}
        </ScrollArea>
      </ContainerBox>
    </>
  );
};

NotificationsIndex.layout = page => <Layout title='Notifications'>{page}</Layout>;

export default NotificationsIndex;

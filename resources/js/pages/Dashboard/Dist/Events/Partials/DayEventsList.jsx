import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Center,
  Divider,
  Group,
  Menu,
  Paper,
  ScrollArea,
  Stack,
  Text,
  ThemeIcon,
  Title,
  Tooltip,
} from '@mantine/core';
import {
  IconCalendarEvent,
  IconClock,
  IconDots,
  IconEdit,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';
import { getEventTypeProps } from '@/utils/event';
import { useState } from 'react';

export default function DayEventsList({ events, onAdd, onEdit, onDelete }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Paper
      withBorder
      radius='md'
      p='lg'
      style={{
        height: '100%',
        minHeight: 580,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Group
        justify='space-between'
        mb='md'
      >
        <div>
          <Title
            order={4}
            fw={700}
            style={{ lineHeight: 1.3 }}
          >
            Events for the Day
          </Title>
          <Text
            size='sm'
            c='dimmed'
          >
            Review and manage your events :
          </Text>
        </div>
        {events.length > 0 && (
          <Button
            leftSection={<IconPlus size={16} />}
            size='sm'
            variant='gradient'
            gradient={{ from: 'indigo', to: 'cyan' }}
            onClick={onAdd}
            style={{ fontWeight: 600 }}
          >
            Add
          </Button>
        )}
      </Group>

      <Divider my='sm' />

      <ScrollArea
        style={{ flex: 1, minHeight: 0 }}
        type='auto'
      >
        {events.length > 0 ? (
          <Stack
            gap='md'
            mt='md'
          >
            {events.map(event => {
              const { icon: Icon, color, label } = getEventTypeProps(event.type);
              return (
                <Paper
                  key={event.id}
                  withBorder
                  radius='md'
                  p='md'
                  shadow='sm'
                  style={{
                    backgroundColor: '#ffffff',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                  }}
                >
                  <Stack gap='sm'>
                    <Group
                      justify='space-between'
                      align='flex-start'
                    >
                      <Group
                        gap='md'
                        style={{ flex: 1 }}
                      >
                        <ThemeIcon
                          color={color}
                          variant='light'
                          size={44}
                          radius='md'
                        >
                          <Icon size={22} />
                        </ThemeIcon>
                        <Stack
                          gap={6}
                          style={{ flex: 1 }}
                        >
                          <Text
                            fw={700}
                            size='md'
                            lh={1.3}
                          >
                            {event.title}
                          </Text>
                          <Group
                            gap={8}
                            align='center'
                          >
                            <Badge
                              color={color}
                              variant='light'
                              size='sm'
                            >
                              {label}
                            </Badge>
                            {event.time && (
                              <Badge
                                leftSection={<IconClock size={14} />}
                                color='gray'
                                variant='outline'
                                size='sm'
                              >
                                {event.time}
                              </Badge>
                            )}
                          </Group>
                          {event.description && (
                            <Text
                              size='sm'
                              c='dimmed'
                              lineClamp={2}
                            >
                              {event.description}
                            </Text>
                          )}
                        </Stack>
                      </Group>

                      <Menu
                        shadow='md'
                        width={160}
                      >
                        <Menu.Target>
                          <ActionIcon
                            variant='subtle'
                            color='gray'
                          >
                            <IconDots size={16} />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item
                            leftSection={<IconEdit size={14} />}
                            onClick={() => onEdit(event)}
                          >
                            Edit
                          </Menu.Item>
                          <Menu.Item
                            leftSection={<IconTrash size={14} />}
                            color='red'
                            onClick={() => onDelete(event.id)}
                          >
                            Delete
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </Group>

                    <Group
                      gap='xs'
                      align='center'
                    >
                      <Text
                        size='xs'
                        c='dimmed'
                        fw={600}
                      >
                        Notify
                      </Text>
                      <Avatar.Group
                        spacing='xs'
                        size={26}
                      >
                        {event.notifyUsers && event.notifyUsers.length > 0 ? (
                          event.notifyUsers.map(user => {
                            const avatarSrc = user?.avatarUrl ?? user?.avatar ?? null;
                            const name = user?.name ?? user?.label ?? `User ${user?.id ?? ''}`;
                            const key = user?.id ?? user?.value ?? name;
                            return (
                              <Avatar
                                key={key}
                                src={avatarSrc}
                                alt={name}
                                title={name}
                                radius='xl'
                              >
                                {!avatarSrc && name ? name.slice(0, 2).toUpperCase() : null}
                              </Avatar>
                            );
                          })
                        ) : (
                          <Text
                            size='xs'
                            c='dimmed'
                          >
                            No notifications
                          </Text>
                        )}
                      </Avatar.Group>
                    </Group>
                  </Stack>
                </Paper>
              );
            })}
          </Stack>
        ) : (
          <Center style={{ flex: 1, minHeight: 360 }}>
            <Stack
              align='center'
              gap='md'
            >
              <Tooltip
                withArrow
                color='blue'
                label='add event'
              >
                <ThemeIcon
                  size={60}
                  radius='xl'
                  variant='light'
                  color={hovered ? 'blue' : 'gray'}
                  component='button'
                  onClick={onAdd}
                  style={{
                    cursor: 'pointer',
                    transition: 'all 150ms ease',
                  }}
                  onMouseEnter={() => setHovered(true)}
                  onMouseLeave={() => setHovered(false)}
                >
                  {hovered ? <IconPlus size={32} /> : <IconCalendarEvent size={32} />}
                </ThemeIcon>
              </Tooltip>
              <div style={{ textAlign: 'center' }}>
                <Text
                  fw={600}
                  c='dimmed'
                  mb={4}
                >
                  No events for this day
                </Text>
                <Text
                  size='sm'
                  c='dimmed'
                >
                  Click{' '}
                  <Text
                    span
                    fw={600}
                    c='blue'
                    style={{ cursor: 'pointer' }}
                    onClick={onAdd}
                  >
                    Add
                  </Text>{' '}
                  to create your first event.
                </Text>
              </div>
            </Stack>
          </Center>
        )}
      </ScrollArea>
    </Paper>
  );
}

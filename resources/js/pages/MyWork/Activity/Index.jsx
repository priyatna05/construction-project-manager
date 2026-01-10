import EmptyWithIcon from '@/components/EmptyWithIcon';
import Layout from '@/layouts/MainLayout';
import { dateTime, diffForHumans } from '@/utils/datetime';
import { redirectTo, reloadWithQuery, reloadWithoutQueryParams } from '@/utils/route';
import { usePage } from '@inertiajs/react';
import {
  Anchor,
  Breadcrumbs,
  Center,
  Select,
  Text,
  Timeline,
  Title,
  Tooltip,
  Group,
  Box,
  Stack,
  Avatar,
} from '@mantine/core';
import { rem } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import {
  IconActivity,
  IconArchive,
  IconCalendarMonth,
  IconCheck,
  IconClock,
  IconEdit,
  IconMessage,
  IconPaperclip,
  IconPlus,
  IconX,
  IconUser,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';

const ActivityIndex = () => {
  let { groupedActivities, dropdowns } = usePage().props;
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  const [selectedProject, setSelectedProject] = useState(route().params?.project || '0');

  useEffect(() => {
    if (selectedProject > 0) {
      reloadWithQuery({ project: selectedProject });
    } else {
      reloadWithoutQueryParams({ exclude: ['project'] });
    }
  }, [selectedProject]);

  const getActivityIconProps = title => {
    let icon, bulletColor;

    if (title.includes('archived')) {
      icon = <IconArchive size={rem(20)} />;
      bulletColor = 'gray';
    } else if (title.includes('comment')) {
      icon = <IconMessage size={rem(20)} />;
      bulletColor = 'blue';
    } else if (title.includes('was changed')) {
      icon = <IconEdit size={rem(20)} />;
      bulletColor = 'orange';
    } else if (title.includes('Due date')) {
      icon = <IconCalendarMonth size={rem(20)} />;
      bulletColor = 'indigo';
    } else if (title.includes('Attachment')) {
      icon = <IconPaperclip size={rem(20)} />;
      bulletColor = 'teal';
    } else if (title.includes('Estimation was set')) {
      icon = <IconClock size={rem(20)} />;
      bulletColor = 'purple';
    } else if (title.includes('was completed')) {
      icon = <IconCheck size={rem(20)} />;
      bulletColor = 'green';
    } else if (title.includes('uncompleted')) {
      icon = <IconX size={rem(20)} />;
      bulletColor = 'red';
    } else if (title === 'New task' || title === 'New project' || title.includes('Assigned user')) {
      icon = <IconPlus size={rem(20)} />;
      bulletColor = 'lime';
    } else {
      icon = <IconActivity size={rem(20)} />;
      bulletColor = 'gray';
    }
    return { icon, bulletColor };
  };

  const getRelativeTime = isoString => {
    const now = new Date();
    const then = new Date(isoString);
    const seconds = Math.round((now - then) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);

    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 30) return `${days}d ago`;
    return diffForHumans(isoString);
  };

  return (
    <>
      <Breadcrumbs
        fz='sm'
        mb='xl'
        separator={<Text c='dimmed'>/</Text>}
      >
        <Text c='dimmed'>My Work</Text>
        <Text
          c={isDark ? 'white' : 'white'}
          fw={500}
        >
          Projects activity
        </Text>
      </Breadcrumbs>

      <Group
        justify='space-between'
        align='center'
        mb='xl'
      >
        <Title
          order={1}
          c={isDark ? 'white' : 'white'}
        >
          Projects activity
        </Title>
        <Select
          size='md'
          placeholder='Select project'
          allowDeselect={false}
          value={selectedProject}
          onChange={value => setSelectedProject(value)}
          data={dropdowns.projects}
          maw={260}
        />
      </Group>

      {Object.keys(groupedActivities).length ? (
        <Stack gap='md'>
          {Object.keys(groupedActivities).map(date => (
            <Box key={date}>
              <Title
                order={3}
                mb='lg'
                c={isDark ? 'white' : 'white'}
                style={{
                  borderBottom: `1px solid ${isDark ? 'var(--mantine-color-dark-4)' : 'var(--mantine-color-gray-3)'}`,
                  paddingBottom: '0.5rem',
                }}
              >
                {date}
              </Title>
              <Timeline
                active={9999}
                bulletSize={44}
                lineWidth={2}
              >
                {groupedActivities[date].map(activity => {
                  const { icon, bulletColor } = getActivityIconProps(activity.title);

                  const bulletContent = activity.user?.avatar ? (
                    <Avatar
                      src={activity.user.avatar}
                      radius='xl'
                      size='md'
                      alt={activity.user.name || 'User'}
                    >
                      {activity.user.name ? (
                        activity.user.name.charAt(0).toUpperCase()
                      ) : (
                        <IconUser size={rem(20)} />
                      )}
                    </Avatar>
                  ) : (
                    <Center
                      w={rem(40)}
                      h={rem(40)}
                      style={{
                        borderRadius: '50%',
                        backgroundColor: `var(--mantine-color-${bulletColor}-5)`,
                        color: 'white',
                      }}
                    >
                      {icon}
                    </Center>
                  );

                  return (
                    <Timeline.Item
                      key={activity.id}
                      bullet={bulletContent}
                      lineVariant='solid'
                    >
                      <Box
                        p='sm' // sebelumnya md
                        mt='sm'
                        style={{
                          backgroundColor: isDark
                            ? 'var(--mantine-color-dark-6)'
                            : 'var(--mantine-color-gray-0)',
                          borderRadius: 'var(--mantine-radius-xl)',
                          border: `1px solid ${isDark ? 'var(--mantine-color-dark-5)' : 'var(--mantine-color-gray-2)'}`,
                          transition: 'all 0.2s ease',
                          maxHeight: '120px',
                          overflow: 'hidden',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = isDark
                            ? '0 4px 12px rgba(0,0,0,0.5)'
                            : '0 4px 12px rgba(0,0,0,0.1)';
                          e.currentTarget.style.borderColor = isDark
                            ? 'var(--mantine-color-blue-5)'
                            : 'var(--mantine-color-blue-3)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                          e.currentTarget.style.borderColor = isDark
                            ? 'var(--mantine-color-dark-5)'
                            : 'var(--mantine-color-gray-2)';
                        }}
                      >
                        <Stack gap='xs'>
                          <Group
                            justify='space-between'
                            align='flex-start'
                            wrap='nowrap'
                          >
                            <Group
                              gap='xs'
                              wrap='wrap'
                              style={{ flex: 1 }}
                            >
                              <Anchor
                                fz='md'
                                fw={600}
                                c={isDark ? 'white' : 'dark.7'}
                                onClick={e => {
                                  e.preventDefault();
                                  redirectTo('projects.tasks.open', [
                                    activity.project.id,
                                    activity.subject.id,
                                  ]);
                                }}
                                style={{
                                  textDecoration: 'none',
                                  cursor: 'pointer',
                                }}
                                onMouseEnter={e =>
                                  (e.currentTarget.style.textDecoration = 'underline')
                                }
                                onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
                              >
                                {activity.title}
                              </Anchor>
                              {activity.user && (
                                <Text
                                  size='sm'
                                  c='dimmed'
                                >
                                  by{' '}
                                  <Text
                                    component='span'
                                    fw={500}
                                    c={isDark ? 'gray.2' : 'dark.5'}
                                  >
                                    {activity.user.name || 'Unknown'}
                                  </Text>
                                </Text>
                              )}
                            </Group>
                            <Tooltip
                              label={dateTime(activity.created_at)}
                              openDelay={500}
                              withArrow
                              transitionProps={{ transition: 'fade', duration: 200 }}
                            >
                              <Text
                                size='xs'
                                c='dimmed'
                                style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
                              >
                                {getRelativeTime(activity.created_at)}
                              </Text>
                            </Tooltip>
                          </Group>

                          {activity.description && (
                            <Text
                              c='dimmed'
                              size='sm'
                            >
                              {activity.description}
                            </Text>
                          )}

                          <Group
                            mt='xs'
                            gap='xs'
                          >
                            <IconActivity
                              size={rem(10)}
                              style={{
                                color: isDark
                                  ? 'var(--mantine-color-gray-5)'
                                  : 'var(--mantine-color-gray-6)',
                              }}
                            />
                            <Anchor
                              fz='xs'
                              c='blue.5'
                              onClick={e => {
                                e.preventDefault();
                                redirectTo('projects.tasks', [activity.project_id]);
                              }}
                              style={{
                                textDecoration: 'none',
                                cursor: 'pointer',
                              }}
                              onMouseEnter={e =>
                                (e.currentTarget.style.textDecoration = 'underline')
                              }
                              onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
                            >
                              {activity.project.name}
                            </Anchor>
                          </Group>
                        </Stack>
                      </Box>
                    </Timeline.Item>
                  );
                })}
              </Timeline>
            </Box>
          ))}
        </Stack>
      ) : (
        <Center mih={300}>
          <EmptyWithIcon
            title='No activities found'
            description='On projects you have access to'
            icon={IconActivity}
          />
        </Center>
      )}
    </>
  );
};

ActivityIndex.layout = page => <Layout title='Activity'>{page}</Layout>;

export default ActivityIndex;

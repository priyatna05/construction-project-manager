import EmptyWithIcon from '@/components/EmptyWithIcon';
import { Label } from '@/components/Label';
import Layout from '@/layouts/MainLayout';
import dayjs from '@/utils/dayjsConfig';
import { dateTime, diffForHumans, day } from '@/utils/datetime';
import { getInitials } from '@/utils/user';
import { Link, usePage } from '@inertiajs/react';
import {
  Avatar,
  Badge,
  Breadcrumbs,
  Button,
  Card,
  Divider,
  Grid,
  Group,
  Progress,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
  Tooltip,
} from '@mantine/core';
import {
  IconActivity,
  IconAlertTriangle,
  IconArrowRight,
  IconCalendarMonth,
  IconCircleCheck,
  IconListCheck,
  IconRocket,
  IconStar,
  IconStarFilled,
} from '@tabler/icons-react';

const formatCount = value => {
  const numericValue = Number(value ?? 0);
  if (Number.isNaN(numericValue)) return '0';
  return numericValue.toLocaleString();
};

const normalizeCollection = value => (Array.isArray(value) ? value : value?.data || []);

const resolveDueBadge = dueDate => {
  if (!dueDate) {
    return { label: 'No due date', color: 'gray' };
  }

  const due = dayjs(dueDate);
  if (!due.isValid()) {
    return { label: 'Invalid date', color: 'gray' };
  }

  if (due.isBefore(dayjs(), 'day')) {
    return { label: `${diffForHumans(dueDate, true)} overdue`, color: 'red' };
  }

  if (due.isSame(dayjs(), 'day')) {
    return { label: 'Due today', color: 'orange' };
  }

  return { label: `Due in ${diffForHumans(dueDate, true)}`, color: 'teal' };
};

const StatCard = ({ label, value, description, icon, color }) => (
  <Card
    withBorder
    radius='md'
    p='md'
  >
    <Group
      justify='space-between'
      align='center'
    >
      <Stack gap={2}>
        <Text
          c='dimmed'
          tt='uppercase'
          fw={700}
          fz='xs'
        >
          {label}
        </Text>
        <Text
          fw={700}
          fz='xl'
        >
          {formatCount(value)}
        </Text>
        {description && (
          <Text
            fz='xs'
            c='dimmed'
          >
            {description}
          </Text>
        )}
      </Stack>
      <ThemeIcon
        color={color}
        variant='light'
        size={46}
        radius='md'
      >
        {icon}
      </ThemeIcon>
    </Group>
  </Card>
);

const ActionCard = ({ title, description, icon, href, buttonLabel }) => (
  <Card
    withBorder
    radius='md'
    p='md'
  >
    <Group
      justify='space-between'
      align='flex-start'
    >
      <Group
        gap='sm'
        align='flex-start'
      >
        <ThemeIcon
          variant='light'
          color='blue'
          size={46}
          radius='md'
        >
          {icon}
        </ThemeIcon>
        <Stack gap={2}>
          <Text fw={600}>{title}</Text>
          <Text
            fz='sm'
            c='dimmed'
          >
            {description}
          </Text>
        </Stack>
      </Group>
      <Button
        component={Link}
        href={href}
        variant='light'
        radius='xl'
        rightSection={<IconArrowRight size={14} />}
      >
        {buttonLabel}
      </Button>
    </Group>
  </Card>
);

export default function MyWorkIndex() {
  const {
    stats = {},
    upcomingTasks: upcomingTasksProp,
    recentActivities: recentActivitiesProp,
    projectFocus: projectFocusProp,
  } = usePage().props;

  const upcomingTasks = normalizeCollection(upcomingTasksProp);
  const recentActivities = normalizeCollection(recentActivitiesProp);
  const projectFocus = normalizeCollection(projectFocusProp);

  const openTasks = Number(stats.open_tasks ?? 0);
  const overdueTasks = Number(stats.overdue_tasks ?? 0);
  const dueToday = Number(stats.due_today ?? 0);
  const dueThisWeek = Number(stats.due_this_week ?? 0);
  const noDueDate = Number(stats.no_due_date ?? 0);
  const completedThisWeek = Number(stats.completed_this_week ?? 0);
  const activeProjects = Number(stats.active_projects ?? 0);
  const activityLastSevenDays = Number(stats.activity_last_7_days ?? 0);
  const totalWeeklyTasks = openTasks + completedThisWeek;
  const completionRate =
    totalWeeklyTasks > 0 ? Math.round((completedThisWeek / totalWeeklyTasks) * 100) : 0;

  const healthItems = [
    {
      label: 'Overdue tasks',
      value: overdueTasks,
      color: overdueTasks > 0 ? 'red' : 'teal',
    },
    {
      label: 'Due today',
      value: dueToday,
      color: dueToday > 0 ? 'orange' : 'teal',
    },
    {
      label: 'Due this week',
      value: dueThisWeek,
      color: dueThisWeek > 0 ? 'yellow' : 'teal',
    },
    {
      label: 'No due date',
      value: noDueDate,
      color: noDueDate > 0 ? 'gray' : 'teal',
    },
  ];

  const quickActions = [
    can('view tasks') && {
      title: 'My Tasks',
      description: 'Review tasks assigned to you by project.',
      icon: <IconListCheck size={22} />,
      href: route('my-work.tasks.index'),
      buttonLabel: 'Open Tasks',
    },
    can('view activities') && {
      title: 'Project Activity',
      description: 'Track recent updates across your projects.',
      icon: <IconActivity size={22} />,
      href: route('my-work.activity.index'),
      buttonLabel: 'View Activity',
    },
  ].filter(Boolean);

  return (
    <>
      <Breadcrumbs
        fz='sm'
        mb='xl'
        separator={<Text c='dimmed'>/</Text>}
      >
        <Text c='dimmed'>My Work</Text>
        <Text
          c='white'
          fw={500}
        >
          Overview
        </Text>
      </Breadcrumbs>

      <Group
        justify='space-between'
        align='center'
        mb='lg'
      >
        <Title style={{ color: 'white' }}>My Work Overview</Title>
        <Group>
          {can('view tasks') && (
            <Button
              component={Link}
              href={route('my-work.tasks.index')}
              variant='default'
              radius='xl'
            >
              My Tasks
            </Button>
          )}
          {can('view activities') && (
            <Button
              component={Link}
              href={route('my-work.activity.index')}
              variant='default'
              radius='xl'
            >
              Activity
            </Button>
          )}
        </Group>
      </Group>

      <Stack gap='xl'>
        <Stack gap='md'>
          <Text
            fz='sm'
            c='white'
            fw={600}
          >
            Overview
          </Text>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
            <StatCard
              label='Open Tasks'
              value={openTasks}
              description={`Active projects: ${formatCount(activeProjects)}`}
              icon={<IconListCheck size={22} />}
              color='blue'
            />
            <StatCard
              label='Overdue Tasks'
              value={overdueTasks}
              description='Past due deadlines'
              icon={<IconAlertTriangle size={22} />}
              color={overdueTasks > 0 ? 'red' : 'teal'}
            />
            <StatCard
              label='Due This Week'
              value={dueThisWeek}
              description={`Due today: ${formatCount(dueToday)}`}
              icon={<IconCalendarMonth size={22} />}
              color='indigo'
            />
            <StatCard
              label='Completed This Week'
              value={completedThisWeek}
              description={`Activity (7d): ${formatCount(activityLastSevenDays)}`}
              icon={<IconCircleCheck size={22} />}
              color='teal'
            />
          </SimpleGrid>
        </Stack>

        {quickActions.length > 0 && (
          <Stack gap='md'>
            <Text
              fz='sm'
              c='white'
              fw={600}
            >
              Quick Actions
            </Text>
            <SimpleGrid cols={{ base: 1, md: 2 }}>
              {quickActions.map(action => (
                <ActionCard
                  key={action.title}
                  title={action.title}
                  description={action.description}
                  icon={action.icon}
                  href={action.href}
                  buttonLabel={action.buttonLabel}
                />
              ))}
            </SimpleGrid>
          </Stack>
        )}

        <Grid gutter='xl'>
          <Grid.Col span={{ base: 12, lg: 7 }}>
            <Stack gap='xl'>
              <Card
                withBorder
                radius='md'
                p='md'
              >
                <Group
                  justify='space-between'
                  align='center'
                  mb='sm'
                >
                  <Text fw={600}>Upcoming Tasks</Text>
                  {can('view tasks') && (
                    <Button
                      component={Link}
                      href={route('my-work.tasks.index')}
                      variant='subtle'
                      size='xs'
                      rightSection={<IconArrowRight size={12} />}
                    >
                      View all
                    </Button>
                  )}
                </Group>
                {upcomingTasks.length > 0 ? (
                  <Stack gap='md'>
                    {upcomingTasks.map((task, index) => {
                      const taskLabels = Array.isArray(task.labels) ? task.labels : [];
                      const taskGroupName = task.task_group?.name || task.taskGroup?.name || '';
                      const dueBadge = resolveDueBadge(task.end_date);
                      const taskTitle = task.number ? `#${task.number}: ${task.name}` : task.name;
                      return (
                        <Stack
                          key={task.id}
                          gap='xs'
                        >
                          <Group
                            justify='space-between'
                            align='flex-start'
                            wrap='nowrap'
                          >
                            <Stack
                              gap={4}
                              style={{ flex: 1 }}
                            >
                              <Text
                                component={Link}
                                href={route('projects.tasks.open', [task.project_id, task.id])}
                                fw={600}
                                fz='sm'
                                style={{ textDecoration: 'none' }}
                              >
                                {taskTitle}
                              </Text>
                              <Group
                                gap='xs'
                                wrap='wrap'
                              >
                                {task.project?.name && (
                                  <Badge
                                    variant='light'
                                    color='blue'
                                  >
                                    {task.project.name}
                                  </Badge>
                                )}
                                {taskGroupName && (
                                  <Badge
                                    variant='light'
                                    color='gray'
                                  >
                                    {taskGroupName}
                                  </Badge>
                                )}
                              </Group>
                              {taskLabels.length > 0 && (
                                <Group
                                  gap='xs'
                                  wrap='wrap'
                                >
                                  {taskLabels.slice(0, 3).map(label => (
                                    <Label
                                      key={label.id}
                                      name={label.name}
                                      color={label.color}
                                      size={10}
                                    />
                                  ))}
                                </Group>
                              )}
                            </Stack>
                            <Tooltip
                              label={task.end_date ? day(task.end_date) : 'No due date'}
                              withArrow
                            >
                              <Badge
                                variant='light'
                                color={dueBadge.color}
                              >
                                {dueBadge.label}
                              </Badge>
                            </Tooltip>
                          </Group>
                          {index < upcomingTasks.length - 1 && <Divider />}
                        </Stack>
                      );
                    })}
                  </Stack>
                ) : (
                  <EmptyWithIcon
                    title='No upcoming tasks'
                    description='You are all caught up for now'
                    icon={IconRocket}
                    titleFontSize={18}
                    descriptionFontSize={12}
                    iconSize={36}
                  />
                )}
              </Card>

              {can('view activities') && (
                <Card
                  withBorder
                  radius='md'
                  p='md'
                >
                  <Group
                    justify='space-between'
                    align='center'
                    mb='sm'
                  >
                    <Text fw={600}>Recent Activity</Text>
                    <Button
                      component={Link}
                      href={route('my-work.activity.index')}
                      variant='subtle'
                      size='xs'
                      rightSection={<IconArrowRight size={12} />}
                    >
                      View all
                    </Button>
                  </Group>
                  {recentActivities.length > 0 ? (
                    <Stack gap='md'>
                      {recentActivities.map((activity, index) => {
                        const userName = activity.user?.name || 'Unknown';
                        return (
                          <Stack
                            key={activity.id}
                            gap='xs'
                          >
                            <Group
                              justify='space-between'
                              align='flex-start'
                              wrap='nowrap'
                            >
                              <Group
                                gap='sm'
                                align='flex-start'
                                wrap='nowrap'
                              >
                                <Avatar
                                  src={activity.user?.avatar}
                                  radius='xl'
                                  size={40}
                                  alt={userName}
                                >
                                  {getInitials(userName)}
                                </Avatar>
                                <Stack gap={4}>
                                  <Text
                                    fw={600}
                                    fz='sm'
                                  >
                                    {activity.title}
                                  </Text>
                                  {activity.description && (
                                    <Text
                                      fz='xs'
                                      c='dimmed'
                                      lineClamp={2}
                                    >
                                      {activity.description}
                                    </Text>
                                  )}
                                  <Group
                                    gap='xs'
                                    wrap='wrap'
                                  >
                                    {activity.project?.name && (
                                      <Badge
                                        variant='light'
                                        color='blue'
                                        component={Link}
                                        href={route('projects.tasks', activity.project.id)}
                                      >
                                        {activity.project.name}
                                      </Badge>
                                    )}
                                    <Text
                                      fz='xs'
                                      c='dimmed'
                                    >
                                      by {userName}
                                    </Text>
                                  </Group>
                                </Stack>
                              </Group>
                              <Tooltip
                                label={dateTime(activity.created_at)}
                                withArrow
                              >
                                <Text
                                  fz='xs'
                                  c='dimmed'
                                >
                                  {diffForHumans(activity.created_at)}
                                </Text>
                              </Tooltip>
                            </Group>
                            {index < recentActivities.length - 1 && <Divider />}
                          </Stack>
                        );
                      })}
                    </Stack>
                  ) : (
                    <EmptyWithIcon
                      title='No activity yet'
                      description='Updates from your projects will appear here'
                      icon={IconActivity}
                      titleFontSize={18}
                      descriptionFontSize={12}
                      iconSize={36}
                    />
                  )}
                </Card>
              )}
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, lg: 5 }}>
            <Stack gap='xl'>
              <Card
                withBorder
                radius='md'
                p='md'
              >
                <Group
                  justify='space-between'
                  align='center'
                  mb='sm'
                >
                  <Text fw={600}>Task Health</Text>
                  {can('view tasks') && (
                    <Button
                      component={Link}
                      href={route('my-work.tasks.index')}
                      variant='subtle'
                      size='xs'
                      rightSection={<IconArrowRight size={12} />}
                    >
                      View tasks
                    </Button>
                  )}
                </Group>
                <Stack gap='md'>
                  {healthItems.map((item, index) => (
                    <Stack
                      key={item.label}
                      gap='xs'
                    >
                      <Group
                        justify='space-between'
                        align='center'
                      >
                        <Text fz='sm'>{item.label}</Text>
                        <Badge
                          variant='light'
                          color={item.color}
                        >
                          {formatCount(item.value)}
                        </Badge>
                      </Group>
                      {index < healthItems.length - 1 && <Divider />}
                    </Stack>
                  ))}
                </Stack>
                <Group
                  mt='md'
                  gap='xs'
                  c='dimmed'
                >
                  <Progress
                    value={completionRate}
                    color='teal'
                    size='sm'
                    radius='xl'
                    style={{ flex: 1 }}
                  />
                  <Text fz='xs'>Weekly completion rate</Text>
                </Group>
              </Card>

              <Card
                withBorder
                radius='md'
                p='md'
              >
                <Group
                  justify='space-between'
                  align='center'
                  mb='sm'
                >
                  <Text fw={600}>Project Focus</Text>
                  <ThemeIcon
                    color='yellow'
                    variant='light'
                    size={36}
                    radius='md'
                  >
                    <IconStar size={18} />
                  </ThemeIcon>
                </Group>
                {projectFocus.length > 0 ? (
                  <Stack gap='md'>
                    {projectFocus.map((project, index) => (
                      <Stack
                        key={project.id}
                        gap='xs'
                      >
                        <Group
                          justify='space-between'
                          align='center'
                          wrap='nowrap'
                        >
                          <Group
                            gap='xs'
                            wrap='nowrap'
                          >
                            {project.favorite ? (
                              <IconStarFilled
                                size={16}
                                style={{ color: 'var(--mantine-color-yellow-5)' }}
                              />
                            ) : (
                              <IconStar size={16} />
                            )}
                            <Text
                              fz='sm'
                              fw={600}
                              component={Link}
                              href={route('projects.tasks', project.id)}
                              style={{ textDecoration: 'none' }}
                            >
                              {project.name}
                            </Text>
                          </Group>
                          <Badge
                            variant='light'
                            color='blue'
                          >
                            {formatCount(project.open_tasks_count)} tasks
                          </Badge>
                        </Group>
                        {index < projectFocus.length - 1 && <Divider />}
                      </Stack>
                    ))}
                  </Stack>
                ) : (
                  <EmptyWithIcon
                    title='No active projects'
                    description='Projects with open tasks will appear here'
                    icon={IconRocket}
                    titleFontSize={18}
                    descriptionFontSize={12}
                    iconSize={36}
                  />
                )}
              </Card>
            </Stack>
          </Grid.Col>
        </Grid>
      </Stack>
    </>
  );
}

MyWorkIndex.layout = page => <Layout title='My Work'>{page}</Layout>;

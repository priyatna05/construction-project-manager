import { Card, Text, Title, Stack, Divider, ScrollArea, Group, ThemeIcon, UnstyledButton, Center, Box } from '@mantine/core';
import { IconAlertTriangle, IconRocket } from '@tabler/icons-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import EmptyWithIcon from '@/components/EmptyWithIcon';
import { redirectTo } from '@/utils/route';

dayjs.extend(relativeTime);

const TaskItem = ({ task }) => {
  console.log('data task critical:', task);
  if (!task || !task.project) {
    return null;
  }
  return (
    <UnstyledButton
      onClick={() => redirectTo('projects.tasks.open', [task.project_id, task.id])}
      p="xs"
      radius="sm"
      w="100%"
      style={{ transition: 'background-color 0.2s ease' }}
      sx={(theme) => ({
          '&:hover': {
              backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
          },
      })}
    >
      <Group justify="space-between">
          <Group gap="sm">
              <ThemeIcon color="orange" variant="light" size="lg" radius="md">
                  <IconAlertTriangle size={20} />
              </ThemeIcon>
              <Box>
                  <Text fz="sm" fw={600} lineClamp={1}>{task.name}</Text>
                  <Text fz="xs" c="dimmed">{task.project.name}</Text>
              </Box>
          </Group>
          <Text fz="xs" fw={700} c="orange" ta="right" miw={60}>
              Due {dayjs(task.due_on).fromNow()}
          </Text>
      </Group>
    </UnstyledButton>
  );
};

export default function CriticalPathTasks({ tasks }) {
  return (
    <Card withBorder radius="md" p="lg" style={{ height: '100%' }}>
      <Title order={4}>Critical Path Tasks</Title>
      <Text fz="sm" c="dimmed">
        Delays in these tasks will directly impact the project deadline.
      </Text>
      <Divider my="md" />

      {tasks && tasks.length > 0 ? (
        <ScrollArea h={280} offsetScrollbars>
          <Stack gap={4}>
            {tasks.map(task => <TaskItem key={task.id} task={task} />)}
          </Stack>
        </ScrollArea>
      ) : (
        <Center h={280}>
            <EmptyWithIcon
                title="No Critical Tasks"
                description="All critical path tasks are clear."
                icon={IconRocket}
            />
        </Center>
      )}
    </Card>
  );
}

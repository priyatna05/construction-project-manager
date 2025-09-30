import Card from '@/components/Card';
import EmptyWithIcon from '@/components/EmptyWithIcon';
import TaskGroupLabel from '@/components/TaskGroupLabel';
import { day, diffForHumans } from '@/utils/datetime';
import { redirectTo } from '@/utils/route';
import {
  Box,
  Center,
  Divider,
  Group,
  ScrollArea,
  Stack,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import classes from './css/RecentlyAssignedTasks.module.css';

export default function RecentlyAssignedTasks({ tasks }) {
  if (!tasks || tasks.length === 0) {
    return (
      <Card>
        <Title
          order={3}
          ml={15}
        >
          Recently assigned tasks
        </Title>

        <Divider my={14} />

        <Center my={30}>
          <EmptyWithIcon
            title='No tasks'
            description='You have no assigned tasks'
            icon={IconSearch}
          />
        </Center>
      </Card>
    );
  }

  return (
    <Card>
      <Title
        order={3}
        ml={15}
      >
        Recently assigned tasks
      </Title>

      <Divider my={14} />

      <ScrollArea
        h={300}
        scrollbarSize={7}
      >
        <Stack gap={10}>
          {tasks.map(task => (
            <Box
              key={task.id}
              className={classes.task}
            >
              <Group
                wrap='nowrap'
                justify='space-between'
              >
                <Stack gap={3}>
                  <Text
                    fz={13}
                    fw={600}
                    onClick={() => redirectTo('projects.tasks.open', [task.project_id, task.id])}
                    className={classes.link}
                  >
                    {task.name}
                  </Text>
                  <Group>
                    <Tooltip
                      label='Task group'
                      openDelay={500}
                      withArrow
                    >
                      <TaskGroupLabel>{task.task_group.name}</TaskGroupLabel>
                    </Tooltip>
                    <Text
                      fz={11}
                      c='dimmed'
                    >
                      {task.project.name}
                    </Text>
                  </Group>
                </Stack>
                <Tooltip
                  label={day(task.assigned_at)}
                  openDelay={500}
                  withArrow
                >
                  <Text
                    fz={11}
                    fw={700}
                    className={classes.due}
                  >
                    {diffForHumans(task.assigned_at)}
                  </Text>
                </Tooltip>
              </Group>
            </Box>
          ))}
        </Stack>
      </ScrollArea>
    </Card>
  );
}

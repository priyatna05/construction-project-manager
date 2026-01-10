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
  Paper,
} from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import classes from './css/RecentlyAssignedTasks.module.css';

export default function RecentlyAssignedTasks({ tasks }) {
  const hasTasks = !tasks || tasks.length === 0;
  return (
    <Paper
      withBorder
      radius='md'
      p='md'
    >
      <Title
        order={3}
        ml={15}
      >
        Recently assigned tasks
      </Title>

      <Divider my={14} />

      {hasTasks ? (
        <Center my={30}>
          <EmptyWithIcon
            title='No tasks'
            description='You have no assigned tasks'
            icon={IconSearch}
          />
        </Center>
      ) : (
        <ScrollArea
          h={300}
          scrollbarSize={7}
        >
          <Stack
            gap='sm'
            pr='xs'
          >
            {tasks.map(task => (
              <Box
                key={task.id}
                className={classes.task}
                onClick={() => redirectTo('projects.tasks.open', [task.project_id, task.id])}
                role='button'
                tabIndex={0}
              >
                {/* Row 1 */}
                <Group
                  justify='space-between'
                  align='flex-start'
                  wrap='nowrap'
                >
                  <Text
                    fz={13}
                    fw={600}
                    className={classes.title}
                  >
                    {task.name}
                  </Text>

                  <Tooltip
                    label={day(task.assigned_at)}
                    openDelay={500}
                    withArrow
                  >
                    <Text
                      fz={11}
                      fw={700}
                      className={classes.time}
                    >
                      {diffForHumans(task.assigned_at)}
                    </Text>
                  </Tooltip>
                </Group>

                {/* Row 2 */}
                <Group
                  gap='xs'
                  mt={6}
                  wrap='wrap'
                >
                  <Tooltip
                    label='Task group'
                    openDelay={500}
                    withArrow
                  >
                    <span>
                      <TaskGroupLabel>{task.task_group?.name}</TaskGroupLabel>
                    </span>
                  </Tooltip>

                  <Text
                    fz={11}
                    c='dimmed'
                    className={classes.project}
                  >
                    {task.project?.name}
                  </Text>
                </Group>
              </Box>
            ))}
          </Stack>
        </ScrollArea>
      )}
    </Paper>
  );
}

import EmptyWithIcon from '@/components/EmptyWithIcon';
import { dateTime, diffForHumans } from '@/utils/datetime';
import { redirectTo } from '@/utils/route';
import {
  Avatar,
  Box,
  Center,
  Divider,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import { IconMessage } from '@tabler/icons-react';
import { stripHtml } from '@/utils/commentConfig';
import classes from './css/RecentComments.module.css';

export default function RecentComments({ comments = [] }) {
  const hasComments = comments.length > 0;

  return (
    <Paper
      withBorder
      radius='md'
      p='md'
    >
      <Group
        justify='space-between'
        align='center'
        px='xs'
      >
        <Title order={3}>Recent comments</Title>
      </Group>

      <Divider my={14} />

      {!hasComments ? (
        <Center my={30}>
          <EmptyWithIcon
            title='No comments'
            description='On your tasks'
            icon={IconMessage}
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
            {comments.map(comment => (
              <Box
                key={comment.id}
                className={classes.item}
                onClick={() =>
                  redirectTo('projects.tasks.open', [comment.task.project_id, comment.task_id])
                }
              >
                <Group
                  gap='sm'
                  align='flex-start'
                  wrap='nowrap'
                >
                  <Avatar
                    src={comment.user.avatar}
                    radius='xl'
                    color='blue'
                    size={34}
                  >
                    {comment.user.name?.[0]}
                  </Avatar>

                  <Box className={classes.content}>
                    {/* Row 1: user + time (time boleh turun baris kalau sempit) */}
                    <Group
                      justify='space-between'
                      align='flex-start'
                      wrap='wrap'
                    >
                      <Text
                        size='sm'
                        fw={600}
                        className={classes.userName}
                      >
                        {comment.user.name}
                      </Text>

                      <Tooltip
                        label={dateTime(comment.created_at)}
                        openDelay={250}
                        withArrow
                      >
                        <Text
                          size='xs'
                          c='dimmed'
                          className={classes.time}
                        >
                          {diffForHumans(comment.created_at)}
                        </Text>
                      </Tooltip>
                    </Group>

                    {/* Row 2: project */}
                    <Tooltip
                      label={comment.task.project.name}
                      withArrow
                    >
                      <Text
                        size='xs'
                        c='dimmed'
                        className={classes.projectName}
                      >
                        {comment.task.project.name}
                      </Text>
                    </Tooltip>

                    {/* Row 3: task */}
                    <Tooltip
                      label={comment.task?.name || ''}
                      withArrow
                      disabled={!comment.task?.name}
                    >
                      <Text
                        size='xs'
                        c='dimmed'
                        className={classes.taskName}
                      >
                        {comment.task?.name ? `Task: ${comment.task.name}` : 'Task: -'}
                      </Text>
                    </Tooltip>

                    {/* Comment preview (lebih aman pakai teks plain supaya nggak “patah” aneh) */}
                    <Text
                      mt={6}
                      size='xs'
                      className={classes.comment}
                    >
                      {stripHtml(comment.content || '')}
                    </Text>
                  </Box>
                </Group>
              </Box>
            ))}
          </Stack>
        </ScrollArea>
      )}
    </Paper>
  );
}

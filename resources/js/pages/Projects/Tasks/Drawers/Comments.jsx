import RichTextEditor from '@/components/RichTextEditor';
import useTasksStore from '@/hooks/store/useTasksStore';
import { dateTime, diffForHumans } from '@/utils/datetime';
import {
  Avatar,
  Box,
  Button,
  Card,
  Flex,
  Group,
  Paper,
  ScrollArea,
  Skeleton,
  Stack,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import { IconMessage, IconSend, IconLock } from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';
import { usePage } from '@inertiajs/react';
import classes from './css/Comments.module.css';

export default function Comments({ task }) {
  const { comments, fetchComments, saveComment } = useTasksStore();
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const isLocked = Boolean(task?.project_is_completed ?? task?.project?.is_completed);
  const commentDisabled = isLocked || !can('edit task');
  const lockMessage = isLocked
    ? 'Project is completed - comments are locked.'
    : 'You do not have permission to post comments.';
  const editorRef = useRef(null);
  const scrollRef = useRef(null);
  const {
    auth: { user },
  } = usePage().props;

  useEffect(() => {
    if (!task?.id || !task?.project_id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchComments(task, () => setLoading(false));
  }, [task?.id, task?.project_id]);

  useEffect(() => {
    // Auto scroll to bottom when new comments added
    if (scrollRef.current && !loading) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [comments.length, loading]);

  const handleSendComment = () => {
    if (comment.length > 7) {
      saveComment(task, comment, () => {
        editorRef.current.setContent('');
        setComment('');
      });
    }
  };

  return (
    <Box
      h='calc(100vh - 160px)'
      display='flex'
      style={{ flexDirection: 'column' }}
    >
      {/* Header */}
      <Paper
        p='md'
        withBorder
        radius={0}
        style={{
          borderLeft: 0,
          borderRight: 0,
          borderTop: 0,
          position: 'sticky',
          top: 0,
          zIndex: 10,
          backgroundColor: 'var(--mantine-color-body)',
        }}
      >
        <Group
          justify='space-between'
          mt='lg'
        >
          <Group gap='xs'>
            <IconMessage size={20} />
            <Title order={4}>Discussion</Title>
          </Group>
          <Text
            size='xs'
            c='dimmed'
          >
            Team conversation about this task
          </Text>
        </Group>
      </Paper>

      {/* Messages Area */}
      <ScrollArea
        flex={5}
        p='md'
        viewportRef={scrollRef}
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          backgroundColor: 'var(--mantine-color-gray-0)',
          border: '1px dashed #d0d0d0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}
        onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)')}
        onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)')}
      >
        {loading ? (
          <Stack gap='md'>
            {Array.from({ length: 3 }).map((_, index) => (
              <Card
                key={index}
                shadow='xs'
                padding='md'
                radius='lg'
              >
                <Group
                  gap='sm'
                  align='flex-start'
                >
                  <Skeleton
                    height={40}
                    circle
                  />
                  <Box flex={1}>
                    <Skeleton
                      height={14}
                      width='30%'
                      mb={8}
                    />
                    <Skeleton
                      height={12}
                      width='20%'
                      mb={12}
                    />
                    <Skeleton
                      height={60}
                      width='100%'
                      radius='sm'
                    />
                  </Box>
                </Group>
              </Card>
            ))}
          </Stack>
        ) : comments.length === 0 ? (
          <Flex
            direction='column'
            align='center'
            justify='center'
            style={{
              minHeight: 'calc(100vh - 250px)',
              textAlign: 'center',
            }}
          >
            <IconMessage
              size={48}
              stroke={1.5}
              color='var(--mantine-color-gray-4)'
            />
            <Text
              c='dimmed'
              size='sm'
            >
              No messages yet. Start the conversation!
            </Text>
          </Flex>
        ) : (
          <Stack gap='md'>
            {comments.map(comment => {
              const isMine = comment.user?.id === user?.id;
              const authorName = comment.user?.name || 'Unknown user';

              return (
                <Group
                  key={comment.id}
                  justify={isMine ? 'flex-end' : 'flex-start'}
                >
                  <Card
                    shadow='xs'
                    padding='md'
                    radius='lg'
                    withBorder
                    style={{
                      maxWidth: '85%',
                      width: '100%',
                      backgroundColor: isMine ? 'var(--mantine-color-blue-0)' : 'white',
                      transition: 'transform 0.2s',
                    }}
                  >
                    <Group
                      gap='sm'
                      align='flex-start'
                      wrap='nowrap'
                      justify={isMine ? 'flex-end' : 'flex-start'}
                    >
                      {!isMine && (
                        <Avatar
                          src={comment.user?.avatar}
                          radius='xl'
                          size='lg'
                          color='blue'
                        />
                      )}

                      <Box flex={1}>
                        <Group
                          justify={isMine ? 'flex-end' : 'space-between'}
                          mb='xs'
                        >
                          <Box>
                            <Group gap={8} justify={isMine ? 'flex-end' : 'flex-start'}>
                              <Text
                                size='sm'
                                fw={600}
                                c='blue'
                              >
                                {authorName}
                              </Text>
                              {comment.user?.job_title && (
                                <>
                                  <Text
                                    size='xs'
                                    c='dimmed'
                                  >
                                    •
                                  </Text>
                                  <Text
                                    size='xs'
                                    c='dimmed'
                                  >
                                    {comment.user?.job_title}
                                  </Text>
                                </>
                              )}
                            </Group>
                          </Box>

                          <Tooltip
                            label={dateTime(comment.created_at)}
                            openDelay={250}
                            withArrow
                            position='left'
                            zIndex={2200}
                          >
                            <Text
                              size='xs'
                              c='dimmed'
                            >
                              {diffForHumans(comment.created_at)}
                            </Text>
                          </Tooltip>
                        </Group>

                        <Paper
                          p='sm'
                          radius='md'
                          bg={isMine ? 'var(--mantine-color-blue-1)' : 'var(--mantine-color-gray-1)'}
                        >
                          <Text
                            size='sm'
                            className={classes.comment}
                            style={{
                              textAlign: isMine ? 'right' : 'left',
                            }}
                            dangerouslySetInnerHTML={{ __html: comment.content }}
                          />
                        </Paper>
                      </Box>

                      {isMine && (
                        <Avatar
                          src={comment.user?.avatar}
                          radius='xl'
                          size='lg'
                          color='blue'
                        />
                      )}
                    </Group>
                  </Card>
                </Group>
              );
            })}
          </Stack>
        )}
      </ScrollArea>

      {/* Input Area */}
      {commentDisabled ? (
        <Paper
          p='md'
          withBorder
          radius={0}
          style={{
            borderLeft: 0,
            borderRight: 0,
            borderBottom: 0,
            position: 'sticky',
            bottom: 0,
            zIndex: 10,
            backgroundColor: 'var(--mantine-color-body)',
          }}
        >
          <Group gap='sm'>
            <IconLock size={18} />
            <Stack gap={2}>
              <Text fw={600} size='sm'>
                Comments locked
              </Text>
              <Text size='xs' c='dimmed'>
                {lockMessage}
              </Text>
            </Stack>
          </Group>
        </Paper>
      ) : (
        <Paper
          p='md'
          withBorder
          radius={0}
          style={{
            borderLeft: 0,
            borderRight: 0,
            borderBottom: 0,
            position: 'sticky',
            bottom: 0,
            zIndex: 10,
            backgroundColor: 'var(--mantine-color-body)',
          }}
        >
          <Stack gap='xs'>
            <RichTextEditor
              ref={editorRef}
              placeholder='Type your message...'
              height={100}
              content={comment}
              onChange={content => setComment(content)}
              readOnly={false}
              projectId={task?.project_id || task?.project?.id}
            />
            <Flex
              justify='space-between'
              align='center'
            >
              <Text
                size='xs'
                c='dimmed'
              >
                {comment.length > 7
                  ? 'Press send to post your message'
                  : 'Type at least a few characters'}
              </Text>
              <Button
                variant='filled'
                disabled={comment.length <= 7}
                leftSection={<IconSend size={16} />}
                onClick={handleSendComment}
              >
                Send
              </Button>
            </Flex>
          </Stack>
        </Paper>
      )}
    </Box>
  );
}

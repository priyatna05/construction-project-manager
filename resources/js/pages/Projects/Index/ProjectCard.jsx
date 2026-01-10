import { stopOnIgnoreLink } from '@/utils/domEvents';
import { getInitials } from '@/utils/user';
import { Link } from '@inertiajs/react';
import { ActionIcon, Avatar, Card, Group, Progress, Text, Tooltip } from '@mantine/core';
import { IconFileText, IconPhoto, IconDotsCircleHorizontal, IconLock } from '@tabler/icons-react';
import ToggleFavorite from './FavoriteToggle';
import ProjectCardActions from './ProjectCardActions';
import classes from './css/ProjectCard.module.css';
import JsFileDownloader from 'js-file-downloader';
import { isImage, isViewable } from '@/utils/file';
import { useState } from 'react';
import { useDisclosure } from '@mantine/hooks';
import ImageModal from '@/components/ImageModal';
import { BadgeWithIcon } from '@/components/helperLabel';

export default function ProjectCard({ item, onEdit }) {
  const completedPercent = (item.completed_tasks_count / item.all_tasks_count) * 100 || 0;
  const overduePercent = (item.overdue_tasks_count / item.all_tasks_count) * 100 || 0;
  const [opened, { close, open }] = useDisclosure(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const isLocked = Boolean(item.is_completed);

  const openFile = file => {
    const fileUrl = file.url || (file instanceof File ? URL.createObjectURL(file) : null);
    const filePathForLoader = file.path || file.url;

    if (isImage(file)) {
      setSelectedImage({
        name: file.name,
        url: fileUrl,
        path: filePathForLoader,
      });
      open();
    } else if (isViewable(file)) {
      if (fileUrl) {
        window.open(fileUrl, '_blank');
      } else {
        console.error('No URL available for viewable file:', file);
      }
    } else {
      if (fileUrl) {
        new JsFileDownloader({
          url: fileUrl,
          filename: file.name,
          contentType: file.type,
          nativeFallbackOnError: true,
        }).catch(error => console.error('Failed to download file', error));
      } else {
        console.error('No URL available for downloadable file:', file);
      }
    }
  };

  const latestStatusRaw =
    Array.isArray(item.status) && item.status.length > 0
      ? item.status[item.status.length - 1]
      : item.status;

  const latestStatus =
    typeof latestStatusRaw === 'string'
      ? latestStatusRaw
      : latestStatusRaw?.slug || latestStatusRaw?.name;

  const isCompletedStatus =
    typeof latestStatus === 'string' &&
    ['done', 'completed'].includes(latestStatus.trim().toLowerCase());
  const isCompleted = Boolean(item.is_completed);
  const isPreCompleted = !isCompleted && isCompletedStatus;
  const cardBackground = isCompleted ? '#CCCCCC' : isPreCompleted ? '#CCCC11' : undefined;

  return (
    <Card
      withBorder
      padding='xl'
      radius='md'
      w={440}
      style={{
        minHeight: 300,
        backgroundColor: cardBackground,
        position: 'relative',
      }}
      className={classes.card}
    >
      {isLocked && (
        <Tooltip
          label='Project locked'
          withArrow
        >
          <ActionIcon
            variant='filled'
            radius='xl'
            size='sm'
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              zIndex: 2,
              cursor: 'default',
            }}
            aria-label='Project locked'
          >
            <IconLock size={14} />
          </ActionIcon>
        </Tooltip>
      )}
      <Group
        align='center'
        gap='sm'
        wrap='nowrap'
      >
        <ToggleFavorite item={item} />
        <Link
          href={route('projects.tasks', item.id)}
          className={classes.link}
          onClick={stopOnIgnoreLink}
        >
          <Text
            fz={23}
            fw={700}
            className={classes.title}
          >
            {item.code} {item.name.length > 50 ? `${item.name.slice(0, 50)}...` : item.name}
          </Text>
        </Link>
      </Group>

      <Group
        gap='sm'
        align='center'
      >
        <Avatar
          src={item.clientCompany?.avatar || item.clientUser?.avatar || null}
          radius='xl'
          color='blue'
          size='sm'
        >
          {/* fallback inisial kalau avatar tidak ada */}
          {item.clientCompany?.name
            ? item.clientCompany.name.charAt(0).toUpperCase()
            : item.clientUser?.name?.charAt(0).toUpperCase() || '?'}
        </Avatar>

        <Text
          fz='sm'
          fw={500}
        >
          {item.clientCompany?.name || item.clientUser?.name || '-'}
        </Text>
      </Group>

      <Group
        gap='xs'
        mt='md'
      >
        <Text
          c='dimmed'
          fz='sm'
        >
          Contract:{' '}
        </Text>
        <BadgeWithIcon label={item.type || '-'} />
      </Group>
      <Group
        gap='xs'
        mt='xs'
      >
        <Text
          c='dimmed'
          fz='sm'
        >
          Status:
        </Text>

        {Array.isArray(item.status) && item.status.length > 0 ? (
          <BadgeWithIcon label={item.status[item.status.length - 1]} />
        ) : (
          <Text
            span
            fw={500}
            c='bright'
          >
            {item.status?.name || '-'}
          </Text>
        )}
      </Group>
      <Group
        gap='xs'
        mt='xs'
      >
        <Text
          c='dimmed'
          fz='sm'
        >
          Completed tasks:{' '}
          <Text
            span
            fw={500}
            c='bright'
          >
            {item.completed_tasks_count} / {item.all_tasks_count}
          </Text>
        </Text>
      </Group>

      <Progress.Root
        value={item.all_tasks_count}
        mt={10}
        radius='xl'
      >
        <Tooltip
          label={`Completed: ${item.completed_tasks_count}`}
          withArrow
        >
          <Progress.Section
            value={completedPercent}
            color='blue'
          />
        </Tooltip>
        <Tooltip
          label={`Overdue: ${item.overdue_tasks_count}`}
          withArrow
        >
          <Progress.Section
            value={overduePercent}
            color='red'
          />
        </Tooltip>
        <Progress.Section
          value={100 - (completedPercent + overduePercent)}
          color='gray'
        />
      </Progress.Root>

      <Group
        mt='md'
        gap='sm'
        align='center'
        ml='auto'
      >
        <Group
          spacing='sm'
          mt='xs'
          ml='auto'
        >
          {/* Attachments */}
          {item.attachments?.length > 0 && (
            <Avatar.Group
              spacing='sm'
              ml='auto'
            >
              {item.attachments.slice(0, 4).map(file => {
                const isImg = file.mime_type?.startsWith('image/');
                const icon = isImg ? <IconPhoto size={18} /> : <IconFileText size={18} />;

                return (
                  <Tooltip
                    key={file.id}
                    label={file.name}
                    withArrow
                  >
                    <Avatar
                      src={isImg ? file.url : undefined} // ✅ tampilkan thumbnail jika image
                      onClick={() => openFile(file)}
                      radius='xl'
                      color={isImg ? 'teal' : 'blue'}
                      style={{
                        cursor: 'pointer',
                        backgroundColor: isImg ? '#e6fcf5' : '#e7f5ff',
                        objectFit: 'cover',
                      }}
                    >
                      {!isImg && icon} {/* ✅ tampilkan icon hanya jika bukan gambar */}
                    </Avatar>
                  </Tooltip>
                );
              })}

              {item.attachments.length > 4 && (
                <Tooltip
                  label='other'
                  withArrow
                >
                  <Avatar
                    radius='xl'
                    color='gray'
                    style={{ cursor: 'pointer', backgroundColor: '#f1f3f5' }}
                  >
                    <IconDotsCircleHorizontal size={18} />
                  </Avatar>
                </Tooltip>
              )}
            </Avatar.Group>
          )}

          {/* Avatars */}
          {item.users_with_access?.length > 0 && (
            <Avatar.Group
              spacing='sm'
              ml='auto'
            >
              {item.users_with_access.slice(0, 4).map(user => (
                <Tooltip
                  key={user.id}
                  label={user.name}
                  openDelay={300}
                  withArrow
                >
                  <Avatar
                    src={user.avatar}
                    radius='xl'
                    color='gray'
                    style={{
                      cursor: 'default',
                      backgroundColor: '#f1f3f5',
                      fontSize: 12,
                      fontWeight: 500,
                    }}
                  >
                    {getInitials(user.name)}
                  </Avatar>
                </Tooltip>
              ))}

              {item.users_with_access.length > 4 && (
                <Avatar
                  radius='xl'
                  color='gray'
                  style={{
                    backgroundColor: '#f1f3f5',
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                >
                  +{item.users_with_access.length - 4}
                </Avatar>
              )}
            </Avatar.Group>
          )}
          <ProjectCardActions
            item={item}
            onEdit={onEdit}
          />
        </Group>
      </Group>

      <ImageModal
        image={selectedImage}
        opened={opened}
        close={close}
      />
    </Card>
  );
}

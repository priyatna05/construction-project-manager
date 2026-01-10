import { Table, Text, Avatar, Tooltip, Group, Badge } from '@mantine/core';
import { getInitials } from '@/utils/user';
import { stopOnIgnoreLink } from '@/utils/domEvents';
import { Link } from '@inertiajs/react';
import ProjectCardActions from './ProjectCardActions';
import { IconPhoto, IconFileText } from '@tabler/icons-react';

export default function ProjectList({ item, onEdit }) {
  console.log('Rendering ProjectList for item:', item); // Debugging line
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
  const cardBackground = isCompleted ? '#CCCCCC' : isPreCompleted ? '#FFF3BF' : undefined;

  return (
    <Table.Tr
      key={item.id}
      onClick={stopOnIgnoreLink}
      style={{ cursor: 'pointer', backgroundColor: cardBackground }}
    >
      <Table.Td>{item.code}</Table.Td>
      <Table.Td>
        <Link
          href={route('projects.tasks', item.id)}
          onClick={stopOnIgnoreLink}
        >
          <Text fw={600}>{item.name}</Text>
        </Link>
      </Table.Td>
      <Table.Td>{item.clientCompany?.name}</Table.Td>
      <Table.Td>
        <Avatar.Group spacing='sm'>
          {item.users_with_access?.slice(0, 4).map(user => (
            <Tooltip
              key={user.id}
              label={user.name}
              withArrow
            >
              <Avatar
                size='sm'
                src={user.avatar}
                radius='xl'
              >
                {getInitials(user.name)}
              </Avatar>
            </Tooltip>
          ))}

          {item.users_with_access?.length > 4 && (
            <Avatar
              size='sm'
              radius='xl'
            >
              +{item.users_with_access.length - 4}
            </Avatar>
          )}
        </Avatar.Group>
      </Table.Td>
      <Table.Td>
        {item.completed_tasks_count} / {item.all_tasks_count}
      </Table.Td>
      <Table.Td>
        {Array.isArray(item.status) && item.status.length > 0 ? (
          <Group
            gap={6}
            wrap='wrap'
          >
            {item.status.map(s => (
              <Badge
                key={s.id}
                size='xs'
                variant='light'
                style={{
                  color: s.color || undefined,
                  backgroundColor: s.color ? `${s.color}22` : undefined, // transparan
                  border: s.color ? `1px solid ${s.color}55` : undefined,
                }}
              >
                {s.name}
              </Badge>
            ))}
          </Group>
        ) : item.status ? (
          <Badge
            size='xs'
            variant='light'
          >
            {item.status}
          </Badge>
        ) : (
          <Text
            size='sm'
            c='dimmed'
          >
            -
          </Text>
        )}
      </Table.Td>

      <Table.Td>
        {item.type ? (
          <Badge
            size='xs'
            variant='light'
            style={{
              color: item.type.color || undefined,
              backgroundColor: item.type.color ? `${item.type.color}22` : undefined,
              border: item.type.color ? `1px solid ${item.type.color}55` : undefined,
            }}
          >
            {item.type.name}
          </Badge>
        ) : (
          <Text
            size='sm'
            c='dimmed'
          >
            -
          </Text>
        )}
      </Table.Td>

      <Table.Td>
        <Avatar.Group spacing='sm'>
          {item.attachments && item.attachments.length > 0
            ? item.attachments.slice(0, 4).map(file => {
                const isImage = file.mime_type?.startsWith('image/');
                const icon = isImage ? <IconPhoto size={14} /> : <IconFileText size={14} />;

                return (
                  <Tooltip
                    key={file.id}
                    label={file.name}
                    withArrow
                  >
                    <Avatar
                      size='sm'
                      color={isImage ? 'teal' : 'blue'}
                    >
                      {icon}
                    </Avatar>
                  </Tooltip>
                );
              })
            : '-'}
          {item.attachments?.length > 4 && (
            <Avatar
              size='sm'
              color='gray'
            >
              +{item.attachments.length - 4}
            </Avatar>
          )}
        </Avatar.Group>
      </Table.Td>

      <Table.Td>
        <ProjectCardActions
          item={item}
          onEdit={onEdit}
        />
      </Table.Td>
    </Table.Tr>
  );
}

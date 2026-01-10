import { dateTime } from '@/utils/datetime';
import { Badge, Group, Text, rem, ActionIcon, Indicator, ThemeIcon, Tooltip } from '@mantine/core';
import { IconTrash, IconCheck, IconBell } from '@tabler/icons-react';
import { useState } from 'react';

const stripHtml = value =>
  typeof value === 'string' ? value.replace(/<[^>]*>/g, '').trim() : value;

export default function Notification({ title, description, datetime, read, type, onDelete }) {
  const isApprovalNotification = type === 'work_report_approval';
  const [isHovered, setIsHovered] = useState(false);
  return (
    <Group
      wrap='nowrap'
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ position: 'relative' }}
    >
      <div style={{ position: 'relative' }}>
        <Indicator
          inline
          size={10}
          offset={7}
          position='top-end'
          color={read ? 'gray' : 'orange'}
          withBorder
          disabled={read}
        >
          <ThemeIcon
            size='lg'
            radius='md'
            variant='light'
            color={read ? 'gray' : 'blue'}
          >
            {read ? (
              <IconCheck style={{ width: rem(18), height: rem(18) }} />
            ) : (
              <IconBell style={{ width: rem(18), height: rem(18) }} />
            )}
          </ThemeIcon>
        </Indicator>
        {read && isHovered && onDelete && (
          <Tooltip
            label='delete'
            color='red'
            withArrow
          >
            <ActionIcon
              size='sm'
              color='red'
              variant='subtle'
              style={{
                position: 'absolute',
                top: -8,
                right: -8,
                zIndex: 10,
              }}
              onClick={e => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <IconTrash size={20} />
            </ActionIcon>
          </Tooltip>
        )}
      </div>
      <div
        className='content'
        style={{ position: 'relative' }}
      >
        {isApprovalNotification && (
          <Badge
            size='sm'
            color='orange'
            variant='light'
            style={{ position: 'absolute', top: 0, right: 0 }}
          >
            Approval
          </Badge>
        )}

        <Text
          fz={14}
          lh={rem(20)}
          pr={80}
        >
          {title}
        </Text>
        <Text
          fz={11}
          c='gray'
        >
          {dateTime(datetime)}
        </Text>

        <Text
          fz={11}
          c='blue'
          mt={6}
        >
          {stripHtml(description || 'No description')}
        </Text>
      </div>
    </Group>
  );
}

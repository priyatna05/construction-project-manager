import { Group, Text, Tooltip, rem } from '@mantine/core';
import { IconCircleX } from '@tabler/icons-react';
import { getIcon } from '@/components/helperLabel';
import classes from '@/components/css/FileThumbnail.module.css';

export default function Badges({ selected, onDelete, disabled = false }) {
  return (
    <Group
      gap='xs'
      mt='sm'
      wrap='wrap'
    >
      {selected.map(item => (
        <Group
          key={item.id}
          className={classes.file}
          gap='sm'
          wrap='nowrap'
          align='center'
          style={{
            opacity: disabled ? 0.7 : 1,
            cursor: disabled ? 'not-allowed' : 'default',
          }}
        >
          <div className={classes.iconContainer}>
            <div className={classes.icon}>
              {item.type && item.type.icon
                ? getIcon(item.type.icon, {
                    size: rem(16),
                    color: item.type.color || 'var(--mantine-color-blue-6)',
                  })
                : getIcon('IconTag', {
                    size: rem(16),
                    color: 'var(--mantine-color-blue-6)',
                  })}
            </div>

            {onDelete && !disabled && (
              <Tooltip
                label='Remove inventory'
                withArrow
                color='red'
                position='top'
                transitionProps={{ transition: 'fade', duration: 150 }}
              >
                <IconCircleX
                  className={classes.remove}
                  stroke={2.5}
                  size={28}
                  style={{
                    color: 'var(--mantine-color-red-6)',
                    cursor: 'pointer',
                    position: 'absolute',
                    top: rem(-10),
                    right: rem(-10),
                    background: 'white',
                    borderRadius: '50%',
                    padding: rem(4),
                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                  }}
                  onClick={() => onDelete(item)}
                />
              </Tooltip>
            )}
          </div>
          <div className={classes.text}>
            <Text
              fz={15}
              fw={400}
              truncate='end'
              title={item.name}
              style={{ cursor: 'default' }}
            >
              {item.name}
            </Text>
            <Text
              fz='xs'
              fw={300}
              c='dimmed'
              title={`${item.type?.name || '-'} / ${item.quantity || 0} / ${item.unit?.name || '-'}`}
              style={{ cursor: 'default' }}
            >
              {item.type?.name || '-'} / {item.quantity || 0} / {item.unit?.name || '-'}
            </Text>
          </div>
        </Group>
      ))}
    </Group>
  );
}

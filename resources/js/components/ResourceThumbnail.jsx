import { Avatar, Box, Group, Text, ActionIcon, rem, ThemeIcon } from '@mantine/core';
import { IconUsers, IconHammer, IconBox, IconCircleX, IconQuestionMark } from '@tabler/icons-react';

const typeConfig = {
  team: {
    icon: IconUsers,
    color: 'blue',
    label: 'Team',
  },
  tool: {
    icon: IconHammer,
    color: 'teal',
    label: 'Tool',
  },
  material: {
    icon: IconBox,
    color: 'orange',
    label: 'Material',
  },
};

export default function ResourceThumbnail({ resource, remove, open, index }) {
  const { name, type = 'unknown', image } = resource;
  const avatarSize = rem(45);

  const config = typeConfig[type] || {
    icon: IconQuestionMark,
    color: 'gray',
    label: 'Unknown',
  };

  const Icon = config.icon;

  return (
    <Group
      align='center'
      wrap='nowrap'
      spacing='sm'
      style={{
        border: '1px solid var(--mantine-color-gray-3)',
        borderRadius: rem(8),
        padding: rem(8),
        position: 'relative',
        width: '100%',
        minWidth: 180,
        maxWidth: 220,
        backgroundColor: 'var(--mantine-color-gray-0)',
      }}
    >
      <Box style={{ position: 'relative' }}>
        <Avatar
          src={image}
          alt={name}
          size={avatarSize}
          radius='md'
          onClick={open}
          style={{ cursor: 'pointer' }}
        />
        <ActionIcon
          color='red'
          variant='light'
          size='sm'
          style={{
            position: 'absolute',
            top: rem(-5),
            right: rem(-5),
            zIndex: 1,
          }}
          onClick={remove}
        >
          <IconCircleX size={14} />
        </ActionIcon>
      </Box>

      <Box style={{ overflow: 'hidden', flex: 1 }}>
        <Text
          size='sm'
          weight={500}
          truncate='end'
        >
          {name || `Resource ${index + 1}`}
        </Text>
        <Group
          gap={4}
          align='center'
        >
          <ThemeIcon
            size='sm'
            color={config.color}
            variant='light'
          >
            <Icon size={14} />
          </ThemeIcon>
          <Text
            size='xs'
            color='dimmed'
            truncate='end'
          >
            {config.label}
          </Text>
        </Group>
      </Box>
    </Group>
  );
}

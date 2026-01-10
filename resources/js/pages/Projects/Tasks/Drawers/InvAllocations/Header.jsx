import { Group, UnstyledButton, Title, Text, Tooltip, Badge, Flex } from '@mantine/core';
import { IconReorder } from '@tabler/icons-react';

export default function Header({ count, onOpenModal, disabled = false, lockReason }) {
  const disabledMessage = lockReason || 'View only - no permission to edit';

  return (
    <Group
      justify='space-between'
      align='center'
    >
      <Tooltip
        label={disabled ? disabledMessage : 'manage resource allocate to task'}
        color={disabled ? 'grey' : 'blue'}
        size='sm'
        zIndex={2200}
      >
        <UnstyledButton
          onClick={onOpenModal}
          disabled={disabled}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: 1,
          }}
        >
          <IconReorder
            size={30}
            color='blue'
            style={{ flexShrink: 0 }}
          />

          <Flex direction='column'>
            <Group
              align='center'
              gap='xs'
              mt='md'
            >
              <Title order={4}>Resources Task</Title>
              <Badge
                variant='light'
                size='md'
                color='blue'
              >
                ({count})
              </Badge>
            </Group>

            <Text
              size='sm'
              c='dimmed'
              mb='md'
            >
              {disabled
                ? disabledMessage
                : 'Allocate inventory resources needed for this task'}
            </Text>
          </Flex>
        </UnstyledButton>
      </Tooltip>
    </Group>
  );
}

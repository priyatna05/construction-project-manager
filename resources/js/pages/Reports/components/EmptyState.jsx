import { Center, Text } from '@mantine/core';

export default function EmptyState({ message, height = 160 }) {
  return (
    <Center h={height}>
      <Text
        size='sm'
        c='dimmed'
      >
        {message}
      </Text>
    </Center>
  );
}

import { Box, Group, Paper, Stack, Text } from '@mantine/core';

export default function SectionCard({
  title,
  description,
  rightSection,
  children,
  variant = 'card',
  ...wrapperProps
}) {
  const Wrapper = variant === 'card' ? Paper : Box;
  const props = variant === 'card'
    ? {
      withBorder: true,
      radius: 'md',
      p: { base: 'md', md: 'lg' },
      ...wrapperProps,
    }
    : { ...wrapperProps };
  const showHeader = Boolean(title || description || rightSection);

  if (variant !== 'card' && props.p === undefined) {
    props.p = 0;
  }

  return (
    <Wrapper {...props}>
      {showHeader && (
        <Group
          justify='space-between'
          align='flex-start'
          mb='sm'
          wrap='wrap'
        >
          <Stack gap={2}>
            <Text fw={600}>{title}</Text>
            {description && (
              <Text
                size='xs'
                c='dimmed'
              >
                {description}
              </Text>
            )}
          </Stack>
          {rightSection}
        </Group>
      )}
      {children}
    </Wrapper>
  );
}

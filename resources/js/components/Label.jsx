import { ColorSwatch, Group, Text } from '@mantine/core';
import * as TablerIcons from '@tabler/icons-react';

export function Label({ name, color, size = 10, dot = false, icon }) {
  const IconComponent = icon && TablerIcons[icon];
  const FallbackIcon = TablerIcons.IconCircle;

  return (
    <Group
      gap={5}
      my={2}
      wrap='nowrap'
    >
      {IconComponent ? (
        <IconComponent
          size={size + 4}
          color={color}
        />
      ) : (
        <FallbackIcon
          size={size + 4}
          color={color}
        />
      )}
      {dot && (
        <ColorSwatch
          color={color}
          size={size}
        />
      )}
      <Text
        fz={size}
        tt='uppercase'
        c={color}
        fw={500}
      >
        {name}
      </Text>
    </Group>
  );
}

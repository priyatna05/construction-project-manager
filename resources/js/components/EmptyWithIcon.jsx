import { Group, Text, rem } from '@mantine/core';

export default function EmptyWithIcon({
  title,
  description,
  icon: Icon,
  titleFontSize = 22,
  descriptionFontSize = 14,
  iconSize = 50,
  opacity = 0.6,
}) {
  return (
    <Group
      gap={20}
      opacity={opacity}
    >
      <Icon
        style={{
          width: rem(iconSize),
          height: rem(iconSize),
        }}
      />
      <div>
        <Text
          fz={titleFontSize}
          fw={600}
          lh={1.2}
        >
          {title}
        </Text>
        <Text
          fz={descriptionFontSize}
          opacity={0.6}
        >
          {description}
        </Text>
      </div>
    </Group>
  );
}

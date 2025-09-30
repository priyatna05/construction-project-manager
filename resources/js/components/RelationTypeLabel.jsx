import * as TablerIcons from '@tabler/icons-react';
import { Text } from '@mantine/core';
import upperFirst from 'lodash/upperFirst';

const FallbackIcon = TablerIcons.IconAlertCircle;

export default function RelationTypeLabel({ slug, name, icon, color, size = 14 }) {
  const IconComponent = TablerIcons[icon];

  const RenderIcon = IconComponent ?? FallbackIcon;

  if (!IconComponent) {
    console.warn(`🛑 Icon "${icon}" not found in @tabler/icons-react. Using fallback icon.`);
  }

  return (
    <Text
      span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        color: color ?? 'gray',
        fontSize: size,
        fontWeight: 500,
      }}
    >
      <RenderIcon
        size={size}
        stroke={1.5}
      />
      {upperFirst(name || slug || 'Unknown')}
    </Text>
  );
}

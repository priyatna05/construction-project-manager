import React from 'react';
import { Badge, Group, Text } from '@mantine/core';
import * as TablerIcons from '@tabler/icons-react';

const FallbackIcon = TablerIcons.IconAlertCircle;

export const getIcon = (iconName, props = { size: 16 }) => {
  if (iconName && TablerIcons[iconName]) {
    if (props.color && !/^#([0-9A-Fa-f]{3}){1,2}$/.test(props.color)) {
      props.color = 'currentColor';
    }
    return React.createElement(TablerIcons[iconName], props);
  }
  return React.createElement(FallbackIcon, props);
};

export const LabelDisplay = ({ label }) => {
  if (!label || !label.name) {
    return <Text component="span" c="dimmed">-</Text>;
  }

  return (
    <Group gap="xs" wrap="nowrap">
      {label.icon &&
        getIcon(label.icon, {
          size: 16,
          color:
            label.color && /^#([0-9A-Fa-f]{3}){1,2}$/.test(label.color)
              ? label.color
              : 'currentColor',
        })}
      <Text component="span" size="sm">{label.name}</Text>
    </Group>
  );
};


export const StatusBadge = ({ label }) => {
  if (!label || !label.name) {
    return (
      <Badge
        color='gray'
        variant='light'
      >
        Unknown
      </Badge>
    );
  }

  return (
    <Badge
      color={label.color || 'gray'}
      variant='light'
    >
      {label.name}
    </Badge>
  );
};

const formatLabelsForDropdown = (labels = []) => {
  if (!Array.isArray(labels)) {
    return [];
  }

  const filteredLabels = labels.filter(label => {
    const isValid = label && typeof label.slug === 'string' && typeof label.name === 'string';
    return isValid;
  });

  const mappedData = filteredLabels.map(label => ({
    value: label.slug,
    label: label.name,
    icon: label.icon,
    color: label.color,
  }));
  return mappedData;
};

export { formatLabelsForDropdown };

export const renderSelectOptionWithIcon = ({ option, checked }) => (
    <Group>
    {checked && <Text fw={900}>✓</Text>}
      {option.icon && getIcon(option.icon, { size: 16, color: option.color || 'currentColor' })}
      <Text>{option.label}</Text>
  </Group>
);

export const BadgeWithIcon = ({ label }) => {
  if (!label || !label.name) {
    return (
      <Badge color="gray" variant="light">
        Unknown
      </Badge>
    );
  }

  const iconEl =
    label.icon &&
    getIcon(label.icon, {
      size: 14,
      color:
        label.color && /^#([0-9A-Fa-f]{3}){1,2}$/.test(label.color)
          ? label.color
          : 'currentColor',
    });

  return (
    <Badge
      color={label.color || 'gray'}
      variant="light"
      leftSection={iconEl}
      styles={{
        root: { display: 'flex', alignItems: 'center', gap: 6 },
        label: { display: 'flex', alignItems: 'center', gap: 4 },
      }}
    >
      {label.name}
    </Badge>
  );
};

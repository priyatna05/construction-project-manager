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
  console.warn(`🛑 Icon "${iconName}" not found in @tabler/icons-react. Using fallback icon.`);
  return React.createElement(FallbackIcon, props);
};

export const LabelDisplay = ({ label }) => {
  if (!label || !label.name) {
    return <Text c='dimmed'>-</Text>;
  }

  return (
    <Group
      gap='xs'
      wrap='nowrap'
    >
      {label.icon &&
        getIcon(label.icon, {
          size: 16,
          color:
            label.color && /^#([0-9A-Fa-f]{3}){1,2}$/.test(label.color)
              ? label.color
              : 'currentColor',
        })}
      <Text size='sm'>{label.name}</Text>
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

export const renderSelectOptionWithIcon = ({ option }) => (
  <Group>
    {option.icon && getIcon(option.icon, { size: 16, color: option.color || 'currentColor' })}
    <Text>{option.label}</Text>
  </Group>
);

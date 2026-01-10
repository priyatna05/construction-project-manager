import { Group, MultiSelect, Text } from '@mantine/core';
import { useMemo } from 'react';

import { getIcon } from '@/components/helperLabel';

const buildStatusOption = (status, withValueIcon) => {
  const labelText = status.labelText ?? status.label ?? status.name ?? '';
  const icon = status.icon;
  const color = status.color;
  const iconEl = withValueIcon && icon
    ? getIcon(icon, { size: 14, color: color || 'currentColor' })
    : null;
  const label = iconEl ? (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
      {iconEl}
      <span style={{ lineHeight: 'inherit', fontSize: 'inherit' }}>{labelText}</span>
    </span>
  ) : (typeof status.label === 'undefined' ? labelText : status.label);

  return {
    ...status,
    value: String(status.slug ?? status.value ?? status.id ?? ''),
    labelText,
    icon,
    color,
    label,
  };
};

const StatusMultiSelectOption = ({ option, checked }) => (
  <Group>
    {checked && <span style={{ marginRight: 8 }}>✓</span>}
    {option.icon && getIcon(option.icon, { size: 16, color: option.color || 'currentColor' })}
    <Text>{option.labelText ?? option.label}</Text>
  </Group>
);

StatusMultiSelectOption.displayName = 'StatusMultiSelectOption';

const defaultFilter = ({ options, search, limit }) => {
  const query = search.trim().toLowerCase();

  if (!query) {
    return typeof limit === 'number' ? options.slice(0, limit) : options;
  }

  const max = typeof limit === 'number' ? limit : Infinity;
  const result = [];

  for (const option of options) {
    if (result.length >= max) {
      break;
    }

    const label = (option.labelText ?? option.value ?? '').toLowerCase();
    if (label.includes(query)) {
      result.push(option);
    }
  }

  return result;
};

const StatusMultiSelect = ({
  statuses = [],
  data,
  renderOption,
  filter,
  withValueIcon = true,
  ...props
}) => {
  const options = useMemo(() => {
    if (data) {
      return data.map(option => buildStatusOption(option, withValueIcon));
    }

    return (statuses || []).map(status => buildStatusOption(status, withValueIcon));
  }, [data, statuses, withValueIcon]);

  return (
    <MultiSelect
      data={options}
      renderOption={renderOption ?? StatusMultiSelectOption}
      filter={filter ?? defaultFilter}
      {...props}
    />
  );
};

StatusMultiSelect.displayName = 'StatusMultiSelect';

export default StatusMultiSelect;

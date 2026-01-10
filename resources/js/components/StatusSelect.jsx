import { Select } from '@mantine/core';
import { useMemo } from 'react';

import { getIcon, renderSelectOptionWithIcon } from '@/components/helperLabel';

const buildStatusOption = status => ({
  value: String(status.slug ?? status.value ?? status.id ?? ''),
  label: status.name ?? status.label ?? '',
  icon: status.icon,
  color: status.color,
});

const getDefaultLeftSection = (options, value) => {
  if (!value) return null;

  const selected = options.find(option => option.value === String(value));
  if (!selected || !selected.icon) return null;

  return (
    <span style={{ color: selected.color, display: 'flex', alignItems: 'center' }}>
      {getIcon(selected.icon, { size: 18 })}
    </span>
  );
};

const StatusSelect = ({ statuses = [], data, value, leftSection, renderOption, ...props }) => {
  const options = useMemo(() => {
    if (data) {
      return data;
    }

    return (statuses || []).map(buildStatusOption);
  }, [data, statuses]);

  const resolvedLeftSection = useMemo(() => {
    if (leftSection !== undefined) {
      return leftSection;
    }

    return getDefaultLeftSection(options, value);
  }, [leftSection, options, value]);

  return (
    <Select
      data={options}
      value={value}
      leftSection={resolvedLeftSection}
      renderOption={renderOption ?? renderSelectOptionWithIcon}
      {...props}
    />
  );
};

StatusSelect.displayName = 'StatusSelect';

export default StatusSelect;

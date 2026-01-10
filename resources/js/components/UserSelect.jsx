import { Avatar, Select, Text } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { useMemo } from 'react';

import { getInitials } from '@/utils/user';

const buildUserOption = user => {
  const labelText = user.label ?? user.name ?? '';
  const avatar = user.avatar ?? user.avatar_url ?? null;
  const initial = user.initial ?? getInitials(labelText);

  return {
    value: String(user.value ?? user.id),
    label: labelText,
    labelText,
    avatar,
    initial,
  };
};

const UserSelectOption = ({ option, checked, ...others }) => {
  const label = option.labelText ?? (typeof option.label === 'string' ? option.label : option.value);
  const initial = option.initial ?? getInitials(label ?? '');

  return (
    <div
      {...others}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {checked && <IconCheck size={16} />}
        <Avatar
          size='xs'
          radius='xl'
          src={option.avatar}
          >
          {initial}
        </Avatar>
          <Text>{label}</Text>
      </div>
    </div>
  );
};

UserSelectOption.displayName = 'UserSelectOption';

const getDefaultLeftSection = (data, value) => {
  if (!value) return null;

  const selectedOption = data.find(opt => String(opt.value ?? '') === String(value));
  if (!selectedOption) return null;

  const label =
    selectedOption.labelText ??
    (typeof selectedOption.label === 'string' ? selectedOption.label : '') ??
    '';
  const initial = selectedOption.initial ?? getInitials(label || String(selectedOption.value ?? ''));

  return (
    <Avatar
      size='xs'
      radius='xl'
      src={selectedOption.avatar}
      title={label}
    >
      {initial}
    </Avatar>
  );
};

const UserSelect = ({
  users = [],
  data,
  value,
  leftSection,
  renderOption,
  ...props
}) => {
  const options = useMemo(() => {
    if (data) {
      return data;
    }

    return (users || []).map(buildUserOption);
  }, [users, data]);

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
      renderOption={renderOption ?? UserSelectOption}
      {...props}
    />
  );
};

UserSelect.displayName = 'UserSelect';

export default UserSelect;

import { Avatar, MultiSelect, Text } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { useMemo } from 'react';

import { getInitials } from '@/utils/user';

const buildUserOption = user => {
  const labelText = user.label ?? user.name ?? '';
  const avatar = user.avatar ?? user.avatar_url ?? null;
  const initial = user.initial ?? getInitials(labelText);

  return {
    value: String(user.value ?? user.id),
    labelText,
    avatar,
    initial,
    label: (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
        <Avatar
          component='span'
          size={14}
          radius='xl'
          src={avatar}
        >
          {initial}
        </Avatar>
        <Text
          component='span'
          style={{ lineHeight: 'inherit', fontSize: 'inherit' }}
        >
          {labelText}
        </Text>
      </span>
    ),
  };
};

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

const UserMultiSelectOption = ({ option, checked, ...others }) => {
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

UserMultiSelectOption.displayName = 'UserMultiSelectOption';

const UserMultiSelect = ({
  users = [],
  data,
  styles,
  filter,
  renderOption,
  ...props
}) => {
  const options = useMemo(() => {
    if (data) {
      return data;
    }

    return (users || []).map(buildUserOption);
  }, [users, data]);

  return (
    <MultiSelect
      data={options}
      styles={styles}
      filter={filter ?? defaultFilter}
      renderOption={renderOption ?? UserMultiSelectOption}
      {...props}
    />
  );
};

UserMultiSelect.displayName = 'UserMultiSelect';

export default UserMultiSelect;

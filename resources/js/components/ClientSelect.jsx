import { Avatar, Select, Text } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { useMemo } from 'react';

import CompanyItem from '@/components/CompanyItem';
import { getInitials } from '@/utils/user';

const getOptionValue = option => String(option?.value ?? '');

const isUserOption = (option, userPrefix) => getOptionValue(option).startsWith(userPrefix);

const defaultRenderOption = (userPrefix) => {
  const ClientSelectOption = ({ option, checked, ...others }) => {
    if (isUserOption(option, userPrefix)) {
      const label = option.label ?? option.labelText ?? option.value ?? '';
      const initial = option.initial ?? getInitials(label);

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
            <Text>{label}</Text>
            <Avatar
              size='xs'
              radius='xl'
              src={option.avatar}
            >
              {initial}
            </Avatar>
          </div>
        </div>
      );
    }

    return (
      <div
        {...others}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}
      >
        {checked && <IconCheck size={16} />}
        <CompanyItem
          label={option.label}
          option={option}
        />
      </div>
    );
  };

  ClientSelectOption.displayName = 'ClientSelectOption';

  return ClientSelectOption;
};

const getDefaultLeftSection = (data, value, userPrefix) => {
  if (!value) return null;

  const selectedOption = data.find(opt => getOptionValue(opt) === String(value));
  if (!selectedOption) return null;

  if (isUserOption(selectedOption, userPrefix)) {
    const label = selectedOption.label ?? selectedOption.labelText ?? selectedOption.value ?? '';
    const initial = selectedOption.initial ?? getInitials(label);

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
  }

  const firstUser = selectedOption.users?.[0];
  if (!firstUser) return null;

  const userInitial = firstUser.initial ?? getInitials(firstUser.full_name ?? '');
  return (
    <Avatar
      size='xs'
      radius='xl'
      src={firstUser.avatar ?? firstUser.avatar_url}
      title={`${selectedOption.label} (${firstUser.full_name})`}
    >
      {userInitial}
    </Avatar>
  );
};

const ClientSelect = ({
  data = [],
  value,
  userPrefix = 'user_',
  leftSection,
  renderOption,
  ...props
}) => {
  const resolvedLeftSection = useMemo(() => {
    if (leftSection !== undefined) {
      return leftSection;
    }

    return getDefaultLeftSection(data, value, userPrefix);
  }, [data, leftSection, userPrefix, value]);

  return (
    <Select
      data={data}
      value={value}
      leftSection={resolvedLeftSection}
      renderOption={renderOption ?? defaultRenderOption(userPrefix)}
      {...props}
    />
  );
};

ClientSelect.displayName = 'ClientSelect';

export default ClientSelect;

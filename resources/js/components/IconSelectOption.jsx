import { Group, Text } from '@mantine/core';
import * as TablerIcons from '@tabler/icons-react';

const IconSelectOption = ({ option, checked }) => {
  const IconComponent = TablerIcons[option.value];
  const CheckIcon = TablerIcons.IconCheck;

  return (
    <Group gap="xs" wrap="nowrap">
      {checked && CheckIcon && <CheckIcon size={16} />}
      {IconComponent ? <IconComponent size={18} stroke={1.5} /> : null}
      <Text>{option.label}</Text>
    </Group>
  );
};

export default IconSelectOption;

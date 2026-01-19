import { Group, Text } from '@mantine/core';

const IconSelectOption = ({ option, checked }) => (
  <Group gap="xs" wrap="nowrap">
    <Text fw={checked ? 600 : 400}>{option.label}</Text>
  </Group>
);

export default IconSelectOption;

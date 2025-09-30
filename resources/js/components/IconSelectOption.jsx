import { forwardRef } from 'react';
import { Group, Text } from '@mantine/core';
import * as TablerIcons from '@tabler/icons-react';

const IconSelectOption = forwardRef(({ value, label, ...others }, ref) => {
  const IconComponent = TablerIcons[value];

  return (
    <div ref={ref} {...others}>
      <Group gap="xs" wrap="nowrap">
        {IconComponent ? (
          <IconComponent size={18} stroke={1.5} />
        ) : (
          <div style={{ width: 18, height: 18, background: 'red' }} />
        )}
        <Text>{label}</Text>
      </Group>
    </div>
  );
});

IconSelectOption.displayName = 'IconSelectOption';
export default IconSelectOption;

import { Box, Autocomplete, rem, Text } from '@mantine/core';
import { IconLock } from '@tabler/icons-react';
import { useInvAllocationsTask } from '../../../../../hooks/useInvAllocationsTask';
import Header from './Header';
import Bedges from './Badges';
import ModalInvAllocations from './Modal';

export default function InvAllocations({
  selected = [],
  onChange,
  availableResources = [],
  disabled = false,
  isLocked = false,
  ...props
}) {
  const isDisabled = disabled || isLocked;
  const lockMessage = isLocked
    ? 'This task is locked because the project is completed.'
    : 'This field is locked due to insufficient permissions.';
  const hook = useInvAllocationsTask({
    selected,
    onChange,
    availableResources,
    disabled: isDisabled,
  });

  return (
    <Box {...props}>
      <Header
        count={selected.length}
        onOpenModal={isDisabled ? undefined : hook.open}
        disabled={isDisabled}
        lockReason={isLocked ? lockMessage : undefined}
      />

      <Autocomplete
        mt='xs'
        placeholder='Search and add resources...'
        value={hook.searchValue}
        onChange={hook.setSearchValue}
        onOptionSubmit={hook.handleAdd}
        data={hook.autocompleteOptions}
        clearable
        disabled={isDisabled}
        comboboxProps={{ withinPortal: true, zIndex: 3500 }}
        styles={{
          input: {
            fontSize: rem(14),
          },
        }}
      />
      {isDisabled && (
        <Box mt="xs" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <IconLock size={16} />
          <Text size="sm" c="dimmed">
            {lockMessage}
          </Text>
        </Box>
      )}

      <Bedges
        selected={selected}
        onDelete={isDisabled ? undefined : hook.confirmDelete}
        disabled={isDisabled}
      />

      <ModalInvAllocations
        {...hook}
        selected={selected}
        onChange={onChange}
        availableResources={availableResources}
        disabled={isDisabled}
      />
    </Box>
  );
}

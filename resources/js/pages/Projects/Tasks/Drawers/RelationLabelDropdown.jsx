import {
  Box,
  CheckIcon,
  Combobox,
  Group,
  Input,
  Pill,
  PillsInput,
  rem,
  useCombobox,
} from '@mantine/core';
import RelationTypeLabel from '@/components/RelationTypeLabel';

export default function RelationDropdown({
  items = [],
  value = '',
  onChange,
  allowedNames = [],
  disabled = false,
  ...props
}) {
  const combobox = useCombobox({
    onDropdownClose: () => {
      combobox.resetSelectedOption();
      combobox.updateSelectedOptionIndex('active');
    },
    onDropdownOpen: () => combobox.updateSelectedOptionIndex('active'),
  });

  const handleSelect = val => {
    if (val === value) return;
    onChange?.(val);
    combobox.closeDropdown();
  };

  const selected = items.find(i => i?.value != null && i.value.toString() === value?.toString());

  return (
    <Box {...props}>
      <Input.Label>Task Relation Type</Input.Label>

      <Combobox
        store={combobox}
        onOptionSubmit={handleSelect}
        withinPortal={false}
        disabled={disabled}
      >
        <Combobox.DropdownTarget>
          <PillsInput
            pointer
            onClick={() => combobox.toggleDropdown()}
          >
            <Pill.Group style={{ rowGap: rem(3), columnGap: rem(12) }}>
              {selected ? (
                <RelationTypeLabel
                  slug={selected.slug}
                  name={selected.name}
                  icon={selected.icon}
                  color={selected.color}
                />
              ) : (
                <Input.Placeholder>Select relation type</Input.Placeholder>
              )}

              <Combobox.EventsTarget>
                <PillsInput.Field type='hidden' />
              </Combobox.EventsTarget>
            </Pill.Group>
          </PillsInput>
        </Combobox.DropdownTarget>

        <Combobox.Dropdown>
          <Combobox.Options>
            {items
              .filter(item => item?.value != null)
              .filter(item => (allowedNames.length > 0 ? allowedNames.includes(item.name) : true))
              .map(item => (
                <Combobox.Option
                  value={item.value.toString()}
                  key={item.value}
                  active={value?.toString() === item.value.toString()}
                >
                  <Group gap='sm'>
                    {value?.toString() === item.value.toString() && <CheckIcon size={12} />}
                    <RelationTypeLabel
                      slug={item.slug}
                      name={item.name}
                      icon={item.icon}
                      color={item.color}
                    />
                  </Group>
                </Combobox.Option>
              ))}
          </Combobox.Options>
        </Combobox.Dropdown>
      </Combobox>
    </Box>
  );
}

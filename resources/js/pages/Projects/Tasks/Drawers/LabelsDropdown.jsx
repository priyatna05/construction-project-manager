import { Label } from '@/components/Label';
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
  Text,
} from '@mantine/core';

export default function LabelsDropdown({
  items = [],
  selected = [],
  onChange,
  filterTypes = [],
  readOnly = false,
  ...props
}) {
  const combobox = useCombobox({
    onDropdownClose: () => {
      combobox.resetSelectedOption();
      combobox.updateSelectedOptionIndex('active');
    },
    onDropdownOpen: () => combobox.updateSelectedOptionIndex('active'),
  });

  const handleValueSelect = (val) => {
    if (readOnly) return;

    onChange?.(
      selected.includes(val) ? selected.filter((v) => v !== val) : [...selected, val]
    );
  };

  const handleValueRemove = (val) => {
    if (readOnly) return;
    onChange?.(selected.filter((v) => v !== val));
  };

  const disabledFieldStyles = readOnly
    ? {
        opacity: 0.6,
        cursor: 'not-allowed',
        backgroundColor: 'var(--mantine-color-gray-0)',
        borderColor: 'var(--mantine-color-gray-3)',
      }
    : { cursor: 'pointer' };

  return (
    <Box {...props}>
      <Input.Label>Status</Input.Label>
      <Text
        size='xs'
        c='dimmed'
      >
        Current status or phase of the task
      </Text>
      <Combobox
        store={combobox}
        onOptionSubmit={handleValueSelect}
        withinPortal={false}
        disabled={readOnly}
      >
        <Combobox.DropdownTarget>
          <PillsInput
            pointer
            onClick={() => {
              if (readOnly) return;
              combobox.toggleDropdown();
            }}
            data-disabled={readOnly || undefined}
            style={disabledFieldStyles}
          >
            <Pill.Group style={{ rowGap: rem(3), columnGap: rem(12) }}>
              {selected?.length > 0 ? (
                selected.map(id => {
                  const label = items.find(i => i.id === id);
                  if (!label) return null;
                  return (
                      <Label
                      key={label.id}
                        name={label.name}
                        color={label.color}
                        icon={label.icon}
                        size={11}
                        onRemove={readOnly ? undefined : () => handleValueRemove(label.id)}
                      />
                  );
                })
              ) : (
                <Input.Placeholder>Select status</Input.Placeholder>
              )}

              <Combobox.EventsTarget>
                <PillsInput.Field
                  type='hidden'
                  style={{ opacity: readOnly ? 0.6 : 1 }}
                  onBlur={() => combobox.closeDropdown()}
                  onKeyDown={(event) => {
                    if (readOnly) return;

                    if (event.key === 'Backspace' && selected?.length > 0) {
                      event.preventDefault();
                      handleValueRemove(selected[selected.length - 1]);
                    }
                  }}
                />
              </Combobox.EventsTarget>
            </Pill.Group>
          </PillsInput>
        </Combobox.DropdownTarget>

        <Combobox.Dropdown>
          <Combobox.Options>
            {items
              .filter(label => filterTypes.length === 0 || filterTypes.includes(label.type))
              .map(label => (
                <Combobox.Option
                  value={label.id}
                  key={label.id}
                  active={selected?.includes(label.id)}
                >
                  <Group gap='sm'>
                    {selected?.includes(label.id) ? <CheckIcon size={12} /> : null}
                    <Group gap={7}>
                      <Label
                        name={label.name}
                        color={label.color}
                        icon={label.icon}
                        size={11}
                        onRemove={() => handleValueRemove(label)}
                      />
                    </Group>
                  </Group>
                </Combobox.Option>
              ))}
          </Combobox.Options>
        </Combobox.Dropdown>
      </Combobox>
    </Box>
  );
}

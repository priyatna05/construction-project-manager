import { Label } from "@/components/Label";
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
} from "@mantine/core";
import useAuthorization from "@/hooks/useAuthorization";

export default function LabelsDropdown({ items = [], selected = [], onChange, ...props }) {
  const { can } = useAuthorization() || { can: () => true };
  const combobox = useCombobox({
    onDropdownClose: () => {
      combobox.resetSelectedOption();
      combobox.updateSelectedOptionIndex("active");
    },
    onDropdownOpen: () => combobox.updateSelectedOptionIndex("active"),
  });

  const handleValueSelect = (val) =>
    onChange?.(selected.includes(val) ? selected.filter((v) => v !== val) : [...selected, val]);

  const handleValueRemove = (val) => onChange?.(selected.filter((v) => v !== val));

  return (
    <Box {...props}>
      <Input.Label>Labels</Input.Label>
      <Combobox
        store={combobox}
        onOptionSubmit={handleValueSelect}
        withinPortal={false}
        disabled={!can("edit task")}
      >
        <Combobox.DropdownTarget>
          <PillsInput pointer onClick={() => combobox.toggleDropdown()}>
            <Pill.Group style={{ rowGap: rem(3), columnGap: rem(12) }}>
              {selected?.length > 0 ? (
                selected.map((id) => {
                  const label = items.find((i) => i.id === id);
                  if (!label) return null;

                  return (
                    <Label
                      key={label.id}
                      name={label.name}
                      color={label.color}
                      size={11}
                      onRemove={() => handleValueRemove(label)}
                    />
                  );
                })
              ) : (
                <Input.Placeholder>Select labels</Input.Placeholder>
              )}

              <Combobox.EventsTarget>
                <PillsInput.Field
                  type="hidden"
                  onBlur={() => combobox.closeDropdown()}
                  onKeyDown={(event) => {
                    if (event.key === "Backspace" && selected?.length > 0) {
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
            {items.map((label) => (
              <Combobox.Option
                value={label.id}
                key={label.id}
                active={selected?.includes(label.id)}
              >
                <Group gap="sm">
                  {selected?.includes(label.id) ? <CheckIcon size={12} /> : null}
                  <Group gap={7}>
                    <Label
                      name={label.name}
                      color={label.color}
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

import { getIcon } from '@/components/helperLabel';
import {
  FORMAT_OPTIONS,
  PERIOD_OPTIONS,
  REPORT_TYPES,
  RESOURCE_TYPES,
  TEMPLATE_OPTIONS,
} from '@/utils/reportConfig';
import {
  ActionIcon,
  Box,
  Button,
  Group,
  MultiSelect,
  Popover,
  Select,
  Stack,
  Text,
  Tooltip,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import { IconCalendarEvent, IconFileExport, IconPackageExport } from '@tabler/icons-react';

const renderOptionWithIcon = ({ option }) => (
  <Group gap='xs'>
    {option.icon ? getIcon(option.icon, { size: 16, color: option.color }) : null}
    <Text size='sm'>{option.label}</Text>
  </Group>
);

const resolveOptionIcon = (options, value) => {
  const selected = options.find(option => String(option.value) === String(value));
  if (!selected?.icon) return null;
  return getIcon(selected.icon, { size: 16, color: selected.color });
};

const resolveMultiOptionIcon = (options, values) => {
  if (!Array.isArray(values) || values.length === 0) return null;
  if (values.length === 1) return resolveOptionIcon(options, values[0]);
  return getIcon('IconDots', { size: 16, color: '#adb5bd' });
};

const projectDropdownStyles = {
  dropdown: {
    width: 'max-content',
    maxWidth: 500,
  },
  option: {
    whiteSpace: 'normal',
    lineHeight: 1.35,
  },
};

const comboboxBaseProps = {
  withinPortal: true,
  position: 'left-start',
  withArrow: true,
  arrowPosition: 'side',
  offset: 8,
  shadow: 'md',
};

export default function ExportSetting({
  form,
  projectOptions,
  dateRange,
  onSubmit,
  onDateRangeChange,
  updateValue,
}) {
  const [opened, { close, open }] = useDisclosure(false);
  const formData = form?.data || {};
  const safeProjectOptions = Array.isArray(projectOptions) ? projectOptions : [];
  const safeDateRange = Array.isArray(dateRange) ? dateRange : [null, null];
  const handleDateRangeChange =
    typeof onDateRangeChange === 'function' ? onDateRangeChange : () => {};
  const handleUpdate = typeof updateValue === 'function' ? updateValue : () => {};
  const handleSubmit = typeof onSubmit === 'function' ? onSubmit : () => {};
  const filtersEnabled = Boolean(form && updateValue);
  const isProcessing = Boolean(form?.processing);
  const currentReportType = formData.report_type || 'evm';
  const currentProject = formData.project || 'all';
  const currentPeriod = formData.period || 'month';
  const currentResourceTypes = Array.isArray(formData.resource_types)
    ? formData.resource_types
    : [];
  const currentFormat = formData.format || 'pdf';
  const currentTemplate = formData.template || 'executive';

  return (
    <Popover
      width={260}
      position='bottom-end'
      withArrow
      shadow='md'
      opened={opened}
      onClose={close}
    >
      <Popover.Target>
        <Tooltip
          label='Export settings'
          position='top'
          withArrow
        >
          <ActionIcon
            color='indigo'
            radius='md'
            variant={opened ? 'filled' : 'light'}
            onClick={() => (opened ? close() : open())}
            aria-label='Filters'
          >
            {opened ? <IconPackageExport size={18} /> : <IconFileExport size={18} />}
          </ActionIcon>
        </Tooltip>
      </Popover.Target>

      <Popover.Dropdown>
        <Stack gap='xs'>
          <Box>
            <Text
              size='xs'
              fw={600}
              c='dimmed'
            >
              Report type
            </Text>
            <Select
              aria-label='Report type'
              size='xs'
              clearable
              data={REPORT_TYPES}
              value={currentReportType}
              onChange={value => handleUpdate('report_type', value || 'evm')}
              comboboxProps={comboboxBaseProps}
              leftSection={resolveOptionIcon(REPORT_TYPES, currentReportType)}
              renderOption={renderOptionWithIcon}
              disabled={!filtersEnabled}
            />
          </Box>
          <Box>
            <Text
              size='xs'
              fw={600}
              c='dimmed'
            >
              Project
            </Text>
            <Select
              aria-label='Project'
              size='xs'
              clearable
              searchable
              data={safeProjectOptions}
              value={currentProject}
              onChange={value => handleUpdate('project', value || 'all')}
              comboboxProps={{ ...comboboxBaseProps, width: 420 }}
              leftSection={resolveOptionIcon(safeProjectOptions, currentProject)}
              renderOption={renderOptionWithIcon}
              styles={projectDropdownStyles}
              disabled={!filtersEnabled}
            />
          </Box>
          <Box>
            <Text
              size='xs'
              fw={600}
              c='dimmed'
            >
              Period
            </Text>
            <Select
              aria-label='Period'
              size='xs'
              data={PERIOD_OPTIONS}
              value={currentPeriod}
              onChange={value => handleUpdate('period', value)}
              leftSection={resolveOptionIcon(PERIOD_OPTIONS, currentPeriod)}
              renderOption={renderOptionWithIcon}
              comboboxProps={comboboxBaseProps}
              disabled={!filtersEnabled}
            />
          </Box>
          <Box>
            <Text
              size='xs'
              fw={600}
              c='dimmed'
            >
              Date range
            </Text>
            <DatePickerInput
              type='range'
              value={safeDateRange}
              onChange={handleDateRangeChange}
              clearable
              size='xs'
              placeholder='Select range'
              leftSection={<IconCalendarEvent size={16} />}
              popoverProps={{
                withinPortal: true,
                position: 'left-start',
                withArrow: true,
                arrowPosition: 'side',
                offset: 8,
                shadow: 'md',
              }}
              disabled={!filtersEnabled}
            />
          </Box>
          <Box>
            <Text
              size='xs'
              fw={600}
              c='dimmed'
            >
              Resource type
            </Text>
            <MultiSelect
              aria-label='Resource type'
              size='xs'
              clearable
              placeholder='Select type'
              data={RESOURCE_TYPES}
              value={currentResourceTypes}
              onChange={value => handleUpdate('resource_types', value)}
              comboboxProps={comboboxBaseProps}
              leftSection={resolveMultiOptionIcon(RESOURCE_TYPES, currentResourceTypes)}
              renderOption={renderOptionWithIcon}
              disabled={!filtersEnabled}
            />
          </Box>
          <Box>
            <Text
              size='xs'
              fw={600}
              c='dimmed'
            >
              Format
            </Text>
            <Select
              aria-label='Format'
              size='xs'
              data={FORMAT_OPTIONS}
              value={currentFormat}
              onChange={value => handleUpdate('format', value)}
              leftSection={resolveOptionIcon(FORMAT_OPTIONS, currentFormat)}
              renderOption={renderOptionWithIcon}
              comboboxProps={comboboxBaseProps}
              disabled={!filtersEnabled}
            />
          </Box>
          <Box>
            <Text
              size='xs'
              fw={600}
              c='dimmed'
            >
              Template
            </Text>
            <Select
              aria-label='Template'
              size='xs'
              clearable
              data={TEMPLATE_OPTIONS}
              value={currentTemplate}
              onChange={value => handleUpdate('template', value || 'executive')}
              comboboxProps={comboboxBaseProps}
              leftSection={resolveOptionIcon(TEMPLATE_OPTIONS, currentTemplate)}
              renderOption={renderOptionWithIcon}
              disabled={!filtersEnabled}
            />
          </Box>
          <Box>
            <Button
              fullWidth
              size='xs'
              mt='sm'
              onClick={handleSubmit}
              loading={isProcessing}
              leftSection={<IconFileExport size={14} />}
            >
              Generate Export
            </Button>
          </Box>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
}

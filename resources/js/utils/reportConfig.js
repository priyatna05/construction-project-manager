import dayjs from '@/utils/dayjsConfig';

export const REPORT_TYPES = [
  { value: 'evm', label: 'EVM Analytics', icon: 'IconChartLine', color: '#228be6' },
  { value: 'resource_usage', label: 'Resource Usage', icon: 'IconChartPie', color: '#15aabf' },
  { value: 'task_status', label: 'Task Status', icon: 'IconListDetails', color: '#fab005' },
  { value: 'inventory_movement', label: 'Inventory Movement', icon: 'IconBox', color: '#82c91e' },
];

export const FORMAT_OPTIONS = [
  { value: 'docx', label: 'DOCX', icon: 'IconFileTypeDocx', color: '#4c6ef5' },
  { value: 'pdf', label: 'PDF', icon: 'IconFileTypePdf', color: '#fa5252' },
  { value: 'excel', label: 'Excel (.xlsx)', icon: 'IconFileTypeXls', color: '#2f9e44' },
];

export const TEMPLATE_OPTIONS = [
  { value: 'executive', label: 'Executive Summary', icon: 'IconFileText', color: '#228be6' },
  { value: 'detailed', label: 'Detailed', icon: 'IconListDetails', color: '#15aabf' },
  { value: 'audit', label: 'Audit Log', icon: 'IconReportAnalytics', color: '#fab005' },
];

export const PERIOD_OPTIONS = [
  { value: 'day', label: 'Day', icon: 'IconCalendarEvent', color: '#228be6' },
  { value: 'week', label: 'Week', icon: 'IconCalendarTime', color: '#15aabf' },
  { value: 'month', label: 'Month', icon: 'IconCalendarMonth', color: '#fab005' },
  { value: 'year', label: 'Year', icon: 'IconCalendar', color: '#82c91e' },
];

export const RESOURCE_TYPES = [
  { value: 'labor', label: 'Labor', icon: 'IconUsers', color: '#228be6' },
  { value: 'equipment', label: 'Equipment', icon: 'IconTool', color: '#15aabf' },
  { value: 'material', label: 'Material', icon: 'IconTruck', color: '#fab005' },
  { value: 'service', label: 'Service', icon: 'IconBriefcase', color: '#82c91e' },
  { value: 'other', label: 'Other', icon: 'IconDots', color: '#adb5bd' },
];

export const RESOURCE_COLORS = ['#228be6', '#15aabf', '#82c91e', '#fab005', '#fa5252'];

export const resolveStatusColor = status => {
  const value = (status || '').toLowerCase();
  if (value === 'done') return 'green';
  if (value === 'failed') return 'red';
  if (value === 'processing') return 'blue';
  return 'yellow';
};

export const resolveWorkReportStatusColor = status => {
  const value = (status || '').toLowerCase();
  if (value.includes('approved')) return 'green';
  if (value.includes('rejected')) return 'red';
  if (value.includes('pending')) return 'yellow';
  return 'gray';
};

export const resolveProjectStatus = metric => {
  const cpi = metric?.cpi;
  const spi = metric?.spi;
  if (cpi === null && spi === null) {
    return { label: 'No data', color: 'gray' };
  }
  const atRisk = (cpi !== null && cpi < 1) || (spi !== null && spi < 1);
  return atRisk
    ? { label: 'At risk', color: 'red' }
    : { label: 'On track', color: 'green' };
};

export const formatDateTime = value => {
  if (!value) return '-';
  return dayjs(value).format('DD MMM YYYY, HH:mm');
};

export const formatFilterSummary = filters => {
  if (!filters) return 'All projects';
  const projectLabel = filters.project_name
    || (filters.project && filters.project !== 'all' ? `Project ${filters.project}` : 'All projects');
  const period = filters.start && filters.end
    ? `${filters.start} to ${filters.end}`
    : filters.period || 'month';
  return `${projectLabel} at ${period}`;
};

export const formatIndexValue = value => (
  value === null || value === undefined ? '--' : Number(value).toFixed(2)
);

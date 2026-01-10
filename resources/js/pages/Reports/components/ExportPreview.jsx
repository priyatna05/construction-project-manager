import { useMemo, useState } from 'react';
import {
  Badge,
  Box,
  Group,
  Paper,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import dayjs from '@/utils/dayjsConfig';
import { formatCompact, formatCurrency } from '@/utils/currency';
import EmptyState from './EmptyState';
import SectionCard from './SectionCard';
import {
  REPORT_TYPES,
  RESOURCE_COLORS,
  resolveProjectStatus,
  resolveWorkReportStatusColor,
  formatIndexValue,
} from '../../../utils/reportConfig';
import { stripHtml } from '@/utils/commentConfig';
import classes from '../css/ReportPreview.module.css';
import ExportSetting from './ExportSetting';

const formatDate = value => (value ? dayjs(value).format('DD MMM YYYY') : '-');
const formatDateTime = value => (value ? dayjs(value).format('DD MMM YYYY, HH:mm') : '-');
const formatPercent = value =>
  value === null || value === undefined ? '-' : `${Number(value).toFixed(1)}%`;
const formatMaybeCurrency = value =>
  value === null || value === undefined ? '-' : formatCurrency(Number(value));
const formatMaybeNumber = value =>
  value === null || value === undefined ? '-' : Number(value).toLocaleString('id-ID');
const formatPeriodLabel = filters => {
  if (filters?.start && filters?.end) {
    return `${formatDate(filters.start)} - ${formatDate(filters.end)}`;
  }
  const period = filters?.period ? String(filters.period) : 'month';
  return period.charAt(0).toUpperCase() + period.slice(1);
};
const axisCompact = value => {
  if (typeof value !== 'number') return value;
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value;
};


const SummaryCard = ({ label, value, helper }) => (
  <Box className={classes.summaryCard}>
    <Text className={classes.summaryLabel}>{label}</Text>
    <Text className={classes.summaryValue}>{value}</Text>
    {helper && (
      <Text
        size='xs'
        c='dimmed'
      >
        {helper}
      </Text>
    )}
  </Box>
);

const DocumentSection = ({ title, description, children }) => (
  <Box className={classes.section}>
    <Text className={classes.sectionTitle}>{title}</Text>
    {description && <Text className={classes.sectionIntro}>{description}</Text>}
    {children}
  </Box>
);

const TableScroll = ({ minWidth = 640, children }) => (
  <Table.ScrollContainer
    miw={minWidth}
    className={classes.reportTable}
  >
    {children}
  </Table.ScrollContainer>
);

const EmptyRow = ({ colSpan, message }) => (
  <Table.Tr>
    <Table.Td colSpan={colSpan}>
      <Text
        size='xs'
        c='dimmed'
      >
        {message}
      </Text>
    </Table.Td>
  </Table.Tr>
);

const KeyValueTable = ({ rows }) => (
  <Table
    className={classes.kvTable}
    verticalSpacing='xs'
  >
    <Table.Tbody>
      {rows.map(row => (
        <Table.Tr key={row.label}>
          <Table.Td>{row.label}</Table.Td>
          <Table.Td>{row.value}</Table.Td>
        </Table.Tr>
      ))}
    </Table.Tbody>
  </Table>
);

const ChartBlock = ({ title, height = 240, empty, children }) => (
  <Box className={classes.chartFrame}>
    <Text className={classes.chartLabel}>{title}</Text>
    {empty ? (
      <EmptyState
        message='No data available.'
        height={height}
      />
    ) : (
      children
    )}
  </Box>
);

const ReportHeader = ({ reportTypeLabel, projectName, periodLabel, generatedAt, status }) => (
  <Group
    className={classes.pageHeader}
    justify='space-between'
    align='flex-start'
  >
    <Group
      gap='md'
      align='center'
    >
      <Box className={classes.logoMark} />
      <Box>
        <Title
          order={3}
          className={classes.headerTitle}
        >
          Project Report
        </Title>
        <Text className={classes.subTitle}>{reportTypeLabel}</Text>
      </Box>
    </Group>
    <Stack
      gap={4}
      className={classes.headerMeta}
    >
      <Text
        size='xs'
        c='dimmed'
      >
        Project
      </Text>
      <Text fw={600}>{projectName}</Text>
      <Text
        size='xs'
        c='dimmed'
      >
        Period
      </Text>
      <Text size='sm'>{periodLabel}</Text>
      <Text
        size='xs'
        c='dimmed'
      >
        Generated
      </Text>
      <Text size='sm'>{generatedAt}</Text>
      <Badge
        size='xs'
        variant='light'
        color={status.color}
        className={classes.metaBadge}
      >
        {status.label}
      </Badge>
    </Stack>
  </Group>
);

const DetailEmpty = ({ message }) => (
  <Paper className={classes.page}>
    <EmptyState
      message={message}
      height={220}
    />
  </Paper>
);

const SheetBlock = ({ title, subtitle, children }) => (
  <Paper className={classes.sheet}>
    <Stack gap='sm'>
      <Box>
        <Text
          fw={600}
          className={classes.sheetTitle}
        >
          {title}
        </Text>
        {subtitle && <Text className={classes.sheetMeta}>{subtitle}</Text>}
      </Box>
      {children}
    </Stack>
  </Paper>
);

const EvmPreview = ({ evmTrendData, summary }) => {
  const evm = summary?.evm;

  return (
    <Stack gap='md'>
      <SimpleGrid
        cols={{ base: 1, sm: 2, md: 3 }}
        spacing='sm'
        className={classes.summaryGrid}
      >
        <SummaryCard
          label='Planned value'
          value={evm ? formatCompact(evm.pv) : '-'}
        />
        <SummaryCard
          label='Earned value'
          value={evm ? formatCompact(evm.ev) : '-'}
        />
        <SummaryCard
          label='Actual cost'
          value={evm ? formatCompact(evm.ac) : '-'}
        />
        <SummaryCard
          label='CPI'
          value={evm ? formatIndexValue(evm.cpi) : '--'}
        />
        <SummaryCard
          label='SPI'
          value={evm ? formatIndexValue(evm.spi) : '--'}
        />
      </SimpleGrid>
      <ChartBlock
        title='EVM trend'
        empty={evmTrendData.length === 0}
      >
        <ResponsiveContainer
          width='100%'
          height={240}
        >
          <LineChart data={evmTrendData}>
            <CartesianGrid
              strokeDasharray='3 3'
              stroke='var(--mantine-color-gray-3)'
            />
            <XAxis
              dataKey='period'
              tick={{ fontSize: 11 }}
            />
            <YAxis
              tickFormatter={axisCompact}
              tick={{ fontSize: 11 }}
            />
            <Tooltip formatter={value => formatCurrency(Number(value))} />
            <Legend />
            <Line
              type='monotone'
              dataKey='pv'
              name='PV'
              stroke='#228be6'
              strokeWidth={2}
              dot={false}
            />
            <Line
              type='monotone'
              dataKey='ev'
              name='EV'
              stroke='#12b886'
              strokeWidth={2}
              dot={false}
            />
            <Line
              type='monotone'
              dataKey='ac'
              name='AC'
              stroke='#fa5252'
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartBlock>
    </Stack>
  );
};

const ResourcePreview = ({ resourceBreakdownData }) => (
  <Stack gap='md'>
    <ChartBlock
      title='Cost by resource type'
      empty={resourceBreakdownData.length === 0}
    >
      <ResponsiveContainer
        width='100%'
        height={240}
      >
        <PieChart>
          <Pie
            data={resourceBreakdownData}
            dataKey='value'
            nameKey='name'
            outerRadius={90}
            innerRadius={45}
            paddingAngle={3}
          >
            {resourceBreakdownData.map((entry, index) => (
              <Cell
                key={entry.name || index}
                fill={RESOURCE_COLORS[index % RESOURCE_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip formatter={value => formatCurrency(Number(value))} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartBlock>
    <TableScroll minWidth={420}>
      <Table verticalSpacing='xs'>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Resource</Table.Th>
            <Table.Th>Cost</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {resourceBreakdownData.length === 0 ? (
            <EmptyRow
              colSpan={2}
              message='No resource usage recorded.'
            />
          ) : (
            resourceBreakdownData.map(item => (
              <Table.Tr key={item.name}>
                <Table.Td>{item.name}</Table.Td>
                <Table.Td>{formatMaybeCurrency(item.value)}</Table.Td>
              </Table.Tr>
            ))
          )}
        </Table.Tbody>
      </Table>
    </TableScroll>
  </Stack>
);

const TaskStatusPreview = ({ overdueTrendData, workreportActivityData, taskStats }) => (
  <Stack gap='md'>
    <SimpleGrid
      cols={{ base: 1, sm: 2, md: 3 }}
      spacing='sm'
    >
      <SummaryCard
        label='Total tasks'
        value={formatMaybeNumber(taskStats.total)}
      />
      <SummaryCard
        label='Completed tasks'
        value={formatMaybeNumber(taskStats.completed)}
      />
      <SummaryCard
        label='Active tasks'
        value={formatMaybeNumber(taskStats.active)}
      />
    </SimpleGrid>
    <SimpleGrid
      cols={{ base: 1, md: 2 }}
      spacing='md'
    >
      <ChartBlock
        title='Overdue tasks trend'
        empty={overdueTrendData.length === 0}
      >
        <ResponsiveContainer
          width='100%'
          height={220}
        >
          <BarChart data={overdueTrendData}>
            <CartesianGrid
              strokeDasharray='3 3'
              stroke='var(--mantine-color-gray-3)'
            />
            <XAxis
              dataKey='period'
              tick={{ fontSize: 11 }}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11 }}
            />
            <Tooltip />
            <Bar
              dataKey='overdue'
              name='Overdue tasks'
              fill='#fa5252'
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartBlock>
      <ChartBlock
        title='Work report activity'
        empty={workreportActivityData.length === 0}
      >
        <ResponsiveContainer
          width='100%'
          height={220}
        >
          <BarChart data={workreportActivityData}>
            <CartesianGrid
              strokeDasharray='3 3'
              stroke='var(--mantine-color-gray-3)'
            />
            <XAxis
              dataKey='period'
              tick={{ fontSize: 11 }}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11 }}
            />
            <Tooltip />
            <Bar
              dataKey='count'
              name='Work reports'
              fill='#228be6'
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartBlock>
    </SimpleGrid>
  </Stack>
);

const InventoryPreview = ({ inventoryChartData }) => (
  <Stack gap='md'>
    <ChartBlock
      title='Top allocated inventory'
      empty={inventoryChartData.length === 0}
    >
      <ResponsiveContainer
        width='100%'
        height={240}
      >
        <BarChart data={inventoryChartData}>
          <CartesianGrid
            strokeDasharray='3 3'
            stroke='var(--mantine-color-gray-3)'
          />
          <XAxis
            dataKey='name'
            tick={{ fontSize: 11 }}
          />
          <YAxis
            tickFormatter={axisCompact}
            tick={{ fontSize: 11 }}
          />
          <Tooltip formatter={value => formatCurrency(Number(value))} />
          <Bar
            dataKey='cost'
            name='Allocated cost'
            fill='#15aabf'
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartBlock>
  </Stack>
);

const TaskGroupsTable = ({ taskGroups }) => (
  <TableScroll minWidth={520}>
    <Table verticalSpacing='xs'>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Group</Table.Th>
          <Table.Th>Description</Table.Th>
          <Table.Th>Tasks</Table.Th>
          <Table.Th>Completed</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {taskGroups.length === 0 ? (
          <EmptyRow
            colSpan={4}
            message='No task groups within the selected range.'
          />
        ) : (
          taskGroups.map(group => (
            <Table.Tr key={group.id}>
              <Table.Td>{group.name}</Table.Td>
              <Table.Td>{group.description || '-'}</Table.Td>
              <Table.Td>{formatMaybeNumber(group.tasks_count)}</Table.Td>
              <Table.Td>{formatMaybeNumber(group.completed_tasks_count)}</Table.Td>
            </Table.Tr>
          ))
        )}
      </Table.Tbody>
    </Table>
  </TableScroll>
);

const TasksTable = ({ tasks }) => (
  <TableScroll minWidth={900}>
    <Table verticalSpacing='xs'>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Task</Table.Th>
          <Table.Th>Group</Table.Th>
          <Table.Th>Assigned</Table.Th>
          <Table.Th>Start</Table.Th>
          <Table.Th>End</Table.Th>
          <Table.Th>Progress</Table.Th>
          <Table.Th>Budget plan</Table.Th>
          <Table.Th>Budget actual</Table.Th>
          <Table.Th>Status</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {tasks.length === 0 ? (
          <EmptyRow
            colSpan={9}
            message='No tasks in range.'
          />
        ) : (
          tasks.map(task => (
            <Table.Tr key={task.id}>
              <Table.Td>{task.name}</Table.Td>
              <Table.Td>{task.group || '-'}</Table.Td>
              <Table.Td>{task.assigned_to || '-'}</Table.Td>
              <Table.Td>{formatDate(task.start_date)}</Table.Td>
              <Table.Td>{formatDate(task.end_date)}</Table.Td>
              <Table.Td>{formatPercent(task.progress)}</Table.Td>
              <Table.Td>{formatMaybeCurrency(task.budget_plan)}</Table.Td>
              <Table.Td>{formatMaybeCurrency(task.budget_actual)}</Table.Td>
              <Table.Td>
                <Badge
                  size='xs'
                  variant='light'
                  color={task.is_completed ? 'green' : 'blue'}
                >
                  {task.is_completed ? 'Completed' : 'Active'}
                </Badge>
              </Table.Td>
            </Table.Tr>
          ))
        )}
      </Table.Tbody>
    </Table>
  </TableScroll>
);

const InventoryTable = ({ inventory }) => (
  <TableScroll minWidth={720}>
    <Table verticalSpacing='xs'>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Code</Table.Th>
          <Table.Th>Name</Table.Th>
          <Table.Th>On hand</Table.Th>
          <Table.Th>Unit cost</Table.Th>
          <Table.Th>Allocated qty</Table.Th>
          <Table.Th>Allocated cost</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {inventory.length === 0 ? (
          <EmptyRow
            colSpan={6}
            message='No inventory usage for this period.'
          />
        ) : (
          inventory.map(item => (
            <Table.Tr key={item.inventory_id}>
              <Table.Td>{item.code || '-'}</Table.Td>
              <Table.Td>{item.name || '-'}</Table.Td>
              <Table.Td>{formatMaybeNumber(item.quantity_on_hand)}</Table.Td>
              <Table.Td>{formatMaybeCurrency(item.unit_cost)}</Table.Td>
              <Table.Td>{formatMaybeNumber(item.allocated_quantity)}</Table.Td>
              <Table.Td>{formatMaybeCurrency(item.allocated_cost)}</Table.Td>
            </Table.Tr>
          ))
        )}
      </Table.Tbody>
    </Table>
  </TableScroll>
);

const AllocationsTable = ({ allocations }) => (
  <TableScroll minWidth={860}>
    <Table verticalSpacing='xs'>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Date</Table.Th>
          <Table.Th>Inventory</Table.Th>
          <Table.Th>Task</Table.Th>
          <Table.Th>Group</Table.Th>
          <Table.Th>Allocated by</Table.Th>
          <Table.Th>Qty</Table.Th>
          <Table.Th>Cost</Table.Th>
          <Table.Th>Notes</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {allocations.length === 0 ? (
          <EmptyRow
            colSpan={8}
            message='No allocations recorded.'
          />
        ) : (
          allocations.map(item => (
            <Table.Tr key={item.id}>
              <Table.Td>{formatDateTime(item.created_at)}</Table.Td>
              <Table.Td>
                {[item.inventory?.code, item.inventory?.name].filter(Boolean).join(' ')}
              </Table.Td>
              <Table.Td>{item.task?.name || '-'}</Table.Td>
              <Table.Td>{item.task?.group || '-'}</Table.Td>
              <Table.Td>{item.allocated_by || '-'}</Table.Td>
              <Table.Td>{formatMaybeNumber(item.quantity)}</Table.Td>
              <Table.Td>{formatMaybeCurrency(item.cost)}</Table.Td>
              <Table.Td>{item.notes || '-'}</Table.Td>
            </Table.Tr>
          ))
        )}
      </Table.Tbody>
    </Table>
  </TableScroll>
);

const WorkReportsTable = ({ workReports }) => (
  <TableScroll minWidth={980}>
    <Table verticalSpacing='xs'>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Date</Table.Th>
          <Table.Th>Task</Table.Th>
          <Table.Th>Group</Table.Th>
          <Table.Th>Reporter</Table.Th>
          <Table.Th>Progress</Table.Th>
          <Table.Th>Cost</Table.Th>
          <Table.Th>Status</Table.Th>
          <Table.Th>Remarks</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {workReports.length === 0 ? (
          <EmptyRow
            colSpan={8}
            message='No work reports found.'
          />
        ) : (
          workReports.map(report => (
            <Table.Tr key={report.id}>
              <Table.Td>{formatDate(report.report_date)}</Table.Td>
              <Table.Td>{report.task?.name || '-'}</Table.Td>
              <Table.Td>{report.task?.group || '-'}</Table.Td>
              <Table.Td>{report.user?.name || '-'}</Table.Td>
              <Table.Td>{formatPercent(report.progress)}</Table.Td>
              <Table.Td>{formatMaybeCurrency(report.actual_cost)}</Table.Td>
              <Table.Td>
                <Badge
                  size='xs'
                  variant='light'
                  color={resolveWorkReportStatusColor(report.status)}
                >
                  {report.status}
                </Badge>
              </Table.Td>
              <Table.Td>{report.remarks || '-'}</Table.Td>
            </Table.Tr>
          ))
        )}
      </Table.Tbody>
    </Table>
  </TableScroll>
);

const CommentsTable = ({ comments }) => (
  <TableScroll minWidth={860}>
    <Table verticalSpacing='xs'>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Date</Table.Th>
          <Table.Th>Task</Table.Th>
          <Table.Th>Group</Table.Th>
          <Table.Th>User</Table.Th>
          <Table.Th>Comment</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {comments.length === 0 ? (
          <EmptyRow
            colSpan={5}
            message='No comments available.'
          />
        ) : (
          comments.map(comment => (
            <Table.Tr key={comment.id}>
              <Table.Td>{formatDateTime(comment.created_at)}</Table.Td>
              <Table.Td>{comment.task?.name || '-'}</Table.Td>
              <Table.Td>{comment.task?.group || '-'}</Table.Td>
              <Table.Td>{comment.user?.name || '-'}</Table.Td>
              <Table.Td>{stripHtml(comment.content) || '-'}</Table.Td>
            </Table.Tr>
          ))
        )}
      </Table.Tbody>
    </Table>
  </TableScroll>
);

export default function ExportPreview({
  reportType = 'evm',
  evmTrendData = [],
  resourceBreakdownData = [],
  overdueTrendData = [],
  workreportActivityData = [],
  detail,
  filters,
  form,
  projectOptions,
  dateRange,
  onSubmit,
  onDateRangeChange,
  updateValue,

}) {
  const [viewMode, setViewMode] = useState('document');

  const reportTypeLabel =
    REPORT_TYPES.find(option => option.value === reportType)?.label || 'Report';
  const detailProject = detail?.project || null;
  const detailSummary = detail?.summary || null;
  const taskGroups = Array.isArray(detail?.task_groups) ? detail.task_groups : [];
  const tasks = Array.isArray(detail?.tasks) ? detail.tasks : [];
  const inventory = Array.isArray(detail?.inventory) ? detail.inventory : [];
  const allocations = Array.isArray(detail?.allocations) ? detail.allocations : [];
  const workReports = Array.isArray(detail?.work_reports) ? detail.work_reports : [];
  const comments = Array.isArray(detail?.comments) ? detail.comments : [];
  const periodLabel = formatPeriodLabel(filters);
  const projectStatusMetric = detailSummary?.evm || { cpi: null, spi: null };
  const projectStatus = resolveProjectStatus(projectStatusMetric);

  const taskStats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.is_completed).length;
    return {
      total,
      completed,
      active: Math.max(total - completed, 0),
    };
  }, [tasks]);

  const inventoryChartData = useMemo(
    () =>
      [...inventory]
        .sort((a, b) => (b.allocated_cost || 0) - (a.allocated_cost || 0))
        .slice(0, 6)
        .map(item => ({
          name: item.name || item.code || `Item ${item.inventory_id}`,
          cost: item.allocated_cost || 0,
        })),
    [inventory]
  );

  const renderPreviewContent = () => {
    switch (reportType) {
      case 'resource_usage':
        return <ResourcePreview resourceBreakdownData={resourceBreakdownData} />;
      case 'task_status':
        return (
          <TaskStatusPreview
            overdueTrendData={overdueTrendData}
            workreportActivityData={workreportActivityData}
            taskStats={taskStats}
          />
        );
      case 'inventory_movement':
        return <InventoryPreview inventoryChartData={inventoryChartData} />;
      case 'evm':
      default:
        return (
          <EvmPreview
            evmTrendData={evmTrendData}
            summary={detailSummary}
          />
        );
    }
  };

  const summaryCards = [
    { label: 'Tasks', value: formatMaybeNumber(detailSummary?.tasks_count) },
    { label: 'Task groups', value: formatMaybeNumber(detailSummary?.task_groups_count) },
    { label: 'Inventory items', value: formatMaybeNumber(detailSummary?.inventory_items_count) },
    { label: 'Allocations cost', value: formatMaybeCurrency(detailSummary?.allocations_cost) },
    { label: 'Work reports', value: formatMaybeNumber(detailSummary?.work_reports_count) },
    { label: 'Budget variance', value: formatMaybeCurrency(detailSummary?.budget_variance) },
  ];

  const projectRows = [
    { label: 'Client company', value: detailProject?.client_company || '-' },
    { label: 'Start date', value: formatDate(detailProject?.start_date) },
    { label: 'End date', value: formatDate(detailProject?.end_date) },
    { label: 'Progress', value: formatPercent(detailProject?.progress) },
    {
      label: 'Status',
      value: (
        <Badge
          size='xs'
          variant='light'
          color={projectStatus.color}
        >
          {projectStatus.label}
        </Badge>
      ),
    },
    { label: 'Budget estimate', value: formatMaybeCurrency(detailProject?.budget_estimate) },
    { label: 'Budget actual', value: formatMaybeCurrency(detailProject?.budget_actual) },
    { label: 'Budget variance', value: formatMaybeCurrency(detailSummary?.budget_variance) },
    { label: 'Completed at', value: formatDate(detailProject?.completed_at) },
  ];

  const summarySheetRows = [
    { label: 'Project', value: detailProject?.name || '-' },
    { label: 'Client company', value: detailProject?.client_company || '-' },
    { label: 'Report type', value: reportTypeLabel },
    { label: 'Period', value: periodLabel },
    { label: 'Generated', value: formatDate(dayjs()) },
    { label: 'Tasks', value: formatMaybeNumber(detailSummary?.tasks_count) },
    { label: 'Task groups', value: formatMaybeNumber(detailSummary?.task_groups_count) },
    { label: 'Inventory items', value: formatMaybeNumber(detailSummary?.inventory_items_count) },
    { label: 'Allocation cost', value: formatMaybeCurrency(detailSummary?.allocations_cost) },
    { label: 'Work reports', value: formatMaybeNumber(detailSummary?.work_reports_count) },
    { label: 'Comments', value: formatMaybeNumber(detailSummary?.comments_count) },
    { label: 'Budget estimate', value: formatMaybeCurrency(detailSummary?.budget_estimate) },
    { label: 'Budget actual', value: formatMaybeCurrency(detailSummary?.budget_actual) },
    { label: 'Budget variance', value: formatMaybeCurrency(detailSummary?.budget_variance) },
  ];

  return (
    <SectionCard
      title='Report Preview'
      description='Preview a document-like export for the selected project.'
      rightSection={
        <Group
          gap='sm'
          align='center'
          wrap='wrap'
        >
          <SegmentedControl
            size='xs'
            value={viewMode}
            onChange={setViewMode}
            data={[
              { label: 'Document', value: 'document' },
              { label: 'Spreadsheet', value: 'sheet' },
            ]}
          />
          <ExportSetting
            form={form}
            projectOptions={projectOptions}
            dateRange={dateRange}
            onSubmit={onSubmit}
            onDateRangeChange={onDateRangeChange}
            updateValue={updateValue}
          />
        </Group>
      }
    >
      {viewMode === 'document' ? (
        detailProject ? (
          <Paper className={classes.page}>
            <ReportHeader
              reportTypeLabel={reportTypeLabel}
              projectName={detailProject.name}
              periodLabel={periodLabel}
              generatedAt={formatDate(dayjs())}
              status={projectStatus}
            />
            <DocumentSection
              title='Executive summary'
              description='Key totals from the selected reporting range.'
            >
              <SimpleGrid
                cols={{ base: 1, sm: 2, md: 3 }}
                spacing='sm'
              >
                {summaryCards.map(card => (
                  <SummaryCard
                    key={card.label}
                    label={card.label}
                    value={card.value}
                  />
                ))}
              </SimpleGrid>
            </DocumentSection>
            <DocumentSection
              title='Project overview'
              description='High level details for the selected project.'
            >
              <KeyValueTable rows={projectRows} />
            </DocumentSection>
            <DocumentSection
              title='Key analytics'
              description={`${reportTypeLabel} highlights based on the current filters.`}
            >
              {renderPreviewContent()}
            </DocumentSection>
            <Box className={classes.pageBreak} />
            <DocumentSection title='Inventory summary'>
              <InventoryTable inventory={inventory} />
            </DocumentSection>
            <DocumentSection title='Inventory allocations'>
              <AllocationsTable allocations={allocations} />
            </DocumentSection>
            <DocumentSection title='Task groups'>
              <TaskGroupsTable taskGroups={taskGroups} />
            </DocumentSection>
            <DocumentSection title='Tasks'>
              <TasksTable tasks={tasks} />
            </DocumentSection>
            <DocumentSection title='Work reports'>
              <WorkReportsTable workReports={workReports} />
            </DocumentSection>
            <DocumentSection title='Discussions'>
              <CommentsTable comments={comments} />
            </DocumentSection>
          </Paper>
        ) : (
          <DetailEmpty message='Select a project to generate a full report preview.' />
        )
      ) : detailProject ? (
        <Stack gap='md'>
          <SheetBlock
            title='Workbook summary'
            subtitle='Metadata and headline totals.'
          >
            <KeyValueTable rows={summarySheetRows} />
          </SheetBlock>
          {detailSummary?.evm && (
            <SheetBlock
              title='EVM summary'
              subtitle='Planned value, earned value, and cost indicators.'
            >
              <KeyValueTable
                rows={[
                  { label: 'PV', value: formatMaybeCurrency(detailSummary.evm.pv) },
                  { label: 'EV', value: formatMaybeCurrency(detailSummary.evm.ev) },
                  { label: 'AC', value: formatMaybeCurrency(detailSummary.evm.ac) },
                  { label: 'CPI', value: formatIndexValue(detailSummary.evm.cpi) },
                  { label: 'SPI', value: formatIndexValue(detailSummary.evm.spi) },
                ]}
              />
            </SheetBlock>
          )}
          <SheetBlock title='Inventory summary'>
            <InventoryTable inventory={inventory} />
          </SheetBlock>
          <SheetBlock title='Inventory allocations'>
            <AllocationsTable allocations={allocations} />
          </SheetBlock>
          <SheetBlock title='Task groups'>
            <TaskGroupsTable taskGroups={taskGroups} />
          </SheetBlock>
          <SheetBlock title='Tasks'>
            <TasksTable tasks={tasks} />
          </SheetBlock>
          <SheetBlock title='Work reports'>
            <WorkReportsTable workReports={workReports} />
          </SheetBlock>
          <SheetBlock title='Discussions'>
            <CommentsTable comments={comments} />
          </SheetBlock>
        </Stack>
      ) : (
        <DetailEmpty message='Select a project to preview spreadsheet tabs.' />
      )}
    </SectionCard>
  );
}

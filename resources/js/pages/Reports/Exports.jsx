import { useEffect, useMemo, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { Box, Stack, Text, TextInput, Title } from '@mantine/core';
import { useDidUpdate } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import useForm from '@/hooks/useForm';
import dayjs from '@/utils/dayjsConfig';
import { reloadWithQuery } from '@/utils/route';
import ExportPreview from './components/ExportPreview';
import ExportQueue from './components/ExportQueue';
import SectionCard from './components/SectionCard';

export default function ExportCenterSection() {
  const { projects, filters, exports, charts, projectMetrics, latestReports, detail } = usePage().props;
  const safeProjects = Array.isArray(projects) ? projects : [];
  const safeFilters = filters || {};
  const exportQueue = Array.isArray(exports) ? exports : [];
  const safeCharts = charts || {};
  const previewProjects = Array.isArray(projectMetrics) ? projectMetrics : [];
  const previewReports = Array.isArray(latestReports) ? latestReports : [];
  const evmTrendData = Array.isArray(safeCharts.evmTrend) ? safeCharts.evmTrend : [];
  const resourceBreakdownData = Array.isArray(safeCharts.resourceBreakdown)
    ? safeCharts.resourceBreakdown
    : [];
  const overdueTrendData = Array.isArray(safeCharts.overdueTrend) ? safeCharts.overdueTrend : [];
  const workreportActivityData = Array.isArray(safeCharts.workreportActivity)
    ? safeCharts.workreportActivity
    : [];

  const projectOptions = useMemo(() => (
    [
      { value: 'all', label: 'All projects', icon: 'IconCircleDashed', color: '#868e96' },
      ...safeProjects.map(project => ({
        value: String(project.id),
        label: project.name,
        icon: project.is_completed ? 'IconCircleCheck' : 'IconCircleDashed',
        color: project.is_completed ? '#2f9e44' : '#228be6',
      })),
    ]
  ), [safeProjects]);

  const initialStart = safeFilters.start ? dayjs(safeFilters.start).toDate() : null;
  const initialEnd = safeFilters.end ? dayjs(safeFilters.end).toDate() : null;

  const [form, submit, updateValue] = useForm('post', route('reports.exports.store'), {
    name: '',
    report_type: 'evm',
    project: safeFilters.project ? String(safeFilters.project) : 'all',
    period: safeFilters.period || 'month',
    start: initialStart,
    end: initialEnd,
    resource_types: Array.isArray(safeFilters.resourceTypes)
      ? safeFilters.resourceTypes.map(type => String(type))
      : [],
    format: 'pdf',
    template: 'executive',
  });

  const [dateRange, setDateRange] = useState([initialStart, initialEnd]);

  useEffect(() => {
    if (!exportQueue.length) return;

    const hasPending = exportQueue.some(item => ['queued', 'processing'].includes(item.status));
    if (!hasPending) return;

    const interval = setInterval(() => {
      router.reload({ only: ['exports'], preserveScroll: true, preserveState: true });
    }, 10000);

    return () => clearInterval(interval);
  }, [exportQueue]);

  useDidUpdate(() => {
    const query = {
      project: form.data.project || 'all',
      period: form.data.period || 'month',
    };

    if (form.data.start && form.data.end) {
      query.start = dayjs(form.data.start).format('YYYY-MM-DD');
      query.end = dayjs(form.data.end).format('YYYY-MM-DD');
    }

    if (Array.isArray(form.data.resource_types) && form.data.resource_types.length > 0) {
      query.resource_types = form.data.resource_types;
    }

    reloadWithQuery(query);
  }, [
    form.data.project,
    form.data.period,
    form.data.start,
    form.data.end,
    form.data.resource_types,
  ]);

  const handleDateRange = range => {
    setDateRange(range);
    updateValue('start', range?.[0] || null);
    updateValue('end', range?.[1] || null);
  };

  const submitExport = (payload = {}) => {
    submit({
      data: payload,
      onSuccess: () => {
        updateValue('name', '');
      },
    });
  };

  const handleSubmit = () => {
    if (form.processing) return;
    const existingName = String(form.data.name || '').trim();
    if (existingName) {
      submitExport();
      return;
    }

    let pendingName = '';
    modals.openConfirmModal({
      title: 'Report name',
      centered: true,
      labels: { confirm: 'Generate', cancel: 'Cancel' },
      overlayProps: { backgroundOpacity: 0.55, blur: 3 },
      children: (
        <Stack gap='xs'>
          <Text size='sm' c='dimmed'>
            Leave blank to use the default report name.
          </Text>
          <TextInput
            placeholder='Monthly portfolio report'
            defaultValue={pendingName}
            onChange={event => {
              pendingName = event.currentTarget.value;
            }}
            data-autofocus
          />
        </Stack>
      ),
      onConfirm: () => {
        const trimmed = pendingName.trim();
        updateValue('name', trimmed);
        submitExport({ name: trimmed || null });
      },
    });
  };

  const handleRetry = exportItem => {
    router.patch(route('reports.exports.retry', exportItem.id), {
      preserveScroll: true,
    });
  };

  const handleDelete = exportItem => {
    router.delete(route('reports.exports.destroy', exportItem.id), {
      preserveScroll: true,
    });
  };

  const handleDownload = exportItem => {
    if (!exportItem?.can_download) return;
    window.location.href = route('reports.exports.download', exportItem.id);
  };

  return (
    <Box id='export-center'>
      <Stack gap='lg'>
        <Box>
          <Title order={2} c='white'>
            Reports
          </Title>
          <Text c='dimmed'>Preview and export project reports.</Text>
        </Box>
        {exportQueue.length > 0 && (
          <SectionCard
          title='Export Center'
          description='Build exports and manage the queue.'
        >
          <Stack gap='lg'>
            <ExportQueue
              exportQueue={exportQueue}
              onRetry={handleRetry}
              onDelete={handleDelete}
              onDownload={handleDownload}
              variant='plain'
              />
          </Stack>
        </SectionCard>
            )}
        <ExportPreview
          reportType={form.data.report_type}
          evmTrendData={evmTrendData}
          previewProjects={previewProjects}
          resourceBreakdownData={resourceBreakdownData}
          overdueTrendData={overdueTrendData}
          workreportActivityData={workreportActivityData}
          previewReports={previewReports}
          detail={detail}
          filters={safeFilters}
          form={form}
          onSubmit={handleSubmit}
          projectOptions={projectOptions}
          dateRange={dateRange}
          onDateRangeChange={handleDateRange}
          updateValue={updateValue}
        />
      </Stack>
    </Box>
  );
}

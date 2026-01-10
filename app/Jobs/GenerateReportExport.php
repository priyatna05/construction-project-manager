<?php

namespace App\Jobs;

use App\Models\Inventory;
use App\Models\InventoryTaskAllocation;
use App\Models\Label;
use App\Models\Project;
use App\Models\ReportExport;
use App\Models\Task;
use App\Models\User;
use App\Services\EvmCalculationService;
use App\Services\PermissionService;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpWord\IOFactory;
use PhpOffice\PhpWord\PhpWord;
use PhpOffice\PhpWord\SimpleType\JcTable;

class GenerateReportExport implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    private const RESOURCE_TYPES = ['labor', 'equipment', 'material', 'service', 'other'];

    public function __construct(private readonly int $exportId)
    {
    }

    public function handle(): void
    {
        $export = ReportExport::find($this->exportId);
        if (!$export) {
            return;
        }

        $user = User::find($export->created_by_user_id);
        if (!$user) {
            $this->markFailed($export, 'Export user not found.');
            return;
        }

        $export->update([
            'status' => 'processing',
            'started_at' => now(),
            'error_message' => null,
        ]);

        try {
            $payload = $this->buildPayload($export, $user);
            $path = $this->writeExportFile($export, $payload);

            $export->update([
                'status' => 'done',
                'file_path' => $path,
                'completed_at' => now(),
            ]);
        } catch (\Throwable $e) {
            $this->markFailed($export, $e->getMessage());
        }
    }

    private function writeExportFile(ReportExport $export, array $payload): string
    {
        return match ($export->format) {
            'pdf' => $this->writePdf($export, $payload),
            'excel' => $this->writeExcel($export, $payload),
            'docx' => $this->writeDocx($export, $payload),
            default => throw new \RuntimeException('Unsupported export format.'),
        };
    }

    private function writePdf(ReportExport $export, array $payload): string
    {
        if (!class_exists(Pdf::class)) {
            throw new \RuntimeException('PDF exporter is not available.');
        }

        $filename = $this->resolveExportFilename($export);
        $path = $this->buildPath($export, $filename);
        $document = Pdf::loadView('reports.exports.pdf', [
            'export' => $export,
            'payload' => $payload,
        ]);

        Storage::disk('local')->put($path, $document->output());

        return $path;
    }

    private function writeExcel(ReportExport $export, array $payload): string
    {
        if (!class_exists(Spreadsheet::class)) {
            throw new \RuntimeException('Excel exporter is not available.');
        }

        $filename = $this->resolveExportFilename($export);
        $path = $this->buildPath($export, $filename);

        $spreadsheet = new Spreadsheet();
        $overviewSheet = $spreadsheet->getActiveSheet();
        $overviewSheet->setTitle('Overview');
        $this->populateOverviewSheet($overviewSheet, $export, $payload);

        $summaryRows = $this->buildSummaryRows($payload);
        if (!empty($summaryRows)) {
            $this->addSheetWithTable($spreadsheet, 'Summary', ['Metric', 'Value'], $summaryRows);
        }

        $filterRows = $this->buildFilterRows($payload);
        if (!empty($filterRows)) {
            $this->addSheetWithTable($spreadsheet, 'Filters', ['Filter', 'Value'], $filterRows);
        }

        $type = $payload['type'] ?? $export->report_type ?? '';
        [$headers, $rows] = $this->buildCsvDataset($payload);
        $this->addSheetWithTable(
            $spreadsheet,
            $this->resolveSheetTitle($type),
            $headers,
            $rows
        );

        if ($type === 'evm') {
            [$trendHeaders, $trendRows] = $this->buildEvmTrendDataset($payload);
            $this->addSheetWithTable($spreadsheet, 'EVM Trend', $trendHeaders, $trendRows);
        }

        $spreadsheet->setActiveSheetIndex(0);

        $writer = new Xlsx($spreadsheet);
        $tempPath = tempnam(sys_get_temp_dir(), 'export_xlsx_');
        if ($tempPath === false) {
            throw new \RuntimeException('Unable to create temporary export file.');
        }
        $writer->save($tempPath);
        $this->storeTempFile($path, $tempPath);

        return $path;
    }

    private function populateOverviewSheet(Worksheet $sheet, ReportExport $export, array $payload): void
    {
        $range = $payload['range'] ?? [];
        $rows = [
            ['Report Name', $export->name ?: 'Report'],
            ['Report Type', strtoupper((string) $export->report_type)],
            ['Format', strtoupper((string) $export->format)],
            ['Template', (string) ($export->template ?: '-')],
            ['Generated', (string) ($payload['generated_at'] ?? '')],
            ['Period', (string) ($payload['period'] ?? '')],
            ['Range Start', (string) ($range['start'] ?? '')],
            ['Range End', (string) ($range['end'] ?? '')],
        ];

        $sheet->fromArray(array_merge([['Field', 'Value']], $rows), null, 'A1');
        $sheet->getStyle('A1:B1')->getFont()->setBold(true);
        $sheet->freezePane('A2');
        $this->autoSizeColumns($sheet, 2);
    }

    private function addSheetWithTable(
        Spreadsheet $spreadsheet,
        string $title,
        array $headers,
        array $rows
    ): void {
        $sheet = new Worksheet($spreadsheet, $title);
        $spreadsheet->addSheet($sheet);

        $sheet->fromArray([$headers], null, 'A1');
        if (!empty($rows)) {
            $sheet->fromArray($rows, null, 'A2');
        }

        $columnCount = max(count($headers), 1);
        $lastColumn = Coordinate::stringFromColumnIndex($columnCount);
        $sheet->getStyle('A1:' . $lastColumn . '1')->getFont()->setBold(true);
        $sheet->freezePane('A2');
        $this->autoSizeColumns($sheet, $columnCount);
    }

    private function autoSizeColumns(Worksheet $sheet, int $columnCount): void
    {
        for ($column = 1; $column <= $columnCount; $column++) {
            $sheet->getColumnDimension(Coordinate::stringFromColumnIndex($column))->setAutoSize(true);
        }
    }

    private function resolveSheetTitle(?string $type): string
    {
        return match ($type) {
            'evm' => 'Project Metrics',
            'resource_usage' => 'Resource Breakdown',
            'task_status' => 'Overdue Trend',
            'inventory_movement' => 'Inventory Movements',
            default => 'Data',
        };
    }

    private function writeDocx(ReportExport $export, array $payload): string
    {
        if (!class_exists(PhpWord::class)) {
            throw new \RuntimeException('DOCX exporter is not available.');
        }

        $filename = $this->resolveExportFilename($export);
        $path = $this->buildPath($export, $filename);

        $phpWord = new PhpWord();
        $phpWord->setDefaultFontName('Calibri');
        $phpWord->setDefaultFontSize(10);
        $phpWord->addTitleStyle(1, ['size' => 18, 'bold' => true, 'color' => '0b7285']);
        $phpWord->addTitleStyle(2, ['size' => 12, 'bold' => true, 'color' => '1c7ed6']);
        $phpWord->addTableStyle('ReportTable', [
            'borderSize' => 6,
            'borderColor' => 'dddddd',
            'cellMargin' => 80,
            'alignment' => JcTable::LEFT,
        ], [
            'bgColor' => 'f5f5f5',
            'bold' => true,
        ]);

        $section = $phpWord->addSection();
        $reportLabel = $export->report_type === 'evm'
            ? 'EVM'
            : ucwords(str_replace('_', ' ', (string) $export->report_type));
        $section->addTitle($export->name ?: 'Report', 1);
        $section->addText(
            trim($reportLabel . ' Report'),
            ['color' => '666666', 'size' => 10],
            ['spaceAfter' => 200]
        );

        $range = $payload['range'] ?? [];
        $rangeStart = (string) ($range['start'] ?? '');
        $rangeEnd = (string) ($range['end'] ?? '');
        $rangeLabel = ($rangeStart || $rangeEnd) ? trim($rangeStart . ' to ' . $rangeEnd) : '';
        $metaRows = [
            ['Type', $reportLabel ?: strtoupper((string) $export->report_type)],
            ['Format', strtoupper((string) $export->format)],
            ['Template', $export->template ? ucwords((string) $export->template) : '-'],
            ['Generated', $payload['generated_at'] ?? ''],
            ['Period', $payload['period'] ?? ''],
            ['Range', $rangeLabel],
        ];

        $this->addDocxKeyValueTable($section, $metaRows);

        $filterRows = $this->buildFilterRows($payload);
        if (!empty($filterRows)) {
            $section->addTextBreak(1);
            $section->addTitle('Filters', 2);
            $this->addDocxKeyValueTable($section, $filterRows);
        }

        $summaryRows = $this->buildSummaryRows($payload);
        if (!empty($summaryRows)) {
            $section->addTextBreak(1);
            $section->addTitle('Summary', 2);
            $this->addDocxKeyValueTable($section, $summaryRows);
        }

        $tables = $this->buildDocxTables($payload);
        foreach ($tables as $table) {
            $section->addTextBreak(1);
            $section->addTitle($table['title'], 2);
            if (empty($table['rows'])) {
                $section->addText($table['empty'] ?? 'No data available.');
                continue;
            }
            $this->addDocxTable($section, $table['headers'], $table['rows']);
        }

        $writer = IOFactory::createWriter($phpWord, 'Word2007');
        $tempPath = tempnam(sys_get_temp_dir(), 'export_docx_');
        if ($tempPath === false) {
            throw new \RuntimeException('Unable to create temporary export file.');
        }
        $writer->save($tempPath);
        $this->storeTempFile($path, $tempPath);

        return $path;
    }

    private function buildDocxTables(array $payload): array
    {
        $type = $payload['type'] ?? '';

        switch ($type) {
            case 'evm':
                [$headers, $rows] = $this->buildEvmCsv($payload);
                [$trendHeaders, $trendRows] = $this->buildEvmTrendDataset($payload);
                return [
                    $this->buildDocxTable('Project Metrics', $headers, $rows, 'No project metrics.'),
                    $this->buildDocxTable('EVM Trend', $trendHeaders, $trendRows, 'No trend data.'),
                ];
            case 'resource_usage':
                [$headers, $rows] = $this->buildResourceCsv($payload);
                return [
                    $this->buildDocxTable('Resource Breakdown', $headers, $rows, 'No resource data.'),
                ];
            case 'task_status':
                [$headers, $rows] = $this->buildTaskStatusCsv($payload);
                return [
                    $this->buildDocxTable('Overdue Trend', $headers, $rows, 'No overdue data.'),
                ];
            case 'inventory_movement':
                [$headers, $rows] = $this->buildInventoryMovementDocxDataset($payload);
                return [
                    $this->buildDocxTable(
                        'Inventory Movements',
                        $headers,
                        $rows,
                        'No inventory movement data.'
                    ),
                ];
            default:
                return [
                    $this->buildDocxTable('Data', ['Message'], [['No data']], 'No data available.'),
                ];
        }
    }

    private function buildDocxTable(string $title, array $headers, array $rows, string $emptyMessage): array
    {
        return [
            'title' => $title,
            'headers' => $headers,
            'rows' => $rows,
            'empty' => $emptyMessage,
        ];
    }

    private function buildInventoryMovementDocxDataset(array $payload): array
    {
        $headers = ['Date', 'Project', 'Task', 'Inventory', 'Quantity', 'Cost', 'Notes'];
        $rows = [];

        foreach ($payload['allocations'] ?? [] as $row) {
            $inventory = trim(($row['inventory_code'] ?? '') . ' ' . ($row['inventory_name'] ?? ''));
            $rows[] = [
                $row['created_at'] ?? '',
                $row['project'] ?? '',
                $row['task'] ?? '',
                $inventory,
                $row['quantity'] ?? '',
                $row['cost'] ?? '',
                $row['notes'] ?? '',
            ];
        }

        return [$headers, $rows];
    }

    private function addDocxTable($section, array $headers, array $rows): void
    {
        $table = $section->addTable('ReportTable');
        $table->addRow(null, ['tblHeader' => true]);
        foreach ($headers as $header) {
            $table->addCell(null, ['bgColor' => 'e9ecef'])
                ->addText((string) $header, ['bold' => true, 'color' => '1f2937']);
        }

        foreach ($rows as $index => $row) {
            $rowColor = $index % 2 === 0 ? 'ffffff' : 'f8f9fa';
            $table->addRow();
            foreach ($row as $cell) {
                $table->addCell(null, ['bgColor' => $rowColor])
                    ->addText($this->formatDocxValue($cell));
            }
        }
    }

    private function addDocxKeyValueTable($section, array $rows): void
    {
        $table = $section->addTable('ReportTable');
        foreach ($rows as $index => $row) {
            $rowColor = $index % 2 === 0 ? 'ffffff' : 'f8f9fa';
            $table->addRow();
            $table->addCell(null, ['bgColor' => $rowColor])
                ->addText((string) ($row[0] ?? ''), ['bold' => true]);
            $table->addCell(null, ['bgColor' => $rowColor])
                ->addText($this->formatDocxValue($row[1] ?? ''));
        }
    }

    private function formatDocxValue($value): string
    {
        if ($value === null) {
            return '';
        }
        if (is_bool($value)) {
            return $value ? 'Yes' : 'No';
        }
        if (is_array($value)) {
            return implode(', ', array_map('strval', $value));
        }

        return (string) $value;
    }

    private function storeTempFile(string $path, string $tempPath): void
    {
        $stream = fopen($tempPath, 'rb');
        if ($stream === false) {
            throw new \RuntimeException('Unable to read generated export file.');
        }

        Storage::disk('local')->put($path, $stream);
        fclose($stream);
        @unlink($tempPath);
    }

    private function buildCsvDataset(array $payload): array
    {
        return match ($payload['type'] ?? '') {
            'evm' => $this->buildEvmCsv($payload),
            'resource_usage' => $this->buildResourceCsv($payload),
            'task_status' => $this->buildTaskStatusCsv($payload),
            'inventory_movement' => $this->buildInventoryMovementCsv($payload),
            default => [['Message'], [['No data']]],
        };
    }

    private function buildFilterRows(array $payload): array
    {
        $filters = is_array($payload['filters'] ?? null) ? $payload['filters'] : [];
        $project = $filters['project'] ?? 'all';
        $projectLabel = $project === 'all' ? 'All projects' : (string) $project;
        $period = $filters['period'] ?? ($payload['period'] ?? '');
        $start = $filters['start'] ?? ($payload['range']['start'] ?? '');
        $end = $filters['end'] ?? ($payload['range']['end'] ?? '');
        $startText = (string) $start;
        $endText = (string) $end;
        $range = ($startText || $endText) ? trim($startText . ' to ' . $endText) : '';
        $resourceTypes = $filters['resource_types'] ?? [];
        if (is_string($resourceTypes)) {
            $resourceTypes = [$resourceTypes];
        }
        $resourceTypes = array_values(array_filter(array_map('strval', (array) $resourceTypes)));

        return [
            ['Project', $projectLabel],
            ['Period', $period ? ucfirst((string) $period) : ''],
            ['Date range', $range ?: ''],
            ['Resource types', empty($resourceTypes) ? 'All' : implode(', ', $resourceTypes)],
        ];
    }

    private function buildSummaryRows(array $payload): array
    {
        $type = $payload['type'] ?? '';

        switch ($type) {
            case 'evm':
                $metrics = is_array($payload['project_metrics'] ?? null) ? $payload['project_metrics'] : [];
                $totalPv = 0.0;
                $totalEv = 0.0;
                $totalAc = 0.0;
                $totalBac = 0.0;

                foreach ($metrics as $metric) {
                    $totalPv += (float) ($metric['pv'] ?? 0);
                    $totalEv += (float) ($metric['ev'] ?? 0);
                    $totalAc += (float) ($metric['ac'] ?? 0);
                    $totalBac += (float) ($metric['bac'] ?? 0);
                }

                $cpi = $totalAc > 0 ? round($totalEv / $totalAc, 3) : null;
                $spi = $totalPv > 0 ? round($totalEv / $totalPv, 3) : null;

                return [
                    ['Projects', count($metrics)],
                    ['Total PV', round($totalPv, 2)],
                    ['Total EV', round($totalEv, 2)],
                    ['Total AC', round($totalAc, 2)],
                    ['Total BAC', round($totalBac, 2)],
                    ['CPI', $cpi ?? ''],
                    ['SPI', $spi ?? ''],
                ];
            case 'resource_usage':
                $breakdown = is_array($payload['resource_breakdown'] ?? null) ? $payload['resource_breakdown'] : [];
                $totalCost = 0.0;

                foreach ($breakdown as $row) {
                    $totalCost += (float) ($row['value'] ?? 0);
                }

                return [
                    ['Resources', count($breakdown)],
                    ['Total cost', round($totalCost, 2)],
                ];
            case 'task_status':
                $summary = is_array($payload['summary'] ?? null) ? $payload['summary'] : [];
                $overdueTrend = is_array($payload['overdue_trend'] ?? null) ? $payload['overdue_trend'] : [];

                return [
                    ['Tasks total', (int) ($summary['tasks_total'] ?? 0)],
                    ['Overdue total', (int) ($summary['overdue_total'] ?? 0)],
                    ['Periods', count($overdueTrend)],
                ];
            case 'inventory_movement':
                $allocations = is_array($payload['allocations'] ?? null) ? $payload['allocations'] : [];
                $totalQuantity = 0.0;
                $totalCost = 0.0;

                foreach ($allocations as $row) {
                    $totalQuantity += (float) ($row['quantity'] ?? 0);
                    $totalCost += (float) ($row['cost'] ?? 0);
                }

                return [
                    ['Allocations', count($allocations)],
                    ['Total quantity', round($totalQuantity, 2)],
                    ['Total cost', round($totalCost, 2)],
                ];
            default:
                return [];
        }
    }

    private function buildEvmCsv(array $payload): array
    {
        $headers = ['Project', 'PV', 'EV', 'AC', 'BAC', 'CPI', 'SPI'];
        $rows = [];

        foreach ($payload['project_metrics'] ?? [] as $metric) {
            $rows[] = [
                $metric['name'] ?? '',
                $metric['pv'] ?? '',
                $metric['ev'] ?? '',
                $metric['ac'] ?? '',
                $metric['bac'] ?? '',
                $metric['cpi'] ?? '',
                $metric['spi'] ?? '',
            ];
        }

        return [$headers, $rows];
    }

    private function buildEvmTrendDataset(array $payload): array
    {
        $headers = ['Period', 'PV', 'EV', 'AC'];
        $rows = [];

        foreach ($payload['evm_trend'] ?? [] as $row) {
            $rows[] = [
                $row['period'] ?? '',
                $row['pv'] ?? '',
                $row['ev'] ?? '',
                $row['ac'] ?? '',
            ];
        }

        return [$headers, $rows];
    }

    private function buildResourceCsv(array $payload): array
    {
        $headers = ['Resource', 'Total Cost'];
        $rows = [];

        foreach ($payload['resource_breakdown'] ?? [] as $row) {
            $rows[] = [
                $row['name'] ?? '',
                $row['value'] ?? '',
            ];
        }

        return [$headers, $rows];
    }

    private function buildTaskStatusCsv(array $payload): array
    {
        $headers = ['Period', 'Overdue'];
        $rows = [];

        foreach ($payload['overdue_trend'] ?? [] as $row) {
            $rows[] = [
                $row['period'] ?? '',
                $row['overdue'] ?? '',
            ];
        }

        return [$headers, $rows];
    }

    private function buildInventoryMovementCsv(array $payload): array
    {
        $headers = ['Date', 'Project', 'Task', 'Inventory Code', 'Inventory Name', 'Quantity', 'Cost', 'Notes'];
        $rows = [];

        foreach ($payload['allocations'] ?? [] as $row) {
            $rows[] = [
                $row['created_at'] ?? '',
                $row['project'] ?? '',
                $row['task'] ?? '',
                $row['inventory_code'] ?? '',
                $row['inventory_name'] ?? '',
                $row['quantity'] ?? '',
                $row['cost'] ?? '',
                $row['notes'] ?? '',
            ];
        }

        return [$headers, $rows];
    }

    private function buildPayload(ReportExport $export, User $user): array
    {
        $filters = is_array($export->filters) ? $export->filters : [];
        $period = $this->resolvePeriod((string) ($filters['period'] ?? 'month'));
        $projectFilter = $filters['project'] ?? 'all';
        $resourceTypes = $this->normalizeResourceTypes($filters['resource_types'] ?? []);
        $startQuery = $filters['start'] ?? null;
        $endQuery = $filters['end'] ?? null;

        $projectIds = PermissionService::projectsThatUserCanAccess($user)->pluck('id');
        if ($projectFilter && $projectFilter !== 'all') {
            $projectIds = $projectIds->filter(fn ($id) => (string) $id === (string) $projectFilter);
        }

        $asOfDate = Carbon::now();
        [$rangeStart, $rangeEnd] = $this->resolveDateRange(
            $startQuery,
            $endQuery,
            $period,
            $asOfDate
        );
        [$rangeStart, $rangeEnd] = $this->clampDateRange($rangeStart, $rangeEnd, $period);
        $buckets = $this->buildPeriodBuckets($rangeStart, $rangeEnd, $period);

        $payload = [
            'type' => $export->report_type,
            'period' => $period,
            'range' => [
                'start' => $rangeStart->toDateString(),
                'end' => $rangeEnd->toDateString(),
            ],
            'filters' => $filters,
            'generated_at' => $asOfDate->toDateTimeString(),
        ];

        if ($projectIds->isEmpty()) {
            return $payload;
        }

        $projects = Project::whereIn('id', $projectIds)
            ->orderBy('name')
            ->get([
                'id',
                'name',
                'is_completed',
                'budget_project_estimate',
                'budget_project_grandtotal_actual',
            ]);

        $tasks = Task::whereIn('project_id', $projectIds)
            ->get([
                'id',
                'project_id',
                'start_date',
                'end_date',
                'weight_task',
                'progress_task',
                'budget_task_actual',
                'budget_task_plan',
                'completed_at',
            ]);

        $tasksByProject = $tasks->groupBy('project_id');

        return match ($export->report_type) {
            'evm' => $payload + $this->buildEvmReport($projects, $tasksByProject, $buckets, $asOfDate),
            'resource_usage' => $payload + [
                'resource_breakdown' => $this->buildResourceBreakdown(
                    $projectIds,
                    $resourceTypes,
                    $rangeStart,
                    $rangeEnd
                ),
            ],
            'task_status' => $payload + [
                'overdue_trend' => $this->buildOverdueTrend($tasks, $buckets, $asOfDate),
                'summary' => [
                    'tasks_total' => $tasks->count(),
                    'overdue_total' => $tasks->filter(function ($task) use ($asOfDate) {
                        if (!$task->end_date || $task->completed_at) {
                            return false;
                        }
                        return Carbon::parse($task->end_date)->lte($asOfDate);
                    })->count(),
                ],
            ],
            'inventory_movement' => $payload + [
                'allocations' => $this->buildInventoryMovements($tasks->pluck('id'), $rangeStart, $rangeEnd),
            ],
            default => $payload,
        };
    }

    private function buildEvmReport($projects, $tasksByProject, array $buckets, Carbon $asOfDate): array
    {
        $evmService = new EvmCalculationService();

        $projectMetrics = $projects->map(function ($project) use ($tasksByProject, $evmService, $asOfDate) {
            $projectTasks = $tasksByProject->get($project->id, collect());
            $core = $evmService->calculateProjectCoreMetrics($project, $asOfDate, $projectTasks);
            $derived = $evmService->calculateProjectDerivedMetrics(
                $core['pv'],
                $core['ev'],
                $core['ac'],
                $core['bac']
            );

            return [
                'id' => $project->id,
                'name' => $project->name,
                'pv' => round((float) $core['pv'], 2),
                'ev' => round((float) $core['ev'], 2),
                'ac' => round((float) $core['ac'], 2),
                'bac' => round((float) $core['bac'], 2),
                'cpi' => $derived['cpi'],
                'spi' => $derived['spi'],
            ];
        })->values()->all();

        $evmTrend = collect($buckets)->map(function ($bucket) use ($projects, $tasksByProject, $evmService, $asOfDate) {
            $asOf = $bucket['as_of']->copy();
            if ($asOf->gt($asOfDate)) {
                $asOf = $asOfDate->copy();
            }

            $pv = 0;
            $ev = 0;
            $ac = 0;

            foreach ($projects as $project) {
                $projectTasks = $tasksByProject->get($project->id, collect());
                $core = $evmService->calculateProjectCoreMetrics($project, $asOf, $projectTasks);
                $pv += $core['pv'];
                $ev += $core['ev'];
                $ac += $core['ac'];
            }

            return [
                'period' => $bucket['label'],
                'pv' => round($pv, 2),
                'ev' => round($ev, 2),
                'ac' => round($ac, 2),
            ];
        })->values()->all();

        return [
            'project_metrics' => $projectMetrics,
            'evm_trend' => $evmTrend,
        ];
    }

    private function buildInventoryMovements($taskIds, Carbon $rangeStart, Carbon $rangeEnd): array
    {
        if ($taskIds->isEmpty()) {
            return [];
        }

        return InventoryTaskAllocation::query()
            ->whereIn('task_id', $taskIds)
            ->whereBetween('created_at', [
                $rangeStart->copy()->startOfDay(),
                $rangeEnd->copy()->endOfDay(),
            ])
            ->with([
                'inventory:id,code,name',
                'task:id,name,project_id',
                'task.project:id,name',
            ])
            ->orderByDesc('created_at')
            ->limit(2000)
            ->get()
            ->map(function (InventoryTaskAllocation $allocation) {
                return [
                    'created_at' => $allocation->created_at?->toDateTimeString(),
                    'project' => $allocation->task?->project?->name,
                    'task' => $allocation->task?->name,
                    'inventory_code' => $allocation->inventory?->code,
                    'inventory_name' => $allocation->inventory?->name,
                    'quantity' => (float) ($allocation->quantity_allocated ?? 0),
                    'cost' => (float) ($allocation->cost_at_allocation ?? 0),
                    'notes' => $allocation->notes,
                ];
            })
            ->values()
            ->all();
    }

    private function resolvePeriod(string $period): string
    {
        $allowed = ['day', 'week', 'month', 'year'];
        return in_array($period, $allowed, true) ? $period : 'month';
    }

    private function resolveDateRange(?string $start, ?string $end, string $period, Carbon $fallbackEnd): array
    {
        if ($start && $end) {
            $rangeStart = Carbon::parse($start)->startOfDay();
            $rangeEnd = Carbon::parse($end)->endOfDay();
            if ($rangeEnd->gt($fallbackEnd)) {
                $rangeEnd = $fallbackEnd->copy();
            }
            if ($rangeStart->gt($rangeEnd)) {
                return [$rangeEnd->copy(), $rangeEnd->copy()];
            }
            return [$rangeStart, $rangeEnd];
        }

        $rangeEnd = $fallbackEnd->copy();
        $rangeStart = $fallbackEnd->copy();

        switch ($period) {
            case 'day':
                $rangeStart->subDays(6);
                break;
            case 'week':
                $rangeStart->subWeeks(7);
                break;
            case 'year':
                $rangeStart->subYears(4);
                break;
            case 'month':
            default:
                $rangeStart->subMonths(5);
                break;
        }

        return [$rangeStart, $rangeEnd];
    }

    private function clampDateRange(Carbon $start, Carbon $end, string $period): array
    {
        $maxPoints = match ($period) {
            'day' => 31,
            'week' => 20,
            'month' => 12,
            'year' => 8,
            default => 12,
        };

        $points = match ($period) {
            'day' => $start->diffInDays($end) + 1,
            'week' => $start->diffInWeeks($end) + 1,
            'month' => $start->diffInMonths($end) + 1,
            'year' => $start->diffInYears($end) + 1,
            default => $start->diffInMonths($end) + 1,
        };

        if ($points <= $maxPoints) {
            return [$start, $end];
        }

        $newStart = $end->copy();
        switch ($period) {
            case 'day':
                $newStart->subDays($maxPoints - 1);
                break;
            case 'week':
                $newStart->subWeeks($maxPoints - 1);
                break;
            case 'year':
                $newStart->subYears($maxPoints - 1);
                break;
            case 'month':
            default:
                $newStart->subMonths($maxPoints - 1);
                break;
        }

        return [$newStart, $end];
    }

    private function buildPeriodBuckets(Carbon $start, Carbon $end, string $period): array
    {
        $buckets = [];
        $cursor = $start->copy();

        while ($cursor->lte($end)) {
            switch ($period) {
                case 'day':
                    $bucketStart = $cursor->copy()->startOfDay();
                    $bucketEnd = $cursor->copy()->endOfDay();
                    $label = $cursor->format('d M');
                    $cursor->addDay();
                    break;
                case 'week':
                    $bucketStart = $cursor->copy()->startOfWeek();
                    $bucketEnd = $cursor->copy()->endOfWeek();
                    $label = 'W' . $bucketStart->isoWeek() . ' ' . $bucketStart->format('Y');
                    $cursor->addWeek();
                    break;
                case 'year':
                    $bucketStart = $cursor->copy()->startOfYear();
                    $bucketEnd = $cursor->copy()->endOfYear();
                    $label = $bucketStart->format('Y');
                    $cursor->addYear();
                    break;
                case 'month':
                default:
                    $bucketStart = $cursor->copy()->startOfMonth();
                    $bucketEnd = $cursor->copy()->endOfMonth();
                    $label = $bucketStart->format('M Y');
                    $cursor->addMonth();
                    break;
            }

            if ($bucketEnd->gt($end)) {
                $bucketEnd = $end->copy();
            }

            $buckets[] = [
                'label' => $label,
                'start' => $bucketStart,
                'end' => $bucketEnd,
                'as_of' => $bucketEnd->copy(),
            ];
        }

        return $buckets;
    }

    private function buildOverdueTrend($tasks, array $buckets, Carbon $asOfDate): array
    {
        $counts = array_fill(0, count($buckets), 0);

        foreach ($tasks as $task) {
            if (!$task->end_date || $task->completed_at) {
                continue;
            }
            $endDate = Carbon::parse($task->end_date);
            if ($endDate->gt($asOfDate)) {
                continue;
            }

            foreach ($buckets as $index => $bucket) {
                if ($endDate->betweenIncluded($bucket['start'], $bucket['end'])) {
                    $counts[$index] += 1;
                    break;
                }
            }
        }

        return collect($buckets)->map(function ($bucket, $index) use ($counts) {
            return [
                'period' => $bucket['label'],
                'overdue' => $counts[$index] ?? 0,
            ];
        })->values()->all();
    }

    private function buildResourceBreakdown($projectIds, array $resourceTypes, Carbon $start, Carbon $end): array
    {
        if ($projectIds->isEmpty()) {
            return [];
        }

        $query = InventoryTaskAllocation::query()
            ->select(
                'labels.name as type_name',
                'labels.slug as type_slug',
                \DB::raw('COALESCE(SUM(inventory_task_allocations.cost_at_allocation), 0) as total_cost')
            )
            ->join('tasks', 'inventory_task_allocations.task_id', '=', 'tasks.id')
            ->join('inventories', 'inventory_task_allocations.inventory_id', '=', 'inventories.id')
            ->join('labelables', function ($join) {
                $join->on('labelables.labelable_id', '=', 'inventories.id')
                    ->where('labelables.labelable_type', '=', Inventory::class)
                    ->where('labelables.type', '=', Label::TYPE_INVENTORY_TYPE);
            })
            ->join('labels', 'labels.id', '=', 'labelables.label_id')
            ->whereIn('tasks.project_id', $projectIds)
            ->whereBetween('inventory_task_allocations.created_at', [$start, $end])
            ->groupBy('labels.slug', 'labels.name')
            ->orderByDesc('total_cost');

        if (!empty($resourceTypes)) {
            $query->whereIn('labels.slug', $resourceTypes);
        }

        return $query->get()
            ->map(fn ($row) => [
                'name' => $row->type_name,
                'value' => (float) $row->total_cost,
            ])
            ->values()
            ->all();
    }

    private function normalizeResourceTypes($resourceTypes): array
    {
        $types = is_string($resourceTypes) ? [$resourceTypes] : (array) $resourceTypes;
        $types = array_map(fn ($type) => strtolower((string) $type), $types);
        $types = array_values(array_filter($types));

        return array_values(array_intersect(self::RESOURCE_TYPES, $types));
    }

    private function resolveExportExtension(?string $format): string
    {
        return match ($format) {
            'pdf' => 'pdf',
            'excel' => 'xlsx',
            'docx' => 'docx',
            default => 'txt',
        };
    }

    private function resolveExportFilename(ReportExport $export): string
    {
        $name = $export->name ?: 'report';
        $sanitized = preg_replace('/[^A-Za-z0-9._-]+/', '_', $name);
        $sanitized = trim($sanitized ?: '', '_');
        $extension = '.' . $this->resolveExportExtension($export->format);

        return ($sanitized ?: 'report') . $extension;
    }

    private function buildPath(ReportExport $export, string $filename): string
    {
        return 'exports/reports/' . $export->id . '/' . $filename;
    }

    private function markFailed(ReportExport $export, string $message): void
    {
        $export->update([
            'status' => 'failed',
            'completed_at' => now(),
            'error_message' => $message,
        ]);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Inventory;
use App\Models\InventoryTaskAllocation;
use App\Models\Project;
use App\Models\Task;
use App\Models\WorkReport;
use App\Models\ReportExport;
use App\Models\Label;
use App\Models\Comment;
use App\Models\TaskGroup;
use App\Services\EvmCalculationService;
use App\Services\PermissionService;
use App\Jobs\GenerateReportExport;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    private const RESOURCE_TYPES = ['labor', 'equipment', 'material', 'service', 'other'];
    private const EXPORT_TYPES = ['evm', 'resource_usage', 'task_status', 'inventory_movement'];
    private const EXPORT_FORMATS = ['pdf', 'excel', 'docx'];
    private const EXPORT_TEMPLATES = ['executive', 'detailed', 'audit'];

    public function index(Request $request): Response
    {
        $period = $this->resolvePeriod($request->query('period', 'month'));
        $projectFilter = $request->query('project', 'all');
        $selectedProjectId = $projectFilter && $projectFilter !== 'all'
            ? (int) $projectFilter
            : null;
        $resourceTypes = $this->normalizeResourceTypes($request->query('resource_types', []));
        $startQuery = $request->query('start');
        $endQuery = $request->query('end');

        $projectIds = PermissionService::projectsThatUserCanAccess(Auth::user())->pluck('id');
        if ($projectFilter && $projectFilter !== 'all') {
            $projectIds = $projectIds->filter(fn ($id) => (string) $id === (string) $projectFilter);
        }

        $projects = Project::whereIn('id', $projectIds)
            ->orderBy('name')
            ->get(['id', 'name', 'is_completed', 'budget_project_estimate', 'budget_project_grandtotal_actual']);

        $tasks = Task::whereIn('project_id', $projectIds)
            ->get([
                'id',
                'project_id',
                'start_date',
                'end_date',
                'weight_task',
                'progress_task',
                'budget_task_actual',
                'completed_at',
            ]);
        $tasksByProject = $tasks->groupBy('project_id');

        $evmService = new EvmCalculationService();
        $asOfDate = Carbon::now();
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
                'is_completed' => $project->is_completed,
                'pv' => $core['pv'],
                'ev' => $core['ev'],
                'ac' => $core['ac'],
                'bac' => $core['bac'],
                'cpi' => $derived['cpi'],
                'spi' => $derived['spi'],
            ];
        });

        [$rangeStart, $rangeEnd] = $this->resolveDateRange(
            $startQuery,
            $endQuery,
            $period,
            $asOfDate
        );
        [$rangeStart, $rangeEnd] = $this->clampDateRange($rangeStart, $rangeEnd, $period);
        $buckets = $this->buildPeriodBuckets($rangeStart, $rangeEnd, $period);

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
        })->values();

        $overdueTrend = $this->buildOverdueTrend($tasks, $buckets, $asOfDate);
        $workreportActivity = collect($buckets)->map(fn ($bucket) => [
            'period' => $bucket['label'],
            'count' => 0,
        ])->values()->all();
        $latestReports = [];
        $taskIds = $tasks->pluck('id');

        if ($taskIds->isNotEmpty()) {
            $reportQuery = WorkReport::whereIn('task_id', $taskIds)
                ->whereBetween('report_date', [$rangeStart->toDateString(), $rangeEnd->toDateString()]);

            $reportDates = $reportQuery->get(['report_date']);
            foreach ($reportDates as $report) {
                $reportDate = $report->report_date ? Carbon::parse($report->report_date) : $asOfDate;
                $bucketIndex = $this->findBucketIndex($buckets, $reportDate);
                if ($bucketIndex !== null) {
                    $workreportActivity[$bucketIndex]['count'] += 1;
                }
            }

            $latestReports = (clone $reportQuery)
                ->with([
                    'task:id,name,project_id',
                    'user:id,name',
                    'labels:id,name,type,slug',
                ])
                ->orderByDesc('report_date')
                ->limit(6)
                ->get([
                    'id',
                    'task_id',
                    'user_id',
                    'report_date',
                    'actual_cost',
                    'remarks',
                ])
                ->map(function ($report) {
                    $statusLabel = $report->labels
                        ? $report->labels->firstWhere('type', Label::TYPE_WORK_REPORT_STATUS)
                        : null;

                    return [
                        'id' => $report->id,
                        'task' => $report->task ? [
                            'id' => $report->task->id,
                            'name' => $report->task->name,
                            'project_id' => $report->task->project_id,
                        ] : null,
                        'user' => $report->user ? [
                            'id' => $report->user->id,
                            'name' => $report->user->name,
                        ] : null,
                        'report_date' => $report->report_date?->toDateString(),
                        'actual_cost' => (float) ($report->actual_cost ?? 0),
                        'remarks' => $report->remarks,
                        'status' => $statusLabel?->name ?? 'Pending',
                    ];
                })
                ->values()
                ->all();
        }
        $resourceBreakdown = $this->buildResourceBreakdown($projectIds, $resourceTypes, $rangeStart, $rangeEnd);
        $projectNameMap = $projects->pluck('name', 'id')->toArray();
        $exports = ReportExport::where('created_by_user_id', Auth::id())
            ->orderByDesc('created_at')
            ->limit(20)
            ->get()
            ->map(function (ReportExport $export) use ($projectNameMap) {
                $filters = is_array($export->filters) ? $export->filters : [];
                if (!empty($filters['project']) && $filters['project'] !== 'all') {
                    $filters['project_name'] = $projectNameMap[$filters['project']] ?? null;
                }
                return [
                    'id' => $export->id,
                    'name' => $export->name,
                    'report_type' => $export->report_type,
                    'format' => $export->format,
                    'template' => $export->template,
                    'status' => $export->status,
                    'filters' => $filters,
                    'created_at' => $export->created_at?->toDateTimeString(),
                    'completed_at' => $export->completed_at?->toDateTimeString(),
                    'can_download' => $export->status === 'done' && !empty($export->file_path),
                    'error_message' => $export->error_message,
                ];
            })
            ->values()
            ->all();
        $detail = $this->buildProjectDetail(
            $selectedProjectId,
            $projectIds,
            $rangeStart,
            $rangeEnd,
            $projectMetrics
        );
        return Inertia::render('Reports/Index', [
            'projects' => $projects,
            'projectMetrics' => $projectMetrics
                ->map(fn ($metric) => [
                    'id' => $metric['id'],
                    'name' => $metric['name'],
                    'is_completed' => (bool) $metric['is_completed'],
                    'pv' => round((float) $metric['pv'], 2),
                    'ev' => round((float) $metric['ev'], 2),
                    'ac' => round((float) $metric['ac'], 2),
                    'bac' => round((float) $metric['bac'], 2),
                    'cpi' => $metric['cpi'],
                    'spi' => $metric['spi'],
                ])
                ->values()
                ->all(),
            'filters' => [
                'project' => $projectFilter,
                'period' => $period,
                'start' => $startQuery ? $rangeStart->toDateString() : null,
                'end' => $endQuery ? $rangeEnd->toDateString() : null,
                'resourceTypes' => array_values($resourceTypes),
            ],
            'charts' => [
                'evmTrend' => $evmTrend,
                'resourceBreakdown' => $resourceBreakdown,
                'overdueTrend' => $overdueTrend,
                'workreportActivity' => $workreportActivity,
            ],
            'latestReports' => $latestReports,
            'exports' => $exports,
            'detail' => $detail,
        ]);
    }

    public function storeExport(Request $request): RedirectResponse
    {
        $projectIds = PermissionService::projectsThatUserCanAccess(Auth::user())->pluck('id');
        $projectOptions = $projectIds->map(fn ($id) => (string) $id)->push('all')->all();

        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'report_type' => ['required', Rule::in(self::EXPORT_TYPES)],
            'format' => ['required', Rule::in(self::EXPORT_FORMATS)],
            'template' => ['nullable', Rule::in(self::EXPORT_TEMPLATES)],
            'project' => ['nullable', Rule::in($projectOptions)],
            'period' => ['nullable', Rule::in(['day', 'week', 'month', 'year'])],
            'start' => 'nullable|date',
            'end' => 'nullable|date|after_or_equal:start',
            'resource_types' => 'nullable|array',
            'resource_types.*' => 'string',
        ]);

        $resourceTypes = $this->normalizeResourceTypes($validated['resource_types'] ?? []);
        $filters = [
            'project' => $validated['project'] ?? 'all',
            'period' => $this->resolvePeriod($validated['period'] ?? 'month'),
            'start' => $validated['start'] ?? null,
            'end' => $validated['end'] ?? null,
            'resource_types' => $resourceTypes,
        ];

        $projectNameMap = Project::whereIn('id', $projectIds)
            ->pluck('name', 'id')
            ->toArray();

        $name = $validated['name'] ?? $this->buildExportName($validated['report_type'], $filters, $projectNameMap);

        $export = ReportExport::create([
            'name' => $name,
            'report_type' => $validated['report_type'],
            'format' => $validated['format'],
            'template' => $validated['template'] ?? null,
            'filters' => $filters,
            'status' => 'queued',
            'created_by_user_id' => Auth::id(),
        ]);

        GenerateReportExport::dispatch($export->id)->afterCommit();

        return back()->with('success', 'Export queued.');
    }

    public function retryExport(ReportExport $export): RedirectResponse
    {
        if ($export->created_by_user_id !== Auth::id()) {
            abort(403);
        }

        $export->update([
            'status' => 'queued',
            'error_message' => null,
            'started_at' => null,
            'completed_at' => null,
        ]);

        return back()->with('success', 'Export queued for retry.');
    }

    public function destroyExport(ReportExport $export): RedirectResponse
    {
        if ($export->created_by_user_id !== Auth::id()) {
            abort(403);
        }

        $export->delete();

        return back()->with('success', 'Export removed.');
    }

    public function downloadExport(ReportExport $export)
    {
        if ($export->created_by_user_id !== Auth::id()) {
            abort(403);
        }

        if ($export->status !== 'done' || empty($export->file_path)) {
            abort(404);
        }

        $path = $export->file_path;
        $filename = $this->resolveExportFilename($export);

        $publicDisk = Storage::disk('public');
        if ($publicDisk->exists($path)) {
            return $publicDisk->download($path, $filename);
        }

        $defaultDisk = Storage::disk(config('filesystems.default', 'local'));
        if ($defaultDisk->exists($path)) {
            return $defaultDisk->download($path, $filename);
        }

        abort(404);
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
                DB::raw('COALESCE(SUM(inventory_task_allocations.cost_at_allocation), 0) as total_cost')
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

    private function buildExportName(string $type, array $filters, array $projectNameMap): string
    {
        $typeLabel = $this->resolveExportTypeLabel($type);
        $projectValue = $filters['project'] ?? 'all';
        $projectLabel = 'All projects';

        if ($projectValue && $projectValue !== 'all') {
            $projectLabel = $projectNameMap[$projectValue] ?? ('Project ' . $projectValue);
        }

        if (!empty($filters['start']) && !empty($filters['end'])) {
            $rangeLabel = $filters['start'] . ' to ' . $filters['end'];
        } else {
            $rangeLabel = ucfirst($filters['period'] ?? 'month');
        }

        return trim($typeLabel . ' - ' . $projectLabel . ' - ' . $rangeLabel);
    }

    private function resolveExportTypeLabel(string $type): string
    {
        return match ($type) {
            'evm' => 'EVM Analytics',
            'resource_usage' => 'Resource Usage',
            'task_status' => 'Task Status',
            'inventory_movement' => 'Inventory Movement',
            default => 'Export',
        };
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
        $extension = $this->resolveExportExtension($export->format);
        if (!empty($export->file_path)) {
            $pathExtension = pathinfo($export->file_path, PATHINFO_EXTENSION);
            if (!empty($pathExtension)) {
                $extension = $pathExtension;
            }
        }

        return ($sanitized ?: 'report') . '.' . $extension;
    }

    private function findBucketIndex(array $buckets, Carbon $date): ?int
    {
        foreach ($buckets as $index => $bucket) {
            if ($date->betweenIncluded($bucket['start'], $bucket['end'])) {
                return $index;
            }
        }

        return null;
    }

    private function buildProjectDetail(
        ?int $projectId,
        $projectIds,
        Carbon $rangeStart,
        Carbon $rangeEnd,
        $projectMetrics
    ): array {
        $empty = [
            'project' => null,
            'summary' => null,
            'task_groups' => [],
            'tasks' => [],
            'inventory' => [],
            'allocations' => [],
            'work_reports' => [],
            'comments' => [],
        ];

        if (!$projectId || !$projectIds->contains($projectId)) {
            return $empty;
        }

        $project = Project::query()
            ->with(['clientCompany:id,name'])
            ->where('id', $projectId)
            ->first([
                'id',
                'client_company_id',
                'name',
                'description',
                'start_date',
                'end_date',
                'progress_project',
                'budget_project_estimate',
                'budget_project_grandtotal_actual',
                'is_completed',
                'completed_at',
            ]);

        if (!$project) {
            return $empty;
        }

        $applyTaskRange = function ($query) use ($rangeStart, $rangeEnd) {
            $query->where(function ($query) use ($rangeEnd) {
                $query->whereNull('start_date')
                    ->orWhereDate('start_date', '<=', $rangeEnd->toDateString());
            })->where(function ($query) use ($rangeStart) {
                $query->whereNull('end_date')
                    ->orWhereDate('end_date', '>=', $rangeStart->toDateString());
            });
        };

        $taskRangeQuery = Task::query()->where('project_id', $projectId);
        $applyTaskRange($taskRangeQuery);
        $taskIds = $taskRangeQuery->pluck('id');

        $taskGroups = TaskGroup::query()
            ->where('project_id', $projectId)
            ->withCount([
                'tasks as tasks_count' => function ($query) use ($applyTaskRange) {
                    $applyTaskRange($query);
                },
                'tasks as completed_tasks_count' => function ($query) use ($applyTaskRange) {
                    $applyTaskRange($query);
                    $query->whereNotNull('completed_at');
                },
            ])
            ->orderBy('order_column')
            ->get(['id', 'name', 'description', 'order_column']);

        $tasks = $taskIds->isEmpty()
            ? collect()
            : Task::query()
                ->whereIn('id', $taskIds)
                ->with([
                    'taskGroup:id,name',
                    'assignedToUser:id,name',
                ])
                ->withCount(['comments', 'workReports', 'inventoryAllocations'])
                ->orderBy('order_column')
                ->get([
                    'id',
                    'group_id',
                    'assigned_to_user_id',
                    'name',
                    'description',
                    'start_date',
                    'end_date',
                    'budget_task_plan',
                    'budget_task_actual',
                    'progress_task',
                    'is_completed',
                    'completed_at',
                ]);

        $allocationBaseQuery = $taskIds->isEmpty()
            ? null
            : InventoryTaskAllocation::query()
                ->whereIn('task_id', $taskIds)
                ->whereBetween('created_at', [
                    $rangeStart->copy()->startOfDay(),
                    $rangeEnd->copy()->endOfDay(),
                ]);

        $allocations = $allocationBaseQuery
            ? (clone $allocationBaseQuery)
                ->with([
                    'inventory:id,code,name,unit_cost,quantity_on_hand',
                    'task:id,name,group_id',
                    'task.taskGroup:id,name',
                    'allocatedByUser:id,name',
                ])
                ->orderByDesc('created_at')
                ->get()
            : collect();

        $inventoryUsage = $allocationBaseQuery
            ? (clone $allocationBaseQuery)
                ->select(
                    'inventory_id',
                    DB::raw('SUM(quantity_allocated) as allocated_quantity'),
                    DB::raw('SUM(cost_at_allocation) as allocated_cost')
                )
                ->groupBy('inventory_id')
                ->orderByDesc(DB::raw('SUM(cost_at_allocation)'))
                ->get()
            : collect();

        $inventoryMap = $inventoryUsage->isEmpty()
            ? collect()
            : Inventory::query()
                ->whereIn('id', $inventoryUsage->pluck('inventory_id'))
                ->get(['id', 'code', 'name', 'unit_cost', 'quantity_on_hand'])
                ->keyBy('id');

        $workReports = $taskIds->isEmpty()
            ? collect()
            : WorkReport::query()
                ->whereIn('task_id', $taskIds)
                ->whereBetween('report_date', [$rangeStart->toDateString(), $rangeEnd->toDateString()])
                ->with([
                    'task:id,name,group_id',
                    'task.taskGroup:id,name',
                    'user:id,name',
                    'labels:id,name,type,slug',
                ])
                ->orderByDesc('report_date')
                ->get([
                    'id',
                    'task_id',
                    'user_id',
                    'report_date',
                    'progress',
                    'actual_cost',
                    'remarks',
                ]);

        $comments = $taskIds->isEmpty()
            ? collect()
            : Comment::query()
                ->whereIn('task_id', $taskIds)
                ->whereBetween('created_at', [
                    $rangeStart->copy()->startOfDay(),
                    $rangeEnd->copy()->endOfDay(),
                ])
                ->with([
                    'task:id,name,group_id',
                    'task.taskGroup:id,name',
                    'user:id,name',
                ])
                ->orderByDesc('created_at')
                ->get(['id', 'task_id', 'user_id', 'content', 'created_at']);

        $metric = collect($projectMetrics)->firstWhere('id', $projectId);
        $budgetEstimate = (float) ($project->budget_project_estimate ?? 0);
        $budgetActual = (float) ($project->budget_project_grandtotal_actual ?? 0);
        $allocationCostTotal = (float) $inventoryUsage->sum('allocated_cost');

        return [
            'project' => [
                'id' => $project->id,
                'name' => $project->name,
                'description' => $project->description,
                'client_company' => $project->clientCompany?->name,
                'start_date' => $project->start_date?->toDateString(),
                'end_date' => $project->end_date?->toDateString(),
                'progress' => $project->progress_project,
                'is_completed' => (bool) $project->is_completed,
                'completed_at' => $project->completed_at?->toDateString(),
                'budget_estimate' => $budgetEstimate,
                'budget_actual' => $budgetActual,
            ],
            'summary' => [
                'tasks_count' => $taskIds->count(),
                'task_groups_count' => $taskGroups->count(),
                'inventory_items_count' => $inventoryUsage->count(),
                'allocations_count' => $allocations->count(),
                'allocations_cost' => $allocationCostTotal,
                'work_reports_count' => $workReports->count(),
                'comments_count' => $comments->count(),
                'budget_estimate' => $budgetEstimate,
                'budget_actual' => $budgetActual,
                'budget_variance' => $budgetActual - $budgetEstimate,
                'evm' => $metric ? [
                    'pv' => (float) ($metric['pv'] ?? 0),
                    'ev' => (float) ($metric['ev'] ?? 0),
                    'ac' => (float) ($metric['ac'] ?? 0),
                    'cpi' => $metric['cpi'] ?? null,
                    'spi' => $metric['spi'] ?? null,
                ] : null,
            ],
            'task_groups' => $taskGroups->map(fn (TaskGroup $group) => [
                'id' => $group->id,
                'name' => $group->name,
                'description' => $group->description,
                'tasks_count' => (int) ($group->tasks_count ?? 0),
                'completed_tasks_count' => (int) ($group->completed_tasks_count ?? 0),
            ])->values()->all(),
            'tasks' => $tasks->map(fn (Task $task) => [
                'id' => $task->id,
                'name' => $task->name,
                'description' => $task->description,
                'group' => $task->taskGroup?->name,
                'assigned_to' => $task->assignedToUser?->name,
                'start_date' => $task->start_date?->toDateString(),
                'end_date' => $task->end_date?->toDateString(),
                'progress' => $task->progress_task !== null ? (float) $task->progress_task : null,
                'budget_plan' => $task->budget_task_plan !== null ? (float) $task->budget_task_plan : null,
                'budget_actual' => $task->budget_task_actual !== null ? (float) $task->budget_task_actual : null,
                'comments_count' => (int) ($task->comments_count ?? 0),
                'work_reports_count' => (int) ($task->work_reports_count ?? 0),
                'inventory_allocations_count' => (int) ($task->inventory_allocations_count ?? 0),
                'is_completed' => (bool) $task->is_completed,
                'completed_at' => $task->completed_at?->toDateString(),
            ])->values()->all(),
            'inventory' => $inventoryUsage->map(function ($row) use ($inventoryMap) {
                $inventory = $inventoryMap->get($row->inventory_id);
                return [
                    'inventory_id' => $row->inventory_id,
                    'code' => $inventory?->code,
                    'name' => $inventory?->name,
                    'unit_cost' => $inventory?->unit_cost !== null ? (float) $inventory->unit_cost : null,
                    'quantity_on_hand' => $inventory?->quantity_on_hand !== null
                        ? (float) $inventory->quantity_on_hand
                        : null,
                    'allocated_quantity' => (float) ($row->allocated_quantity ?? 0),
                    'allocated_cost' => (float) ($row->allocated_cost ?? 0),
                ];
            })->values()->all(),
            'allocations' => $allocations->map(function (InventoryTaskAllocation $allocation) {
                return [
                    'id' => $allocation->id,
                    'created_at' => $allocation->created_at?->toDateTimeString(),
                    'inventory' => $allocation->inventory ? [
                        'id' => $allocation->inventory->id,
                        'code' => $allocation->inventory->code,
                        'name' => $allocation->inventory->name,
                    ] : null,
                    'task' => $allocation->task ? [
                        'id' => $allocation->task->id,
                        'name' => $allocation->task->name,
                        'group' => $allocation->task->taskGroup?->name,
                    ] : null,
                    'allocated_by' => $allocation->allocatedByUser?->name,
                    'quantity' => (float) ($allocation->quantity_allocated ?? 0),
                    'cost' => (float) ($allocation->cost_at_allocation ?? 0),
                    'notes' => $allocation->notes,
                ];
            })->values()->all(),
            'work_reports' => $workReports->map(function (WorkReport $report) {
                $statusLabel = $report->labels
                    ? $report->labels->firstWhere('type', Label::TYPE_WORK_REPORT_STATUS)
                    : null;

                return [
                    'id' => $report->id,
                    'report_date' => $report->report_date?->toDateString(),
                    'task' => $report->task ? [
                        'id' => $report->task->id,
                        'name' => $report->task->name,
                        'group' => $report->task->taskGroup?->name,
                    ] : null,
                    'user' => $report->user ? [
                        'id' => $report->user->id,
                        'name' => $report->user->name,
                    ] : null,
                    'progress' => $report->progress !== null ? (float) $report->progress : null,
                    'actual_cost' => (float) ($report->actual_cost ?? 0),
                    'remarks' => $report->remarks,
                    'status' => $statusLabel?->name ?? 'Pending',
                ];
            })->values()->all(),
            'comments' => $comments->map(function (Comment $comment) {
                return [
                    'id' => $comment->id,
                    'created_at' => $comment->created_at?->toDateTimeString(),
                    'task' => $comment->task ? [
                        'id' => $comment->task->id,
                        'name' => $comment->task->name,
                        'group' => $comment->task->taskGroup?->name,
                    ] : null,
                    'user' => $comment->user ? [
                        'id' => $comment->user->id,
                        'name' => $comment->user->name,
                    ] : null,
                    'content' => $comment->content,
                ];
            })->values()->all(),
        ];
    }
}

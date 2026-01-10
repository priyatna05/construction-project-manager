<?php

namespace App\Http\Controllers\Task;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\Label;
use App\Models\WorkReport;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Resources\WorkReport\WorkReportResource;
use App\Services\PermissionService;
use Illuminate\Support\Facades\Auth;
use App\Actions\Attachment\StoreAttachmentAction;
use Illuminate\Support\Collection;

class WorkReportController extends Controller
{
    public function index(Project $project, Task $task): JsonResponse
    {
        $this->authorize('view', [$task, $project]);

        $workReports = $task->workReports()->with(['task', 'labels', 'attachments'])->get();

        return response()->json(WorkReportResource::collection($workReports));
    }

    public function store(Request $request, Project $project, Task $task): JsonResponse
    {
        $this->authorize('update', [$task, $project]);

        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'report_date' => 'required|date',
            'progress' => 'required|integer|min:0|max:100',
            'work_done' => 'nullable|numeric|min:0',
            'unit_id' => 'nullable|exists:labels,id',
            'actual_cost' => 'nullable|numeric|min:0',
            'actual_unit_cost' => 'nullable|numeric|min:0',
            'labor_details' => 'nullable|array',
            'material_details' => 'nullable|array',
            'equipment_details' => 'nullable|array',
            'remarks' => 'nullable|string',
            'weather' => 'nullable|string',
            'status_label_id' => 'nullable|exists:labels,id',
        ]);

        $workReport = $task->workReports()->create([
            'user_id' => Auth::id(),
            ...$validated,
        ]);

        // Attach status label - default to pending if not provided
        $statusLabelId = $request->status_label_id ?: Label::where('slug', 'pending_work_report')->first()?->id;
        if ($statusLabelId) {
            $workReport->labels()->attach($statusLabelId);
        }

        $workReport->loadDefault();

        // Log Activity - Work Report Created
         $workReport->activities()->create([
            'user_id' => Auth::id(),
            'project_id' => $project->id,
            'subject_type' => WorkReport::class,
            'subject_id' => $workReport->id,
            'title' => 'New work report',
            'description' => $workReport->name ?? "Work report for {$task->name}",
            'properties' => [
                'task_id' => $task->id,
                'task_name' => $task->name,
                'progress' => $validated['progress'],
                'report_date' => $validated['report_date'],
            ],
        ]);

        // Fire event to notify admins/managers
        event(new \App\Events\Task\WorkReportCreated($workReport));

        return response()->json(new WorkReportResource($workReport), 201);
    }

    public function update(Request $request, Project $project, Task $task, WorkReport $workReport): JsonResponse
    {
        $this->authorize('update', [$task, $project]);

        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'report_date' => 'required|date',
            'progress' => 'required|integer|min:0|max:100',
            'work_done' => 'nullable|numeric|min:0',
            'unit_id' => 'nullable|exists:labels,id',
            'actual_cost' => 'nullable|numeric|min:0',
            'actual_unit_cost' => 'nullable|numeric|min:0',
            'labor_details' => 'nullable|array',
            'material_details' => 'nullable|array',
            'equipment_details' => 'nullable|array',
            'remarks' => 'nullable|string',
            'weather' => 'nullable|string',
            'status_label_id' => 'nullable|exists:labels,id',
        ]);

        // Store old values for comparison
        $oldValues = [
            'progress' => $workReport->progress,
            'status' => $workReport->status_label?->slug,
            'actual_cost' => $workReport->actual_cost,
        ];

        $workReport->update($validated);

        $oldStatus = $workReport->status_label?->slug;

        if ($request->has('status_label_id')) {
            $workReport->labels()->sync([$request->status_label_id]);
        } else {
            // Ensure status label exists, default to pending if not set
            $existingStatus = $workReport->labels()->where('type', Label::TYPE_WORK_REPORT_STATUS)->first();
            if (!$existingStatus) {
                $pendingLabel = Label::where('slug', 'pending_work_report')->first();
                if ($pendingLabel) {
                    $workReport->labels()->attach($pendingLabel->id);
                }
            }
        }

        $workReport->loadDefault();

        $newStatus = $workReport->status_label?->slug;

        // Track what changed
        $changes = [];

        if ($oldValues['progress'] != $validated['progress']) {
            $changes[] = "progress from {$oldValues['progress']}% to {$validated['progress']}%";
        }

        if ($oldStatus !== $newStatus) {
            $changes[] = "status from " . str_replace('_', ' ', $oldStatus ?? 'none') . " to " . str_replace('_', ' ', $newStatus ?? 'none');
        }

        if (isset($validated['actual_cost']) && $oldValues['actual_cost'] != $validated['actual_cost']) {
            $changes[] = "actual cost from " . number_format($oldValues['actual_cost'] ?? 0) . " to " . number_format($validated['actual_cost']);
        }

        // Log Activity - Work Report Updated
        if (!empty($changes)) {
            $workReport->activities()->create([
                'user_id' => Auth::id(),
                'project_id' => $project->id,
                'subject_type' => WorkReport::class,
                'subject_id' => $workReport->id,
                'title' => 'Work report was changed',
                'description' => 'Updated ' . implode(', ', $changes),
                'properties' => [
                    'task_id' => $task->id,
                    'task_name' => $task->name,
                    'changes' => $changes,
                    'old_values' => $oldValues,
                    'new_values' => [
                        'progress' => $validated['progress'],
                        'status' => $newStatus,
                        'actual_cost' => $validated['actual_cost'] ?? null,
                    ],
                ],
            ]);
        }

        // If status changed to approved, notify the work report creator
        if ($oldStatus !== 'approved_work_report' && $newStatus === 'approved_work_report') {
            $workReport->user->notify(new \App\Notifications\WorkReportApprovedNotification($workReport));

            // Log Activity - Work Report Approved
            $workReport->activities()->create([
                'user_id' => Auth::id(),
                'project_id' => $project->id,
                'subject_type' => WorkReport::class,
                'subject_id' => $workReport->id,
                'title' => 'Work report was approved',
                'description' => $workReport->name ?? "Work report for {$task->name}",
                'properties' => [
                    'task_id' => $task->id,
                    'task_name' => $task->name,
                    'approved_by' => Auth::user()->name,
                ],
            ]);
        }

        if ($newStatus === 'approved_work_report' || $oldStatus === 'approved_work_report') {
            $this->updateTaskMetricsFromApprovedReports($task);
        }
        return response()->json(new WorkReportResource($workReport));
    }

    public function updateDetails(Request $request, Project $project, Task $task, WorkReport $workReport): JsonResponse
    {
        $this->authorize('update', [$task, $project]);

        $validated = $request->validate([
            'equipment_details' => 'nullable|array',
            'labor_details' => 'nullable|array',
            'material_details' => 'nullable|array',
            'work_done' => 'nullable|string',
            'progress' => 'nullable|integer|min:0|max:100',
            'photos_count' => 'nullable|integer|min:0',
        ]);

        $workReport->update($validated);

        $workReport->loadDefault();

        return response()->json(new WorkReportResource($workReport));
    }
    public function destroy(Project $project, Task $task, WorkReport $workReport): JsonResponse
    {
        $this->authorize('edit task', [$task, $project]);

        $workReport->delete();

        return response()->json([
            'message' => 'Work report deleted',
            'deleted' => true
        ]);
    }

    public function uploadPhotos(Request $request, Project $project, Task $task, WorkReport $workReport): JsonResponse
    {
        $this->authorize('update', [$task, $project]);

        $request->validate([
            'photos' => 'required|array',
            'photos.*' => 'required|file|mimes:jpeg,jpg,png,gif|max:5120', // 5MB max per file
        ]);

        $uploadedPhotos = [];

        foreach ($request->file('photos') as $photo) {
            $attachment = app(StoreAttachmentAction::class)->execute($workReport, $photo);
            $uploadedPhotos[] = $attachment;
        }

        $workReport->load('attachments');

        return response()->json([
            'message' => 'Photos uploaded successfully',
            'work_report' => new WorkReportResource($workReport),
            'uploaded_photos' => $uploadedPhotos
        ], 201);
    }

    public function approve(Request $request, Project $project, Task $task, WorkReport $workReport): JsonResponse
    {
        $this->authorize('update', [$task, $project]);

        $request->validate([
            'approved' => 'required|boolean',
            'remarks' => 'nullable|string',
        ]);

        $approvedLabel = Label::where('slug', 'approved_work_report')->first();
        $rejectedLabel = Label::where('slug', 'rejected_work_report')->first();

        if ($request->approved) {
            if ($approvedLabel) {
                $workReport->labels()->sync([$approvedLabel->id]);
            }
        } else {
            if ($rejectedLabel) {
                $workReport->labels()->sync([$rejectedLabel->id]);
            }
            // Update remarks when rejecting
            if ($request->has('remarks')) {
                $workReport->update(['remarks' => $request->remarks]);
            }
        }

        $workReport->loadDefault();

        // If approved, notify the work report creator
        if ($request->approved) {
            $workReport->user->notify(new \App\Notifications\WorkReportApprovedNotification($workReport));
            $this->updateTaskMetricsFromApprovedReports($task);

            // Log Activity - Work Report Approved
            $workReport->activities()->create([
                'user_id' => Auth::id(),
                'project_id' => $project->id,
                'subject_type' => WorkReport::class,
                'subject_id' => $workReport->id,
                'title' => 'Work report was approved',
                'description' => $workReport->name ?? "Work report for {$task->name}",
                'properties' => [
                    'task_id' => $task->id,
                    'task_name' => $task->name,
                    'approved_by' => Auth::user()->name,
                ],
            ]);
        } else {
            // If rejected, notify the work report creator
            $workReport->user->notify(new \App\Notifications\WorkReportRejectedNotification($workReport));
            $this->updateTaskMetricsFromApprovedReports($task);

            // Log Activity - Work Report Rejected
            $workReport->activities()->create([
                'user_id' => Auth::id(),
                'project_id' => $project->id,
                'subject_type' => WorkReport::class,
                'subject_id' => $workReport->id,
                'title' => 'Work report was rejected',
                'description' => $workReport->name ?? "Work report for {$task->name}",
                'properties' => [
                    'task_id' => $task->id,
                    'task_name' => $task->name,
                    'rejected_by' => Auth::user()->name,
                    'remarks' => $request->remarks,
                ],
            ]);
        }

        return response()->json(new WorkReportResource($workReport));
    }

    /**
     * Update task progress and actual costs using only approved work reports.
     */
    protected function updateTaskMetricsFromApprovedReports(Task $task): void
    {
        $approvedReports = $task->workReports()
            ->whereHas('labels', fn($q) => $q->where('slug', 'approved_work_report'))
            ->get(['progress', 'actual_cost']);

        /** @var Collection<int, \App\Models\WorkReport> $approvedReports */
        $task->progress_task = $approvedReports->max('progress') ?? 0;
        $task->budget_task_actual = $approvedReports->sum('actual_cost') ?? 0;
        $task->save();
    }
}

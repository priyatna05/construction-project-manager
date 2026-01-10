<?php

namespace App\Http\Controllers;

use App\Actions\Task\CreateTask as CreateTaskAction;
use App\Events\Task\TaskCreated;
use App\Events\Task\TaskGroupChanged;
use App\Events\Task\TaskOrderChanged;
use App\Http\Requests\Task\StoreTaskRequest;
use App\Http\Requests\Task\UpdateTaskRequest;
use App\Http\Resources\Project\ProjectResource;
use App\Http\Resources\Task\TaskResource;
use App\Http\Resources\Inventory\InventoryResource;
use Illuminate\Support\Facades\Log;
use App\Models\Label;
use App\Models\OwnerCompany;
use App\Models\Project;
use App\Models\Task;
use App\Models\TaskGroup;
use App\Models\Inventory;
use App\Models\User;
use App\Services\PermissionService;
use App\Services\TaskService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TaskController extends Controller
{
    public function __construct(
        protected CreateTaskAction $createTaskAction,
        protected TaskService $taskService
    ) {}

    public function index(Request $request, Project $project, ?Task $task = null): Response
    {
        // Ambil filter grup dari query (support array/single)
        $groupIds = collect($request->input('groups', []))
            ->filter()
            ->map(fn($v) => (int) $v)
            ->values()
            ->all();

        $taskRelations = [
            'project:id,name,is_completed',
            'taskGroup:id,name',
            'assignedToUser:id,name,avatar',
            'createdByUser:id,name,avatar',
            'labels',
            'attachments',
            'subscribedUsers:id,name',
            'dependencies',
            'dependentTasks',
            'allocatedInventories.labels',
            'inventoryAllocations.inventory.labels',
        ];
        if ($request->has('archived')) {
            $groupsWithTasks = TaskGroup::onlyArchived()
                ->where('project_id', $project->id)
                ->get();

            $archivedTasks = Task::onlyArchived()
                ->where('project_id', $project->id)
                ->when(!empty($groupIds), fn($q) => $q->whereIn('group_id', $groupIds))
                ->with($taskRelations)
                ->withCount('comments', 'workReports')
                ->get();

            $groupedTasks = $archivedTasks->groupBy('group_id')->map(function ($tasks) {
                return TaskResource::collection($tasks);
            });
        } else {
            $groupsWithTasks = $project->taskGroups()
                ->with([
                    'tasks' => fn($query) => $query
                        ->when(!empty($groupIds), fn($q) => $q->whereIn('group_id', $groupIds))
                        ->searchByQueryString()
                        ->filterByQueryString()
                        ->with($taskRelations)
                        ->withCount('comments', 'workReports')
                ])
                ->get();

            $groupedTasks = $groupsWithTasks->mapWithKeys(function (TaskGroup $group) use ($taskRelations) {
                $group->tasks->each(function ($task) use ($taskRelations) {
                    $task->loadMissing($taskRelations);
                });
                return [$group->id => TaskResource::collection($group->tasks)];
            });
        }

        // Manually set the project relation for each group
        $groupsWithTasks->each(function ($group) use ($project) {
            $group->setRelation('project', $project);
        });

        $project->loadMissing(['clientCompany', 'labels', 'attachments']);
        $taskDepends = Task::query()
            ->where('project_id', $project->id)
            ->when(
                $task?->exists,
                fn($q) =>
                $q->where('id', '!=', $task->id)
                    ->where('group_id', $task->group_id)
            )
            ->with([
                'dependencies' => function ($q) {
                    // relationType is loaded on the pivot in TaskResource
                }
            ])
            ->orderBy('name')
            ->get(['id', 'number', 'name', 'group_id', 'start_date', 'end_date']);

        $openedTaskResource = null;
        if ($task && $task->exists) {
            $task->loadMissing($taskRelations);
            $task->loadCount('comments', 'workReports');
            $openedTaskResource = new TaskResource($task);
        }

        $availableInventories = Inventory::query()
            ->active()
            ->with('labels')
            ->orderBy('name')
            ->get();
        $allowedSlugs = [
            // 📏 PANJANG
            'millimeter',
            'centimeter',
            'meter',
            'kilometer',
            // 📐 LUAS
            'square_meter',
            'are',
            'hectare',
            // 🧱 VOLUME
            'cubic_meter',
            'liter',
            'milliliter',
            // ⏱️ WAKTU
            'hour',
            'day',
            'week',
            'month',
        ];

        $order = implode(',', array_fill(0, count($allowedSlugs), '?'));

        $units = Label::query()
            ->whereIn('labels.type', [Label::TYPE_TASK_INVENTORY_UNIT, Label::TYPE_KONTRAK])
            ->whereIn('slug', $allowedSlugs)
            ->orderByRaw("FIELD(slug, $order)", $allowedSlugs)
            ->get();
        $type = Label::query()
            ->where('type', [Label::TYPE_TASK])->get();
        $priority = Label::query()
            ->where('type', [Label::TYPE_PRIORITY])->get();
        $relations = Label::taskRelation()->get();
        // =====================================================================
        // LANGKAH 4: Kirim Semua Data ke View Inertia
        // =====================================================================

        return Inertia::render('Projects/Tasks/Index', [
            'project' => new ProjectResource($project),
            'usersWithAccessToProject' => PermissionService::usersWithAccessToProject($project),
            'taskGroups' => $groupsWithTasks,
            'groupedTasks' => $groupedTasks,
            'taskDepends' => $taskDepends,
            'labels' => Label::get(['id', 'name', 'color', 'type', 'icon']),
            'taskRelationLabels' => $relations,
            'units' => $units,
            'types' => $type,
            'priorities' => $priority,
            'openedTask' => $openedTaskResource,
            'availableResources' => InventoryResource::collection($availableInventories),
            'currency' => [
                'symbol' => OwnerCompany::first()?->currency?->symbol ?? '$',
            ],
            'dropdowns' => [
                'types' => Label::ofType(Label::TYPE_KONTRAK)->get(),
                'status' => Label::ofType(Label::TYPE_PROJECT_TASK_STATUS)->get(['id', 'name', 'slug', 'color', 'icon']),
                'users' => User::userDropdownValues(['client'], $request->user()->id),
            ],
        ]);
    }

    public function store(StoreTaskRequest $request, Project $project)
    {
        // Log::info('🎯 [TASK CONTROLLER] Store method called');
        // Log::info('📥 [TASK CREATE] Raw Request', [
        //     'project_id' => $project->id,
        //     'method' => $request->method(),
        //     'content_type' => $request->header('Content-Type'),
        //     'has_files' => $request->hasFile('attachment_files'),
        //     'all_keys' => array_keys($request->all()),
        // ]);

        try {
            $validatedData = $request->validated();
            // Log::info('✅ [TASK CREATE] Validation Passed', [
            //     'validated_keys' => array_keys($validatedData)
            // ]);

            // Transform inventories - PENTING!
            if (isset($validatedData['inventories'])) {
                $validatedData['inventories'] = array_map(function ($inv) {
                    return [
                        'inventory_id' => $inv['inventory_id'] ?? null,
                        'quantity' => $inv['quantity'] ?? 0,
                        'note' => $inv['note'] ?? ''
                    ];
                }, $validatedData['inventories']);
            }


            // Log::info('🔄 [TASK CREATE] Creating task via service...');
            $task = $this->taskService->createTask($project, $validatedData);
            // Log::info('✅ [TASK CREATE] Task created', ['task_id' => $task->id]);

            if ($request->hasFile('attachment_files')) {
                // Log::info('📎 [TASK CREATE] Uploading attachments...');

                $attachments = $this->createTaskAction->uploadAttachments(
                    $task,
                    $request->file('attachment_files')
                );

                // Log::info('✅ [TASK CREATE] Attachments uploaded', [
                //     'count' => $attachments->count(),
                // ]);
            }

            // Log::info('📡 [TASK CREATE] Broadcasting event...');
            TaskCreated::dispatch($task);

            // Log::info('🎉 [TASK CREATE] Complete');

            // Load necessary relations for the task resource
            $task->loadMissing([
                'project:id,name',
                'taskGroup:id,name',
                'assignedToUser:id,name,avatar',
                'createdByUser:id,name,avatar',
                'labels',
                'attachments',
                'subscribedUsers:id,name',
                'dependencies',
                'dependentTasks',
                'allocatedInventories.labels',
                'inventoryAllocations.inventory.labels',
            ]);

            return response()->json([
                'task' => new TaskResource($task),
                'flash' => [
                    'type' => 'success',
                    'title' => 'Task Created',
                    'message' => 'The task has been successfully created.',
                ],
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            // Log::error('❌ [TASK CREATE] Validation Failed', [
            //     'errors' => $e->errors()
            // ]);

            if ($request->expectsJson()) {
                return response()->json([
                    'errors' => $e->errors(),
                    'message' => 'Validation failed.',
                ], 422);
            }

            return back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            // Log::error('❌ [TASK CREATE] Failed', [
            //     'error' => $e->getMessage(),
            //     'file' => $e->getFile(),
            //     'line' => $e->getLine(),
            //     'trace' => $e->getTraceAsString()
            // ]);

            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Failed to create task.',
                    'error' => $e->getMessage(),
                ], 500);
            }

            return back()->withErrors([
                'error' => 'Failed to create task: ' . $e->getMessage()
            ])->withInput();
        }
    }

    public function update(UpdateTaskRequest $request, Project $project, Task $task)
    {
        $this->authorize('update', [$task, $project]);

        $updatedTask = (new TaskService())->updateTask($task, $request->validated());

        $updatedTask->loadMissing([
            'project:id,name',
            'taskGroup:id,name',
            'assignedToUser:id,name,avatar',
            'createdByUser:id,name,avatar',
            'labels',
            'attachments',
            'subscribedUsers:id,name',
            'dependencies',
            'dependentTasks',
        ]);

        return response()->json([
            'task' => new TaskResource($updatedTask),
            'flash' => [
                'type' => 'success',
                'title' => 'Task Updated',
                'message' => 'The task has been successfully updated.',
            ],
        ]);
    }

    public function reorder(Request $request, Project $project): JsonResponse
    {
        $this->authorize('reorder', [Task::class, $project]);

        (new TaskService())->reorderTasks($project, $request->ids, $request->group_id, $request->from_index, $request->to_index);

        TaskOrderChanged::dispatch(
            $project->id,
            (int) $request->group_id,
            (int) $request->from_index,
            (int) $request->to_index
        );

        return response()->json();
    }

    //verivy need it!
    public function move(Request $request, Project $project): JsonResponse
    {
        $this->authorize('reorder', [Task::class, $project]);

        (new TaskService())->moveTaskGroup($request->ids, $request->from_group_id, $request->to_group_id, $request->from_index, $request->to_index);

        TaskGroupChanged::dispatch(
            $project->id,
            (int) $request->from_group_id,
            (int) $request->to_group_id,
            (int) $request->from_index,
            (int) $request->to_index
        );

        return response()->json();
    }

    public function complete(Request $request, Project $project, Task $task): JsonResponse
    {
        $this->authorize('complete', [Task::class, $project]);

        $completedAt = $request->input('completed_at');

        $updatedTask = (new TaskService())->completeTask(
            $task,
            $request->boolean('completed'),
            $completedAt
        );

        return response()->json([
            'task' => new TaskResource($updatedTask->fresh()),
        ]);
    }

    public function destroy(Project $project, Task $task): RedirectResponse
    {
        $this->authorize('archive task', [$task, $project]);

        (new TaskService())->archiveTask(['task' => $task]);

        return redirect()->back()->success('Task archived', 'The task was successfully archived.');
    }

    public function restore(Project $project, Task $task)
    {
        $task = Task::withArchived()->findOrFail($task->id);

        $this->authorize('restore', [$task, $project]);

        (new TaskService())->restoreTask($task);

        return redirect()->back()->success('Task restored', 'The restoring of the Task was completed successfully.');
    }

    public function forceDelete(Project $project, Task $task)
    {
        $this->authorize('forceDelete', [$task, $project]);

        if ($task->project_id !== $project->id) {
            return redirect()->back()->error('Invalid project-task relation', 'This task does not belong to the selected project.');
        }

        // delete related data
        $task->inventoryAllocations()->delete();
        $task->attachments()->delete();
        $task->comments()->delete();
        $task->labels()->detach();

        $task->forceDelete();

        return redirect()->back()->success('Task deleted', 'The task was permanently deleted.');
    }


    public function allocatedInventories(Project $project, Task $task): JsonResponse
    {
        $this->authorize('view', [$task, $project]);

        $allocatedInventories = $task->allocatedInventories()
            ->with('labels')
            ->get()
            ->map(function ($inventory) {
                $typeLabel = $inventory->labels->where('type', \App\Models\Label::TYPE_INVENTORY_TYPE)->first();
                $unitLabel = $inventory->labels->where('type', \App\Models\Label::TYPE_TASK_INVENTORY_UNIT)->first();

                return [
                    'inventory' => [
                        'id' => $inventory->id,
                        'name' => $inventory->name,
                        'type' => $typeLabel,
                        'unit' => $unitLabel,
                        'unit_cost' => $inventory->unit_cost,
                        'quantity_inventory' => $inventory->quantity_on_hand,
                        'labels' => $inventory->labels,
                    ],
                    'quantity_allocated' => $inventory->pivot->quantity_allocated ?? 0,
                    'cost_at_allocation' => $inventory->pivot->cost_at_allocation ?? 0,
                ];
            });

        return response()->json($allocatedInventories);
    }
}

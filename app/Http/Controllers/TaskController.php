<?php

namespace App\Http\Controllers;

use App\Actions\Task\CreateTask;
use App\Actions\Task\UpdateTask;
use App\Events\Task\TaskDeleted;
use App\Events\Task\TaskGroupChanged;
use App\Events\Task\TaskOrderChanged;
use App\Events\Task\TaskRestored;
use App\Events\Task\TaskUpdated;
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
use App\Services\PermissionService;
use App\Services\TaskService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TaskController extends Controller
{
    public function index(Request $request, Project $project, ?Task $task = null): Response
    {
        $taskRelations = [
            'project:id,name',
            'taskGroup:id,name',
            'assignedToUser:id,name,avatar',
            'createdByUser:id,name,avatar',
            'labels',
            'attachments',
            'subscribedUsers:id,name',
            'dependencies',
            'allocatedInventories.labels',
            'inventoryAllocations.inventory.labels',
        ];
        $groupsWithTasks = $project->taskGroups()
                   ->when($request->has('archived'), fn ($query) => $query->onlyArchived())
                   ->with([
                       'tasks' => fn ($query) => $query
                           ->searchByQueryString()
                           ->filterByQueryString()
                           ->when($request->user()->hasRole('client'))
                           ->with($taskRelations)
                   ])
                   ->get();

        $groupedTasks = $groupsWithTasks->mapWithKeys(function (TaskGroup $group) use ($taskRelations) {
            $group->tasks->each(function ($task) use ($taskRelations) {
            $task->loadMissing($taskRelations);
        });
            return [$group->id => TaskResource::collection($group->tasks)];
        });

        $project->loadMissing('clientCompany');
        $taskDepends = Task::query()
            ->where('project_id', $project->id)
            ->whereNotNull('group_id')
            ->when($task?->exists, fn ($q) => $q->where('id', '!=', $task->id)->where('group_id', $task->group_id))
            ->orderBy('name')
            ->get(['id', 'number', 'name', 'group_id']);
        $taskRelationLabels = Label::taskRelation()->get(['id', 'name', 'slug', 'color', 'icon'])->map(function ($label) {
            return [
                'value' => $label->id,
                'name' => $label->name,
                'slug' => $label->slug,
                'icon' => $label->icon,
                'color' => $label->color,
            ];
        });
        $openedTaskResource = null;
        if ($task && $task->exists) {
            $task->loadMissing($taskRelations);
            $openedTaskResource = new TaskResource($task);
        }

       $allInventories = Inventory::orderBy('name')->get();

        // 2. Gunakan Log untuk memastikan query ini berjalan dan menemukan sesuatu.
        Log::info("Total inventories found in database: " . $allInventories->count());

        // 3. Ini adalah query yang lebih benar yang akan kita gunakan setelah debugging.
        $availableInventories = Inventory::query()
            ->where('project_site_location_id', $project->id)
            ->orWhereNull('project_site_location_id')
            // ->active() // Komentari scope 'active' sementara untuk debugging
            ->with('labels')
            ->orderBy('name')
            ->get();

        Log::info("Available inventories for Project #{$project->id}: " . $availableInventories->count());

        // =====================================================================
        // LANGKAH 4: Kirim Semua Data ke View Inertia
        // =====================================================================

        return Inertia::render('Projects/Tasks/Index', [
            'project' => new ProjectResource($project),
            'usersWithAccessToProject' => PermissionService::usersWithAccessToProject($project),
            'taskGroups' => $groupsWithTasks,
            'groupedTasks' => $groupedTasks,
            'taskDepends' => $taskDepends,
            'taskRelationLabels' => $taskRelationLabels,
            'labels' => Label::get(['id', 'name', 'color', 'type', 'icon']),
            'openedTask' => $openedTaskResource,
            'availableResources' => InventoryResource::collection($availableInventories),
            'currency' => [
                'symbol' => OwnerCompany::first()?->currency?->symbol ?? '$',
            ],
        ]);
    }

    public function store(StoreTaskRequest $request, Project $project): RedirectResponse
    {
        $this->authorize('create', [Task::class, $project]);

        (new TaskService())->createTask($project, $request->validated());

        return redirect()->route('projects.tasks', $project)->success('Task added', 'A new task was successfully added.');
    }

    public function update(UpdateTaskRequest $request, Project $project, Task $task)
    {
        $this->authorize('update', [$task, $project]);
    //         $validated = $request->validated();

    // \Log::info('Subscribers:', $validated['subscribed_users'] ?? []);


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
    ]);

    return response()->json($updatedTask->toArray());
    }

    public function reorder(Request $request, Project $project): JsonResponse
    {
        $this->authorize('reorder', [Task::class, $project]);

        (new TaskService())->reorderTasks($project, $request->ids, $request->group_id, $request->from_index, $request->to_index);

        return response()->json();
    }

    //verivy need it!
    public function move(Request $request, Project $project): JsonResponse
    {
        $this->authorize('reorder', [Task::class, $project]);

        (new TaskService())->moveTaskGroup($request->ids, $request->from_group_id, $request->to_group_id, $request->from_index, $request->to_index);

        return response()->json();
    }

    public function complete(Request $request, Project $project, Task $task): JsonResponse
    {
        $this->authorize('complete', [Task::class, $project]);

        (new TaskService())->completeTask($task, $request->boolean('completed'));

        return response()->json();
    }

    public function destroy(Project $project, Task $task): RedirectResponse
    {
        $this->authorize('archive task', [$task, $project]);

        (new TaskService())->archiveTask($task);

        return redirect()->back()->success('Task archived', 'The task was successfully archived.');
    }

    public function restore(Project $project, int $taskId)
    {
        $task = Task::withArchived()->findOrFail($taskId);

        $this->authorize('restore', [$task, $project]);

        (new TaskService())->restoreTask($task);

        return redirect()->back()->success('Task restored', 'The restoring of the Task was completed successfully.');
    }
}

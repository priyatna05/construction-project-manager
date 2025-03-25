<?php

namespace App\Http\Controllers;

use App\Http\Requests\Task\StoreTaskRequest;
use App\Http\Requests\Task\UpdateTaskRequest;
use App\Models\Label;
use App\Models\Project;
use App\Models\Task;
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
        $this->authorize('viewAny', [Task::class, $project]);

        $groups = $project->taskGroups()
            ->with(['tasks' => function ($query) use ($request) {
                $query->searchByQueryString()
                    ->filterByQueryString()
                    ->when($request->user()->hasRole('client'), fn ($query) => $query->where('hidden_from_clients', false))
                    ->when($request->has('archived'), fn ($query) => $query->onlyArchived())
                    ->when(! $request->has('status'), fn ($query) => $query->whereNull('completed_at'))
                    ->withDefault();
            }])
            ->get();

        return Inertia::render('Projects/Tasks/Index', [
            'project' => $project,
            'usersWithAccessToProject' => PermissionService::usersWithAccessToProject($project),
            'labels' => Label::select('id', 'name', 'color')->get(),
            'taskGroups' => $groups,
            'groupedTasks' => $groups->pluck('tasks', 'id'),
            'openedTask' => $task ? $task->loadDefault() : null,
        ]);
    }

    public function store(StoreTaskRequest $request, Project $project): RedirectResponse
    {
        $this->authorize('create', [Task::class, $project]);

        (new TaskService)->createTask($project, $request->validated());

        return redirect()->route('projects.tasks', $project)->success('Task added', 'A new task was successfully added.');
    }

    public function update(UpdateTaskRequest $request, Project $project, Task $task): JsonResponse
    {
        $this->authorize('update', [$task, $project]);

        (new TaskService)->updateTask($task, $request->validated());

        return response()->json();
    }

    public function reorder(Request $request, Project $project): JsonResponse
    {
        $this->authorize('reorder', [Task::class, $project]);

        (new TaskService)->reorderTasks($project, $request->ids, $request->group_id, $request->from_index, $request->to_index);

        return response()->json();
    }

    public function move(Request $request, Project $project): JsonResponse
    {
        $this->authorize('reorder', [Task::class, $project]);

        (new TaskService)->moveTaskGroup($request->ids, $request->from_group_id, $request->to_group_id, $request->from_index, $request->to_index);

        return response()->json();
    }

    public function complete(Request $request, Project $project, Task $task): JsonResponse
    {
        $this->authorize('complete', [Task::class, $project]);

        (new TaskService)->completeTask($task, $request->completed);

        return response()->json();
    }

    public function destroy(Project $project, Task $task): RedirectResponse
    {
        $this->authorize('archive task', [$task, $project]);

        (new TaskService)->archiveTask($task);

        return redirect()->back()->success('Task archived', 'The task was successfully archived.');
    }

    public function restore(Project $project, int $taskId)
    {
        $task = Task::withArchived()->findOrFail($taskId);

        $this->authorize('restore', [$task, $project]);

        (new TaskService)->restoreTask($task);

        return redirect()->back()->success('Task restored', 'The restoring of the Task was completed successfully.');
    }
}

<?php

namespace App\Http\Controllers\Task;

use App\Events\TaskGroup\TaskGroupCreated;
use App\Events\TaskGroup\TaskGroupDeleted;
use App\Events\TaskGroup\TaskGroupOrderChanged;
use App\Events\TaskGroup\TaskGroupRestored;
use App\Events\TaskGroup\TaskGroupUpdated;
use App\Http\Controllers\Controller;
use App\Http\Requests\TaskGroup\StoreTaskGroupRequest;
use App\Http\Requests\TaskGroup\UpdateTaskGroupRequest;
use App\Models\Project;
use App\Models\TaskGroup;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;

class GroupController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(TaskGroup::class, 'taskGroup');
    }

    public function index(Request $request)
    {
        $taskGroup = TaskGroup::Query()
            ->with([
                'project:id,code,name',
                'tasks:id,name,task_group_id',
            ])
            ->when($request->user()->isNotAdmin(), function ($query) {
                $query->whereHas('project.clientCompany.clients', fn($query) => $query->where('users.id',  Auth::id()))
                    ->orWhereHas('users', fn($query) => $query->where('user_id',  Auth::id()));
            })
            ->when($request->has('archived'), fn($query) => $query->onlyArchived())
            ->orderBy('name')
            ->get();

        return inertia('Tasks/Groups/Index', [
            'items' => $taskGroup,
        ]);
    }

    public function store(StoreTaskGroupRequest $request, Project $project)
    {
        $this->authorize('create', [TaskGroup::class, $project]);

        $taskGroup = $project->taskGroups()->create($request->validated());

        TaskGroupCreated::dispatch($taskGroup);

        return redirect()->route('projects.tasks', $project)->success('Tasks group created', 'A new tasks group was successfully created.');
    }

    public function update(UpdateTaskGroupRequest $request, Project $project, TaskGroup $taskGroup)
    {
        $this->authorize('update', [$taskGroup, $project]);

        $taskGroup->update($request->validated());

        TaskGroupUpdated::dispatch($taskGroup);

        return redirect()->route('projects.tasks', $project)->success('Tasks group updated', 'The tasks group was successfully updated.');
    }

    public function destroy(Request $request, Project $project, TaskGroup $taskGroup)
    {
        $this->authorize('delete', [$taskGroup, $project]);

        $taskGroup->load('tasks');

        if ($taskGroup->tasks->isNotEmpty()) {
            foreach ($taskGroup->tasks as $task) {
                app(\App\Services\TaskService::class)->archiveTask(['task' => $task]);
            }
        }

        $taskGroup->archive();

        TaskGroupDeleted::dispatch($taskGroup->id, $project->id);

        return redirect()
            ->route('projects.tasks', $project)
            ->success(
                'Task group archived',
                $taskGroup->tasks->isNotEmpty()
                    ? 'The task group and all its tasks were successfully archived.'
                    : 'The task group was successfully archived.'
            );
    }

    public function restore(Project $project, int $taskGroupId)
    {
        $taskGroup = TaskGroup::withArchived()->findOrFail($taskGroupId);

        $this->authorize('restore', [$taskGroup, $project]);

        $taskGroup->unArchive();

        TaskGroupRestored::dispatch($taskGroup);

        return redirect()->back()->success('Tasks group restored', 'The restoring of the tasks group was completed successfully.');
    }

       public function reorder(Request $request, Project $project)
    {
        $this->authorize('reorder', [TaskGroup::class, $project]);

        TaskGroup::setNewOrder($request->ids);

        TaskGroupOrderChanged::dispatch($project->id, $request->ids);

        return response()->json();
    }

    public function forceDelete(Project $project, TaskGroup $taskGroup)
    {
        $taskGroup = TaskGroup::withArchived()->findOrFail($taskGroup->id);

        $this->authorize('forceDelete', [$taskGroup, $project]);

        $taskGroup->load('tasks');

        if ($taskGroup->tasks->isNotEmpty()) {
            foreach ($taskGroup->tasks as $task) {
                $task->inventoryAllocations()->delete();
                $task->attachments()->delete();
                $task->comments()->delete();
                $task->labels()->detach();
                $task->forceDelete();
            }
        }

        $taskGroup->forceDelete();

        return redirect()->back()->success('Tasks group deleted', 'The tasks group and all its tasks were successfully deleted.');
    }
}

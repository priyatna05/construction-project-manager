<?php

namespace App\Services;

use App\Events\Task\TaskDeleted;
use App\Events\Task\TaskGroupChanged;
use App\Events\Task\TaskOrderChanged;
use App\Events\Task\TaskRestored;
use App\Events\Task\TaskUpdated;
use App\Models\Project;
use App\Models\Task;

class TaskService
{
    public function createTask(Project $project, array $data): Task
    {
        return Task::create(array_merge($data, ['project_id' => $project->id]));
    }

    public function updateTask(Task $task, array $data): void
    {
        $task->update($data);
    }

    public function reorderTasks(Project $project, array $taskIds, int $groupId, int $fromIndex, int $toIndex): void
    {
        Task::setNewOrder($taskIds);
        TaskOrderChanged::dispatch($project->id, $groupId, $fromIndex, $toIndex);
    }

    public function moveTaskGroup(array $taskIds, int $fromGroupId, int $toGroupId, int $fromIndex, int $toIndex): void
    {
        Task::whereIn('id', $taskIds)->update(['group_id' => $toGroupId]);
        TaskGroupChanged::dispatch($project->id, $fromGroupId, $toGroupId, $fromIndex, $toIndex);
    }

    public function completeTask(Task $task, bool $isCompleted): void
    {
        $task->update(['completed_at' => $isCompleted ? now() : null]);
        TaskUpdated::dispatch($task, 'completed_at');
    }

    public function archiveTask(Task $task): void
    {
        $task->archive();
        TaskDeleted::dispatch($task->id, $task->project_id);
    }

    public function restoreTask(Task $task): void
    {
        $task->unArchive();
        TaskRestored::dispatch($task);
    }

    public function addDependency(Task $task, int $dependsOnTaskId, string $relationType): void
    {
        $task->dependencies()->attach($dependsOnTaskId, ['relation_type' => $relationType]);
    }

    public function removeDependency(Task $task, int $dependencyId): void
    {
        $task->dependencies()->detach($dependencyId);
    }
}

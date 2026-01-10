<?php

namespace App\Observers;

use App\Events\Task\TaskUpdated;
use App\Models\User;
use App\Models\Task;
use App\Notifications\TaskAssignedNotification;
use App\Services\TaskService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class TaskObserver
{
    /**
     * Handle the Task "created" event.
     */
    public function created(Task $task): void
    {
        $user = Auth::user() ?? User::whereHas('roles', fn($q) =>
            $q->where('name', 'admin')
        )->first();

        $userId = $user?->id ?? 1;
        $userName = $user?->name ?? 'System';

        $task->activities()->create([
            'project_id'    => $task->project_id,
            'user_id'       => $userId,
            'title'         => 'New task',
            'description'   => "\"{$task->name}\" was created by {$userName}",
        ]);

        if ($task->assigned_to_user_id !== null) {
            $task->assigned_at = now();
            $task->saveQuietly();
        }

        // Initialize budget_task_actual to calculated value if not set
        if (is_null($task->budget_task_actual)) {
            $task->budget_task_actual = \App\Services\TaskService::calculateBudgetTaskActual($task);
            $task->saveQuietly();
        }

        // Update project direct costs when task is created
        \App\Services\ProjectService::updateCalculatedFields($task->project);
    }

    /**
     * Handle the Task "updated" event.
     */
    public function updated(Task $task): void
    {
        $user = Auth::user() ?? User::whereHas('roles', fn($q) =>
            $q->where('name', 'admin')
        )->first();

        $userId = $user?->id ?? 1;
        $userName = $user?->name ?? 'System';

        if ($task->isDirty('name')) {
            $task->activities()->create([
                'project_id'    => $task->project_id,
                'user_id'       => $userId,
                'title'         => 'Task name was changed',
                'description'   => "from \"{$task->getOriginal('name')}\" to \"{$task->name}\" by {$userName}",
            ]);
        }
        if ($task->isDirty('description')) {
            $task->activities()->create([
                'project_id'    => $task->project_id,
                'user_id'       => $userId,
                'title'         => 'Task description was changed',
                'description'   => "on \"{$task->name}\" by {$userName}",
            ]);
        }
        if ($task->isDirty('assigned_to_user_id')) {
            $task->activities()->create([
                'project_id'    => $task->project_id,
                'user_id'       => $userId,
                'title'         => $task->assigned_to_user_id ? 'Assigned user to task' : 'Assigned user was removed',
                'description'   => $task->assigned_to_user_id
                    ? "\"{$task->name}\" was assigned to {$task->assignedToUser->name} by {$userName}"
                    : "on task \"{$task->name}\" by {$userName}",
            ]);

            $task->assigned_at = now();
            $task->saveQuietly();
        }

        if ($task->wasChanged('assigned_to_user_id') && $task->assigned_to_user_id) {
            $assignedUser = $task->assignedToUser()->first();
            if ($assignedUser && $assignedUser->id !== $userId) {
                $task->loadMissing(['project', 'createdByUser']);
                $assignedUser->notify(new TaskAssignedNotification($task, $user));
            }
        }

        // Trigger EVM record recalculation for the related project
        if ($task->project_id) {
            app(\App\Services\EvmRecordService::class)->calculateAndSave(
                $task->project
            );
        }

        // Dispatch job untuk real-time EVM recalculation
        \App\Jobs\RecalculateEvmJob::dispatch($task->project);

        // Update project direct costs if budget fields changed
        if ($task->isDirty('budget_task_plan') || $task->isDirty('budget_task_actual')) {
            \App\Services\ProjectService::updateCalculatedFields($task->project);
        }

        // Recalculate budget_task_plan if volume or unit_cost_task changed
        if ($task->isDirty('volume') || $task->isDirty('unit_cost_task')) {
            $task->budget_task_plan = ($task->volume ?? 0) * ($task->unit_cost_task ?? 0);
            // Add allocated inventory costs
            $allocatedCost = $task->inventoryAllocations()->sum('cost_at_allocation');
            $task->budget_task_plan += $allocatedCost;
            $task->saveQuietly();

            // Update project direct costs
            \App\Services\ProjectService::updateCalculatedFields($task->project);
        }
    }

    /**
     * Handle the Project "archived" event.
     */
    public function archived(Task $task): void
    {
        $user = Auth::user() ?? User::whereHas('roles', fn($q) =>
            $q->where('name', 'admin')
        )->first();

        $userId = $user?->id ?? 1;
        $userName = $user?->name ?? 'System';

        $task->activities()->create([
            'project_id' => $task->project_id,
            'user_id' => $userId,
            'title' => 'Task was archived',
            'description' => "\"{$task->name}\" was archived by {$userName}",
        ]);
    }

    /**
     * Handle the Project "unArchived" event.
     */
    public function unArchived(Task $task): void
    {
        $user = Auth::user() ?? User::whereHas('roles', fn($q) =>
            $q->where('name', 'admin')
        )->first();

        $userId = $user?->id ?? 1;
        $userName = $user?->name ?? 'System';

        $task->activities()->create([
            'project_id' => $task->project_id,
            'user_id' => $userId,
            'title' => 'Task was unarchived',
            'description' => "\"{$task->name}\" was unarchived by {$userName}",
        ]);
    }


    public function saved(Task $task)
    {
        // Always recalculate budget_task_actual
        $calculated = TaskService::calculateBudgetTaskActual($task);
        if ($task->budget_task_actual != $calculated) {
            $task->budget_task_actual = $calculated;
            $task->saveQuietly();

            // Update project direct costs after task budget changes
            \App\Services\ProjectService::updateCalculatedFields($task->project);
        }
        broadcast(new TaskUpdated($task, 'budget_task_actual'));
    }

    /**
     * Handle the Task "updating" event.
     */
    public function updating(Task $task): void
    {
        // Prevent manual updates to budget_task_actual if it's being auto-calculated
        if ($task->isDirty('budget_task_actual') && !$task->isDirty('volume') && !$task->isDirty('unit_cost_task')) {
            // If only budget_task_actual is dirty and no related fields, revert it
            $task->budget_task_actual = $task->getOriginal('budget_task_actual');
        }
    }

    /**
     * Handle the Task "deleted" event.
     */
    public function deleted(Task $task): void
    {
        // Update project direct costs when task is deleted
        \App\Services\ProjectService::updateCalculatedFields($task->project);

        // Dispatch job untuk real-time EVM recalculation
        \App\Jobs\RecalculateEvmJob::dispatch($task->project);
    }
}

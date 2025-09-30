<?php

namespace App\Observers;

use App\Models\User;
use App\Models\Task;
use Illuminate\Support\Facades\Auth;

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

        // Trigger EVM record recalculation for the related project
        if ($task->project_id) {
            app(\App\Services\EvmRecordService::class)->calculateAndSave(
                $task->project
            );
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
}

<?php

use App\Models\Project;
use App\Models\Task;
use App\Models\Inventory;
use App\Services\PermissionService;
use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
*/

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('App.Models.Project.{id}', function ($user, $id) {
    $projectId = (int) $id;
    if ($projectId <= 0) {
        return false;
    }
    $users = PermissionService::usersWithAccessToProject(
        Project::findOrFail($projectId)
    );

    return $users->contains(fn ($u) => $u['id'] === $user->id);
});

Broadcast::channel('App.Models.Task.{id}', function ($user, $id) {
    $taskId = (int) $id;
    if ($taskId <= 0) {
        return false;
    }
    $task = Task::findOrFail($taskId);
    $users = PermissionService::usersWithAccessToProject($task->project);

    return $users->contains(fn ($u) => $u['id'] === $user->id);
});

Broadcast::channel('App.Models.Inventory.{id}', function ($user, $id) {
    $inventoryId = (int) $id;
    if ($inventoryId <= 0) {
        return false;
    }
    $inventory = Inventory::findOrFail($inventoryId);
    $users = PermissionService::usersWithAccessToProject($inventory->project);

    return $users->contains(fn ($u) => $u['id'] === $user->id);
});

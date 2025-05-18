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

Broadcast::channel('App.Models.Project.{id}', function ($user, int $id) {
    $users = PermissionService::usersWithAccessToProject(
        Project::findOrFail($id)
    );

    return $users->contains(fn ($u) => $u['id'] === $user->id);
});

Broadcast::channel('App.Models.Task.{id}', function ($user, int $id) {
    $task = Task::findOrFail($id);
    $users = PermissionService::usersWithAccessToProject($task->project);

    return $users->contains(fn ($u) => $u['id'] === $user->id);
});

Broadcast::channel('App.Models.Inventory.{id}', function ($user, int $id) {
    $inventory = Inventory::findOrFail($id);
    $users = PermissionService::usersWithAccessToProject($inventory->project);

    return $users->contains(fn ($u) => $u['id'] === $user->id);
});

<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Task;
use App\Models\Inventory;

class InventoryPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view inventory');
    }

    public function view(User $user, Inventory $inventory): bool
    {
        return $user->hasPermissionTo('view inventory') &&
               optional($inventory->status_label)->slug !== 'deleted';
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create inventory');
    }

    public function update(User $user, Inventory $inventory): bool
    {
        return $user->hasPermissionTo('edit inventory') &&
               optional($inventory->status_label)->slug !== 'deleted';
    }

    public function archive(User $user, Inventory $inventory): bool
    {
        return $user->hasPermissionTo('archive inventory') &&
               optional($inventory->status_label)->slug !== 'inactive';
    }

    public function restore(User $user, Inventory $inventory): bool
    {
        return $user->hasPermissionTo('restore inventory') &&
               optional($inventory->status_label)->slug !== 'active';
    }

    public function delete(User $user, Inventory $inventory): bool
    {
        return $user->hasPermissionTo('delete inventory') &&
               optional($inventory->status_label)->slug !== 'deleted';
    }

    public function forceDelete(User $user, Inventory $inventory): bool
    {
        return $user->hasPermissionTo('force delete inventory') &&
               optional($inventory->status_label)->slug !== 'deleted';
    }

    public function allocate(User $user, Inventory $inventory, Task $task): bool
    {
        return $user->hasPermissionTo('allocate inventory') &&
               optional($inventory->status_label)->slug === 'active' &&
               $user->can('edit', $task->project);
    }

    public function viewCosts(User $user, Inventory $inventory): bool
    {
        return $user->hasPermissionTo('view inventory costs') &&
               optional($inventory->status_label)->slug === 'active';
    }

    public function manageCosts(User $user, Inventory $inventory): bool
    {
        return $user->hasPermissionTo('manage inventory costs') &&
               optional($inventory->status_label)->slug === 'active';
    }

    public function export(User $user): bool
    {
        return $user->hasPermissionTo('export inventory');
    }
}

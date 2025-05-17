<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Project;
use App\Models\Task;


class InventoryPolicy
{

    /**
     * Determine whether the user can view any inventory.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view inventories');
    }

    /**
     * Determine whether the user can view the inventory.
     */
    public function view(User $user, Inventory $inventory): bool
    {
        return $user->hasPermissionTo('view inventories') &&
               $inventory->status !== InventoryStatus::DELETED->value;
    }

    /**
     * Determine whether the user can create inventories.
     */
    public function create(User $user, Project $project): bool
    {
        return $user->hasPermissionTo('create inventories') && $user->hasPermissionTo('edit', $project);
    }

    /**
     * Determine whether the user can update the Inventories.
     */
    public function update(User $user, Inventory $inventory): bool
    {
        return $user->hasPermissionTo('edit inventories') &&
               $inventory->status !== InventoryStatus::DELETED->value;
    }

    /**
     * Determine whether the user can delete the Inventories.
     */
    public function delete(User $user, Inventory $inventory): bool
    {
        return $user->hasPermissionTo('delete inventories') &&
               $inventory->status !== InventoryStatus::DELETED->value;
    }

    /**
     * Determine whether the user can restore the Inventories.
     */
    public function restore(User $user, Inventory $inventory): bool
    {
        return $user->hasPermissionTo('restore inventories') &&
               $inventory->status === InventoryStatus::DELETED->value;
    }

    /**
     * Determine whether the user can force delete the Inventories.
     */
    public function forceDelete(User $user, Inventory $inventory): bool
    {
        return $user->hasPermissionTo('force delete inventories');
    }

    /**
     * Determine whether the user can allocate the Inventories to a task.
     */
    public function allocate(User $user, Inventory $inventory, Task $task): bool
    {
        return $user->hasPermissionTo('allocate inventories') &&
               $inventory->status === InventoryStatus::ACTIVE->value &&
               $user->hasPermissionTo('edit', $task->project);
    }

    /**
     * Determine whether the user can view Inventories costs.
     */
    public function viewCosts(User $user, Inventory $inventory): bool
    {
        return $user->hasPermissionTo('view Inventories costs') &&
               $inventory->status === InventoryStatus::ACTIVE->value;
    }

    /**
     * Determine whether the user can manage Inventories costs.
     */
    public function manageCosts(User $user, Inventory $inventory): bool
    {
        return $user->hasPermissionTo('manage Inventories costs') &&
               $inventory->status === InventoryStatus::ACTIVE->value;
    }

    /**
     * Determine whether the user can export Inventories data.
     */
    public function export(User $user): bool
    {
        return $user->hasPermissionTo('export inventories');
    }
}

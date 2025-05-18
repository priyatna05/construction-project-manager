<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Project;
use App\Models\Task;
use App\Models\Inventory;
use App\Enums\InventoryStatus;


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
        return $user->hasPermissionTo('view inventory') &&
               $inventory->status !== InventoryStatus::DELETED->value;
    }

    /**
     * Determine whether the user can create inventories.
     */
    public function create(User $user, Inventory $inventory): bool
    {
        return $user->hasPermissionTo('create inventory') &&
                $inventory->status !== InventoryStatus::ACTIVE->value;
    }

    /**
     * Determine whether the user can update the Inventories.
     */
    public function update(User $user, Inventory $inventory): bool
    {
        return $user->hasPermissionTo('edit inventory') &&
               $inventory->status !== InventoryStatus::ACTIVE->value;
    }

    /**
     * Determine whether the user can achive the Inventories
     */
    public function archive(User $user, Inventory $inventory): bool
    {
        return $user->hasPermissionTo('archive inventory') &&
                $inventory->status !== InventoryStatus::INACTIVE->value;
    }

    /**
     * Determine whether the user can restore the Inventories.
     */
    public function restore(User $user, Inventory $inventory): bool
    {
        return $user->hasPermissionTo('restore inventory') &&
               $inventory->status !== InventoryStatus::ACTIVE->value;
    }

    /**
     * Determine whether the user can delete the Inventories.
     */
    public function delete(User $user, Inventory $inventory): bool
    {
        return $user->hasPermissionTo('delete inventory') &&
               $inventory->status !== InventoryStatus::DELETED->value;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function forceDelete(User $user, Inventory $inventory): bool
    {
        return $user->hasPermissionTo('force delete inventory') &&
                $inventory->status !== InventoryStatus::DELETED->value;
    }

    /**
     * Determine whether the user can allocate the Inventories to a task.
     */
    public function allocate(User $user, Inventory $inventory, Task $task): bool
    {
        return $user->hasPermissionTo('allocate inventory') &&
               $inventory->status === InventoryStatus::ACTIVE->value &&
               $user->hasPermissionTo('edit', $task->project);
    }

    /**
     * Determine whether the user can view Inventories costs.
     */
    public function viewCosts(User $user, Inventory $inventory): bool
    {
        return $user->hasPermissionTo('view Inventory costs') &&
               $inventory->status === InventoryStatus::ACTIVE->value;
    }

    /**
     * Determine whether the user can manage Inventories costs.
     */
    public function manageCosts(User $user, Inventory $inventory): bool
    {
        return $user->hasPermissionTo('manage Inventory costs') &&
               $inventory->status === InventoryStatus::ACTIVE->value;
    }

    /**
     * Determine whether the user can export Inventories data.
     */
    public function export(User $user): bool
    {
        return $user->hasPermissionTo('export inventory');
    }
}

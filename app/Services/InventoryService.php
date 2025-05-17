<?php

namespace App\Services;

use App\Models\Inventory;
use App\Models\InventoryAllocation;
use App\Models\Project;
use App\Models\Task;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Builder;

class InventoryService
{
    public function createInventory(array $data): Inventory
    {
        return DB::transaction(function () use ($data) {
            return Inventory::create($data);
        });
    }

    public function updateInventory(Inventory $inventory, array $data): Inventory
    {
        return DB::transaction(function () use ($inventory, $data) {
            $inventory->update($data);
            if (isset($data['unit_cost']) && $data['unit_cost'] !== $inventory->getOriginal('unit_cost')) {
                $this->updateInventoryCosts($inventory);
            }
            event(new InventoryCostUpdated($inventory));
            return $inventory->fresh();
        });
    }

    public function deleteInventory(Inventory $inventory): bool
    {
        return DB::transaction(function () use ($inventory) {
            // Check if inventory has active allocations
            if ($inventory->inventoryAllocation()->whereNull('end_date')->exists()) {
                throw new \Exception('Cannot delete inventory with active allocations');
            }

            $inventory->update(['status' => InventoryStatus::DELETED->value]);
            return true;
        });
    }

    public function allocateInventory(Inventory $inventory, Task $task, array $data): InventoryAllocation
    {
        return DB::transaction(function () use ($inventory, $task, $data) {
            $allocation = InventoryAllocation::create([
                'inventory_id' => $inventory->id,
                'project_id' => $task->project_id,
                'task_id' => $task->id,
                'quantity' => $data['quantity'],
                'allocated_date' => $data['allocated_date'] ?? now(),
            ]);

            $this->updateInventoryCosts($inventory);
            event(new InventoryAllocated($allocation));

            return $allocation;
        });
    }

    public function calculateInventoryCost(Inventory $inventory, $quantity): float
    {
        return $inventory->unit_cost * $quantity;
    }

    public function updateInventoryCosts(Inventory $inventory): void
    {
        $totalCost = $inventory->resourceAllocations()
            ->sum(DB::raw('quantity * ' . $inventory->unit_cost));

        $inventory->update(['sum_cost' => $totalCost]);
        event(new InventoryCostUpdated($inventory));
    }

    public function searchInventory(array $filters = []): Builder
    {
        $query = Inventory::query();

        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function($q) use ($search) {
                $q->where('name_inventory', 'like', "%{$search}%")
                  ->orWhere('code_inventory', 'like', "%{$search}%")
                  ->orWhere('description_inventory', 'like', "%{$search}%");
            });
        }

        if (isset($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query;
    }

    public function getProjectInventory(Project $project, array $filters = []): Builder
    {
        $query = $project->inventories();

        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function($q) use ($search) {
                $q->where('name_inventory', 'like', "%{$search}%")
                  ->orWhere('code_inventory', 'like', "%{$search}%")
                  ->orWhere('description_inventory', 'like', "%{$search}%");
            });
        }

        if (isset($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query;
    }

    public function getTaskInventory(Task $task): Collection
    {
        return Inventory::whereHas('inventoryAllocations', function ($query) use ($task) {
            $query->where('task_id', $task->id);
        })
        ->with(['inventoryAllocations' => function ($query) use ($task) {
            $query->where('task_id', $task->id);
        }])
        ->get();
    }

    public function getAvailableInventory(Project $project, $date): Collection
    {
        return Inventory::where('status', ResourceStatus::ACTIVE)
            ->whereDoesntHave('inventoryAllocations', function ($query) use ($project, $date) {
                $query->where('project_id', '<>', $project->id)
                      ->where('allocated_date', $date);
            })
            ->get();
    }
}

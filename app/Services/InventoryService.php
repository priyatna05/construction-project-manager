<?php

namespace App\Services;

use App\Events\Inventory\InventoryCostUpdated;
use App\Events\Inventory\InventoryAllocated;
use App\Models\Inventory;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Builder;
use InvalidArgumentException;

class InventoryService
{
    public function create(array $data): Inventory { return DB::transaction(function () use ($data) { return Inventory::create($data);}); }
    public function update(Inventory $inventory, array $data): Inventory { return DB::transaction(function () use ($inventory, $data) {
        \Log::info('InventoryService update called', ['inventory_id' => $inventory->id, 'data' => $data]);

        foreach (['type' => 'setTypeLabel', 'status' => 'setStatusLabel', 'unit' => 'setUnitLabel'] as $key => $method) {
            if (isset($data[$key])) {
                $inventory->{$method}($data[$key]);
                unset($data[$key]);
            }
        }

        tap($inventory)->update($data);

        \Log::info('InventoryService update result', ['inventory' => $inventory->toArray()]);

        if (array_key_exists('unit_cost', $data) && $data['unit_cost'] !== $inventory->getOriginal('unit_cost')) {
            $this->updateInventoryCosts($inventory);
        }

        event(new InventoryCostUpdated($inventory));
        event(new \App\Events\Inventory\InventoryUpdated($inventory));

        return $inventory->fresh();
    });}
    public function delete(Inventory $inventory): bool { return DB::transaction(function () use ($inventory) {
        if ($inventory->allocations()->whereNull('end_date')->exists()) {throw new \Exception('Cannot delete inventory with active allocations');
        }
        $inventory->setStatusLabel('deleted');
        return true;
    });}
    public function archive(Inventory $inventory): bool { return DB::transaction(function () use ($inventory) {
        $inventory->setStatusLabel('archived');
        return true;
    }); }
    public function restore(Inventory $inventory): bool { return DB::transaction(function () use ($inventory) {
        $inventory->setStatusLabel('active');
        return true;
    }); }

    public function allocate(Inventory $inventory, array $data): Inventory { if (empty($data['quantity_allocation']) || $data['quantity_allocation'] <= 0) {
            throw new InvalidArgumentException('Quantity allocation must be greater than zero.');
        }
        if ($inventory->quantity_inventory < $data['quantity_allocation']) {
            throw new InvalidArgumentException('Insufficient stock to allocate.');
        }
        return DB::transaction(function () use ($inventory, $data) {
            $inventory->update([
                'task_id'            => $data['task_id'],
                'quantity_allocation'=> $data['quantity_allocation'],
                'allocated_date'     => $data['allocated_date'] ?? now(),
                'quantity_inventory' => $inventory->quantity_inventory - $data['quantity_allocation'],
            ]);
            event(new InventoryAllocated($inventory));
            return $inventory;
    }); }
    public function calculate(Inventory $inventory, $quantity): float { return $inventory->unit_cost * $quantity; }
    public function updateInventoryCosts(Inventory $inventory): void { $totalCost = $inventory->resourceAllocations()->sum(DB::raw('quantity * ' . $inventory->unit_cost));
        $inventory->update(['sum_cost' => $totalCost]);
        event(new InventoryCostUpdated($inventory)); }
    public function search(array $filters = []): Builder {  $query = Inventory::query();
        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function($q) use ($search) { $q->where('name', 'like', "%{$search}%")->orWhere('code', 'like', "%{$search}%")->orWhere('description', 'like', "%{$search}%");
            });
        }
        if (isset($filters['type'])) { $query->where('type', $filters['type']);
        }
        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        return $query; }
}

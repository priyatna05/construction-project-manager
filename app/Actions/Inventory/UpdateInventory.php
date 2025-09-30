<?php

namespace App\Actions\Inventory;

use App\Models\Inventory;
use App\Services\InventoryService;
use App\Enums\InventoryStatus;


class UpdateInventory
{
    protected InventoryService $inventoryService;

    public function __construct(InventoryService $inventoryService)
    {
        $this->inventoryService = $inventoryService;
    }

    public function execute(Inventory $inventory, array $data): Inventory
    {
        if (isset($data['status'])) {
            $this->handleStatusChange($inventory, $data['status']);
            unset($data['status']);
        }

        $inventory = $this->inventoryService->update($inventory, $data);

        if (isset($data['unit_cost']) && $data['unit_cost'] !== $inventory->getOriginal('unit_cost')) {
            $this->inventoryService->updateInventoryCosts($inventory);
        }

        return $inventory;
    }

    protected function handleStatusChange(Inventory $inventory, string $newStatus): void
    {
        $allowedStatuses = ['active', 'inactive', 'archived', 'deleted'];

        if (!in_array($newStatus, $allowedStatuses, true)) {
            throw new \InvalidArgumentException("Invalid inventory status: {$newStatus}");
        }

        if (in_array($newStatus, ['inactive', 'deleted'])) {
            $hasActiveAllocations = $inventory->allocations()
                ->whereNull('end_date')
                ->exists();

            if ($hasActiveAllocations) {
                throw new \Exception("Cannot set status '{$newStatus}' on inventory with active allocations.");
            }
        }

        $inventory->setStatusLabel($newStatus);
    }
}

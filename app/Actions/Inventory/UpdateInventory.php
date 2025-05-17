<?php

namespace App\Actions\Inventory;

use App\Models\Inventory;
use App\Services\InventoryService;
use App\Enums\InventoryStatus;
use App\Http\Inventory\InventoryResource;

class UpdateInventory
{
    protected InventoryService $inventoryService;

    public function __construct(InventoryService $inventoryService)
    {
        $this->inventoryService = $inventoryService;
    }

    public function execute(Inventory $inventory, array $data): Inventory
    {
        // Handle status changes
        if (isset($data['status']) && $data['status'] !== $inventory->status) {
            $this->handleStatusChange($inventory, $data['status']);
        }

        // Update the inventory
        $inventory = $this->inventoryService->updateInventory($inventory, $data);

        // Recalculate costs if unit_cost was updated
        if (isset($data['unit_cost']) && $data['unit_cost'] !== $inventory->getOriginal('unit_cost')) {
            $this->inventoryService->updateResourceCosts($inventory);
        }

        return $inventory;
    }

    protected function handleStatusChange(Inventory $inventory, string $newStatus): void
    {
        // If inventory is being deactivated, handle any active allocations
        if ($newStatus === InventoryStatus::INACTIVE->value || $newStatus === InventoryStatus::DELETED->value) {
            // You might want to notify project managers or handle active allocations
            $activeAllocations = $inventory->inventoriesAllocations()
                ->whereNull('end_date')
                ->get();

            foreach ($activeAllocations as $allocation) {
                // Add logic to handle active allocations
                // For example, you might want to end the allocation or notify relevant users
            }
        }
    }
}

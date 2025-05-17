<?php

namespace App\Actions\Inventory;

use App\Models\Inventory;
use App\Services\InventoryService;
use App\Enums\InventoryStatus;


class CreateInventory
{
    protected InventoryService $inventoryService;

    public function __construct(InventoryService $inventoryService)
    {
        $this->inventoryService = $inventoryService;
    }

    public function execute(array $data): Inventory
    {
        // Set default status if not provided
        if (!isset($data['status'])) {
            $data['status'] = InventoryStatus::ACTIVE->value;
        }

        // Initialize sum_cost to 0 if not provided
        if (!isset($data['sum_cost'])) {
            $data['sum_cost'] = 0;
        }

        // Generate code_resource if not provided
        if (!isset($data['code_inventory'])) {
            $data['code_inventory'] = $this->generateInventoryCode($data['type']);
        }

        // Create the resource
        $inventory = $this->inventoryService->createInventory($data);

        // Calculate initial costs if quantity is provided
        if (isset($data['initial_quantity'])) {
            $this->inventoryService->updateResourceCosts($inventory);
        }

        return $inventory;
    }

    protected function generateInventoryCode(string $type): string
    {
        $prefix = strtoupper(substr($type, 0, 3));
        $count = Inventory::where('type', $type)->count() + 1;
        return sprintf('%s%03d', $prefix, $count);
    }
}

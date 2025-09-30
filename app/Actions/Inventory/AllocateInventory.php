<?php

namespace App\Actions\Inventory;

use App\Models\Inventory;
use App\Services\InventoryService;

class AllocateInventory
{
    public function __construct(protected InventoryService $service) {}

    public function execute(Inventory $inventory, array $data): Inventory
    {
        return $this->service->allocate($inventory, $data);
    }
}

<?php

namespace App\Actions\Inventory;

use App\Models\Inventory;
use App\Services\Inventory\InventoryService;

class CreateInventoryAction
{
    public function __construct(protected InventoryService $service){}

    public function execute(array $data): Inventory
    {
       return $this->service->createInventory($data);
    }
}

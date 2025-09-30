<?php

namespace App\Actions\Inventory;

use App\Models\Inventory;
use App\Services\InventoryService;

class CreateInventory
{
    public function __construct(protected InventoryService $service){}

    public function execute(array $data): Inventory
    {
       return $this->service->create($data);
    }
}

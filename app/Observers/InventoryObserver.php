<?php

namespace App\Observers;

use App\Models\Inventory;
use App\Enums\InventoryStatus;

class InventoryObserver
{
    public function creating(Inventory $inventory)
    {
        // generate code jika belum ada
        if (empty($inventory->code_inventory)) {
            $inventory->code_inventory = 'INV-' . now()->format('Ymd') . rand(100, 999);
        }
    }

    public function deleting(Inventory $inventory)
    {
        // custom logic sebelum soft delete, misal log
    }
}

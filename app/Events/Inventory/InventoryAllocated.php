<?php

namespace App\Events;

use App\Models\InventoryAllocation;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class InventoryAllocated
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $inventoryAllocation;

    public function __construct(InventoryAllocation $inventoryAllocation)
    {
        $this->inventoryAllocation = $inventoryAllocation;
    }
}

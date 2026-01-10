<?php

namespace App\Events\Inventory;

use App\Models\Inventory;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class InventoryCreated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Inventory $inventory;

    public function __construct(Inventory $inventory)
    {
        $this->inventory = $inventory->load(['labels', 'allocations', 'createdByUser']);
        $this->dontBroadcastToCurrentUser();
        // \Log::info('InventoryCreated event fired for inventory ' . $inventory->id);
        // \Log::info('Type label: ' . ($this->inventory->typeLabel ? $this->inventory->typeLabel->name : 'null'));
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('inventories'),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'inventory' => new \App\Http\Resources\Inventory\InventoryResource($this->inventory),
        ];
    }
}

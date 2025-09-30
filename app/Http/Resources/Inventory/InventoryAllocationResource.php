<?php

namespace App\Http\Resources\Inventory;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InventoryAllocationResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
        'inventory_id' => $this->inventory_id,
        'task_id' => $this->task_id,
        'quantity_allocated' => $this->quantity_allocated,
        'cost_at_alloaction' => $this->cost_at_allocation,
        'allocation_date' => $this->allocation_date,
        'notes' => $this->notes,
        'inventory' => new InventoryResource($this->whenLoaded('inventory')),
        ];
    }
}

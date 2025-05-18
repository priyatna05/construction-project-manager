<?php

namespace App\Http\Resources\Inventory;

use App\Http\Resources\Project\ProjectResource;
use Illuminate\Http\Resources\Json\JsonResource;


class InventoryResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'                => $this->id,
            'code'              => $this->code_inventory,
            'name'              => $this->name_inventory,
            'status'            => $this->status->value,
            'type'              => $this->type->value,
            'unit'              => $this->unit?->value,
            'unit_cost'         => $this->unit_cost,
            'quantity'          => $this->quantity_inventory,
            'total_value'       => $this->total_value,
            'location'          => new ProjectResource($this->whenLoaded('location')),
            'created_at'        => $this->created_at->toDateTimeString(),
        ];
    }
}

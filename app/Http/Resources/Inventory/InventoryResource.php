<?php

namespace App\Http\Resources\Inventory;

use App\Http\Resources\User\UserResource;
use App\Http\Resources\Project\ProjectResource;
use App\Http\Resources\Label\LabelResource;
use Illuminate\Http\Resources\Json\JsonResource;


class InventoryResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'                => $this->id,
            'code'              => $this->code,
            'name'              => $this->name,
            'description'       => $this->description,
            'status' => new LabelResource($this->whenLoaded('labels', fn() => $this->statusLabel)),
            'type'   => new LabelResource($this->whenLoaded('labels', fn() => $this->typeLabel)),
            'unit'   => new LabelResource($this->whenLoaded('labels', fn() => $this->unitLabel)),
            'unit_cost'         => $this->unit_cost,
            'quantity_on_hand'          => $this->quantity_on_hand,

            'allocations'       => InventoryAllocationResource::collection($this->whenLoaded('allocations')),
            'createdBy' => new UserResource($this->whenLoaded('createdByUser')),
            'created_at'        => $this->created_at->toDateTimeString(),
        ];
    }
}

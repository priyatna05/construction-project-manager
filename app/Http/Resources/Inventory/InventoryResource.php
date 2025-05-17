<?php

namespace App\Http\Resources\Inventory;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\Project\ProjectResource;
use App\Http\Resources\Task\TaskResource;

class InventoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'inventory_id' => $this->inventory_id,
            'project_id' => $this->project_id,
            'task_id' => $this->task_id,
            'quantity' => $this->quantity,
            'allocated_date' => $this->allocated_date,
            'inventory' => new InventoryResource($this->whenLoaded('inventory')),
            'project' => new ProjectResource($this->whenLoaded('project')),
            // 'task' => new TaskResource($this->whenLoaded('task')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}

<?php

namespace App\Http\Resources\Task;

use Illuminate\Http\Request;
use App\Http\Resources\User\UserResource;
use App\Http\Resources\Inventory\InventoryAllocationResource;
use App\Http\Resources\Label\LabelResource;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class TaskResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'number' => $this->number,
            'project_id' => $this->project_id,
            'group_id' => $this->group_id,
            'assigned_to_user_id' => $this->assigned_to_user_id,
            'description' => $this->description,
            'start_date' => $this->start_date,
            'end_date' => $this->end_date,
            'budget_task' => $this->budget_task,
            'created_by_user' => new UserResource($this->whenLoaded('createdByUser')),
            'subscribed_users' => UserResource::collection($this->whenLoaded('subscribedUsers')),
            'assigned_to_user' => new UserResource($this->whenLoaded('assignedToUser')),
            'labels' => LabelResource::collection($this->whenLoaded('labels')),
            'allocated_inventories' => InventoryAllocationResource::collection($this->whenLoaded('inventoryAllocations')),
            'attachments' => $this->attachments->map(function ($attachment) {
                return [
                    'id' => $attachment->id,
                    'name' => $attachment->name,
                    'path' => $attachment->path,
                    'disk' => $attachment->disk,
                    'mime_type' => $attachment->mime_type,
                    'size' => $attachment->size,
                    'url' => Storage::disk($attachment->disk)->url($attachment->path),
                ];
            }),
            'dependencies' => $this->dependencies->map(function ($dep) {
                $pivot = $dep->pivot;
                return [
                    'id' => $dep->id,
                    'name' => $dep->name,
                    'depends_on_task_id' => $pivot->depends_on_task_id,
                    'relation_type_id' => $pivot->relation_type_id,
                    'relation_type' => $pivot->relationType
                        ? [
                            'slug' => $pivot->relationType->slug,
                            'name' => $pivot->relationType->name,
                            'icon' => $pivot->relationType->icon,
                            'color' => $pivot->relationType->color,
                        ]
                        : null,
                ];
            }),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}

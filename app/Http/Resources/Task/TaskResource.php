<?php

namespace App\Http\Resources\Task;

use Illuminate\Http\Request;
use App\Http\Resources\User\UserResource;
use App\Http\Resources\Inventory\InventoryAllocationResource;
use App\Http\Resources\Label\LabelResource;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\Attachments\AttachmentResource;
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
            'budget_task_plan' => $this->budget_task_plan ? $this->budget_task_plan : null,
            'budget_task_actual' => $this->budget_task_actual ? $this->budget_task_actual : null,
            'volume' => $this->volume,
            'weight_task' => $this->weight_task,
            'unit_cost_task' => $this->unit_cost_task ? $this->unit_cost_task : null,
            'progress_task' => $this->progress_task,
            'project_is_completed' => $this->whenLoaded('project', fn() => (bool) $this->project->is_completed),

            // Optimized label loading
            'type' => new LabelResource($this->whenLoaded('labels', fn() => $this->labels->firstWhere('type', \App\Models\Label::TYPE_TASK))),
            'status' => LabelResource::collection($this->whenLoaded('labels', fn() => $this->labels->where('type', \App\Models\Label::TYPE_PROJECT_TASK_STATUS))),
            'unit' => new LabelResource($this->whenLoaded('labels', fn() => $this->labels->firstWhere('type', \App\Models\Label::TYPE_TASK_INVENTORY_UNIT))),
            'priority' => new LabelResource($this->whenLoaded('labels', fn() => $this->labels->firstWhere('type', \App\Models\Label::TYPE_PRIORITY))),
            'labels' => LabelResource::collection($this->whenLoaded('labels')),

            'created_by_user' => new UserResource($this->whenLoaded('createdByUser')),
            'subscribed_users' => UserResource::collection($this->whenLoaded('subscribedUsers')),
            'assigned_to_user' => new UserResource($this->whenLoaded('assignedToUser')),
            'allocated_inventories' => InventoryAllocationResource::collection($this->whenLoaded('inventoryAllocations')),
            'attachment_files' => AttachmentResource::collection($this->whenLoaded('attachments')),
            'comments_count' => $this->whenCounted('comments', $this->comments_count ?? 0),
            'workReports_count' => $this->whenCounted('workReports', $this->work_reports_count ?? 0),
            'dependentTasks' => $this->whenLoaded('dependentTasks', function () {
                return $this->dependentTasks->filter(function ($dep) {
                    return $dep->exists; // Ensure the dependency task still exists
                })->map(function ($dep) {
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
                });
            }),
            'dependencies' => $this->whenLoaded('dependencies', function () {
                return $this->dependencies->filter(function ($dep) {
                    return $dep->exists; // Ensure the dependency task still exists
                })->map(function ($dep) {
                    $pivot = $dep->pivot;
                    return [
                        'id' => $dep->id,
                        'name' => $dep->name,
                        'number' => $dep->number,
                        'group_id' => $dep->group_id,
                        'start_date' => $dep->start_date,
                        'end_date' => $dep->end_date,
                        'depends_on_task_id' => $pivot->depends_on_task_id,
                        'relation_type_id' => $pivot->relation_type_id,
                        'lag_days' => $pivot->lag_days,
                        'relation_type' => $pivot->relationType
                            ? [
                                'slug' => $pivot->relationType->slug,
                                'name' => $pivot->relationType->name,
                                'icon' => $pivot->relationType->icon,
                                'color' => $pivot->relationType->color,
                            ]
                            : null,
                    ];
                });
            }),
            'created_at' => $this->created_at,
            'completed_at' => $this->completed_at,
            'updated_at' => $this->updated_at,
        ];
    }
}

<?php

namespace App\Http\Resources\Project;

use App\Services\PermissionService;
use App\Http\Resources\User\UserResource;
use App\Http\Resources\Attachments\AttachmentResource;
use App\Http\Resources\Inventory\InventoryResource;
use App\Http\Resources\Task\TaskResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Carbon\Carbon;

class ProjectResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'                    => $this->id,
            'code'                  => $this->code,
            'name'                  => $this->name,
            'description'           => $this->description,
            'start_date'            => $this->start_date,
            'end_date'              => $this->end_date,
            'budget_project'        => $this->budget_project,
            'duration'              => Carbon::parse($this->start_date)->diffInDays(Carbon::parse($this->end_date)) + 1,
            'favorite'              => $this->favorite,
            'client_company_id'     => $this->client_company_id,
            'clientCompany'         => $this->whenLoaded('clientCompany', fn() => $this->clientCompany->only(['id', 'name'])),
            'attachments'           => AttachmentResource::collection($this->whenLoaded('attachments')),
            'users'                 => UserResource::collection($this->whenLoaded('users')),
            'users_with_access'     => PermissionService::usersWithAccessToProject($this),
            'tasks'                 => TaskResource::collection($this->whenLoaded('tasks')),
            'inventories'           => InventoryResource::collection($this->whenLoaded('inventories')),
            'all_tasks_count'       => $this->all_tasks_count,
            'completed_tasks_count' => $this->completed_tasks_count,
            'overdue_tasks_count'   => $this->overdue_tasks_count,
            'status'                => optional($this->labels->firstWhere('type', \App\Models\Label::TYPE_PROJECT_TASK_STATUS))->name,
        ];
    }
}

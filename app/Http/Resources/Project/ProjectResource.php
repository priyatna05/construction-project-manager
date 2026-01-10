<?php

namespace App\Http\Resources\Project;

use App\Services\PermissionService;
use App\Http\Resources\User\UserResource;
use App\Http\Resources\Attachments\AttachmentResource;
use App\Http\Resources\Inventory\InventoryResource;
use App\Http\Resources\Task\TaskResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Models\Label;
use App\Http\Resources\Label\LabelResource;
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
            'start_date'            => $this->start_date ? $this->start_date->toDateString() : null,
            'end_date'              => $this->end_date ? $this->end_date->toDateString() : null,
            'budget_project_estimate'        => $this->budget_project_estimate,
            // Direct costs
            'direct_cost_plan'               => $this->direct_cost_plan,
            'direct_cost_actual'             => $this->direct_cost_actual,

            // Rates (persentase)
            'overhead_site_rate'             => $this->overhead_site_rate,
            'administrative_rate'            => $this->administrative_rate,
            'contingency_rate'               => $this->contingency_rate,
            'profit_rate'                    => $this->profit_rate,
            'tax_rate'                       => $this->tax_rate,

            // Calculated costs (nominal)
            //planeed
            'overhead_site_cost_plan'             => $this->overhead_site_cost_plan,
            'administrative_cost_plan'            => $this->administrative_cost_plan,
            'contingency_cost_plan'               => $this->contingency_cost_plan,
            'profit_cost_plan'                    => $this->profit_cost_plan,
            'tax_cost_plan'                       => $this->tax_cost_plan,

            //actual
            'overhead_site_cost_actual'             => $this->overhead_site_cost_actual,
            'administrative_cost_actual'            => $this->administrative_cost_actual,
            'contingency_cost_actual'               => $this->contingency_cost_actual,
            'profit_cost_actual'                    => $this->profit_cost_actual,
            'tax_cost_actual'                       => $this->tax_cost_actual,

            // Budget totals
            'budget_project_final_plan'           => $this->budget_project_final_plan,
            'budget_project_actual'          => $this->budget_project_actual,
            'budget_project_grandtotal_plan'      => $this->budget_project_grandtotal_plan,
            'budget_project_grandtotal_actual'      => $this->budget_project_grandtotal_actual,

            'is_completed'          => (bool) $this->is_completed,
            'completed_at'          => $this->completed_at ? $this->completed_at->toISOString() : null,
            'duration'              => Carbon::parse($this->start_date)->diffInDays(Carbon::parse($this->end_date)) + 1,
            'favorite'              => $this->favorite,
            'client_company_id'     => $this->client_company_id,
            'client_user_id'        => $this->client_user_id,
            'clientCompany'         => $this->whenLoaded('clientCompany', function () {
                $company = $this->clientCompany->only(['id', 'name']);
                $company['users'] = $this->clientCompany->users()->select('id', 'name', 'avatar')->get()->toArray();
                return $company;
            }),
            'clientUser'            => $this->whenLoaded('clientUsers', fn() => $this->clientUsers->only(['id', 'name', 'avatar'])),
            'attachments'           => AttachmentResource::collection($this->whenLoaded('attachments')),
            'users'                 => UserResource::collection($this->whenLoaded('users')),
            'users_with_access'     => PermissionService::usersWithAccessToProject($this),
            'tasks'                 => TaskResource::collection($this->whenLoaded('tasks')),
            'inventories'           => InventoryResource::collection($this->whenLoaded('inventories')),
            'task_groups'           => $this->whenLoaded('taskGroups', function () {
                return $this->taskGroups->map(fn($group) => [
                    'id'   => $group->id,
                    'name' => $group->name,
                    'order' => $group->order,
                ]);
            }),
            'all_tasks_count'       => $this->all_tasks_count,
            'completed_tasks_count' => $this->completed_tasks_count,
            'overdue_tasks_count'   => $this->overdue_tasks_count,
            'type' => $this->whenLoaded('labels', function () {
                $label = $this->labels->firstWhere('type', Label::TYPE_KONTRAK);
                return $label ? new LabelResource($label) : null;
            }),

            'status' => $this->whenLoaded('labels', function () {
                $statusLabels = $this->labels->where('type', Label::TYPE_PROJECT_TASK_STATUS);
                return LabelResource::collection($statusLabels);
            }),
        ];
    }
}

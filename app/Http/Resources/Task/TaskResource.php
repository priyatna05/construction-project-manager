<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

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
            'name_task' => $this->name_task,
            'group_id' => $this->group_id,
            'assigned_to_user_id' => $this->assigned_to_user_id,
            'description_task' => $this->description_task,
            'start_date_task' => $this->start_date_task,
            'end_date_task' => $this->end_date_task,
            'budget_task' => $this->budget_task,
            'subscribed_users' => $this->subscribed_users,
            'labels' => $this->labels,
            'attachments' => $this->attachments,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}

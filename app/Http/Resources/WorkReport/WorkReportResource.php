<?php

namespace App\Http\Resources\WorkReport;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WorkReportResource extends JsonResource
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
            'task_id' => $this->task_id,
            'user' => $this->user,
            'name' => $this->name,
            'report_date' => $this->report_date,
            'progress' => $this->progress,
            'work_done' => $this->work_done,
            'unit' => $this->unitLabel?->name ?? null,
            'actual_cost' => $this->actual_cost,
            'actual_unit_cost' => $this->actual_unit_cost,
            'labor_details' => $this->labor_details,
            'material_details' => $this->material_details,
            'equipment_details' => $this->equipment_details,
            'remarks' => $this->remarks,
            'status' => $this->status_label?->name ?? 'Pending',
            'photos_count' => $this->photos_count ?? $this->attachments?->count() ?? 0,
            'attachments' => \App\Http\Resources\Attachments\AttachmentResource::collection($this->whenLoaded('attachments')),
            'weather' => $this->weather,
            'labels' => $this->labels,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}

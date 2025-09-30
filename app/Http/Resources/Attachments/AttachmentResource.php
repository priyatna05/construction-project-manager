<?php

namespace App\Http\Resources\Attachments;

use Illuminate\Http\Resources\Json\JsonResource;

class AttachmentResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'        => $this->id,
            'name'      => $this->name,
            'path'      => $this->path,
            'thumb'     => $this->thumb,
            'disk'      => $this->disk,
            'size'      => $this->size,
            'mime_type' => $this->mime_type,
            'type' => $this->type,
            'url'       => $this->when($this->path, fn () => \Storage::disk($this->disk)->url($this->path)),
            'thumb_url' => $this->when($this->thumb, fn () => \Storage::disk($this->disk)->url($this->thumb)),
            'created_at' => $this->created_at,
        ];
    }
}

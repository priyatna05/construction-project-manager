<?php

namespace App\Http\Resources\User;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
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
            'email' => $this->email,
            'email_verified_at' => $this->email_verified_at,
            'job_title' => $this->job_title,
            'avatar' => $this->avatar,
            'phone' => $this->phone,
            'address' => $this->address,
            'roles' => $this->roles->map->only('name')->flatten()->toArray(),
        ];
    }
}

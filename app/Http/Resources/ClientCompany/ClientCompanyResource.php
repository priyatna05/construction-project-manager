<?php

namespace App\Http\Resources\ClientCompany;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ClientCompanyResource extends JsonResource
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
            'address' => $this->address,
            'postal_code' => $this->postal_code,
            'city' => $this->city,
            'country_id' => $this->country_id,
            'currency_id' => $this->currency_id,
            'phone' => $this->phone,
            'web' => $this->web,
            'clients' => $this->clients->map->only(['id', 'name']),
        ];
    }
}

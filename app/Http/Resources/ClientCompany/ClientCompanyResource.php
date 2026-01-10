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
            'logo' => $this->logo,
            'name' => $this->name,
            'avatar' => $this->avatar,
            'email' => $this->email,
            'address' => $this->address,
            'postal_code' => $this->postal_code,
            'city' => $this->city,
            'country' => $this->whenLoaded('country', function () {
                return [
                    'id' => $this->country->id,
                    'name' => $this->country->name,
                ];
            }),

            'currency' => $this->whenLoaded('currency', function () {
                return [
                    'id' => $this->currency->id,
                    'code' => $this->currency->code,
                    'symbol' => $this->currency->symbol,
                    'name' => $this->currency->name,
                ];
            }),
            'phone' => $this->phone,
            'web' => $this->web,
            'clients' => $this->clients->map(function ($client) {
                return [
                    'id' => $client->id,
                    'name' => $client->name,
                    'avatar' => $client->avatar,
                ];
            }),
        ];
    }
}

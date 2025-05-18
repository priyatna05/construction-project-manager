<?php

namespace Database\Factories;

use App\Models\InventoryUser;
use Illuminate\Database\Eloquent\Factories\Factory;

class InventoryUserFactory extends Factory
{
    protected $model = InventoryUser::class;

    public function definition()
    {
        return [
            'inventory_id' => \App\Models\Inventory::inRandomOrder()->first()->id,
            'user_id'      => \App\Models\User::inRandomOrder()->first()->id,
        ];
    }
}

<?php

namespace Database\Factories;

use App\Models\InventoryAllocation;
use Illuminate\Database\Eloquent\Factories\Factory;

class InventoryAllocationFactory extends Factory
{
    protected $model = InventoryAllocation::class;

    public function definition()
    {
        return [
            'inventory_id'        => \App\Models\Inventory::inRandomOrder()->first()->id,
            'project_id'          => \App\Models\Project::inRandomOrder()->first()->id,
            'task_id'             => \App\Models\Task::inRandomOrder()->first()->id,
            'quantity_allocation' => $this->faker->randomFloat(2, 1, 20),
            'allocated_date'      => $this->faker->dateTimeBetween('-3 months', 'now')->format('Y-m-d'),
        ];
    }
}

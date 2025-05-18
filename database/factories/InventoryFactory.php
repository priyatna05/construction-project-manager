<?php

namespace Database\Factories;

use App\Models\Inventory;
use App\Enums\InventoryType;
use App\Enums\InventoryStatus;
use App\Enums\InventoryUnit;
use Illuminate\Database\Eloquent\Factories\Factory;

class InventoryFactory extends Factory
{
    protected $model = Inventory::class;

    public function definition()
    {
        $types = InventoryType::cases();
        $statuses = InventoryStatus::cases();
        $units = InventoryUnit::cases();

        return [
            'code_inventory'       => 'INV-' . $this->faker->unique()->numerify('#####'),
            'name_inventory'       => $this->faker->word(),
            'description_inventory'=> $this->faker->optional()->sentence(),
            'status'               => $this->faker->randomElement($statuses)->value,
            'type'                 => $this->faker->randomElement($types)->value,
            'unit'                 => $this->faker->optional()->randomElement($units)->value,
            'unit_cost'            => $this->faker->randomFloat(2, 10, 1000),
            'quantity_inventory'   => $this->faker->optional()->randomFloat(2, 1, 100),
            'location_inventory'   => \App\Models\Project::inRandomOrder()->first()?->id,
        ];
    }
}

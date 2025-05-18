<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Inventory;
use App\Enums\InventoryType;
use App\Enums\InventoryStatus;
use App\Enums\InventoryUnit;

class InventorySeeder extends Seeder
{
    public function run()
    {
        // for inventory as a type randomly
        foreach (InventoryType::cases() as $type) {
            foreach (InventoryStatus::cases() as $status) {
                Inventory::factory()->count(5)->create([
                    'type'   => $type->value,
                    'status' => $status->value,
                ]);
            }
        }

        // count random inventory
        Inventory::factory()->count(20)->create();
    }
}

<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Inventory;

class InventorySeeder extends Seeder
{
    public function run()
    {
        if (\App\Models\Project::count() === 0) {
             $this->call(ProjectSeeder::class);
        }

        Inventory::factory(75)->create();

        $this->command->info('Inventories seeded. Observer should have generated codes.');
    }
}

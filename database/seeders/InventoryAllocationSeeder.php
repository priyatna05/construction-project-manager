<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\InventoryAllocation;

class InventoryAllocationSeeder extends Seeder
{
    public function run()
    {
        // random stock allocation
        InventoryAllocation::factory()->count(100)->create();
    }
}

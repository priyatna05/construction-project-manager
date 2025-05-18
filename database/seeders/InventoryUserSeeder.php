<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\InventoryUser;

class InventoryUserSeeder extends Seeder
{
    public function run()
    {
        // crate relation inventory-user random
        InventoryUser::factory()->count(100)->create();
    }
}

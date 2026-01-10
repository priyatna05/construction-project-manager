<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            PermissionSeeder::class,
            CurrencySeeder::class, // Currency and Country before others that use them
            CountrySeeder::class,
            LabelSeeder::class, // Labels before Tasks
        ]);

        if ($this->command->confirm('Seed development data?', true)) { // Default to true for dev
            $this->call([
                UserSeeder::class, // Users first
                OwnerCompanySeeder::class,
                // ClientSeeder::class, // Can be merged into UserSeeder or ClientCompanySeeder
                ClientCompanySeeder::class, // Depends on Users
                ProjectSeeder::class,       // Depends on ClientCompanies & Users
                TaskGroupSeeder::class,     // Depends on Projects
                InventorySeeder::class,     // Can run in parallel with tasks if allocations are separate
                TasksSeeder::class,         // Depends on TaskGroups, Users, Labels
                                            // TasksSeeder now optionally seeds InventoryTaskAllocations
                EvmRecordSeeder::class,     // Depends on Projects
            ]);

            // You might want to explicitly call factories here for specific complex scenarios
            // e.g., creating a project that is almost complete with many EVM records.

        } else {
            $this->call([ProductionSeeder::class]);
        }

        // Optional: Clear cache after seeding
        if (app()->environment('local', 'development')) {
             \Illuminate\Support\Facades\Artisan::call('cache:clear');
             $this->command->info('Application cache cleared.');
        }
    }
}

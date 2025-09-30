<?php

namespace Database\Seeders;

use App\Models\ClientCompany;
use App\Models\User;
use Illuminate\Database\Seeder;

class ClientCompanySeeder extends Seeder
{
    public function run(): void
    {
        $clientUsers = User::role('client')->get();

        if ($clientUsers->isEmpty()) {
            // Create some client users if none exist
            $clientUsers = User::factory(3)->create(['job_title' => 'Client'])->each->assignRole('client');
        }

        // Create client companies and attach client users
        ClientCompany::factory(5)
            ->create()
            ->each(function (ClientCompany $company) use ($clientUsers) {
                // Attach one or more random client users to each company
                $company->clients()->attach(
                    $clientUsers->random(rand(1, min(2, $clientUsers->count())))->pluck('id')->toArray()
                );
            });
    }
}

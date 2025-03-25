<?php

namespace Database\Seeders;

use App\Models\ClientCompany;
use App\Models\Project;
use Illuminate\Database\Seeder;

class ProjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $projects = [];

        $projects[] = Project::create([
            'name' => 'Demo Project',
            'description' => fake()->sentence(),
            'start_date' => fake()->dateTimeBetween('-1 month', '+1 month'),
            'end_date' => fake()->dateTimeBetween('+1 month', '+2 month'),
            'budget' => fake()->randomFloat(2, 0, 1000),
            'client_company_id' => ClientCompany::first()->id,
        ]);

        $projects[] = Project::create([
            'name' => 'Demo Project 2',
            'description' => fake()->sentence(),
            'start_date' => fake()->dateTimeBetween('-1 month', '+1 month'),
            'end_date' => fake()->dateTimeBetween('+1 month', '+2 month'),
            'budget' => fake()->randomFloat(2, 0, 1000),
            'client_company_id' => ClientCompany::oldest()->first()->id,
        ]);
    }
}

<?php

namespace Database\Seeders;

use App\Models\ClientCompany;
use App\Models\Project;
use Illuminate\Database\Seeder;

class ProjectSeeder extends Seeder
{
    public static $admin;
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $projects = [];

        $projects[] = Project::create([
            'name_project' => 'Demo Project',
            'description_project' => fake()->sentence(),
            'start_date_project' => fake()->dateTimeBetween('-1 month', '+1 month'),
            'end_date_project' => fake()->dateTimeBetween('+1 month', '+2 month'),
            'budget_project' => fake()->randomFloat(2, 0, 1000),
            'client_company_id' => ClientCompany::first()->id,
        ]);

        $projects[] = Project::create([
            'name_project' => 'Demo Project 2',
            'description_project' => fake()->sentence(),
            'start_date_project' => fake()->dateTimeBetween('-1 month', '+1 month'),
            'end_date_project' => fake()->dateTimeBetween('+1 month', '+2 month'),
            'budget_project' => fake()->randomFloat(2, 0, 1000),
            'client_company_id' => ClientCompany::oldest()->first()->id,
        ]);
    }
}

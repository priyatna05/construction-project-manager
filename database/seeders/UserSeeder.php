<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    // Ensure these job titles map to your roles
    private array $jobTitleToRole = [
        'Team member' => 'team member',
        'Client' => 'client',
        'Manager' => 'manager',
        'Admin' => 'admin',
    ];

    public function run(): void
    {
        // Create specific users for each role (except client if handled by ClientSeeder)
        User::factory()->create(['email' => 'admin@mail.com', 'job_title' => 'Admin'])->assignRole('admin');
        User::factory()->create(['email' => 'manager@mail.com', 'job_title' => 'Manager'])->assignRole('manager');
        User::factory()->create(['email' => 'teammember@mail.com', 'job_title' => 'Team member'])->assignRole('team member');
        // Client users might be created via ClientSeeder or here

        // Create additional random users
        User::factory(10) // Reduced count for faster seeding
            ->create()
            ->each(function (User $user) {
                // Assign a role based on job_title, default if not found
                $role = $this->jobTitleToRole[$user->job_title] ?? 'team member';
                $user->assignRole($role);
            });
    }
}

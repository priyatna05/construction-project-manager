<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'avatar' => null,
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(), // Added
            'password' => '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
            'phone' => fake()->phoneNumber(),
            'address' => fake()->address(),
            'job_title' => fake()->randomElement(['Team member', 'Manager', 'Client', 'Admin']),
            'default_hourly_rate' => fake()->optional(0.8, null)->randomFloat(2, 10, 150), // 80% chance punya rate, sisanya null
            'remember_token' => Str::random(10),
            'archived_at' => null, // Added if you use this field consistently
        ];
    }
}

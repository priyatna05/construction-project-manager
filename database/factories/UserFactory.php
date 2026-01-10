<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
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
            'password' => Hash::make('password'),
            'phone' => fake()->phoneNumber(),
            'address' => fake()->address(),
            'job_title' => fake()->randomElement(['Team member', 'Manager', 'Client', 'Admin']),
            'remember_token' => Str::random(10),
            'archived_at' => null, // Added if you use this field consistently
        ];
    }
}

<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ClientCompany>
 */
class ClientCompanyFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->company,
            'address' => fake()->address,
            'postal_code' => fake()->postcode,
            'city' => fake()->city,
            'country_id' => fake()->numberBetween(1, 249),
            'currency_id' => 97,
            'phone' => fake()->phoneNumber,
            'web' => 'https://company.com',
            'email' => fake()->email,
        ];
    }
}

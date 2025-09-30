<?php

namespace Database\Factories;
use App\Models\Country;
use App\Models\Currency;
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
            // Ensure Country and Currency seeders run first or use ::factory()
            'country_id' => Country::inRandomOrder()->first()?->id ?? Country::factory(),
            'currency_id' => Currency::where('code', 'IDR')->first()?->id ?? Currency::factory(['code' => 'IDR']), // Default to IDR
            'phone' => fake()->phoneNumber,
            'web' => 'https://'.fake()->domainName, // More realistic web address
            'email' => fake()->unique()->companyEmail, // Unique company email
            'archived_at' => null, // Added
        ];
    }
}

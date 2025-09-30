<?php

namespace Database\Factories;

use App\Models\OwnerCompany;
use App\Models\Country;
use App\Models\Currency;
use Illuminate\Database\Eloquent\Factories\Factory;

class OwnerCompanyFactory extends Factory
{
    protected $model = OwnerCompany::class;

    public function definition()
    {
        // Get all country and currency IDs, fallback to null if none
        $countryIds = Country::pluck('id')->toArray();
        $currencyIds = Currency::pluck('id')->toArray();

        return [
            'country_id'   => count($countryIds) ? $this->faker->randomElement($countryIds) : null,
            'currency_id'  => count($currencyIds) ? $this->faker->randomElement($currencyIds) : null,
            'name'         => $this->faker->company(),
            'logo'         => $this->faker->optional()->imageUrl(100, 100, 'business'),
            'address'      => $this->faker->optional()->streetAddress(),
            'postal_code'  => $this->faker->optional()->postcode(),
            'city'         => $this->faker->optional()->city(),
            'email'        => $this->faker->optional()->companyEmail(),
            'phone'        => $this->faker->optional()->phoneNumber(),
            'web'          => $this->faker->optional()->url(),
            'tax'          => $this->faker->numberBetween(0, 100),
        ];
    }
}

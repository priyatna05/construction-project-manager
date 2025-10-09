<?php

namespace Database\Seeders;

use App\Models\Currency;
use App\Models\OwnerCompany;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class ProductionSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'email' => config('auth.admin.email'),
            'name' => config('auth.admin.name'),
            'phone' => '',
            'job_title' => 'Owner',
            'avatar' => null,
            'password' => bcrypt(config('auth.admin.password')),
            'email_verified_at' => now(),
            'remember_token' => null,
        ])->assignRole(Role::firstWhere('name', 'admin'));

        $currency = Currency::where('code', 'IDR')->first();
        OwnerCompany::create([
            'name' => 'My Company',
            'logo' => null,
            'address' => '',
            'postal_code' => '',
            'city' => '',
            'country_id' => null,
            'currency_id' => $currency?->id,
            'phone' => '',
            'web' => '',
            'email' => '',
        ]);
    }
}

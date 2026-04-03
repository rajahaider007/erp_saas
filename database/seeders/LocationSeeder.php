<?php

namespace Database\Seeders;

use App\Models\Company;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LocationSeeder extends Seeder
{
    public function run(): void
    {
        $companies = Company::query()->orderBy('id')->get();

        if ($companies->isEmpty()) {
            $this->command->warn('LocationSeeder skipped (no companies).');

            return;
        }

        $now = now();

        foreach ($companies as $company) {
            $exists = DB::table('locations')
                ->where('company_id', $company->id)
                ->where('location_name', 'Head Office')
                ->exists();

            if ($exists) {
                continue;
            }

            DB::table('locations')->insert([
                'company_id' => $company->id,
                'location_name' => 'Head Office',
                'address' => $company->address_line_1 ?? null,
                'city' => $company->city ?? null,
                'country' => $company->country ?? null,
                'postal_code' => $company->postal_code ?? null,
                'phone' => $company->phone ?? null,
                'email' => $company->email ?? null,
                'status' => true,
                'sort_order' => 0,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        $this->command->info('Default locations ensured for each company.');
    }
}

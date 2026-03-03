<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Country;

class CountrySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $countries = [
            // Asia
            ['country_code' => 'IND', 'country_name' => 'India', 'iso_2_code' => 'IN', 'iso_numeric_code' => '356', 'region' => 'Asia', 'sub_region' => 'South Asia'],
            ['country_code' => 'CHN', 'country_name' => 'China', 'iso_2_code' => 'CN', 'iso_numeric_code' => '156', 'region' => 'Asia', 'sub_region' => 'East Asia'],
            ['country_code' => 'JPN', 'country_name' => 'Japan', 'iso_2_code' => 'JP', 'iso_numeric_code' => '392', 'region' => 'Asia', 'sub_region' => 'East Asia'],
            ['country_code' => 'PAK', 'country_name' => 'Pakistan', 'iso_2_code' => 'PK', 'iso_numeric_code' => '586', 'region' => 'Asia', 'sub_region' => 'South Asia'],
            ['country_code' => 'BGD', 'country_name' => 'Bangladesh', 'iso_2_code' => 'BD', 'iso_numeric_code' => '050', 'region' => 'Asia', 'sub_region' => 'South Asia'],
            ['country_code' => 'IDN', 'country_name' => 'Indonesia', 'iso_2_code' => 'ID', 'iso_numeric_code' => '360', 'region' => 'Asia', 'sub_region' => 'Southeast Asia'],
            ['country_code' => 'THA', 'country_name' => 'Thailand', 'iso_2_code' => 'TH', 'iso_numeric_code' => '764', 'region' => 'Asia', 'sub_region' => 'Southeast Asia'],
            ['country_code' => 'MYS', 'country_name' => 'Malaysia', 'iso_2_code' => 'MY', 'iso_numeric_code' => '458', 'region' => 'Asia', 'sub_region' => 'Southeast Asia'],
            ['country_code' => 'SGP', 'country_name' => 'Singapore', 'iso_2_code' => 'SG', 'iso_numeric_code' => '702', 'region' => 'Asia', 'sub_region' => 'Southeast Asia'],
            ['country_code' => 'VNM', 'country_name' => 'Vietnam', 'iso_2_code' => 'VN', 'iso_numeric_code' => '704', 'region' => 'Asia', 'sub_region' => 'Southeast Asia'],

            // Europe
            ['country_code' => 'GBR', 'country_name' => 'United Kingdom', 'iso_2_code' => 'GB', 'iso_numeric_code' => '826', 'region' => 'Europe', 'sub_region' => 'Northern Europe'],
            ['country_code' => 'DDE', 'country_name' => 'Germany', 'iso_2_code' => 'DE', 'iso_numeric_code' => '276', 'region' => 'Europe', 'sub_region' => 'Central Europe'],
            ['country_code' => 'FRA', 'country_name' => 'France', 'iso_2_code' => 'FR', 'iso_numeric_code' => '250', 'region' => 'Europe', 'sub_region' => 'Western Europe'],
            ['country_code' => 'ITA', 'country_name' => 'Italy', 'iso_2_code' => 'IT', 'iso_numeric_code' => '380', 'region' => 'Europe', 'sub_region' => 'Southern Europe'],
            ['country_code' => 'ESP', 'country_name' => 'Spain', 'iso_2_code' => 'ES', 'iso_numeric_code' => '724', 'region' => 'Europe', 'sub_region' => 'Southern Europe'],
            ['country_code' => 'NLD', 'country_name' => 'Netherlands', 'iso_2_code' => 'NL', 'iso_numeric_code' => '528', 'region' => 'Europe', 'sub_region' => 'Western Europe'],
            ['country_code' => 'BEL', 'country_name' => 'Belgium', 'iso_2_code' => 'BE', 'iso_numeric_code' => '056', 'region' => 'Europe', 'sub_region' => 'Western Europe'],
            ['country_code' => 'SWE', 'country_name' => 'Sweden', 'iso_2_code' => 'SE', 'iso_numeric_code' => '752', 'region' => 'Europe', 'sub_region' => 'Northern Europe'],
            ['country_code' => 'RUS', 'country_name' => 'Russia', 'iso_2_code' => 'RU', 'iso_numeric_code' => '643', 'region' => 'Europe', 'sub_region' => 'Eastern Europe'],
            ['country_code' => 'UKR', 'country_name' => 'Ukraine', 'iso_2_code' => 'UA', 'iso_numeric_code' => '804', 'region' => 'Europe', 'sub_region' => 'Eastern Europe'],

            // Americas
            ['country_code' => 'USA', 'country_name' => 'United States', 'iso_2_code' => 'US', 'iso_numeric_code' => '840', 'region' => 'Americas', 'sub_region' => 'Northern America'],
            ['country_code' => 'CAN', 'country_name' => 'Canada', 'iso_2_code' => 'CA', 'iso_numeric_code' => '124', 'region' => 'Americas', 'sub_region' => 'Northern America'],
            ['country_code' => 'MEX', 'country_name' => 'Mexico', 'iso_2_code' => 'MX', 'iso_numeric_code' => '484', 'region' => 'Americas', 'sub_region' => 'Central America'],
            ['country_code' => 'BRA', 'country_name' => 'Brazil', 'iso_2_code' => 'BR', 'iso_numeric_code' => '076', 'region' => 'Americas', 'sub_region' => 'South America'],
            ['country_code' => 'ARG', 'country_name' => 'Argentina', 'iso_2_code' => 'AR', 'iso_numeric_code' => '032', 'region' => 'Americas', 'sub_region' => 'South America'],
            ['country_code' => 'CHL', 'country_name' => 'Chile', 'iso_2_code' => 'CL', 'iso_numeric_code' => '152', 'region' => 'Americas', 'sub_region' => 'South America'],

            // Africa
            ['country_code' => 'ZAF', 'country_name' => 'South Africa', 'iso_2_code' => 'ZA', 'iso_numeric_code' => '710', 'region' => 'Africa', 'sub_region' => 'Sub-Saharan Africa'],
            ['country_code' => 'EGY', 'country_name' => 'Egypt', 'iso_2_code' => 'EG', 'iso_numeric_code' => '818', 'region' => 'Africa', 'sub_region' => 'Northern Africa'],
            ['country_code' => 'GHA', 'country_name' => 'Ghana', 'iso_2_code' => 'GH', 'iso_numeric_code' => '288', 'region' => 'Africa', 'sub_region' => 'Sub-Saharan Africa'],
            ['country_code' => 'NGA', 'country_name' => 'Nigeria', 'iso_2_code' => 'NG', 'iso_numeric_code' => '566', 'region' => 'Africa', 'sub_region' => 'Sub-Saharan Africa'],

            // Oceania
            ['country_code' => 'AUS', 'country_name' => 'Australia', 'iso_2_code' => 'AU', 'iso_numeric_code' => '036', 'region' => 'Oceania', 'sub_region' => 'Australia and New Zealand'],
            ['country_code' => 'NZL', 'country_name' => 'New Zealand', 'iso_2_code' => 'NZ', 'iso_numeric_code' => '554', 'region' => 'Oceania', 'sub_region' => 'Australia and New Zealand'],
        ];

        foreach ($countries as $countryData) {
            Country::firstOrCreate(
                ['country_code' => $countryData['country_code']],
                array_merge($countryData, ['is_active' => true])
            );
        }

        $this->command->info('Country data seeded successfully!');
    }
}

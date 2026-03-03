<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Optional: keep your factory call
        // \App\Models\User::factory(10)->create();

        // Call your custom seeders in order of dependencies
        $this->call([
            AdminSeeder::class,
            SystemSeeder::class,
            UserRightsSeeder::class,
            ChartOfAccountsSeeder::class,
            SampleJournalVoucherSeeder::class,
            CountrySeeder::class,           // No dependencies
            UomMasterSeeder::class,         // Depends on Company
            TaxCategorySeeder::class,       // Depends on Company
            VendorSeeder::class,            // Depends on Company and Country
        ]);
    }
}

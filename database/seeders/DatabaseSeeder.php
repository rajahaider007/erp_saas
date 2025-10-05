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

        // Call your custom admin seeder
        $this->call([
            AdminSeeder::class,
            SystemSeeder::class,
            UserRightsSeeder::class,
            ChartOfAccountsSeeder::class,
        ]);
    }
}

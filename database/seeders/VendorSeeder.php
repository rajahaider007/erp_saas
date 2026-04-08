<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class VendorSeeder extends Seeder
{
    /**
     * Vendors are Level 4 Chart of Accounts rows with party_type = vendor (created from Vendor Master).
     * Demo data is no longer seeded here because each vendor must sit under a configured AP Level 3 parent.
     */
    public function run(): void
    {
        $this->command?->info('Skipped: add vendors via Inventory → Vendor Master (Chart of Accounts).');
    }
}

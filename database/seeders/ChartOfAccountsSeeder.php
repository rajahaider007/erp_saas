<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ChartOfAccountsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Import current data from exported JSON
        $data = json_decode(file_get_contents('chart_data.json'), true);
        
        foreach ($data as $account) {
            // Remove id and timestamps as they will be auto-generated
            unset($account['id']);
            unset($account['created_at']);
            unset($account['updated_at']);
            
            DB::table('chart_of_accounts')->insert($account);
        }
    }
}

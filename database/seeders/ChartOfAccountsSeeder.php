<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ChartOfAccountsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $accounts = [
            // Level 1 - Main Categories
            [
                'account_code' => '100000000000000',
                'account_name' => 'ASSETS',
                'short_code' => 'ASSETS',
                'account_type' => 'Assets',
                'account_level' => 1,
                'status' => 'Active',
                'currency' => 'USD',
                'comp_id' => 1,
                'location_id' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'account_code' => '200000000000000',
                'account_name' => 'LIABILITIES',
                'short_code' => 'LIAB',
                'account_type' => 'Liabilities',
                'account_level' => 1,
                'status' => 'Active',
                'currency' => 'USD',
                'comp_id' => 1,
                'location_id' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'account_code' => '300000000000000',
                'account_name' => 'EQUITY',
                'short_code' => 'EQUITY',
                'account_type' => 'Equity',
                'account_level' => 1,
                'status' => 'Active',
                'currency' => 'USD',
                'comp_id' => 1,
                'location_id' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'account_code' => '400000000000000',
                'account_name' => 'REVENUE',
                'short_code' => 'REV',
                'account_type' => 'Revenue',
                'account_level' => 1,
                'status' => 'Active',
                'currency' => 'USD',
                'comp_id' => 1,
                'location_id' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'account_code' => '500000000000000',
                'account_name' => 'EXPENSES',
                'short_code' => 'EXP',
                'account_type' => 'Expenses',
                'account_level' => 1,
                'status' => 'Active',
                'currency' => 'USD',
                'comp_id' => 1,
                'location_id' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            
            // Level 2 - Assets Subcategories
            [
                'account_code' => '100010000000000',
                'account_name' => 'Current Assets',
                'short_code' => 'CA',
                'account_type' => 'Assets',
                'account_level' => 2,
                'parent_account_id' => 1,
                'status' => 'Active',
                'currency' => 'USD',
                'comp_id' => 1,
                'location_id' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'account_code' => '100020000000000',
                'account_name' => 'Fixed Assets',
                'short_code' => 'FA',
                'account_type' => 'Assets',
                'account_level' => 2,
                'parent_account_id' => 1,
                'status' => 'Active',
                'currency' => 'USD',
                'comp_id' => 1,
                'location_id' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'account_code' => '100030000000000',
                'account_name' => 'Intangible Assets',
                'short_code' => 'IA',
                'account_type' => 'Assets',
                'account_level' => 2,
                'parent_account_id' => 1,
                'status' => 'Active',
                'currency' => 'USD',
                'comp_id' => 1,
                'location_id' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            
            // Level 2 - Liabilities Subcategories
            [
                'account_code' => '200010000000000',
                'account_name' => 'Current Liabilities',
                'short_code' => 'CL',
                'account_type' => 'Liabilities',
                'account_level' => 2,
                'parent_account_id' => 2,
                'status' => 'Active',
                'currency' => 'USD',
                'comp_id' => 1,
                'location_id' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'account_code' => '200020000000000',
                'account_name' => 'Long-term Liabilities',
                'short_code' => 'LTL',
                'account_type' => 'Liabilities',
                'account_level' => 2,
                'parent_account_id' => 2,
                'status' => 'Active',
                'currency' => 'USD',
                'comp_id' => 1,
                'location_id' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            
            // Level 3 - Current Assets (Transactional)
            [
                'account_code' => '100010000000001',
                'account_name' => 'Cash in Hand',
                'short_code' => 'CASH',
                'account_type' => 'Assets',
                'account_level' => 3,
                'parent_account_id' => 6,
                'status' => 'Active',
                'currency' => 'USD',
                'comp_id' => 1,
                'location_id' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'account_code' => '100010000000002',
                'account_name' => 'Bank Account',
                'short_code' => 'BANK',
                'account_type' => 'Assets',
                'account_level' => 3,
                'parent_account_id' => 6,
                'status' => 'Active',
                'currency' => 'USD',
                'comp_id' => 1,
                'location_id' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'account_code' => '100010000000003',
                'account_name' => 'Accounts Receivable',
                'short_code' => 'AR',
                'account_type' => 'Assets',
                'account_level' => 3,
                'parent_account_id' => 6,
                'status' => 'Active',
                'currency' => 'USD',
                'comp_id' => 1,
                'location_id' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'account_code' => '100010000000004',
                'account_name' => 'Inventory',
                'short_code' => 'INV',
                'account_type' => 'Assets',
                'account_level' => 3,
                'parent_account_id' => 6,
                'status' => 'Active',
                'currency' => 'USD',
                'comp_id' => 1,
                'location_id' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'account_code' => '100010000000005',
                'account_name' => 'Prepaid Expenses',
                'short_code' => 'PREP',
                'account_type' => 'Assets',
                'account_level' => 3,
                'parent_account_id' => 6,
                'status' => 'Active',
                'currency' => 'USD',
                'comp_id' => 1,
                'location_id' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            
            // Level 3 - Fixed Assets (Transactional)
            [
                'account_code' => '100020000000001',
                'account_name' => 'Office Equipment',
                'short_code' => 'OFFEQ',
                'account_type' => 'Assets',
                'account_level' => 3,
                'parent_account_id' => 7,
                'status' => 'Active',
                'currency' => 'USD',
                'comp_id' => 1,
                'location_id' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'account_code' => '100020000000002',
                'account_name' => 'Computer Equipment',
                'short_code' => 'COMP',
                'account_type' => 'Assets',
                'account_level' => 3,
                'parent_account_id' => 7,
                'status' => 'Active',
                'currency' => 'USD',
                'comp_id' => 1,
                'location_id' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'account_code' => '100020000000003',
                'account_name' => 'Furniture & Fixtures',
                'short_code' => 'FURN',
                'account_type' => 'Assets',
                'account_level' => 3,
                'parent_account_id' => 7,
                'status' => 'Active',
                'currency' => 'USD',
                'comp_id' => 1,
                'location_id' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            
            // Level 3 - Current Liabilities (Transactional)
            [
                'account_code' => '200010000000001',
                'account_name' => 'Accounts Payable',
                'short_code' => 'AP',
                'account_type' => 'Liabilities',
                'account_level' => 3,
                'parent_account_id' => 9,
                'status' => 'Active',
                'currency' => 'USD',
                'comp_id' => 1,
                'location_id' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'account_code' => '200010000000002',
                'account_name' => 'Accrued Expenses',
                'short_code' => 'ACCR',
                'account_type' => 'Liabilities',
                'account_level' => 3,
                'parent_account_id' => 9,
                'status' => 'Active',
                'currency' => 'USD',
                'comp_id' => 1,
                'location_id' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'account_code' => '200010000000003',
                'account_name' => 'Short-term Loans',
                'short_code' => 'STL',
                'account_type' => 'Liabilities',
                'account_level' => 3,
                'parent_account_id' => 9,
                'status' => 'Active',
                'currency' => 'USD',
                'comp_id' => 1,
                'location_id' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            
            // Level 3 - Equity (Transactional)
            [
                'account_code' => '300010000000001',
                'account_name' => 'Owner\'s Capital',
                'short_code' => 'CAP',
                'account_type' => 'Equity',
                'account_level' => 3,
                'parent_account_id' => 3,
                'status' => 'Active',
                'currency' => 'USD',
                'comp_id' => 1,
                'location_id' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'account_code' => '300010000000002',
                'account_name' => 'Retained Earnings',
                'short_code' => 'RE',
                'account_type' => 'Equity',
                'account_level' => 3,
                'parent_account_id' => 3,
                'status' => 'Active',
                'currency' => 'USD',
                'comp_id' => 1,
                'location_id' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            
            // Level 3 - Revenue (Transactional)
            [
                'account_code' => '400010000000001',
                'account_name' => 'Sales Revenue',
                'short_code' => 'SALES',
                'account_type' => 'Revenue',
                'account_level' => 3,
                'parent_account_id' => 4,
                'status' => 'Active',
                'currency' => 'USD',
                'comp_id' => 1,
                'location_id' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'account_code' => '400010000000002',
                'account_name' => 'Service Revenue',
                'short_code' => 'SERV',
                'account_type' => 'Revenue',
                'account_level' => 3,
                'parent_account_id' => 4,
                'status' => 'Active',
                'currency' => 'USD',
                'comp_id' => 1,
                'location_id' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'account_code' => '400010000000003',
                'account_name' => 'Interest Income',
                'short_code' => 'INT',
                'account_type' => 'Revenue',
                'account_level' => 3,
                'parent_account_id' => 4,
                'status' => 'Active',
                'currency' => 'USD',
                'comp_id' => 1,
                'location_id' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            
            // Level 3 - Expenses (Transactional)
            [
                'account_code' => '500010000000001',
                'account_name' => 'Office Rent',
                'short_code' => 'RENT',
                'account_type' => 'Expenses',
                'account_level' => 3,
                'parent_account_id' => 5,
                'status' => 'Active',
                'currency' => 'USD',
                'comp_id' => 1,
                'location_id' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'account_code' => '500010000000002',
                'account_name' => 'Utilities',
                'short_code' => 'UTIL',
                'account_type' => 'Expenses',
                'account_level' => 3,
                'parent_account_id' => 5,
                'status' => 'Active',
                'currency' => 'USD',
                'comp_id' => 1,
                'location_id' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'account_code' => '500010000000003',
                'account_name' => 'Salaries & Wages',
                'short_code' => 'SAL',
                'account_type' => 'Expenses',
                'account_level' => 3,
                'parent_account_id' => 5,
                'status' => 'Active',
                'currency' => 'USD',
                'comp_id' => 1,
                'location_id' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'account_code' => '500010000000004',
                'account_name' => 'Office Supplies',
                'short_code' => 'SUPP',
                'account_type' => 'Expenses',
                'account_level' => 3,
                'parent_account_id' => 5,
                'status' => 'Active',
                'currency' => 'USD',
                'comp_id' => 1,
                'location_id' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'account_code' => '500010000000005',
                'account_name' => 'Marketing Expenses',
                'short_code' => 'MKT',
                'account_type' => 'Expenses',
                'account_level' => 3,
                'parent_account_id' => 5,
                'status' => 'Active',
                'currency' => 'USD',
                'comp_id' => 1,
                'location_id' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'account_code' => '500010000000006',
                'account_name' => 'Professional Fees',
                'short_code' => 'PROF',
                'account_type' => 'Expenses',
                'account_level' => 3,
                'parent_account_id' => 5,
                'status' => 'Active',
                'currency' => 'USD',
                'comp_id' => 1,
                'location_id' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'account_code' => '500010000000007',
                'account_name' => 'Insurance',
                'short_code' => 'INS',
                'account_type' => 'Expenses',
                'account_level' => 3,
                'parent_account_id' => 5,
                'status' => 'Active',
                'currency' => 'USD',
                'comp_id' => 1,
                'location_id' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'account_code' => '500010000000008',
                'account_name' => 'Depreciation',
                'short_code' => 'DEP',
                'account_type' => 'Expenses',
                'account_level' => 3,
                'parent_account_id' => 5,
                'status' => 'Active',
                'currency' => 'USD',
                'comp_id' => 1,
                'location_id' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ]
        ];
        
        foreach ($accounts as $account) {
            \DB::table('chart_of_accounts')->insert($account);
        }
    }
}

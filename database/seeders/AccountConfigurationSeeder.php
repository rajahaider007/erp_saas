<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AccountConfigurationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get company and location from first transaction or use defaults
        $compId = 1;
        $locationId = 1;

        // Check if we have data in transactions
        $transaction = DB::table('transactions')->first();
        if ($transaction) {
            $compId = $transaction->comp_id;
            $locationId = $transaction->location_id;
        }

        // Define account mapping patterns for configuration
        $accountMappings = [
            // Cash accounts
            [
                'search' => ['Cash in Hand', 'Petty Cash'],
                'config_type' => 'cash',
                'description' => 'Cash on hand and petty cash accounts'
            ],
            // Bank accounts
            [
                'search' => ['Bank', 'HBL', 'MCB', 'UBL', 'Allied Bank', 'Meezan Bank'],
                'config_type' => 'bank',
                'description' => 'Bank accounts for transactions'
            ],
            // Accounts Receivable
            [
                'search' => ['Accounts Receivable', 'Trade Receivable', 'Customer'],
                'config_type' => 'accounts_receivable',
                'description' => 'Customer receivables and trade debtors'
            ],
            // Accounts Payable
            [
                'search' => ['Accounts Payable', 'Trade Payable', 'Creditor', 'Supplier'],
                'config_type' => 'accounts_payable',
                'description' => 'Supplier payables and trade creditors'
            ],
            // Inventory
            [
                'search' => ['Inventory', 'Stock', 'Raw Material', 'Finished Goods'],
                'config_type' => 'inventory',
                'description' => 'Inventory and stock accounts'
            ],
            // Fixed Assets
            [
                'search' => ['Land', 'Building', 'Machinery', 'Vehicle', 'Furniture', 'Equipment', 'Computer'],
                'config_type' => 'fixed_asset',
                'description' => 'Fixed assets and property'
            ],
            // Prepaid Expenses
            [
                'search' => ['Prepaid', 'Advance Payment'],
                'config_type' => 'prepaid_expense',
                'description' => 'Prepaid expenses and advances'
            ],
            // Tax Receivable
            [
                'search' => ['GST Receivable', 'VAT Receivable', 'Input Tax', 'Tax Receivable'],
                'config_type' => 'input_tax',
                'description' => 'Input tax and VAT receivable'
            ],
            // Short Term Loans
            [
                'search' => ['Short-term Loan', 'Short Term Loan'],
                'config_type' => 'short_term_loan',
                'description' => 'Short-term borrowings'
            ],
            // Long Term Loans
            [
                'search' => ['Long-term Loan', 'Long Term Loan', 'Mortgage'],
                'config_type' => 'long_term_loan',
                'description' => 'Long-term borrowings and mortgages'
            ],
            // Tax Payable
            [
                'search' => ['GST Payable', 'VAT Payable', 'Output Tax', 'Tax Payable', 'Income Tax'],
                'config_type' => 'tax_payable',
                'description' => 'Tax payables and liabilities'
            ],
            // Capital/Equity
            [
                'search' => ['Capital', 'Share Capital', 'Owner Equity'],
                'config_type' => 'capital',
                'description' => 'Capital and equity accounts'
            ],
            // Retained Earnings
            [
                'search' => ['Retained Earning', 'Accumulated Profit'],
                'config_type' => 'retained_earnings',
                'description' => 'Retained earnings and reserves'
            ],
            // Sales Revenue
            [
                'search' => ['Sales', 'Revenue', 'Income from Sale'],
                'config_type' => 'sales',
                'description' => 'Sales revenue accounts'
            ],
            // Service Income
            [
                'search' => ['Service Income', 'Service Revenue', 'Consulting'],
                'config_type' => 'service_income',
                'description' => 'Service and consulting income'
            ],
            // Purchase
            [
                'search' => ['Purchase'],
                'config_type' => 'purchase',
                'description' => 'Purchase accounts'
            ],
            // Cost of Goods Sold
            [
                'search' => ['Cost of Goods Sold', 'COGS', 'Cost of Sales'],
                'config_type' => 'cost_of_goods_sold',
                'description' => 'Cost of goods sold'
            ],
            // Salary Expense
            [
                'search' => ['Salary', 'Wage', 'Payroll'],
                'config_type' => 'salary_expense',
                'description' => 'Salary and wage expenses'
            ],
            // Rent Expense
            [
                'search' => ['Rent Expense', 'Rental'],
                'config_type' => 'rent_expense',
                'description' => 'Rent and rental expenses'
            ],
            // Utility Expense
            [
                'search' => ['Utility', 'Electricity', 'Water', 'Gas', 'Internet'],
                'config_type' => 'utility_expense',
                'description' => 'Utility expenses'
            ],
            // Depreciation
            [
                'search' => ['Depreciation'],
                'config_type' => 'depreciation_expense',
                'description' => 'Depreciation expenses'
            ],
            // Interest Expense
            [
                'search' => ['Interest Expense', 'Finance Cost', 'Bank Charges'],
                'config_type' => 'interest_expense',
                'description' => 'Interest and finance costs'
            ],
        ];

        $configurationsCreated = 0;

        foreach ($accountMappings as $mapping) {
            foreach ($mapping['search'] as $searchTerm) {
                // Find matching Level 3 accounts
                $accounts = DB::table('chart_of_accounts')
                    ->where('comp_id', $compId)
                    ->where('location_id', $locationId)
                    ->where('account_level', 3)
                    ->where('account_name', 'LIKE', "%{$searchTerm}%")
                    ->get();

                foreach ($accounts as $account) {
                    // Check if configuration already exists
                    $exists = DB::table('account_configurations')
                        ->where('comp_id', $compId)
                        ->where('location_id', $locationId)
                        ->where('account_id', $account->id)
                        ->where('config_type', $mapping['config_type'])
                        ->exists();

                    if (!$exists) {
                        DB::table('account_configurations')->insert([
                            'comp_id' => $compId,
                            'location_id' => $locationId,
                            'account_id' => $account->id,
                            'account_code' => $account->account_code,
                            'account_name' => $account->account_name,
                            'account_level' => $account->account_level,
                            'config_type' => $mapping['config_type'],
                            'description' => $mapping['description'],
                            'is_active' => true,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);

                        $configurationsCreated++;
                        $this->command->info("Created: {$account->account_code} - {$account->account_name} => {$mapping['config_type']}");
                    }
                }
            }
        }

        $this->command->info("\n✓ Total configurations created: {$configurationsCreated}");
    }
}


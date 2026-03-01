<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ComprehensiveAccountConfigurationSeeder extends Seeder
{
    /**
     * Seed ALL Level 4 transactional accounts with appropriate config_types
     * This ensures Balance Sheet and Income Statement work correctly
     */
    public function run(): void
    {
        echo "Starting Comprehensive Account Configuration Seeding...\n\n";

        // Get all companies and locations
        $companies = DB::table('companies')->select('id')->get();
        
        foreach ($companies as $company) {
            $locations = DB::table('locations')
                ->where('company_id', $company->id)
                ->select('id')
                ->get();

            foreach ($locations as $location) {
                echo "Processing Company ID: {$company->id}, Location ID: {$location->id}\n";
                $this->seedAccountConfigurations($company->id, $location->id);
            }
        }

        echo "\n✓ Comprehensive Account Configuration Seeding Completed!\n";
    }

    private function seedAccountConfigurations($compId, $locationId)
    {
        // Get all Level 4 transactional accounts for this company/location
        $accounts = DB::table('chart_of_accounts')
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->where('account_level', 4)
            ->where('is_transactional', true)
            ->select('id', 'account_code', 'account_name', 'account_type')
            ->get();

        $inserted = 0;
        $skipped = 0;

        foreach ($accounts as $account) {
            // Check if already configured
            $exists = DB::table('account_configurations')
                ->where('comp_id', $compId)
                ->where('location_id', $locationId)
                ->where('account_id', $account->id)
                ->exists();

            if ($exists) {
                $skipped++;
                continue;
            }

            // Determine config_type based on account_type and account_name
            $configType = $this->determineConfigType($account->account_name, $account->account_type);

            if ($configType) {
                DB::table('account_configurations')->insert([
                    'comp_id' => $compId,
                    'location_id' => $locationId,
                    'account_id' => $account->id,
                    'config_type' => $configType,
                    'description' => "Auto-configured: {$account->account_name}",
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                $inserted++;
            }
        }

        echo "  Inserted: $inserted, Skipped (already exists): $skipped\n";
    }

    private function determineConfigType($accountName, $accountType): ?string
    {
        $nameLower = strtolower($accountName);
        $typeLower = strtolower($accountType);

        // ASSETS
        if ($typeLower === 'assets' || $typeLower === 'asset') {
            // Cash accounts
            if (str_contains($nameLower, 'cash in hand')) {
                return 'cash';
            }
            if (str_contains($nameLower, 'petty cash')) {
                return 'petty_cash';
            }
            // Bank accounts
            if (str_contains($nameLower, 'bank') || 
                str_contains($nameLower, 'hbl') || 
                str_contains($nameLower, 'mcb') ||
                str_contains($nameLower, 'ubl') ||
                str_contains($nameLower, 'allied') ||
                str_contains($nameLower, 'meezan')) {
                return 'bank';
            }
            // Accounts Receivable
            if (str_contains($nameLower, 'receivable') || 
                str_contains($nameLower, 'debtor') ||
                str_contains($nameLower, 'customer')) {
                return 'accounts_receivable';
            }
            // Inventory
            if (str_contains($nameLower, 'inventory') || 
                str_contains($nameLower, 'stock') ||
                str_contains($nameLower, 'raw material') ||
                str_contains($nameLower, 'finished goods')) {
                return 'inventory';
            }
            // Fixed Assets
            if (str_contains($nameLower, 'land') || 
                str_contains($nameLower, 'building') ||
                str_contains($nameLower, 'machinery') ||
                str_contains($nameLower, 'vehicle') ||
                str_contains($nameLower, 'furniture') ||
                str_contains($nameLower, 'equipment') ||
                str_contains($nameLower, 'computer')) {
                return 'fixed_asset';
            }
            // Intangible Assets
            if (str_contains($nameLower, 'goodwill') || 
                str_contains($nameLower, 'patent') ||
                str_contains($nameLower, 'trademark') ||
                str_contains($nameLower, 'software') ||
                str_contains($nameLower, 'license')) {
                return 'intangible_asset';
            }
            // Investments
            if (str_contains($nameLower, 'investment')) {
                return str_contains($nameLower, 'long') ? 'long_term_investment' : 'short_term_investment';
            }
            // Prepaid Expenses
            if (str_contains($nameLower, 'prepaid') || 
                str_contains($nameLower, 'advance paid')) {
                return 'prepaid_expense';
            }
            // Input Tax / VAT Receivable
            if (str_contains($nameLower, 'input tax') || 
                str_contains($nameLower, 'gst receivable') ||
                str_contains($nameLower, 'vat receivable')) {
                return 'input_tax';
            }
            // Security Deposits
            if (str_contains($nameLower, 'security deposit') || 
                str_contains($nameLower, 'deposit')) {
                return 'security_deposit';
            }
            // Employee Advances
            if (str_contains($nameLower, 'employee advance') || 
                str_contains($nameLower, 'staff advance')) {
                return 'employee_advance';
            }
            // Deferred Tax Asset
            if (str_contains($nameLower, 'deferred tax asset')) {
                return 'deferred_tax_asset';
            }
            // Default for other assets
            return 'other_asset';
        }

        // LIABILITIES
       if ($typeLower === 'liabilities' || $typeLower === 'liability') {
            // Accounts Payable
            if (str_contains($nameLower, 'payable') || 
                str_contains($nameLower, 'creditor') ||
                str_contains($nameLower, 'supplier')) {
                return 'accounts_payable';
            }
            // Short-term Loans
            if (str_contains($nameLower, 'short') && str_contains($nameLower, 'loan')) {
                return 'short_term_loan';
            }
            // Long-term Loans
            if ((str_contains($nameLower, 'long') && str_contains($nameLower, 'loan')) ||
                str_contains($nameLower, 'mortgage')) {
                return 'long_term_loan';
            }
            // Tax Payable
            if (str_contains($nameLower, 'tax') && str_contains($nameLower, 'payable')) {
                return 'tax_payable';
            }
            if (str_contains($nameLower, 'output tax') || 
                str_contains($nameLower, 'gst payable') ||
                str_contains($nameLower, 'vat payable') ||
                str_contains($nameLower, 'income tax payable')) {
                return 'tax_payable';
            }
            // Accrued Expenses
            if (str_contains($nameLower, 'accrued')) {
                return 'accrued_expense';
            }
            // Unearned Revenue
            if (str_contains($nameLower, 'unearned') || 
                str_contains($nameLower, 'deferred revenue') ||
                str_contains($nameLower, 'advance received')) {
                return 'unearned_revenue';
            }
            // Default for other liabilities
            return 'other_liability';
        }

        // EQUITY
        if ($typeLower === 'equity') {
            // Capital
            if (str_contains($nameLower, 'capital') || 
                str_contains($nameLower, 'share capital') ||
                str_contains($nameLower, 'owner')) {
                return 'capital';
            }
            // Retained Earnings
            if (str_contains($nameLower, 'retained') || 
                str_contains($nameLower, 'accumulated')) {
                return 'retained_earnings';
            }
            // Drawings
            if (str_contains($nameLower, 'drawing') || 
                str_contains($nameLower, 'withdrawal')) {
                return 'drawings';
            }
            // Default equity
            return 'capital';
        }

        // REVENUE
        if ($typeLower === 'revenue') {
            // Sales Revenue
            if (str_contains($nameLower, 'sales')) {
                return 'sales';
            }
            // Service Income
            if (str_contains($nameLower, 'service')) {
                return 'service_income';
            }
            // Interest Income
            if (str_contains($nameLower, 'interest income')) {
                return 'interest_income';
            }
            // Other Income
            if (str_contains($nameLower, 'other') || 
                str_contains($nameLower, 'miscellaneous')) {
                return 'other_income';
            }
            // Default revenue
            return 'sales';
        }

        // EXPENSES
        if ($typeLower === 'expenses' || $typeLower === 'expense') {
            // Purchase / COGS
            if (str_contains($nameLower, 'purchase') || 
                str_contains($nameLower, 'cost of goods') ||
                str_contains($nameLower, 'cogs')) {
                return str_contains($nameLower, 'purchase') ? 'purchase' : 'cost_of_goods_sold';
            }
            // Salary Expense
            if (str_contains($nameLower, 'salary') || 
                str_contains($nameLower, 'salaries') ||
                str_contains($nameLower, 'wage') ||
                str_contains($nameLower, 'payroll')) {
                return 'salary_expense';
            }
            // Rent Expense
            if (str_contains($nameLower, 'rent')) {
                return 'rent_expense';
            }
            // Utility Expense
            if (str_contains($nameLower, 'utility') || 
                str_contains($nameLower, 'electricity') ||
                str_contains($nameLower, 'water') ||
                str_contains($nameLower, 'gas')) {
                return 'utility_expense';
            }
            // Depreciation
            if (str_contains($nameLower, 'depreciation')) {
                return 'depreciation_expense';
            }
            // Amortization
            if (str_contains($nameLower, 'amortization')) {
                return 'amortization_expense';
            }
            // Interest Expense
            if (str_contains($nameLower, 'interest expense') || 
                str_contains($nameLower, 'interest paid')) {
                return 'interest_expense';
            }
            // Insurance
            if (str_contains($nameLower, 'insurance')) {
                return 'insurance_expense';
            }
            // Maintenance
            if (str_contains($nameLower, 'maintenance') || 
                str_contains($nameLower, 'repair')) {
                return 'maintenance_expense';
            }
            // Marketing/Advertising
            if (str_contains($nameLower, 'marketing') || 
                str_contains($nameLower, 'advertising')) {
                return 'marketing_expense';
            }
            // Travel
            if (str_contains($nameLower, 'travel')) {
                return 'travel_expense';
            }
            // Office Expense
            if (str_contains($nameLower, 'office') || 
                str_contains($nameLower, 'stationery')) {
                return 'office_expense';
            }
            // Default expense
            return 'other_expense';
        }

        // If we can't determine, return null (skip)
        return null;
    }
}

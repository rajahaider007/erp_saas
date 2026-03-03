<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations - Add missing config_type enum values
     */
    public function up(): void
    {
        // Alter the config_type ENUM to include all needed values
        DB::statement("ALTER TABLE account_configurations MODIFY COLUMN config_type ENUM(
            'cash',
            'bank',
            'petty_cash',
            'accounts_receivable',
            'inventory',
            'fixed_asset',
            'intangible_asset',
            'investment',
            'long_term_investment',
            'short_term_investment',
            'prepaid_expense',
            'input_tax',
            'security_deposit',
            'employee_advance',
            'deferred_tax_asset',
            'other_asset',
            'accounts_payable',
            'accrued_expense',
            'short_term_loan',
            'long_term_loan',
            'tax_payable',
            'output_tax',
            'unearned_revenue',
            'other_liability',
            'capital',
            'drawings',
            'retained_earnings',
            'sales',
            'service_income',
            'interest_income',
            'other_income',
            'purchase',
            'cost_of_goods_sold',
            'salary_expense',
            'rent_expense',
            'utility_expense',
            'depreciation_expense',
            'amortization_expense',
            'interest_expense',
            'insurance_expense',
            'maintenance_expense',
            'marketing_expense',
            'travel_expense',
            'office_expense',
            'other_expense',
            'other'
        ) DEFAULT 'other'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert to original ENUM values
        DB::statement("ALTER TABLE account_configurations MODIFY COLUMN config_type ENUM(
            'cash',
            'bank',
            'petty_cash',
            'accounts_receivable',
            'inventory',
            'fixed_asset',
            'intangible_asset',
            'investment',
            'prepaid_expense',
            'input_tax',
            'accounts_payable',
            'accrued_expense',
            'short_term_loan',
            'long_term_loan',
            'tax_payable',
            'output_tax',
            'capital',
            'drawings',
            'retained_earnings',
            'sales',
            'service_income',
            'other_income',
            'purchase',
            'cost_of_goods_sold',
            'salary_expense',
            'rent_expense',
            'utility_expense',
            'depreciation_expense',
            'interest_expense',
            'other'
        ) DEFAULT 'other'");
    }
};

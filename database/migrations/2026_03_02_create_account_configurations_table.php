<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('account_configurations', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('comp_id')->nullable();
            $table->bigInteger('location_id')->nullable();
            $table->bigInteger('account_id')->nullable();
            $table->string('account_code')->nullable(); // For reference
            $table->string('account_name')->nullable(); // For reference
            $table->tinyInteger('account_level')->nullable(); // Level 3 only

            // Configuration type - What this account is used for
            $table->enum('config_type', [
                // Assets
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

                // Liabilities
                'accounts_payable',
                'accrued_expense',
                'short_term_loan',
                'long_term_loan',
                'tax_payable',
                'output_tax',

                // Equity
                'capital',
                'drawings',
                'retained_earnings',

                // Income
                'sales',
                'service_income',
                'other_income',

                // Expense
                'purchase',
                'cost_of_goods_sold',
                'salary_expense',
                'rent_expense',
                'utility_expense',
                'depreciation_expense',
                'interest_expense',

                'other'
            ])->default('other');

            $table->string('description')->nullable();
            $table->boolean('is_active')->default(true)->index();

            $table->timestamps();
            $table->softDeletes();

            // Indexes for performance
            $table->index(['comp_id', 'location_id', 'config_type']);
            $table->index(['account_id', 'config_type']);
            $table->unique(['comp_id', 'location_id', 'account_id', 'config_type'], 'uq_acct_config');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('account_configurations');
    }
};

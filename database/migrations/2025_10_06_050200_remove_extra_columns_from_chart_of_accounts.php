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
        Schema::table('chart_of_accounts', function (Blueprint $table) {
            // Remove extra columns that are not needed
            $table->dropColumn([
                'account_subtype',
                'account_path', 
                'normal_balance',
                'opening_balance',
                'current_balance',
                'is_parent',
                'is_child',
                'is_transactional',
                'tax_category',
                'reporting_category',
                'cost_center',
                'department',
                'min_balance',
                'max_balance',
                'requires_approval',
                'created_by',
                'updated_by',
                'deleted_at'
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('chart_of_accounts', function (Blueprint $table) {
            $table->string('account_subtype')->nullable();
            $table->text('account_path')->nullable();
            $table->enum('normal_balance', ['Debit', 'Credit']);
            $table->decimal('opening_balance', 18, 2)->default(0.00);
            $table->decimal('current_balance', 18, 2)->default(0.00);
            $table->boolean('is_parent')->default(false);
            $table->boolean('is_child')->default(false);
            $table->boolean('is_transactional')->default(false);
            $table->enum('tax_category', ['Taxable', 'Non-taxable', 'Exempt'])->default('Taxable');
            $table->string('reporting_category')->nullable();
            $table->string('cost_center')->nullable();
            $table->string('department')->nullable();
            $table->decimal('min_balance', 18, 2)->nullable();
            $table->decimal('max_balance', 18, 2)->nullable();
            $table->boolean('requires_approval')->default(false);
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->softDeletes();
        });
    }
};

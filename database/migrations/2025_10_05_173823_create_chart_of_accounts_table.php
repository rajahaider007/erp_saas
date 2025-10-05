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
        Schema::create('chart_of_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('account_code', 15)->unique();
            $table->string('account_name');
            $table->enum('account_type', ['Assets', 'Liabilities', 'Equity', 'Revenue', 'Expenses']);
            $table->string('account_subtype')->nullable();
            $table->unsignedBigInteger('parent_account_id')->nullable();
            $table->tinyInteger('account_level')->default(1);
            $table->text('account_path')->nullable();
            $table->enum('normal_balance', ['Debit', 'Credit']);
            $table->decimal('opening_balance', 18, 2)->default(0.00);
            $table->decimal('current_balance', 18, 2)->default(0.00);
            $table->string('currency', 3)->default('USD');
            $table->boolean('is_parent')->default(false);
            $table->boolean('is_child')->default(false);
            $table->boolean('is_transactional')->default(false);
            $table->enum('status', ['Active', 'Inactive'])->default('Active');
            $table->enum('tax_category', ['Taxable', 'Non-taxable', 'Exempt'])->default('Taxable');
            $table->string('reporting_category')->nullable();
            $table->string('cost_center')->nullable();
            $table->string('department')->nullable();
            $table->decimal('min_balance', 18, 2)->nullable();
            $table->decimal('max_balance', 18, 2)->nullable();
            $table->boolean('requires_approval')->default(false);
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['account_code']);
            $table->index(['account_type']);
            $table->index(['parent_account_id']);
            $table->index(['account_level']);
            $table->index(['status']);
            
            $table->foreign('parent_account_id')->references('id')->on('chart_of_accounts')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chart_of_accounts');
    }
};

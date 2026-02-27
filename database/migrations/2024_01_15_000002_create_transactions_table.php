<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTransactionsTable extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        // Skip creation if the table already exists. This can happen when
        // running migrations against a database that was seeded from a SQL
        // dump, or if the migration has been run before.
        if (!Schema::hasTable('transactions')) {
            Schema::create('transactions', function (Blueprint $table) {
                $table->id();
                $table->string('voucher_number', 50)->unique();
                $table->date('voucher_date');
                $table->string('voucher_type', 50);
                $table->string('voucher_sub_type', 50)->nullable();
                $table->string('reference_number', 100)->nullable();
                $table->text('description');
                $table->enum('status', ['Draft', 'Pending', 'Approved', 'Posted', 'Rejected'])->default('Draft');
                $table->decimal('total_debit', 15, 2)->default(0.00);
                $table->decimal('total_credit', 15, 2)->default(0.00);
                $table->string('currency_code', 3)->default('USD');
                $table->decimal('exchange_rate', 10, 6)->default(1.000000);
                $table->decimal('base_currency_total', 15, 2)->default(0.00);
                $table->unsignedBigInteger('period_id');
                $table->unsignedBigInteger('comp_id');
                $table->unsignedBigInteger('location_id');
                $table->unsignedBigInteger('created_by');
                $table->unsignedBigInteger('approved_by')->nullable();
                $table->unsignedBigInteger('posted_by')->nullable();
                $table->timestamp('approved_at')->nullable();
                $table->timestamp('posted_at')->nullable();
                $table->text('rejection_reason')->nullable();
                $table->boolean('is_reversed')->default(false);
                $table->unsignedBigInteger('reversal_transaction_id')->nullable();
                $table->unsignedBigInteger('original_transaction_id')->nullable();
                $table->timestamps();

                // Indexes for performance
                $table->index(['comp_id', 'location_id']);
                $table->index('voucher_type');
                $table->index('status');
                $table->index('voucher_date');
                $table->index('created_by');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::dropIfExists('transactions');
    }
}

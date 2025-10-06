<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTransactionEntriesTable extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('transaction_entries', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('transaction_id');
            $table->integer('line_number');
            $table->unsignedBigInteger('account_id');
            $table->text('description')->nullable();
            $table->decimal('debit_amount', 15, 2)->default(0.00);
            $table->decimal('credit_amount', 15, 2)->default(0.00);
            $table->string('currency_code', 3);
            $table->decimal('exchange_rate', 10, 6);
            $table->decimal('base_debit_amount', 15, 2)->default(0.00);
            $table->decimal('base_credit_amount', 15, 2)->default(0.00);
            $table->unsignedBigInteger('cost_center_id')->nullable();
            $table->unsignedBigInteger('project_id')->nullable();
            $table->unsignedBigInteger('department_id')->nullable();
            $table->string('reference', 100)->nullable();
            $table->unsignedBigInteger('comp_id');
            $table->unsignedBigInteger('location_id');
            $table->timestamps();

            // Foreign key constraints
            $table->foreign('transaction_id')->references('id')->on('transactions')->onDelete('cascade');
            $table->foreign('account_id')->references('id')->on('chart_of_accounts');
            
            // Indexes for performance
            $table->index('transaction_id');
            $table->index('account_id');
            $table->index(['comp_id', 'location_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::dropIfExists('transaction_entries');
    }
}

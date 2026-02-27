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
            $table->string('reference', 100)->nullable();
            $table->unsignedBigInteger('comp_id');
            $table->unsignedBigInteger('location_id');
            $table->timestamps();

            // Foreign key constraints
            $table->foreign('transaction_id')->references('id')->on('transactions')->onDelete('cascade');
            // chart_of_accounts migration runs later than this one, so only add
            // the FK when the referenced table actually exists. We create the
            // table here and then add the constraint in a second step below.
            
            // Indexes for performance
            $table->index('transaction_id');
            $table->index('account_id');
            $table->index(['comp_id', 'location_id']);
        });

        // add the account_id foreign key if the chart_of_accounts table is
        // already available (e.g. when running migrations against an
        // existing database). If the table is created later in the sequence
        // the constraint will be added in its own migration and there's no
        // harm in this step being skipped.
        if (Schema::hasTable('chart_of_accounts')) {
            Schema::table('transaction_entries', function (Blueprint $table) {
                $table->foreign('account_id')->references('id')->on('chart_of_accounts');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::dropIfExists('transaction_entries');
    }
}

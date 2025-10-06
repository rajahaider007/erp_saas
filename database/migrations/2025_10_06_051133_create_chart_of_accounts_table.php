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
            $table->unsignedBigInteger('parent_account_id')->nullable();
            $table->tinyInteger('account_level')->default(1);
            $table->string('currency', 3)->default('USD');
            $table->enum('status', ['Active', 'Inactive'])->default('Active');
            $table->string('short_code', 20)->nullable();
            $table->unsignedBigInteger('comp_id')->nullable();
            $table->unsignedBigInteger('location_id')->nullable();
            $table->timestamps();
            
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

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
        Schema::create('currency_exchange_rate_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('currency_id')->constrained('currencies')->onDelete('cascade');
            $table->decimal('exchange_rate', 20, 6);
            $table->decimal('previous_rate', 20, 6)->nullable();
            $table->decimal('rate_change', 10, 6)->nullable(); // Percentage change
            $table->string('source')->default('manual'); // manual, api, system
            $table->string('api_provider')->nullable(); // exchangerate-api, fixer, etc.
            $table->text('notes')->nullable();
            $table->timestamp('effective_date');
            $table->timestamps();
            
            $table->index(['currency_id', 'effective_date']);
            $table->index('source');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('currency_exchange_rate_history');
    }
};

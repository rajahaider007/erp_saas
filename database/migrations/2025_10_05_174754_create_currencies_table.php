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
        Schema::create('currencies', function (Blueprint $table) {
            $table->id();
            $table->string('code', 3)->unique(); // USD, EUR, GBP, etc.
            $table->string('name'); // United States Dollar
            $table->string('symbol'); // $, €, £, etc.
            $table->string('country'); // United States, European Union, etc.
            $table->decimal('exchange_rate', 10, 4)->default(1.0000);
            $table->boolean('is_active')->default(true);
            $table->boolean('is_base_currency')->default(false);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            
            $table->index(['is_active']);
            $table->index(['is_base_currency']);
            $table->index(['sort_order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('currencies');
    }
};

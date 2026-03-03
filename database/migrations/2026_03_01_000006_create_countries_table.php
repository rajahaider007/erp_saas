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
        Schema::create('countries', function (Blueprint $table) {
            $table->id();
            
            $table->string('country_code', 3)->unique(); // ISO 3166-1 alpha-3
            $table->string('country_name', 100)->unique();
            $table->string('iso_2_code', 2)->unique(); // ISO 3166-1 alpha-2
            $table->string('iso_numeric_code', 3)->unique();
            $table->string('region', 50)->nullable();
            $table->string('sub_region', 50)->nullable();
            $table->boolean('is_active')->default(true);

            $table->timestamps();

            $table->index(['country_code']);
            $table->index(['country_name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('countries');
    }
};

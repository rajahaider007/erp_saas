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
        Schema::create('code_configurations', function (Blueprint $table) {
            $table->id();
            // foreign keys created afterwards if referenced tables exist
            $table->unsignedBigInteger('company_id')->nullable();
            $table->unsignedBigInteger('location_id')->nullable();
            $table->string('code_type', 50); // customer, bank, vendor, etc.
            $table->string('code_name', 100); // Display name
            $table->integer('account_level')->default(2); // Level 2 or 3 in chart of accounts
            $table->string('prefix', 10)->nullable(); // e.g., 'CUST', 'BANK', 'VEND'
            $table->integer('next_number')->default(1); // Next number to use
            $table->integer('number_length')->default(4); // Padding length (e.g., 0001)
            $table->string('separator', 5)->default('-'); // Separator between prefix and number
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();
            
            // Unique constraint: one configuration per code_type per company-location combination
            $table->unique(['company_id', 'location_id', 'code_type'], 'unique_code_config');
        });

        // add foreign key constraints if tables are present
        if (Schema::hasTable('companies') || Schema::hasTable('locations') || Schema::hasTable('users')) {
            Schema::table('code_configurations', function (Blueprint $table) {
                if (Schema::hasTable('companies')) {
                    $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
                }
                if (Schema::hasTable('locations')) {
                    $table->foreign('location_id')->references('id')->on('locations')->onDelete('cascade');
                }
                if (Schema::hasTable('users')) {
                    $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
                    $table->foreign('updated_by')->references('id')->on('users')->onDelete('set null');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('code_configurations');
    }
};


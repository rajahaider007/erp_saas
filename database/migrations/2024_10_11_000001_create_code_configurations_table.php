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
            $table->foreignId('company_id')->nullable()->constrained('companies')->onDelete('cascade');
            $table->foreignId('location_id')->nullable()->constrained('locations')->onDelete('cascade');
            $table->string('code_type', 50); // customer, bank, vendor, etc.
            $table->string('code_name', 100); // Display name
            $table->integer('account_level')->default(2); // Level 2 or 3 in chart of accounts
            $table->string('prefix', 10)->nullable(); // e.g., 'CUST', 'BANK', 'VEND'
            $table->integer('next_number')->default(1); // Next number to use
            $table->integer('number_length')->default(4); // Padding length (e.g., 0001)
            $table->string('separator', 5)->default('-'); // Separator between prefix and number
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            
            // Unique constraint: one configuration per code_type per company-location combination
            $table->unique(['company_id', 'location_id', 'code_type'], 'unique_code_config');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('code_configurations');
    }
};


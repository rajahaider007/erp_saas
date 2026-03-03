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
        Schema::create('tax_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            
            $table->string('tax_code', 20);
            $table->string('tax_name', 100);
            $table->enum('tax_type', ['vat', 'gst', 'sales_tax', 'excise', 'custom']);
            $table->decimal('tax_rate', 5, 2);
            $table->string('description', 250)->nullable();
            $table->enum('applicable_for', ['purchase', 'sales', 'both'])->default('both');
            $table->boolean('is_active')->default(true);

            $table->timestamps();
            $table->softDeletes();

            $table->unique(['company_id', 'tax_code']);
            $table->index(['company_id']);
            $table->index(['tax_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tax_categories');
    }
};

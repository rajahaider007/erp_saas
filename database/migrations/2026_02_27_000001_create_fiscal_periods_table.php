<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Creates fiscal periods for accounting year management
     * Follows International Accounting Standards (IAS 1)
     */
    public function up(): void
    {
        Schema::create('fiscal_periods', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('comp_id');
            $table->string('fiscal_year', 4); // e.g., "2024", "2025"
            $table->integer('period_number'); // 1-12 for months, or custom
            $table->string('period_name'); // e.g., "January 2024", "Q1 2024"
            $table->date('start_date');
            $table->date('end_date');
            $table->enum('period_type', ['Monthly', 'Quarterly', 'Semi-Annual', 'Annual', 'Custom'])->default('Monthly');
            $table->enum('status', ['Open', 'Locked', 'Closed'])->default('Open');
            $table->boolean('is_adjustment_period')->default(false); // For year-end adjustments
            $table->text('closing_notes')->nullable();
            $table->unsignedBigInteger('closed_by')->nullable();
            $table->timestamp('closed_at')->nullable();
            $table->timestamps();

            // Indexes for performance
            $table->index(['comp_id', 'fiscal_year']);
            $table->index(['comp_id', 'status']);
            $table->unique(['comp_id', 'fiscal_year', 'period_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fiscal_periods');
    }
};

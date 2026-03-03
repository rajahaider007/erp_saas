<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('uom_conversions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->foreignId('from_uom_id')->constrained('uom_masters')->onDelete('cascade');
            $table->foreignId('to_uom_id')->constrained('uom_masters')->onDelete('cascade');
            $table->decimal('conversion_factor', 18, 6);
            $table->string('conversion_direction', 100); // Formula/description like "1 Box = 12 Pieces"
            $table->date('effective_date')->nullable();
            $table->boolean('is_item_specific')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['company_id']);
            $table->index(['from_uom_id']);
            $table->index(['to_uom_id']);
            $table->unique(['company_id', 'from_uom_id', 'to_uom_id', 'deleted_at'], 'uom_conversions_unique_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('uom_conversions');
    }
};

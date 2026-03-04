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
            $table->foreignId('item_id')->nullable()->constrained('inventory_items')->onDelete('cascade'); // Item Code (lookup)
            $table->decimal('conversion_factor', 18, 6);
            $table->string('conversion_direction', 50); // Unidirectional / Bidirectional
            $table->string('rounding_rule', 50)->default('None'); // None / Round Up / Round Down / Round Nearest
            $table->date('effective_from')->nullable();
            $table->date('effective_to')->nullable(); // Blank = no expiry
            $table->string('conversion_type', 50)->default('Standard'); // Standard / Item-Specific / Packaging
            $table->text('notes')->nullable();
            $table->boolean('is_item_specific')->default(false);
            $table->boolean('is_active')->default(true);
            
            // Audit trail
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
            
            $table->timestamps();
            $table->softDeletes();

            $table->index(['company_id']);
            $table->index(['from_uom_id']);
            $table->index(['to_uom_id']);
            $table->index(['item_id']);
            $table->unique(['company_id', 'from_uom_id', 'to_uom_id', 'item_id', 'deleted_at'], 'uom_conversions_unique_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('uom_conversions');
    }
};

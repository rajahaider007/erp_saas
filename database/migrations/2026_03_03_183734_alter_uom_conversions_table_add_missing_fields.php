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
        Schema::table('uom_conversions', function (Blueprint $table) {
            // First rename effective_date to effective_from if it exists
            if (Schema::hasColumn('uom_conversions', 'effective_date') && !Schema::hasColumn('uom_conversions', 'effective_from')) {
                $table->renameColumn('effective_date', 'effective_from');
            }
            
            // Add effective_to if it doesn't exist
            if (!Schema::hasColumn('uom_conversions', 'effective_to')) {
                $table->date('effective_to')->nullable()->after('effective_from');
            }
            
            // Add rounding_rule if it doesn't exist
            if (!Schema::hasColumn('uom_conversions', 'rounding_rule')) {
                $table->string('rounding_rule', 50)->default('None')->after('conversion_direction');
            }
            
            // Add conversion_type if it doesn't exist
            if (!Schema::hasColumn('uom_conversions', 'conversion_type')) {
                $table->string('conversion_type', 50)->default('Standard')->after('effective_to');
            }
            
            // Add notes if it doesn't exist
            if (!Schema::hasColumn('uom_conversions', 'notes')) {
                $table->text('notes')->nullable()->after('conversion_type');
            }
            
            // Add item_id if it doesn't exist
            if (!Schema::hasColumn('uom_conversions', 'item_id')) {
                $table->foreignId('item_id')->nullable()->after('to_uom_id')->constrained('inventory_items')->onDelete('cascade');
            }
            
            // Add audit trail columns
            if (!Schema::hasColumn('uom_conversions', 'created_by')) {
                $table->foreignId('created_by')->nullable()->after('notes')->constrained('users')->onDelete('set null');
            }
            if (!Schema::hasColumn('uom_conversions', 'updated_by')) {
                $table->foreignId('updated_by')->nullable()->after('created_by')->constrained('users')->onDelete('set null');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('uom_conversions', function (Blueprint $table) {
            if (Schema::hasColumn('uom_conversions', 'updated_by')) {
                $table->dropForeignIdFor('users', 'updated_by');
                $table->dropColumn('updated_by');
            }
            if (Schema::hasColumn('uom_conversions', 'created_by')) {
                $table->dropForeignIdFor('users', 'created_by');
                $table->dropColumn('created_by');
            }
            if (Schema::hasColumn('uom_conversions', 'item_id')) {
                $table->dropForeignIdFor('inventory_items', 'item_id');
                $table->dropColumn('item_id');
            }
            if (Schema::hasColumn('uom_conversions', 'notes')) {
                $table->dropColumn('notes');
            }
            if (Schema::hasColumn('uom_conversions', 'conversion_type')) {
                $table->dropColumn('conversion_type');
            }
            if (Schema::hasColumn('uom_conversions', 'effective_to')) {
                $table->dropColumn('effective_to');
            }
            if (Schema::hasColumn('uom_conversions', 'rounding_rule')) {
                $table->dropColumn('rounding_rule');
            }
            // Note: Renaming back to effective_date is handled separately if needed
        });
    }
};

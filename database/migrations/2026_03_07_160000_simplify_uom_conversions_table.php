<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('uom_conversions', function (Blueprint $table) {
            // Drop unique that includes item_id
            $table->dropUnique('uom_conversions_unique_active');
        });

        Schema::table('uom_conversions', function (Blueprint $table) {
            // Drop foreign keys first (names: uom_conversions_item_id_foreign, etc.)
            if (Schema::hasColumn('uom_conversions', 'item_id')) {
                $table->dropForeign(['item_id']);
            }
            if (Schema::hasColumn('uom_conversions', 'created_by')) {
                $table->dropForeign(['created_by']);
            }
            if (Schema::hasColumn('uom_conversions', 'updated_by')) {
                $table->dropForeign(['updated_by']);
            }
        });

        Schema::table('uom_conversions', function (Blueprint $table) {
            $columnsToDrop = [];
            if (Schema::hasColumn('uom_conversions', 'item_id')) {
                $columnsToDrop[] = 'item_id';
            }
            foreach (['rounding_rule', 'effective_from', 'effective_to', 'conversion_type', 'notes', 'is_item_specific', 'created_by', 'updated_by'] as $col) {
                if (Schema::hasColumn('uom_conversions', $col)) {
                    $columnsToDrop[] = $col;
                }
            }
            if (!empty($columnsToDrop)) {
                $table->dropColumn($columnsToDrop);
            }
        });

        Schema::table('uom_conversions', function (Blueprint $table) {
            // New unique: one active conversion per (company, from_uom, to_uom); deleted_at in key for soft deletes
            $table->unique(
                ['company_id', 'from_uom_id', 'to_uom_id', 'deleted_at'],
                'uom_conversions_company_from_to_deleted_unique'
            );
        });
    }

    public function down(): void
    {
        Schema::table('uom_conversions', function (Blueprint $table) {
            $table->dropUnique('uom_conversions_company_from_to_deleted_unique');
        });

        Schema::table('uom_conversions', function (Blueprint $table) {
            $table->foreignId('item_id')->nullable()->after('to_uom_id')->constrained('inventory_items')->onDelete('cascade');
            $table->string('rounding_rule', 50)->default('None')->after('conversion_direction');
            $table->date('effective_from')->nullable()->after('rounding_rule');
            $table->date('effective_to')->nullable()->after('effective_from');
            $table->string('conversion_type', 50)->default('Standard')->after('effective_to');
            $table->text('notes')->nullable()->after('conversion_type');
            $table->boolean('is_item_specific')->default(false)->after('notes');
            $table->foreignId('created_by')->nullable()->after('is_item_specific')->constrained('users')->onDelete('set null');
            $table->foreignId('updated_by')->nullable()->after('created_by')->constrained('users')->onDelete('set null');
        });

        Schema::table('uom_conversions', function (Blueprint $table) {
            $table->unique(
                ['company_id', 'from_uom_id', 'to_uom_id', 'item_id', 'deleted_at'],
                'uom_conversions_unique_active'
            );
        });
    }
};

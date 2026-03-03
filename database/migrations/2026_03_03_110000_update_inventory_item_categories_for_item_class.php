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
        Schema::table('inventory_item_categories', function (Blueprint $table) {
            if (Schema::hasColumn('inventory_item_categories', 'inventory_type')) {
                $table->dropColumn('inventory_type');
            }

            if (Schema::hasColumn('inventory_item_categories', 'valuation_method')) {
                $table->dropColumn('valuation_method');
            }

            if (!Schema::hasColumn('inventory_item_categories', 'item_class_id')) {
                $table->unsignedBigInteger('item_class_id')->nullable()->after('category_name')->index();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('inventory_item_categories', function (Blueprint $table) {
            if (!Schema::hasColumn('inventory_item_categories', 'inventory_type')) {
                $table->string('inventory_type', 50)->default('trading_goods')->after('category_name');
            }

            if (!Schema::hasColumn('inventory_item_categories', 'valuation_method')) {
                $table->string('valuation_method', 30)->default('weighted_average')->after('inventory_type');
            }

            if (Schema::hasColumn('inventory_item_categories', 'item_class_id')) {
                $table->dropColumn('item_class_id');
            }
        });
    }
};

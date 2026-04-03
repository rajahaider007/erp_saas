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
        $columns = array_values(array_filter([
            Schema::hasColumn('inventory_item_classes', 'tracking_type') ? 'tracking_type' : null,
            Schema::hasColumn('inventory_item_classes', 'abc_classification') ? 'abc_classification' : null,
        ]));

        if ($columns === []) {
            return;
        }

        Schema::table('inventory_item_classes', function (Blueprint $table) use ($columns) {
            $table->dropColumn($columns);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('inventory_item_classes', function (Blueprint $table) {
            if (! Schema::hasColumn('inventory_item_classes', 'tracking_type')) {
                $table->string('tracking_type', 20)->default('none')->after('class_name');
            }
            if (! Schema::hasColumn('inventory_item_classes', 'abc_classification')) {
                $after = Schema::hasColumn('inventory_item_classes', 'tracking_type')
                    ? 'tracking_type'
                    : 'class_name';
                $table->string('abc_classification', 1)->default('C')->after($after);
            }
        });
    }
};

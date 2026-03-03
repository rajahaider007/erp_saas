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
        Schema::table('inventory_item_classes', function (Blueprint $table) {
            $table->dropColumn(['tracking_type', 'abc_classification']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('inventory_item_classes', function (Blueprint $table) {
            $table->string('tracking_type', 20)->default('none')->after('class_name');
            $table->string('abc_classification', 1)->default('C')->after('tracking_type');
        });
    }
};

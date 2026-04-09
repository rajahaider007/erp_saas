<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('inventory_items', 'hs_tariff_code')) {
            Schema::table('inventory_items', function (Blueprint $table) {
                $table->string('hs_tariff_code', 20)->nullable()->change();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('inventory_items', 'hs_tariff_code')) {
            Schema::table('inventory_items', function (Blueprint $table) {
                $table->string('hs_tariff_code', 10)->nullable()->change();
            });
        }
    }
};

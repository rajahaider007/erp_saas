<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('inventory_items', function (Blueprint $table) {
            if (! Schema::hasColumn('inventory_items', 'barcode_type_id')) {
                $table->foreignId('barcode_type_id')
                    ->nullable()
                    ->after('country_of_origin_id')
                    ->constrained('inventory_barcode_types')
                    ->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('inventory_items', function (Blueprint $table) {
            if (Schema::hasColumn('inventory_items', 'barcode_type_id')) {
                $table->dropConstrainedForeignId('barcode_type_id');
            }
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('menus')) {
            return;
        }

        DB::table('menus')
            ->where('route', '/inventory/goods-receipt-note/create')
            ->update([
                'route' => '/inventory/goods-receipt-note',
                'updated_at' => now(),
            ]);
    }

    public function down(): void
    {
        if (! Schema::hasTable('menus')) {
            return;
        }

        DB::table('menus')
            ->where('route', '/inventory/goods-receipt-note')
            ->update([
                'route' => '/inventory/goods-receipt-note/create',
                'updated_at' => now(),
            ]);
    }
};

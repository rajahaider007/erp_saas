<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Point Purchase Requisition menu to the list route (list links to create).
     */
    public function up(): void
    {
        if (! Schema::hasTable('menus')) {
            return;
        }

        DB::table('menus')
            ->where('route', '/inventory/purchase-requisition/create')
            ->update([
                'route' => '/inventory/purchase-requisition',
                'updated_at' => now(),
            ]);
    }

    public function down(): void
    {
        if (! Schema::hasTable('menus')) {
            return;
        }

        DB::table('menus')
            ->where('route', '/inventory/purchase-requisition')
            ->where('menu_name', 'Purchase Requisition')
            ->update([
                'route' => '/inventory/purchase-requisition/create',
                'updated_at' => now(),
            ]);
    }
};

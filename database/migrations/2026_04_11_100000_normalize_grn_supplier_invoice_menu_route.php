<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Sidebar and permissions use menus.route; opening "Supplier invoice (GRN)" should land on the list (index), not create.
     */
    public function up(): void
    {
        if (! Schema::hasTable('menus')) {
            return;
        }

        DB::table('menus')
            ->where('route', '/inventory/grn-supplier-invoice/create')
            ->whereNull('deleted_at')
            ->update([
                'route' => '/inventory/grn-supplier-invoice',
                'updated_at' => now(),
            ]);
    }

    public function down(): void
    {
        // Non-destructive: we cannot know which menus intentionally pointed at create
    }
};

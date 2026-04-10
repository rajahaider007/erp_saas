<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Stock position (GRN receipts) under Inventory → Reports + user_rights for active users.
     */
    public function up(): void
    {
        if (! Schema::hasTable('modules') || ! Schema::hasTable('sections') || ! Schema::hasTable('menus')) {
            return;
        }

        $inventory = DB::table('modules')->where('folder_name', 'inventory')->first();
        if (! $inventory) {
            return;
        }

        $section = DB::table('sections')
            ->where('module_id', $inventory->id)
            ->where('section_name', 'Reports')
            ->whereNull('deleted_at')
            ->first();

        if (! $section) {
            return;
        }

        $route = '/inventory/reports/stock-position';
        $existing = DB::table('menus')
            ->where('module_id', $inventory->id)
            ->where('route', $route)
            ->first();

        if ($existing) {
            DB::table('menus')->where('id', $existing->id)->update([
                'section_id' => $section->id,
                'menu_name' => 'Stock Position (GRN)',
                'icon' => 'boxes',
                'status' => 1,
                'sort_order' => 4,
                'updated_at' => now(),
            ]);
            $menuId = (int) $existing->id;
        } else {
            $menuId = (int) DB::table('menus')->insertGetId([
                'module_id' => $inventory->id,
                'section_id' => $section->id,
                'menu_name' => 'Stock Position (GRN)',
                'route' => $route,
                'icon' => 'boxes',
                'status' => 1,
                'sort_order' => 4,
                'created_at' => now(),
                'updated_at' => now(),
                'deleted_at' => null,
            ]);
        }

        if (! Schema::hasTable('user_rights') || ! Schema::hasTable('tbl_users')) {
            return;
        }

        $userIds = DB::table('tbl_users')
            ->where('status', 'active')
            ->where('role', '!=', 'super_admin')
            ->pluck('id');

        foreach ($userIds as $userId) {
            if (DB::table('user_rights')->where('user_id', $userId)->where('menu_id', $menuId)->exists()) {
                continue;
            }
            DB::table('user_rights')->insert([
                'user_id' => $userId,
                'menu_id' => $menuId,
                'can_view' => 1,
                'can_add' => 1,
                'can_edit' => 1,
                'can_delete' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        if (! Schema::hasTable('modules') || ! Schema::hasTable('menus')) {
            return;
        }

        $inventory = DB::table('modules')->where('folder_name', 'inventory')->first();
        if (! $inventory) {
            return;
        }

        $menu = DB::table('menus')
            ->where('module_id', $inventory->id)
            ->where('route', '/inventory/reports/stock-position')
            ->first();

        if ($menu && Schema::hasTable('user_rights')) {
            DB::table('user_rights')->where('menu_id', $menu->id)->delete();
        }
        if ($menu) {
            DB::table('menus')->where('id', $menu->id)->delete();
        }
    }
};

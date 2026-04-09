<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
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
            ->where('section_name', 'Purchases')
            ->first();

        if (! $section) {
            return;
        }

        $route = '/inventory/goods-receipt-note/create';

        if (DB::table('menus')
            ->where('module_id', $inventory->id)
            ->where('route', $route)
            ->exists()) {
            return;
        }

        $maxSort = (int) DB::table('menus')
            ->where('section_id', $section->id)
            ->max('sort_order');

        $menuId = DB::table('menus')->insertGetId([
            'module_id' => $inventory->id,
            'section_id' => $section->id,
            'menu_name' => 'Goods Receipt Note',
            'route' => $route,
            'icon' => 'truck',
            'status' => 1,
            'sort_order' => $maxSort + 1,
            'created_at' => now(),
            'updated_at' => now(),
            'deleted_at' => null,
        ]);

        if (Schema::hasTable('user_rights') && Schema::hasTable('tbl_users')) {
            $userIds = DB::table('tbl_users')
                ->where('status', 'active')
                ->where('role', '!=', 'super_admin')
                ->pluck('id');

            foreach ($userIds as $userId) {
                if (
                    DB::table('user_rights')
                        ->where('user_id', $userId)
                        ->where('menu_id', $menuId)
                        ->exists()
                ) {
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

        DB::table('menus')
            ->where('module_id', $inventory->id)
            ->where('route', '/inventory/goods-receipt-note/create')
            ->delete();
    }
};

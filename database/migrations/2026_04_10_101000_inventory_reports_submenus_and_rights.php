<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add per-report menus under Inventory → Reports and grant user_rights (same users as other inventory menus).
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
            $maxSectionOrder = (int) DB::table('sections')
                ->where('module_id', $inventory->id)
                ->max('sort_order');

            $sectionId = DB::table('sections')->insertGetId([
                'module_id' => $inventory->id,
                'section_name' => 'Reports',
                'slug' => 'inventory-reports',
                'status' => 1,
                'sort_order' => $maxSectionOrder + 1,
                'created_at' => now(),
                'updated_at' => now(),
                'deleted_at' => null,
            ]);
        } else {
            $sectionId = $section->id;
        }

        $definitions = [
            [
                'route' => '/inventory/reports',
                'menu_name' => 'Inventory Reports',
                'icon' => 'file-chart-column-increasing',
                'sort_order' => 1,
            ],
            [
                'route' => '/inventory/reports/goods-receipt-register',
                'menu_name' => 'Goods Receipt Register',
                'icon' => 'clipboard-list',
                'sort_order' => 2,
            ],
            [
                'route' => '/inventory/reports/purchase-order-lines',
                'menu_name' => 'Purchase Order Lines Report',
                'icon' => 'file-spreadsheet',
                'sort_order' => 3,
            ],
        ];

        $menuIds = [];

        foreach ($definitions as $def) {
            $row = DB::table('menus')
                ->where('module_id', $inventory->id)
                ->where('route', $def['route'])
                ->first();

            if ($row) {
                DB::table('menus')
                    ->where('id', $row->id)
                    ->update([
                        'section_id' => $sectionId,
                        'menu_name' => $def['menu_name'],
                        'icon' => $def['icon'],
                        'sort_order' => $def['sort_order'],
                        'status' => 1,
                        'updated_at' => now(),
                    ]);
                $menuIds[] = (int) $row->id;
            } else {
                $menuIds[] = (int) DB::table('menus')->insertGetId([
                    'module_id' => $inventory->id,
                    'section_id' => $sectionId,
                    'menu_name' => $def['menu_name'],
                    'route' => $def['route'],
                    'icon' => $def['icon'],
                    'status' => 1,
                    'sort_order' => $def['sort_order'],
                    'created_at' => now(),
                    'updated_at' => now(),
                    'deleted_at' => null,
                ]);
            }
        }

        if (! Schema::hasTable('user_rights') || ! Schema::hasTable('tbl_users')) {
            return;
        }

        $userIds = DB::table('tbl_users')
            ->where('status', 'active')
            ->where('role', '!=', 'super_admin')
            ->pluck('id');

        foreach ($menuIds as $menuId) {
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

        $routes = [
            '/inventory/reports/purchase-order-lines',
            '/inventory/reports/goods-receipt-register',
        ];

        foreach ($routes as $route) {
            $menu = DB::table('menus')
                ->where('module_id', $inventory->id)
                ->where('route', $route)
                ->first();

            if ($menu && Schema::hasTable('user_rights')) {
                DB::table('user_rights')->where('menu_id', $menu->id)->delete();
            }
            if ($menu) {
                DB::table('menus')->where('id', $menu->id)->delete();
            }
        }
    }
};

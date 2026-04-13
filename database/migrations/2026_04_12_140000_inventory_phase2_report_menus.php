<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Phase 2 inventory reports (A3, A4, B1, B2) under Inventory → Reports + user_rights for active users.
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

        $menus = [
            ['name' => 'GRN vs PO variance', 'route' => '/inventory/reports/grn-po-variance', 'icon' => 'git-compare', 'sort' => 5],
            ['name' => 'GRN supplier invoices', 'route' => '/inventory/reports/grn-supplier-invoice-listing', 'icon' => 'file-text', 'sort' => 6],
            ['name' => 'PR lines register', 'route' => '/inventory/reports/purchase-requisition-lines', 'icon' => 'list', 'sort' => 7],
            ['name' => 'PR → PO conversion', 'route' => '/inventory/reports/pr-to-po-conversion', 'icon' => 'arrow-right-left', 'sort' => 8],
        ];

        $menuIds = [];
        foreach ($menus as $m) {
            $existing = DB::table('menus')
                ->where('module_id', $inventory->id)
                ->where('route', $m['route'])
                ->first();

            if ($existing) {
                DB::table('menus')->where('id', $existing->id)->update([
                    'section_id' => $section->id,
                    'menu_name' => $m['name'],
                    'icon' => $m['icon'],
                    'status' => 1,
                    'sort_order' => $m['sort'],
                    'updated_at' => now(),
                ]);
                $menuIds[] = (int) $existing->id;
            } else {
                $menuIds[] = (int) DB::table('menus')->insertGetId([
                    'module_id' => $inventory->id,
                    'section_id' => $section->id,
                    'menu_name' => $m['name'],
                    'route' => $m['route'],
                    'icon' => $m['icon'],
                    'status' => 1,
                    'sort_order' => $m['sort'],
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
            '/inventory/reports/grn-po-variance',
            '/inventory/reports/grn-supplier-invoice-listing',
            '/inventory/reports/purchase-requisition-lines',
            '/inventory/reports/pr-to-po-conversion',
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

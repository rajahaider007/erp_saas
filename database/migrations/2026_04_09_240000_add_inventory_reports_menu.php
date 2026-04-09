<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Inventory reporting hub (IAS 2 / audit-style registers). Menu points to /inventory/reports.
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

        $route = '/inventory/reports';

        $exists = DB::table('menus')
            ->where('module_id', $inventory->id)
            ->where('route', $route)
            ->exists();

        if ($exists) {
            $existingMenu = DB::table('menus')
                ->where('module_id', $inventory->id)
                ->where('route', $route)
                ->first();

            if ($existingMenu) {
                DB::table('menus')
                    ->where('id', $existingMenu->id)
                    ->update([
                        'section_id' => $sectionId,
                        'updated_at' => now(),
                    ]);
                $this->grantReportsUserRights((int) $existingMenu->id);
            }

            return;
        }

        $maxSort = (int) DB::table('menus')
            ->where('section_id', $sectionId)
            ->max('sort_order');

        $menuId = DB::table('menus')->insertGetId([
            'module_id' => $inventory->id,
            'section_id' => $sectionId,
            'menu_name' => 'Inventory Reports',
            'route' => $route,
            'icon' => 'file-chart-column-increasing',
            'status' => 1,
            'sort_order' => $maxSort + 1,
            'created_at' => now(),
            'updated_at' => now(),
            'deleted_at' => null,
        ]);

        $this->grantReportsUserRights($menuId);
    }

    private function grantReportsUserRights(int $menuId): void
    {
        if (! Schema::hasTable('user_rights') || ! Schema::hasTable('tbl_users')) {
            return;
        }

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
            ->where('route', '/inventory/reports')
            ->first();

        if ($menu && Schema::hasTable('user_rights')) {
            DB::table('user_rights')->where('menu_id', $menu->id)->delete();
        }

        if ($menu) {
            DB::table('menus')->where('id', $menu->id)->delete();
        }
    }
};

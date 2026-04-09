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

        $grnMenu = DB::table('menus')
            ->where('module_id', $inventory->id)
            ->where('route', '/inventory/goods-receipt-note')
            ->whereNull('deleted_at')
            ->first();

        if (! $grnMenu) {
            return;
        }

        $supplierRoute = '/inventory/grn-supplier-invoice';
        $supplierMenuRow = DB::table('menus')
            ->where('module_id', $inventory->id)
            ->where('route', $supplierRoute)
            ->whereNull('deleted_at')
            ->first();

        if (! $supplierMenuRow) {
            $maxSort = (int) DB::table('menus')
                ->where('section_id', $section->id)
                ->max('sort_order');

            $supplierMenuId = DB::table('menus')->insertGetId([
                'module_id' => $inventory->id,
                'section_id' => $section->id,
                'menu_name' => 'Supplier invoice (GRN)',
                'route' => $supplierRoute,
                'icon' => 'receipt',
                'status' => 1,
                'sort_order' => $maxSort + 1,
                'created_at' => now(),
                'updated_at' => now(),
                'deleted_at' => null,
            ]);
        } else {
            $supplierMenuId = (int) $supplierMenuRow->id;
        }

        if (! Schema::hasTable('user_rights') || ! Schema::hasTable('tbl_users')) {
            return;
        }

        $grnMenuId = (int) $grnMenu->id;

        $userIds = DB::table('tbl_users')
            ->where('status', 'active')
            ->where('role', '!=', 'super_admin')
            ->pluck('id');

        foreach ($userIds as $userId) {
            if (
                ! DB::table('user_rights')
                    ->where('user_id', $userId)
                    ->where('menu_id', $grnMenuId)
                    ->exists()
            ) {
                DB::table('user_rights')->insert([
                    'user_id' => $userId,
                    'menu_id' => $grnMenuId,
                    'can_view' => 1,
                    'can_add' => 1,
                    'can_edit' => 1,
                    'can_delete' => 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            $grnRight = DB::table('user_rights')
                ->where('user_id', $userId)
                ->where('menu_id', $grnMenuId)
                ->first();

            if (! $grnRight) {
                continue;
            }

            if (
                DB::table('user_rights')
                    ->where('user_id', $userId)
                    ->where('menu_id', $supplierMenuId)
                    ->exists()
            ) {
                continue;
            }

            DB::table('user_rights')->insert([
                'user_id' => $userId,
                'menu_id' => $supplierMenuId,
                'can_view' => (int) $grnRight->can_view,
                'can_add' => (int) $grnRight->can_add,
                'can_edit' => (int) $grnRight->can_edit,
                'can_delete' => (int) $grnRight->can_delete,
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

        $supplier = DB::table('menus')
            ->where('module_id', $inventory->id)
            ->where('route', '/inventory/grn-supplier-invoice')
            ->first();

        if ($supplier && Schema::hasTable('user_rights')) {
            DB::table('user_rights')->where('menu_id', $supplier->id)->delete();
        }

        if ($supplier) {
            DB::table('menus')->where('id', $supplier->id)->update([
                'deleted_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Get Accounts module ID
        $accountsModuleId = DB::table('modules')->where('folder_name', 'accounts')->value('id');
        
        if (!$accountsModuleId) {
            throw new \Exception('Accounts module not found');
        }

        // Get or create Accounting section for Accounts module
        $sectionId = DB::table('sections')
            ->where('module_id', $accountsModuleId)
            ->where('section_name', 'Accounting')
            ->value('id');

        if (!$sectionId) {
            $sectionId = DB::table('sections')->insertGetId([
                'module_id' => $accountsModuleId,
                'section_name' => 'Accounting',
                'slug' => 'accounting',
                'status' => true,
                'sort_order' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Check if Journal Voucher menu already exists
        $existingMenu = DB::table('menus')
            ->where('module_id', $accountsModuleId)
            ->where('section_id', $sectionId)
            ->where('menu_name', 'Journal Voucher')
            ->first();

        if (!$existingMenu) {
            // Get the next sort order
            $nextSortOrder = DB::table('menus')
                ->where('module_id', $accountsModuleId)
                ->where('section_id', $sectionId)
                ->max('sort_order') + 1;

            // Insert Journal Voucher menu
            DB::table('menus')->insert([
                'module_id' => $accountsModuleId,
                'section_id' => $sectionId,
                'menu_name' => 'Journal Voucher',
                'route' => '/accounts/journal-voucher',
                'icon' => 'file-text',
                'status' => true,
                'sort_order' => $nextSortOrder,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Also add other accounting menus if they don't exist
        $accountingMenus = [
            [
                'menu_name' => 'Chart of Accounts',
                'route' => '/accounts/chart-of-accounts',
                'icon' => 'layers',
                'sort_order' => $nextSortOrder + 1,
            ],
            [
                'menu_name' => 'Voucher Number Configuration',
                'route' => '/accounts/voucher-number-configuration',
                'icon' => 'settings',
                'sort_order' => $nextSortOrder + 2,
            ],
        ];

        foreach ($accountingMenus as $menu) {
            $existingMenu = DB::table('menus')
                ->where('module_id', $accountsModuleId)
                ->where('section_id', $sectionId)
                ->where('menu_name', $menu['menu_name'])
                ->first();

            if (!$existingMenu) {
                DB::table('menus')->insert([
                    'module_id' => $accountsModuleId,
                    'section_id' => $sectionId,
                    'menu_name' => $menu['menu_name'],
                    'route' => $menu['route'],
                    'icon' => $menu['icon'],
                    'status' => true,
                    'sort_order' => $menu['sort_order'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Get Accounts module ID
        $accountsModuleId = DB::table('modules')->where('folder_name', 'accounts')->value('id');
        
        if (!$accountsModuleId) {
            return;
        }

        // Get Accounting section ID
        $sectionId = DB::table('sections')
            ->where('module_id', $accountsModuleId)
            ->where('section_name', 'Accounting')
            ->value('id');

        if ($sectionId) {
            // Remove Journal Voucher menu
            DB::table('menus')
                ->where('module_id', $accountsModuleId)
                ->where('section_id', $sectionId)
                ->where('menu_name', 'Journal Voucher')
                ->delete();
        }
    }
};
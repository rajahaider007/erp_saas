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
        $now = now();

        // Get Accounts module
        $module = DB::table('modules')->where('folder_name', 'accounts')->first();
        if (!$module) {
            return; // Module doesn't exist, skip
        }

        $moduleId = $module->id;

        // Get Configuration section (or create it if needed)
        $configSection = DB::table('sections')
            ->where('module_id', $moduleId)
            ->where('section_name', 'Configuration')
            ->first();

        if (!$configSection) {
            $configSectionId = DB::table('sections')->insertGetId([
                'module_id' => $moduleId,
                'section_name' => 'Configuration',
                'slug' => 'configuration',
                'status' => 1,
                'sort_order' => 0,
                'created_at' => $now,
                'updated_at' => $now,
                'deleted_at' => null,
            ]);
        } else {
            $configSectionId = $configSection->id;
        }

        // Get Reports section
        $reportsSection = DB::table('sections')
            ->where('module_id', $moduleId)
            ->where('section_name', 'Reports')
            ->first();

        if (!$reportsSection) {
            $reportsSectionId = DB::table('sections')->insertGetId([
                'module_id' => $moduleId,
                'section_name' => 'Reports',
                'slug' => 'reports',
                'status' => 1,
                'sort_order' => 1,
                'created_at' => $now,
                'updated_at' => $now,
                'deleted_at' => null,
            ]);
        } else {
            $reportsSectionId = $reportsSection->id;
        }

        // Add Fiscal Year Configuration menu (if not exists)
        $fiscalYearMenu = DB::table('menus')
            ->where('module_id', $moduleId)
            ->where('menu_name', 'Fiscal Year Configuration')
            ->first();

        if (!$fiscalYearMenu) {
            DB::table('menus')->insert([
                'module_id' => $moduleId,
                'section_id' => $configSectionId,
                'menu_name' => 'Fiscal Year Configuration',
                'route' => '/accounts/fiscal-year-configuration',
                'icon' => 'calendar',
                'status' => 1,
                'sort_order' => 1,
                'created_at' => $now,
                'updated_at' => $now,
                'deleted_at' => null,
            ]);
        }

        // Add Income Statement menu (if not exists)
        $incomeStatementMenu = DB::table('menus')
            ->where('module_id', $moduleId)
            ->where('menu_name', 'Income Statement')
            ->first();

        if (!$incomeStatementMenu) {
            DB::table('menus')->insert([
                'module_id' => $moduleId,
                'section_id' => $reportsSectionId,
                'menu_name' => 'Income Statement',
                'route' => '/accounts/income-statement',
                'icon' => 'trending-up',
                'status' => 1,
                'sort_order' => 4,
                'created_at' => $now,
                'updated_at' => $now,
                'deleted_at' => null,
            ]);
        }

        // Update Balance Sheet menu if it exists but route is wrong
        $balanceSheetMenu = DB::table('menus')
            ->where('module_id', $moduleId)
            ->where('menu_name', 'Balance Sheet')
            ->first();

        if ($balanceSheetMenu && $balanceSheetMenu->route === '/reports/balance-sheet') {
            DB::table('menus')
                ->where('id', $balanceSheetMenu->id)
                ->update([
                    'route' => '/accounts/balance-sheet',
                    'updated_at' => $now,
                ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('menus')
            ->where('menu_name', 'Fiscal Year Configuration')
            ->orWhere('menu_name', 'Income Statement')
            ->delete();
    }
};

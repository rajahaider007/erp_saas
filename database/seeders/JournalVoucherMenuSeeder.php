<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class JournalVoucherMenuSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get Accounts module ID
        $accountsModuleId = DB::table('modules')->where('folder_name', 'accounts')->value('id');
        
        if (!$accountsModuleId) {
            $this->command->error('Accounts module not found');
            return;
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
            
            $this->command->info('Created Accounting section for Accounts module');
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
            
            $this->command->info('Journal Voucher menu added successfully');
        } else {
            $this->command->info('Journal Voucher menu already exists');
        }

        // Display all Accounts module menus
        $menus = DB::table('menus')
            ->join('sections', 'menus.section_id', '=', 'sections.id')
            ->where('menus.module_id', $accountsModuleId)
            ->select('menus.menu_name', 'menus.route', 'sections.section_name')
            ->orderBy('menus.sort_order')
            ->get();

        $this->command->info('Accounts Module Menus:');
        foreach ($menus as $menu) {
            $this->command->line("  - {$menu->menu_name} ({$menu->section_name}) - {$menu->route}");
        }
    }
}

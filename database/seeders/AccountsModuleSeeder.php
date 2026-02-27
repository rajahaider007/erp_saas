<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AccountsModuleSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        // First, check if Accounts module exists, if not create it
        $accountsModule = DB::table('modules')->where('folder_name', 'accounts')->first();
        
        if (!$accountsModule) {
            // Create Accounts module
            $moduleId = DB::table('modules')->insertGetId([
                'module_name' => 'Accounts',
                'folder_name' => 'accounts',
                'slug' => Str::slug('Accounts'),
                'image' => null,
                'status' => 1,
                'sort_order' => 2,
                'created_at' => $now,
                'updated_at' => $now,
                'deleted_at' => null,
            ]);
        } else {
            $moduleId = $accountsModule->id;
        }

        // Check if Reports section exists, if not create it
        $reportsSection = DB::table('sections')
            ->where('module_id', $moduleId)
            ->where('section_name', 'Reports')
            ->first();
        
        if (!$reportsSection) {
            $reportsSectionId = DB::table('sections')->insertGetId([
                'module_id' => $moduleId,
                'section_name' => 'Reports',
                'slug' => Str::slug('Reports'),
                'status' => 1,
                'sort_order' => 1,
                'created_at' => $now,
                'updated_at' => $now,
                'deleted_at' => null,
            ]);
        } else {
            $reportsSectionId = $reportsSection->id;
        }

        // Create Reports menus for Accounts module
        $reportsMenus = [
            [
                'module_id' => $moduleId,
                'section_id' => $reportsSectionId,
                'menu_name' => 'General Ledger',
                'route' => '/reports/general-ledger',
                'icon' => 'file-text',
                'status' => 1,
                'sort_order' => 1,
                'created_at' => $now,
                'updated_at' => $now,
                'deleted_at' => null,
            ],
            [
                'module_id' => $moduleId,
                'section_id' => $reportsSectionId,
                'menu_name' => 'Trial Balance',
                'route' => '/reports/trial-balance',
                'icon' => 'bar-chart-3',
                'status' => 1,
                'sort_order' => 2,
                'created_at' => $now,
                'updated_at' => $now,
                'deleted_at' => null,
            ],
            [
                'module_id' => $moduleId,
                'section_id' => $reportsSectionId,
                'menu_name' => 'Balance Sheet',
                'route' => '/reports/balance-sheet',
                'icon' => 'pie-chart',
                'status' => 1,
                'sort_order' => 3,
                'created_at' => $now,
                'updated_at' => $now,
                'deleted_at' => null,
            ],
            [
                'module_id' => $moduleId,
                'section_id' => $reportsSectionId,
                'menu_name' => 'Profit & Loss',
                'route' => '/reports/profit-loss',
                'icon' => 'trending-up',
                'status' => 1,
                'sort_order' => 4,
                'created_at' => $now,
                'updated_at' => $now,
                'deleted_at' => null,
            ],
            [
                'module_id' => $moduleId,
                'section_id' => $reportsSectionId,
                'menu_name' => 'Cash Flow',
                'route' => '/reports/cash-flow',
                'icon' => 'dollar-sign',
                'status' => 1,
                'sort_order' => 5,
                'created_at' => $now,
                'updated_at' => $now,
                'deleted_at' => null,
            ],
            [
                'module_id' => $moduleId,
                'section_id' => $reportsSectionId,
                'menu_name' => 'Aged Receivables',
                'route' => '/reports/aged-receivables',
                'icon' => 'users',
                'status' => 1,
                'sort_order' => 6,
                'created_at' => $now,
                'updated_at' => $now,
                'deleted_at' => null,
            ],
            [
                'module_id' => $moduleId,
                'section_id' => $reportsSectionId,
                'menu_name' => 'Aged Payables',
                'route' => '/reports/aged-payables',
                'icon' => 'credit-card',
                'status' => 1,
                'sort_order' => 7,
                'created_at' => $now,
                'updated_at' => $now,
                'deleted_at' => null,
            ],
            [
                'module_id' => $moduleId,
                'section_id' => $reportsSectionId,
                'menu_name' => 'Journal Entries',
                'route' => '/reports/journal-entries',
                'icon' => 'file-text',
                'status' => 1,
                'sort_order' => 8,
                'created_at' => $now,
                'updated_at' => $now,
                'deleted_at' => null,
            ],
            [
                'module_id' => $moduleId,
                'section_id' => $reportsSectionId,
                'menu_name' => 'Account Summary',
                'route' => '/reports/account-summary',
                'icon' => 'bar-chart-2',
                'status' => 1,
                'sort_order' => 9,
                'created_at' => $now,
                'updated_at' => $now,
                'deleted_at' => null,
            ],
            [
                'module_id' => $moduleId,
                'section_id' => $reportsSectionId,
                'menu_name' => 'Multi-Currency Report',
                'route' => '/reports/multi-currency',
                'icon' => 'globe',
                'status' => 1,
                'sort_order' => 10,
                'created_at' => $now,
                'updated_at' => $now,
                'deleted_at' => null,
            ]
        ];

        // Insert reports menus if they don't exist
        foreach ($reportsMenus as $menu) {
            $exists = DB::table('menus')
                ->where('module_id', $menu['module_id'])
                ->where('menu_name', $menu['menu_name'])
                ->where('route', $menu['route'])
                ->exists();
            
            if (!$exists) {
                DB::table('menus')->insert($menu);
            }
        }

        // Also create other sections for Accounts module if they don't exist
        $this->createAccountsSections($moduleId, $now);
    }

    private function createAccountsSections($moduleId, $now)
    {
        // Check if Chart of Accounts section exists, if not create it
        $chartSection = DB::table('sections')
            ->where('module_id', $moduleId)
            ->where('section_name', 'Chart of Accounts')
            ->first();
        
        if (!$chartSection) {
            $chartSectionId = DB::table('sections')->insertGetId([
                'module_id' => $moduleId,
                'section_name' => 'Chart of Accounts',
                'slug' => Str::slug('Chart of Accounts'),
                'status' => 1,
                'sort_order' => 2,
                'created_at' => $now,
                'updated_at' => $now,
                'deleted_at' => null,
            ]);
        } else {
            $chartSectionId = $chartSection->id;
        }

        // Check if Journal Entries section exists, if not create it
        $journalSection = DB::table('sections')
            ->where('module_id', $moduleId)
            ->where('section_name', 'Journal Entries')
            ->first();
        
        if (!$journalSection) {
            $journalSectionId = DB::table('sections')->insertGetId([
                'module_id' => $moduleId,
                'section_name' => 'Journal Entries',
                'slug' => Str::slug('Journal Entries'),
                'status' => 1,
                'sort_order' => 3,
                'created_at' => $now,
                'updated_at' => $now,
                'deleted_at' => null,
            ]);
        } else {
            $journalSectionId = $journalSection->id;
        }

        // Create Chart of Accounts menus (check for existing first)
        $chartMenus = [
            [
                'module_id' => $moduleId,
                'section_id' => $chartSectionId,
                'menu_name' => 'Accounts List',
                'route' => '/accounts/chart-of-accounts',
                'icon' => 'list',
                'status' => 1,
                'sort_order' => 1,
                'created_at' => $now,
                'updated_at' => $now,
                'deleted_at' => null,
            ],
            [
                'module_id' => $moduleId,
                'section_id' => $chartSectionId,
                'menu_name' => 'Add Account',
                'route' => '/accounts/chart-of-accounts/create',
                'icon' => 'plus',
                'status' => 1,
                'sort_order' => 2,
                'created_at' => $now,
                'updated_at' => $now,
                'deleted_at' => null,
            ]
        ];

        // Insert chart menus if they don't exist
        foreach ($chartMenus as $menu) {
            $exists = DB::table('menus')
                ->where('module_id', $menu['module_id'])
                ->where('menu_name', $menu['menu_name'])
                ->where('route', $menu['route'])
                ->exists();
            
            if (!$exists) {
                DB::table('menus')->insert($menu);
            }
        }

        // Create Journal Entries menus
        $journalMenus = [
            [
                'module_id' => $moduleId,
                'section_id' => $journalSectionId,
                'menu_name' => 'Journal Vouchers',
                'route' => '/accounts/journal-voucher',
                'icon' => 'file-text',
                'status' => 1,
                'sort_order' => 1,
                'created_at' => $now,
                'updated_at' => $now,
                'deleted_at' => null,
            ],
            [
                'module_id' => $moduleId,
                'section_id' => $journalSectionId,
                'menu_name' => 'Create Voucher',
                'route' => '/accounts/journal-voucher/create',
                'icon' => 'plus',
                'status' => 1,
                'sort_order' => 2,
                'created_at' => $now,
                'updated_at' => $now,
                'deleted_at' => null,
            ]
        ];

        // Insert journal menus if they don't exist
        foreach ($journalMenus as $menu) {
            $exists = DB::table('menus')
                ->where('module_id', $menu['module_id'])
                ->where('menu_name', $menu['menu_name'])
                ->where('route', $menu['route'])
                ->exists();
            
            if (!$exists) {
                DB::table('menus')->insert($menu);
            }
        }
    }
}

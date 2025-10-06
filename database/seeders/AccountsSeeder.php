<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class AccountsSeeder extends Seeder
{
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();

        // Check if Accounts module exists, if not create it
        $accountsModule = DB::table('modules')
            ->where('folder_name', 'accounts')
            ->first();

        if (!$accountsModule) {
            // Create Accounts module
            $accountsModuleId = DB::table('modules')->insertGetId([
                'module_name' => 'Account Management',
                'folder_name' => 'accounts',
                'slug' => Str::slug('Account Management'),
                'image' => 'accounts-icon.png',
                'status' => 1,
                'sort_order' => 2,
                'created_at' => now(),
                'updated_at' => now(),
                'deleted_at' => null,
            ]);
        } else {
            $accountsModuleId = $accountsModule->id;
        }

        // Check if Chart of Accounts section exists
        $chartOfAccountsSection = DB::table('sections')
            ->where('module_id', $accountsModuleId)
            ->where('section_name', 'Chart of Accounts')
            ->first();

        if (!$chartOfAccountsSection) {
            // Create Chart of Accounts section
            $chartOfAccountsSectionId = DB::table('sections')->insertGetId([
                'module_id' => $accountsModuleId,
                'section_name' => 'Chart of Accounts',
                'slug' => Str::slug('Chart of Accounts'),
                'status' => 1,
                'sort_order' => 1,
                'created_at' => now(),
                'updated_at' => now(),
                'deleted_at' => null,
            ]);
        } else {
            $chartOfAccountsSectionId = $chartOfAccountsSection->id;
        }

        // Check if Voucher Configuration section exists
        $voucherConfigSection = DB::table('sections')
            ->where('module_id', $accountsModuleId)
            ->where('section_name', 'Voucher Configuration')
            ->first();

        if (!$voucherConfigSection) {
            // Create Voucher Configuration section
            $voucherConfigSectionId = DB::table('sections')->insertGetId([
                'module_id' => $accountsModuleId,
                'section_name' => 'Voucher Configuration',
                'slug' => Str::slug('Voucher Configuration'),
                'status' => 1,
                'sort_order' => 2,
                'created_at' => now(),
                'updated_at' => now(),
                'deleted_at' => null,
            ]);
        } else {
            $voucherConfigSectionId = $voucherConfigSection->id;
        }

        $now = now();

        // Remove any existing accounts-related menus from system module
        DB::table('menus')
            ->where('menu_name', 'Chart of Accounts Form')
            ->orWhere('menu_name', 'Voucher Number Configuration')
            ->delete();

        // Insert accounts menus
        $accountsMenus = [
            [
                'module_id' => $accountsModuleId,
                'section_id' => $chartOfAccountsSectionId,
                'menu_name' => 'Chart of Accounts',
                'route' => '/accounts/chart-of-accounts',
                'icon' => 'file-text',
                'status' => 1,
                'sort_order' => 1,
                'created_at' => $now,
                'updated_at' => $now,
                'deleted_at' => null,
            ],
            [
                'module_id' => $accountsModuleId,
                'section_id' => $voucherConfigSectionId,
                'menu_name' => 'Voucher Number Configuration',
                'route' => '/accounts/voucher-number-configuration',
                'icon' => 'settings',
                'status' => 1,
                'sort_order' => 1,
                'created_at' => $now,
                'updated_at' => $now,
                'deleted_at' => null,
            ],
        ];

        DB::table('menus')->insert($accountsMenus);

        Schema::enableForeignKeyConstraints();
    }
}

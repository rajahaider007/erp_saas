<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AccountingConfigurationMenuSeeder extends Seeder
{
    /**
     * Run the database seeder to add Chart of Account Code Configuration menus
     */
    public function run(): void
    {
        // Get the Accounts module (folder_name is 'accounts')
        $accountsModule = DB::table('modules')->where('folder_name', 'accounts')->first();

        if (!$accountsModule) {
            $this->command->error('Accounts module not found. Please ensure Account Management module exists.');
            return;
        }

        // Get or create Configuration section
        $configSection = DB::table('sections')
            ->where('module_id', $accountsModule->id)
            ->where('section_name', 'Configuration')
            ->first();

        if (!$configSection) {
            $sectionId = DB::table('sections')->insertGetId([
                'module_id' => $accountsModule->id,
                'section_name' => 'Configuration',
                'section_description' => 'Chart of Accounts and accounting configuration',
                'sort_order' => 50,
                'status' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } else {
            $sectionId = $configSection->id;
        }

        // Get admin role (if roles table exists)
        $adminRole = null;
        if (DB::getSchemaBuilder()->hasTable('roles')) {
            $adminRole = DB::table('roles')->where('role_name', 'Admin')->first();
        }

        // 1. Chart of Account Code Configuration Menu
        $this->createMenu(
            $accountsModule->id,
            $sectionId,
            'Chart of Account Codes',
            '/accounts/code-configuration',
            'Code2',
            10,
            $adminRole
        );

        // 2. Bank Account Configuration Menu
        $this->createMenu(
            $accountsModule->id,
            $sectionId,
            'Bank Accounts',
            '/accounts/code-configuration/bank',
            'Building2',
            11,
            $adminRole
        );

        // 3. Cash Account Configuration Menu
        $this->createMenu(
            $accountsModule->id,
            $sectionId,
            'Cash Accounts',
            '/accounts/code-configuration/cash',
            'Coins',
            12,
            $adminRole
        );

        $this->command->info('Accounting configuration menus created successfully.');
    }

    /**
     * Helper method to create menu with permissions
     */
    private function createMenu($moduleId, $sectionId, $menuName, $route, $icon, $sortOrder, $adminRole)
    {
        // Check if menu already exists
        $existingMenu = DB::table('menus')
            ->where('section_id', $sectionId)
            ->where('menu_name', $menuName)
            ->first();

        if ($existingMenu) {
            $this->command->info("Menu '{$menuName}' already exists.");
            return;
        }

        // Insert menu
        $menuId = DB::table('menus')->insertGetId([
            'module_id' => $moduleId,
            'section_id' => $sectionId,
            'menu_name' => $menuName,
            'route' => $route,
            'icon' => $icon,
            'sort_order' => $sortOrder,
            'status' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Add permissions for admin role if it exists
        if ($adminRole && DB::getSchemaBuilder()->hasTable('role_features')) {
            // Check if permission already exists
            $existingPermission = DB::table('role_features')
                ->where('role_id', $adminRole->id)
                ->where('menu_id', $menuId)
                ->exists();
            
            if (!$existingPermission) {
                DB::table('role_features')->insert([
                    'role_id' => $adminRole->id,
                    'menu_id' => $menuId,
                    'can_view' => true,
                    'can_add' => true,
                    'can_edit' => true,
                    'can_delete' => true,
                    'can_print' => false,
                    'can_export' => false,
                    'can_import' => false,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                $this->command->info("Menu '{$menuName}' created with admin permissions.");
            } else {
                $this->command->info("Menu '{$menuName}' created (permissions already exist).");
            }
        } else {
            $this->command->info("Menu '{$menuName}' created (no role system configured).");
        }
    }
}

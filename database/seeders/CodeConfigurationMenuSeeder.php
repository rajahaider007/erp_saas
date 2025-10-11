<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CodeConfigurationMenuSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        // Get the System module
        $systemModule = DB::table('modules')->where('module_name', 'System (Admin Panel)')->first();

        if (!$systemModule) {
            $this->command->error('System (Admin Panel) module not found. Please run SystemSeeder first.');
            return;
        }

        // Get or create the Configuration section
        $configSection = DB::table('sections')
            ->where('module_id', $systemModule->id)
            ->where('section_name', 'Configuration')
            ->first();

        if (!$configSection) {
            // Create Configuration section if it doesn't exist
            $sectionId = DB::table('sections')->insertGetId([
                'module_id' => $systemModule->id,
                'section_name' => 'Configuration',
                'section_description' => 'System configuration and settings',
                'sort_order' => 50,
                'status' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } else {
            $sectionId = $configSection->id;
        }

        // Check if menu already exists
        $existingMenu = DB::table('menus')
            ->where('section_id', $sectionId)
            ->where('menu_name', 'Code Configuration')
            ->first();

        if ($existingMenu) {
            $this->command->info('Code Configuration menu already exists.');
            return;
        }

        // Insert Code Configuration menu
        $menuId = DB::table('menus')->insertGetId([
            'module_id' => $systemModule->id,
            'section_id' => $sectionId,
            'menu_name' => 'Code Configuration',
            'route' => '/system/code-configurations',
            'icon' => 'Code',
            'sort_order' => 40,
            'status' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->command->info('Code Configuration menu created successfully.');

        // Get admin role
        $adminRole = DB::table('roles')->where('role_name', 'Admin')->first();

        if ($adminRole) {
            // Add permissions for admin role
            $rights = [
                'can_view' => true,
                'can_add' => true,
                'can_edit' => true,
                'can_delete' => true,
                'can_print' => false,
                'can_export' => false,
                'can_import' => false,
            ];

            DB::table('role_features')->insert([
                'role_id' => $adminRole->id,
                'menu_id' => $menuId,
                'can_view' => $rights['can_view'],
                'can_add' => $rights['can_add'],
                'can_edit' => $rights['can_edit'],
                'can_delete' => $rights['can_delete'],
                'can_print' => $rights['can_print'],
                'can_export' => $rights['can_export'],
                'can_import' => $rights['can_import'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $this->command->info('Admin permissions granted for Code Configuration menu.');
        }

        // Get super admin user
        $superAdmin = DB::table('users')->where('email', 'admin@erpsaas.com')->first();

        if ($superAdmin) {
            // Add user rights for super admin
            DB::table('user_rights')->insert([
                'user_id' => $superAdmin->id,
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

            $this->command->info('Super admin user rights granted for Code Configuration menu.');
        }

        $this->command->info('Code Configuration menu seeder completed successfully!');
    }
}


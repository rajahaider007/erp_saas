<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class SystemSeeder extends Seeder
{
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();

        // Empty related tables
        DB::table('menus')->delete();
        DB::table('sections')->delete();
        DB::table('modules')->delete();
        DB::table('companies')->delete();

        // Reset sequences when using SQLite (so Module becomes ID=1)
        $default = config('database.default');
        $driver = config("database.connections.$default.driver");
        if ($driver === 'sqlite') {
            try {
                DB::statement("DELETE FROM sqlite_sequence WHERE name IN ('modules','sections','menus','companies')");
            } catch (\Throwable $e) {
                // ignore
            }
        }

        // Insert Module ID = 1 (System / Admin Panel)
        $now = now();
        DB::table('modules')->insert([
            'id' => 1,
            'module_name' => 'System (Admin Panel)',
            'folder_name' => 'system',
            'slug' => Str::slug('System Admin Panel'),
            'image' => null,
            'status' => 1,
            'sort_order' => 1,
            'created_at' => $now,
            'updated_at' => $now,
            'deleted_at' => null,
        ]);

        // Insert Section: Configuration (under module 1)
        $sectionId = DB::table('sections')->insertGetId([
            'module_id' => 1,
            'section_name' => 'Configuration',
            'slug' => Str::slug('Configuration'),
            'status' => 1,
            'sort_order' => 1,
            'created_at' => $now,
            'updated_at' => $now,
            'deleted_at' => null,
        ]);

        // Insert Menus for forms inside Configuration section
        $menus = [
            [
                'module_id' => 1,
                'section_id' => $sectionId,
                'menu_name' => 'Modules',
                'route' => '/system/AddModules',
                'icon' => 'settings',
                'status' => 1,
                'sort_order' => 1,
                'created_at' => $now,
                'updated_at' => $now,
                'deleted_at' => null,
            ],
            [
                'module_id' => 1,
                'section_id' => $sectionId,
                'menu_name' => 'Sections',
                'route' => '/system/sections',
                'icon' => 'layers',
                'status' => 1,
                'sort_order' => 2,
                'created_at' => $now,
                'updated_at' => $now,
                'deleted_at' => null,
            ],
            [
                'module_id' => 1,
                'section_id' => $sectionId,
                'menu_name' => 'Menus',
                'route' => '/system/menus',
                'icon' => 'list',
                'status' => 1,
                'sort_order' => 3,
                'created_at' => $now,
                'updated_at' => $now,
                'deleted_at' => null,
            ],
            [
                'module_id' => 1,
                'section_id' => $sectionId,
                'menu_name' => 'Packages',
                'route' => '/system/packages',
                'icon' => 'package',
                'status' => 1,
                'sort_order' => 4,
                'created_at' => $now,
                'updated_at' => $now,
                'deleted_at' => null,
            ],
            [
                'module_id' => 1,
                'section_id' => $sectionId,
                'menu_name' => 'Package Features',
                'route' => '/system/package-features',
                'icon' => 'layers',
                'status' => 1,
                'sort_order' => 5,
                'created_at' => $now,
                'updated_at' => $now,
                'deleted_at' => null,
            ],
            [
                'module_id' => 1,
                'section_id' => $sectionId,
                'menu_name' => 'Locations',
                'route' => '/system/locations',
                'icon' => 'building',
                'status' => 1,
                'sort_order' => 6,
                'created_at' => $now,
                'updated_at' => $now,
                'deleted_at' => null,
            ],
            [
                'module_id' => 1,
                'section_id' => $sectionId,
                'menu_name' => 'Departments',
                'route' => '/system/departments',
                'icon' => 'users',
                'status' => 1,
                'sort_order' => 7,
                'created_at' => $now,
                'updated_at' => $now,
                'deleted_at' => null,
            ],
            [
                'module_id' => 1,
                'section_id' => $sectionId,
                'menu_name' => 'Companies',
                'route' => '/system/companies',
                'icon' => 'building-2',
                'status' => 1,
                'sort_order' => 8,
                'created_at' => $now,
                'updated_at' => $now,
                'deleted_at' => null,
            ],
            [
                'module_id' => 1,
                'section_id' => $sectionId,
                'menu_name' => 'Users',
                'route' => '/system/users',
                'icon' => 'users',
                'status' => 1,
                'sort_order' => 9,
                'created_at' => $now,
                'updated_at' => $now,
                'deleted_at' => null,
            ],
        ];

        DB::table('menus')->insert($menus);

        // Insert sample companies
        DB::table('companies')->insert([
            [
                'company_name' => 'Acme Corporation',
                'company_code' => 'ACME001',
                'registration_number' => 'REG001',
                'email' => 'contact@acme.com',
                'address_line_1' => '123 Main Street',
                'city' => 'New York',
                'country' => 'United States',
                'status' => 1,
                'created_at' => $now,
                'updated_at' => $now,
                'deleted_at' => null,
            ],
            [
                'company_name' => 'Tech Solutions Inc',
                'company_code' => 'TECH001',
                'registration_number' => 'REG002',
                'email' => 'info@techsolutions.com',
                'address_line_1' => '456 Tech Avenue',
                'city' => 'San Francisco',
                'country' => 'United States',
                'status' => 1,
                'created_at' => $now,
                'updated_at' => $now,
                'deleted_at' => null,
            ],
            [
                'company_name' => 'Global Industries Ltd',
                'company_code' => 'GLOBAL001',
                'registration_number' => 'REG003',
                'email' => 'contact@globalindustries.com',
                'address_line_1' => '789 Business District',
                'city' => 'London',
                'country' => 'United Kingdom',
                'status' => 1,
                'created_at' => $now,
                'updated_at' => $now,
                'deleted_at' => null,
            ],
            [
                'company_name' => 'Innovation Hub',
                'company_code' => 'INNOV001',
                'registration_number' => 'REG004',
                'email' => 'hello@innovationhub.com',
                'address_line_1' => '321 Innovation Street',
                'city' => 'Boston',
                'country' => 'United States',
                'status' => 1,
                'created_at' => $now,
                'updated_at' => $now,
                'deleted_at' => null,
            ],
            [
                'company_name' => 'Enterprise Systems',
                'company_code' => 'ENT001',
                'registration_number' => 'REG005',
                'email' => 'contact@enterprisesystems.com',
                'address_line_1' => '654 Corporate Plaza',
                'city' => 'Chicago',
                'country' => 'United States',
                'status' => 0, // Inactive company for testing
                'created_at' => $now,
                'updated_at' => $now,
                'deleted_at' => null,
            ],
        ]);

        Schema::enableForeignKeyConstraints();
    }
}



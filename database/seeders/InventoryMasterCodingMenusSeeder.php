<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\UserRight;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class InventoryMasterCodingMenusSeeder extends Seeder
{
    /**
     * Inventory module: item coding, UOM, and GeneralizedForm master-data screens — menus + package link + user rights.
     */
    public function run(): void
    {
        $now = now();

        $inventoryModule = DB::table('modules')->where('folder_name', 'inventory')->first();

        if (! $inventoryModule) {
            $moduleId = DB::table('modules')->insertGetId([
                'module_name' => 'Inventory',
                'folder_name' => 'inventory',
                'slug' => Str::slug('Inventory'),
                'image' => null,
                'status' => 1,
                'sort_order' => 3,
                'created_at' => $now,
                'updated_at' => $now,
                'deleted_at' => null,
            ]);
            $this->command->info('Created Inventory module.');
        } else {
            $moduleId = $inventoryModule->id;
            $this->command->info('Inventory module already exists.');
        }

        $allMenuIds = [];

        $allMenuIds = array_merge($allMenuIds, $this->seedMenuGroup(
            $moduleId,
            'Master Data',
            'inventory-master-data',
            1,
            [
                ['menu_name' => 'Item Class Coding', 'route' => '/inventory/item-class-coding', 'icon' => 'file-text', 'sort_order' => 1],
                ['menu_name' => 'Item Category Coding', 'route' => '/inventory/item-category-coding', 'icon' => 'file-text', 'sort_order' => 2],
                ['menu_name' => 'Item Group Coding', 'route' => '/inventory/item-group-coding', 'icon' => 'file-text', 'sort_order' => 3],
                ['menu_name' => 'Item Coding', 'route' => '/inventory/item-master', 'icon' => 'file-text', 'sort_order' => 4], ['menu_name' => 'Tax Category Configuration', 'route' => '/inventory/master-data/tax-category', 'icon' => 'file-text', 'sort_order' => 1],
                ['menu_name' => 'Vendor Master', 'route' => '/inventory/master-data/vendor-master', 'icon' => 'file-text', 'sort_order' => 2],
                ['menu_name' => 'Branch / Location (System)', 'route' => '/system/locations', 'icon' => 'map-pin', 'sort_order' => 3],
                ['menu_name' => 'Zone / Bin Configuration', 'route' => '/inventory/master-data/zone-bin-master', 'icon' => 'file-text', 'sort_order' => 4],
                ['menu_name' => 'Country Master', 'route' => '/inventory/master-data/country-master', 'icon' => 'file-text', 'sort_order' => 5],
                ['menu_name' => 'Brand Configuration', 'route' => '/inventory/master-data/brand-master', 'icon' => 'file-text', 'sort_order' => 6],
                ['menu_name' => 'Reason Code Configuration', 'route' => '/inventory/master-data/reason-code-master', 'icon' => 'file-text', 'sort_order' => 7],
                ['menu_name' => 'Temperature Class Configuration', 'route' => '/inventory/master-data/temperature-class-master', 'icon' => 'file-text', 'sort_order' => 8],
                ['menu_name' => 'Transporter Master', 'route' => '/inventory/master-data/transporter-master', 'icon' => 'file-text', 'sort_order' => 9],
                ['menu_name' => 'Customer Master', 'route' => '/inventory/master-data/customer-master', 'icon' => 'file-text', 'sort_order' => 10],
                ['menu_name' => 'Package Type Configuration', 'route' => '/inventory/master-data/package-type-master', 'icon' => 'file-text', 'sort_order' => 11],
                ['menu_name' => 'HSN / SAC & Tariff Codes', 'route' => '/inventory/master-data/compliance-code-master', 'icon' => 'file-text', 'sort_order' => 12],
                ['menu_name' => 'Barcode Type Configuration', 'route' => '/inventory/master-data/barcode-type-master', 'icon' => 'file-text', 'sort_order' => 13],
            ],
            $now
        ));

        $allMenuIds = array_merge($allMenuIds, $this->seedMenuGroup(
            $moduleId,
            'UOM & Conversions',
            'inventory-uom-conversions',
            2,
            [
                ['menu_name' => 'UOM Master', 'route' => '/inventory/uom-master', 'icon' => 'list', 'sort_order' => 1],
                ['menu_name' => 'UOM Conversion', 'route' => '/inventory/uom-conversion', 'icon' => 'list', 'sort_order' => 2],
            ],
            $now
        ));

        $allMenuIds = array_merge($allMenuIds, $this->seedMenuGroup(
            $moduleId,
            'Purchases',
            'purchases',
            3,
            [
                ['menu_name' => 'Purchase Requisition', 'route' => '/inventory/purchase-requisition', 'icon' => 'shopping-cart', 'sort_order' => 1],
                ['menu_name' => 'Purchase Order', 'route' => '/inventory/purchase-order', 'icon' => 'file-text', 'sort_order' => 2],
                ['menu_name' => 'Document Number Configuration', 'route' => '/inventory/document-number-configuration', 'icon' => 'hash', 'sort_order' => 3],
            ],
            $now
        ));

        $allMenuIds = array_merge($allMenuIds, $this->seedMenuGroup(
            $moduleId,
            'Reports',
            'inventory-reports',
            4,
            [
                ['menu_name' => 'Inventory Reports', 'route' => '/inventory/reports', 'icon' => 'file-chart-column-increasing', 'sort_order' => 1],
                ['menu_name' => 'Goods Receipt Register', 'route' => '/inventory/reports/goods-receipt-register', 'icon' => 'clipboard-list', 'sort_order' => 2],
                ['menu_name' => 'Purchase Order Lines Report', 'route' => '/inventory/reports/purchase-order-lines', 'icon' => 'file-spreadsheet', 'sort_order' => 3],
                ['menu_name' => 'Stock Position (GRN)', 'route' => '/inventory/reports/stock-position', 'icon' => 'boxes', 'sort_order' => 4],
                ['menu_name' => 'GRN vs PO variance', 'route' => '/inventory/reports/grn-po-variance', 'icon' => 'git-compare', 'sort_order' => 5],
                ['menu_name' => 'GRN supplier invoices', 'route' => '/inventory/reports/grn-supplier-invoice-listing', 'icon' => 'file-text', 'sort_order' => 6],
                ['menu_name' => 'PR lines register', 'route' => '/inventory/reports/purchase-requisition-lines', 'icon' => 'list', 'sort_order' => 7],
                ['menu_name' => 'PR → PO conversion', 'route' => '/inventory/reports/pr-to-po-conversion', 'icon' => 'arrow-right-left', 'sort_order' => 8],
                ['menu_name' => 'Posted inventory movements', 'route' => '/inventory/reports/inventory-movements', 'icon' => 'history', 'sort_order' => 9],
            ],
            $now
        ));

        if (Schema::hasTable('package_modules') && Schema::hasTable('packages')) {
            $packageIds = DB::table('packages')->pluck('id');
            foreach ($packageIds as $packageId) {
                $linked = DB::table('package_modules')
                    ->where('package_id', $packageId)
                    ->where('module_id', $moduleId)
                    ->exists();

                if ($linked) {
                    continue;
                }

                DB::table('package_modules')->insert([
                    'package_id' => $packageId,
                    'module_id' => $moduleId,
                    'is_enabled' => true,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
                $this->command->info("Linked Inventory module to package ID {$packageId}.");
            }
        } else {
            $this->command->warn('Skipped package_modules linking (table missing). Run migrations or link Inventory in Package → Modules in the UI.');
        }

        foreach (array_unique($allMenuIds) as $menuId) {
            foreach (User::query()->where('status', 'active')->get() as $user) {
                if ($user->role === 'super_admin') {
                    continue;
                }

                UserRight::query()->firstOrCreate(
                    [
                        'user_id' => $user->id,
                        'menu_id' => $menuId,
                    ],
                    [
                        'can_view' => true,
                        'can_add' => true,
                        'can_edit' => true,
                        'can_delete' => true,
                    ]
                );
            }
        }

        $this->command->info('Inventory menus seeding finished ('.count(array_unique($allMenuIds)).' menus).');
    }

    /**
     * @param  array<int, array{menu_name: string, route: string, icon: string, sort_order: int}>  $menus
     * @return list<int>
     */
    private function seedMenuGroup(int $moduleId, string $sectionName, string $sectionSlug, int $sectionSortOrder, array $menus, $now): array
    {
        $section = DB::table('sections')
            ->where('module_id', $moduleId)
            ->where('section_name', $sectionName)
            ->first();

        if (! $section) {
            $sectionId = DB::table('sections')->insertGetId([
                'module_id' => $moduleId,
                'section_name' => $sectionName,
                'slug' => $sectionSlug,
                'status' => 1,
                'sort_order' => $sectionSortOrder,
                'created_at' => $now,
                'updated_at' => $now,
                'deleted_at' => null,
            ]);
            $this->command->info("Created section: {$sectionName}");
        } else {
            $sectionId = $section->id;
            $this->command->line("Section exists: {$sectionName}");
        }

        $ids = [];

        foreach ($menus as $menu) {
            $exists = DB::table('menus')
                ->where('module_id', $moduleId)
                ->where('route', $menu['route'])
                ->first();

            if ($exists) {
                $ids[] = $exists->id;
                $this->command->line("  Menu already present: {$menu['menu_name']}");

                continue;
            }

            $ids[] = DB::table('menus')->insertGetId([
                'module_id' => $moduleId,
                'section_id' => $sectionId,
                'menu_name' => $menu['menu_name'],
                'route' => $menu['route'],
                'icon' => $menu['icon'],
                'status' => 1,
                'sort_order' => $menu['sort_order'],
                'created_at' => $now,
                'updated_at' => $now,
                'deleted_at' => null,
            ]);
            $this->command->info("  Added menu: {$menu['menu_name']}");
        }

        return $ids;
    }
}

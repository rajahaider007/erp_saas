<?php
// Quick Artisan command to add Sales module sections and menus

use Illuminate\Database\Capsule\Manager as DB;

// Check existing
$existingSections = DB::table('sections')->where('module_id', 4)->get();
echo "Existing sections for module 4: " . count($existingSections) . "\n";

// Create Sales sections
if (count($existingSections) === 0) {
    // Insert sections
    DB::table('sections')->insert([
        [
            'module_id' => 4,
            'section_name' => 'Sales Transactions',
            'slug' => 'sales-transactions',
            'icon' => 'shopping-cart',
            'description' => 'Manage quotations, orders, invoices, and payments',
            'sort_order' => 1,
            'status' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
            'module_id' => 4,
            'section_name' => 'Sales Configuration',
            'slug' => 'sales-configuration',
            'icon' => 'settings',
            'description' => 'Configure sales settings, pricelists, taxes',
            'sort_order' => 2,
            'status' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
            'module_id' => 4,
            'section_name' => 'Sales Analytics',
            'slug' => 'sales-analytics',
            'icon' => 'bar-chart-2',
            'description' => 'Sales reports and performance analysis',
            'sort_order' => 3,
            'status' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ],
    ]);
    
    echo "Created 3 sections for Sales module\n";
}

// Get section IDs
$sections = DB::table('sections')->where('module_id', 4)->get();
$transactionSectionId = $sections->firstWhere('slug', 'sales-transactions')->id ?? 1;
$configSectionId = $sections->firstWhere('slug', 'sales-configuration')->id ?? 2;
$analyticsSectionId = $sections->firstWhere('slug', 'sales-analytics')->id ?? 3;

// Check existing menus
$existingMenus = DB::table('menus')->where('section_id', '>=', $transactionSectionId)->where('section_id', '<=', $analyticsSectionId)->count();
echo "Existing menus for these sections: " . $existingMenus . "\n";

// Create menus if not exist
if ($existingMenus === 0) {
    DB::table('menus')->insert([
        // Transaction menus
        [
            'section_id' => $transactionSectionId,
            'module_id' => 4,
            'menu_name' => 'Customers',
            'route_name' => 'sales.customer.index',
            'icon' => 'users',
            'description' => 'Manage customer master data',
            'sort_order' => 1,
            'status' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
            'section_id' => $transactionSectionId,
            'module_id' => 4,
            'menu_name' => 'Quotations',
            'route_name' => 'sales.quotation.index',
            'icon' => 'file-text',
            'description' => 'Create and manage quotations',
            'sort_order' => 2,
            'status' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
            'section_id' => $transactionSectionId,
            'module_id' => 4,
            'menu_name' => 'Sales Orders',
            'route_name' => 'sales.order.index',
            'icon' => 'shopping-cart',
            'description' => 'Manage sales orders',
            'sort_order' => 3,
            'status' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
            'section_id' => $transactionSectionId,
            'module_id' => 4,
            'menu_name' => 'Invoices',
            'route_name' => 'sales.invoice.index',
            'icon' => 'receipt',
            'description' => 'Create and post customer invoices',
            'sort_order' => 4,
            'status' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
            'section_id' => $transactionSectionId,
            'module_id' => 4,
            'menu_name' => 'Payments',
            'route_name' => 'sales.payment.index',
            'icon' => 'credit-card',
            'description' => 'Register customer payments',
            'sort_order' => 5,
            'status' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
            'section_id' => $transactionSectionId,
            'module_id' => 4,
            'menu_name' => 'Dashboard',
            'route_name' => 'sales.dashboard',
            'icon' => 'activity',
            'description' => 'Sales performance dashboard',
            'sort_order' => 0,
            'status' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ],
        // Config menus
        [
            'section_id' => $configSectionId,
            'module_id' => 4,
            'menu_name' => 'Pricelist',
            'route_name' => '',
            'icon' => 'tag',
            'description' => 'Manage product pricelists',
            'sort_order' => 1,
            'status' => 'inactive',
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
            'section_id' => $configSectionId,
            'module_id' => 4,
            'menu_name' => 'Tax Configuration',
            'route_name' => '',
            'icon' => 'percent',
            'description' => 'Configure sales taxes',
            'sort_order' => 2,
            'status' => 'inactive',
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
            'section_id' => $configSectionId,
            'module_id' => 4,
            'menu_name' => 'Commission Setup',
            'route_name' => '',
            'icon' => 'trending-up',
            'description' => 'Setup commission plans',
            'sort_order' => 3,
            'status' => 'inactive',
            'created_at' => now(),
            'updated_at' => now(),
        ],
        // Analytics menus
        [
            'section_id' => $analyticsSectionId,
            'module_id' => 4,
            'menu_name' => 'Sales Reports',
            'route_name' => '',
            'icon' => 'bar-chart-2',
            'description' => 'Sales performance and analysis reports',
            'sort_order' => 1,
            'status' => 'inactive',
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
            'section_id' => $analyticsSectionId,
            'module_id' => 4,
            'menu_name' => 'AR Aging Report',
            'route_name' => '',
            'icon' => 'calendar',
            'description' => 'Accounts receivable aging analysis',
            'sort_order' => 2,
            'status' => 'inactive',
            'created_at' => now(),
            'updated_at' => now(),
        ],
    ]);
    
    echo "Created menus for Sales module\n";
}

echo "\nDone! Sales module sections and menus added to database.\n";
?>

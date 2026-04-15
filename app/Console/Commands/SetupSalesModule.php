<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class SetupSalesModule extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'sales:setup';

    /**
     * The description of the console command.
     */
    protected $description = 'Setup the Sales module - create sections and menu items';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Setting up Sales Module...');

        try {
            // Check if sections already exist
            $existingSections = DB::table('sections')->where('module_id', 4)->count();
            
            if ($existingSections > 0) {
                $this->warn('Sales module sections already exist. Skipping section creation.');
            } else {
                // Create Sales sections
                DB::table('sections')->insert([
                    [
                        'module_id' => 4,
                        'section_name' => 'Sales Transactions',
                        'slug' => 'sales-transactions',
                        'sort_order' => 1,
                        'status' => 1,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ],
                    [
                        'module_id' => 4,
                        'section_name' => 'Sales Configuration',
                        'slug' => 'sales-configuration',
                        'sort_order' => 2,
                        'status' => 1,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ],
                    [
                        'module_id' => 4,
                        'section_name' => 'Sales Analytics',
                        'slug' => 'sales-analytics',
                        'sort_order' => 3,
                        'status' => 1,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ],
                ]);

                $this->info('✓ Created 3 sections for Sales module');
            }

            // Get section IDs
            $sections = DB::table('sections')->where('module_id', 4)->get();
            $transactionSectionId = $sections->firstWhere('slug', 'sales-transactions')->id;
            $configSectionId = $sections->firstWhere('slug', 'sales-configuration')->id;
            $analyticsSectionId = $sections->firstWhere('slug', 'sales-analytics')->id;

            // Check existing menus
            $existingMenus = DB::table('menus')
                ->whereIn('section_id', [$transactionSectionId, $configSectionId, $analyticsSectionId])
                ->count();

            if ($existingMenus > 0) {
                $this->warn('Sales module menus already exist. Skipping menu creation.');
            } else {
                // Create menus
                DB::table('menus')->insert([
                    ['section_id' => $transactionSectionId, 'module_id' => 4, 'menu_name' => 'Dashboard', 'route' => 'sales.dashboard', 'icon' => 'activity', 'sort_order' => 0, 'status' => 1, 'created_at' => now(), 'updated_at' => now()],
                    ['section_id' => $transactionSectionId, 'module_id' => 4, 'menu_name' => 'Customers', 'route' => 'sales.customer.index', 'icon' => 'users', 'sort_order' => 1, 'status' => 1, 'created_at' => now(), 'updated_at' => now()],
                    ['section_id' => $transactionSectionId, 'module_id' => 4, 'menu_name' => 'Quotations', 'route' => 'sales.quotation.index', 'icon' => 'file-text', 'sort_order' => 2, 'status' => 1, 'created_at' => now(), 'updated_at' => now()],
                    ['section_id' => $transactionSectionId, 'module_id' => 4, 'menu_name' => 'Sales Orders', 'route' => 'sales.order.index', 'icon' => 'shopping-cart', 'sort_order' => 3, 'status' => 1, 'created_at' => now(), 'updated_at' => now()],
                    ['section_id' => $transactionSectionId, 'module_id' => 4, 'menu_name' => 'Invoices', 'route' => 'sales.invoice.index', 'icon' => 'receipt', 'sort_order' => 4, 'status' => 1, 'created_at' => now(), 'updated_at' => now()],
                    ['section_id' => $transactionSectionId, 'module_id' => 4, 'menu_name' => 'Payments', 'route' => 'sales.payment.index', 'icon' => 'credit-card', 'sort_order' => 5, 'status' => 1, 'created_at' => now(), 'updated_at' => now()],
                    ['section_id' => $configSectionId, 'module_id' => 4, 'menu_name' => 'Pricelist', 'route' => '', 'icon' => 'tag', 'sort_order' => 1, 'status' => 0, 'created_at' => now(), 'updated_at' => now()],
                    ['section_id' => $configSectionId, 'module_id' => 4, 'menu_name' => 'Tax Configuration', 'route' => '', 'icon' => 'percent', 'sort_order' => 2, 'status' => 0, 'created_at' => now(), 'updated_at' => now()],
                    ['section_id' => $configSectionId, 'module_id' => 4, 'menu_name' => 'Commission Setup', 'route' => '', 'icon' => 'trending-up', 'sort_order' => 3, 'status' => 0, 'created_at' => now(), 'updated_at' => now()],
                    ['section_id' => $analyticsSectionId, 'module_id' => 4, 'menu_name' => 'Sales Reports', 'route' => '', 'icon' => 'bar-chart-2', 'sort_order' => 1, 'status' => 0, 'created_at' => now(), 'updated_at' => now()],
                    ['section_id' => $analyticsSectionId, 'module_id' => 4, 'menu_name' => 'AR Aging Report', 'route' => '', 'icon' => 'calendar', 'sort_order' => 2, 'status' => 0, 'created_at' => now(), 'updated_at' => now()],
                ]);

                $this->info('✓ Created 10 menus for Sales module');
            }

            $this->newLine();
            $this->info('Sales module setup completed successfully!');
            $this->info('You can now access the Sales module at: http://127.0.0.1:8000/sales/dashboard');

        } catch (\Exception $e) {
            $this->error('Error setting up Sales module: ' . $e->getMessage());
            return 1;
        }

        return 0;
    }
}

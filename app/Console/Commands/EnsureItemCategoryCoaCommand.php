<?php

namespace App\Console\Commands;

use App\Models\InventoryItemCategory;
use App\Services\Inventory\ItemCategoryCostingAccountService;
use Illuminate\Console\Command;

class EnsureItemCategoryCoaCommand extends Command
{
    protected $signature = 'inventory:ensure-category-coa
                            {--comp_id= : Company ID}
                            {--location_id= : Location ID}';

    protected $description = 'Create Chart of Accounts costing heads for item categories that are missing GL links (requires Account Configuration for inventory, purchase, sales, cost_of_goods_sold).';

    public function handle(ItemCategoryCostingAccountService $service): int
    {
        $compId = (int) $this->option('comp_id');
        $locationId = (int) $this->option('location_id');

        if ($compId <= 0 || $locationId <= 0) {
            $this->error('Both --comp_id= and --location_id= are required.');

            return self::FAILURE;
        }

        $categories = InventoryItemCategory::query()
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->where(function ($q) {
                $q->whereNull('inventory_gl_account_id')
                    ->orWhereNull('purchase_gl_account_id')
                    ->orWhereNull('sales_gl_account_id')
                    ->orWhereNull('cogs_gl_account_id');
            })
            ->orderBy('category_code')
            ->get();

        if ($categories->isEmpty()) {
            $this->info('No categories need costing COA links for this company and location.');

            return self::SUCCESS;
        }

        foreach ($categories as $category) {
            try {
                $service->ensureCostingHeads($category);
                $this->info("Linked COA for category [{$category->category_code}] {$category->category_name}.");
            } catch (\Throwable $e) {
                $this->warn("[{$category->category_code}] skipped: {$e->getMessage()}");
            }
        }

        return self::SUCCESS;
    }
}

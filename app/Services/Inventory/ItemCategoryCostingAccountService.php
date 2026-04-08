<?php

namespace App\Services\Inventory;

use App\Models\AccountConfiguration;
use App\Models\ChartOfAccount;
use App\Models\InventoryItem;
use App\Models\InventoryItemCategory;
use Illuminate\Support\Facades\DB;

class ItemCategoryCostingAccountService
{
    /**
     * Create level-4 COA heads for a category (inventory asset, purchase, sales, COGS) and link them on the category.
     *
     * @throws \RuntimeException When required account configuration parents are missing
     */
    public function ensureCostingHeads(InventoryItemCategory $category): void
    {
        $compId = (int) $category->comp_id;
        $locationId = (int) $category->location_id;

        $needsCreation = ! ($category->inventory_gl_account_id
            && $category->purchase_gl_account_id
            && $category->sales_gl_account_id
            && $category->cogs_gl_account_id);

        $defs = [
            'inventory_gl_account_id' => [
                'config' => 'inventory',
                'suffix' => 'STK',
                'type' => 'Assets',
                'label' => 'Stock / Inventory',
            ],
            'purchase_gl_account_id' => [
                'config' => 'purchase',
                'suffix' => 'PUR',
                'type' => 'Expenses',
                'label' => 'Purchases',
            ],
            'sales_gl_account_id' => [
                'config' => 'sales',
                'suffix' => 'SAL',
                'type' => 'Revenue',
                'label' => 'Sales',
            ],
            'cogs_gl_account_id' => [
                'config' => 'cost_of_goods_sold',
                'suffix' => 'COG',
                'type' => 'Expenses',
                'label' => 'Cost of Goods Sold',
            ],
        ];

        if ($needsCreation) {
            $missingConfigs = [];
            foreach ($defs as $column => $meta) {
                if ($category->{$column}) {
                    continue;
                }
                if (! $this->resolveLevel3ParentId($compId, $locationId, $meta['config'])) {
                    $missingConfigs[] = $meta['config'];
                }
            }
            if ($missingConfigs !== []) {
                $missingConfigs = array_values(array_unique($missingConfigs));
                throw new \RuntimeException(
                    'Missing Account Configuration for: '.implode(', ', $missingConfigs).'. '
                    .'Add an active row for each type under Account Configuration (company & location), linked to a Chart of Accounts account (Level 3 control or Level 4 with a Level 3 parent). '
                    .'Then save this category again or run: php artisan inventory:ensure-category-coa'
                );
            }

            DB::transaction(function () use ($category, $compId, $locationId, $defs) {
                $currency = $this->defaultCurrency($compId, $locationId);

                $updates = [];

                foreach ($defs as $column => $meta) {
                    if ($category->{$column}) {
                        continue;
                    }

                    $parentId = $this->resolveLevel3ParentId($compId, $locationId, $meta['config']);
                    if (! $parentId) {
                        throw new \RuntimeException(
                            "Account configuration for \"{$meta['config']}\" is missing."
                        );
                    }

                    $accountName = "{$category->category_name} — {$meta['label']}";
                    $accountCode = $this->uniqueAccountCode($compId, $locationId, (int) $category->id, $meta['suffix']);

                    $account = ChartOfAccount::create([
                        'account_code' => $accountCode,
                        'account_name' => $accountName,
                        'account_type' => $meta['type'],
                        'parent_account_id' => $parentId,
                        'account_level' => 4,
                        'is_transactional' => true,
                        'currency' => $currency,
                        'status' => 'Active',
                        'short_code' => null,
                        'comp_id' => $compId,
                        'location_id' => $locationId,
                    ]);

                    $updates[$column] = $account->id;
                }

                if ($updates !== []) {
                    $category->forceFill($updates)->save();
                }
            });
        }

        $this->syncItemsInCategory($category->fresh());
    }

    /**
     * For UI: which costing config types are ready for automatic COA creation.
     *
     * @return list<array{config_type: string, ready: bool}>
     */
    public function costingConfigurationStatus(int $compId, int $locationId): array
    {
        $types = ['inventory', 'purchase', 'sales', 'cost_of_goods_sold'];

        return array_map(function (string $type) use ($compId, $locationId) {
            return [
                'config_type' => $type,
                'ready' => $this->resolveLevel3ParentId($compId, $locationId, $type) !== null,
            ];
        }, $types);
    }

    public function syncItemsInCategory(InventoryItemCategory $category): void
    {
        $payload = array_filter([
            'inventory_gl_account_id' => $category->inventory_gl_account_id,
            'purchase_gl_account_id' => $category->purchase_gl_account_id,
            'sales_gl_account_id' => $category->sales_gl_account_id,
            'cogs_gl_account_id' => $category->cogs_gl_account_id,
        ], fn ($v) => $v !== null);

        if ($payload === []) {
            return;
        }

        InventoryItem::query()
            ->where('comp_id', $category->comp_id)
            ->where('location_id', $category->location_id)
            ->where('item_category_id', $category->id)
            ->update($payload);
    }

    /**
     * Apply category costing GL ids onto validated item payload when the category defines them.
     */
    public function applyCategoryGlToItemPayload(array &$validated, int $categoryId, int $compId, int $locationId): void
    {
        $category = InventoryItemCategory::query()
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->where('id', $categoryId)
            ->first();
        if (! $category) {
            return;
        }

        foreach (['inventory_gl_account_id', 'purchase_gl_account_id', 'sales_gl_account_id', 'cogs_gl_account_id'] as $col) {
            if ($category->{$col}) {
                $validated[$col] = $category->{$col};
            }
        }
    }

    private function resolveLevel3ParentId(int $compId, int $locationId, string $configType): ?int
    {
        $config = AccountConfiguration::query()
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->where('config_type', $configType)
            ->where('is_active', true)
            ->orderBy('id')
            ->first();

        if (! $config || ! $config->account_id) {
            return null;
        }

        $coa = ChartOfAccount::query()->find($config->account_id);
        if (! $coa) {
            return null;
        }

        if ((int) $coa->account_level === 3) {
            return (int) $coa->id;
        }

        if ((int) $coa->account_level === 4 && $coa->parent_account_id) {
            return (int) $coa->parent_account_id;
        }

        // Level-2 control (e.g. "Cost of Goods Sold" header): use first active Level-3 child as posting parent.
        if ((int) $coa->account_level === 2) {
            $l3Id = ChartOfAccount::query()
                ->where('comp_id', $compId)
                ->where('location_id', $locationId)
                ->where('parent_account_id', $coa->id)
                ->where('account_level', 3)
                ->where('status', 'Active')
                ->orderBy('account_code')
                ->value('id');

            return $l3Id ? (int) $l3Id : null;
        }

        return null;
    }

    private function defaultCurrency(int $compId, int $locationId): ?string
    {
        $sample = ChartOfAccount::query()
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->whereNotNull('currency')
            ->where('currency', '!=', '')
            ->value('currency');

        return $sample ?: null;
    }

    /**
     * chart_of_accounts.account_code is VARCHAR(15) in this database.
     * Format: 3-digit comp + 3-digit location + 5-digit category id + 1-letter type (S/P/V/C) = 12 chars.
     */
    private const ACCOUNT_CODE_MAX_LEN = 15;

    private function uniqueAccountCode(int $compId, int $locationId, int $categoryId, string $suffixToken): string
    {
        $typeChar = match (strtoupper($suffixToken)) {
            'STK' => 'S',
            'PUR' => 'P',
            'SAL' => 'V',
            'COG' => 'C',
            default => strtoupper(substr($suffixToken, 0, 1)),
        };

        $base = sprintf(
            '%03d%03d%05d%s',
            min(max($compId, 0), 999),
            min(max($locationId, 0), 999),
            min(max($categoryId, 0), 99999),
            $typeChar
        );

        $code = $base;
        $n = 0;
        while (ChartOfAccount::query()->where('account_code', $code)->exists()) {
            $n++;
            $variant = strtoupper(base_convert((string) $n, 10, 36));
            $code = substr($base, 0, self::ACCOUNT_CODE_MAX_LEN - strlen($variant)).$variant;
            if ($n > 50000) {
                throw new \RuntimeException('Could not allocate a unique chart account_code (max '.self::ACCOUNT_CODE_MAX_LEN.' characters).');
            }
        }

        return $code;
    }
}

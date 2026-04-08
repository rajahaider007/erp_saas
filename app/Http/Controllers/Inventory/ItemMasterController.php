<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\AccountConfiguration;
use App\Models\ChartOfAccount;
use App\Models\Country;
use App\Models\InventoryItem;
use App\Models\InventoryItemCategory;
use App\Models\InventoryItemClass;
use App\Models\InventoryItemGroup;
use App\Models\TaxCategory;
use App\Models\UomMaster;
use App\Services\Inventory\ItemCategoryCostingAccountService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class ItemMasterController extends Controller
{
    public function __construct(
        private ItemCategoryCostingAccountService $categoryCostingAccounts
    ) {}

    /**
     * Display list of items
     */
    public function list(Request $request)
    {
        $compId = $this->resolvedCompId($request);
        $locationId = $this->resolvedLocationId($request);

        if (! $compId || ! $locationId) {
            return Inertia::render('Inventory/ItemMaster/List', [
                'error' => 'Company and Location information is required.',
                'items' => [],
            ]);
        }

        $search = $request->input('search');
        $status = $request->input('status');
        $sortBy = $request->input('sort_by', 'item_code');
        $sortDirection = $request->input('sort_direction', 'asc');
        $perPage = $request->input('per_page', 25);

        $query = InventoryItem::byCompanyAndLocation($compId, $locationId)
            ->with('itemClass:id,class_code,class_name', 'itemCategory:id,category_name', 'uomStock', 'taxCategory');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('item_code', 'like', "%{$search}%")
                    ->orWhere('item_name_short', 'like', "%{$search}%")
                    ->orWhere('item_name_long', 'like', "%{$search}%");
            });
        }

        if ($status !== null && $status !== 'all') {
            $query->where('is_active', $status == '1');
        }

        $items = $query->orderBy($sortBy, $sortDirection)
            ->paginate($perPage)
            ->appends($request->query());

        return Inertia::render('Inventory/ItemMaster/List', [
            'items' => $items,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'sort_by' => $sortBy,
                'sort_direction' => $sortDirection,
                'per_page' => $perPage,
            ],
        ]);
    }

    /**
     * Show create form
     */
    public function create(Request $request, ?InventoryItem $itemForGlOptions = null)
    {
        $compId = $this->resolvedCompId($request);
        $locationId = $this->resolvedLocationId($request);

        if (! $compId || ! $locationId) {
            return Inertia::render('Inventory/ItemMaster/Create', [
                'error' => 'Company and Location information is required.',
                'itemClassOptions' => [],
                'itemCategoryOptions' => [],
                'itemCategoryCoaById' => [],
                'itemGroupOptions' => [],
                'itemTypeOptions' => [],
                'uomOptions' => [],
                'taxCategoryOptions' => [],
                'glAccountOptions' => [],
                'glAccountOptionsInventory' => [],
                'glAccountOptionsPurchase' => [],
                'glAccountOptionsCogs' => [],
                'glAccountOptionsSales' => [],
                'glAccountOptionsWriteoff' => [],
                'glAccountOptionsVariance' => [],
            ]);
        }

        $itemClassOptions = InventoryItemClass::byCompanyAndLocation($compId, $locationId)
            ->active()
            ->orderBy('class_code')
            ->get(['id', 'class_code', 'class_name'])
            ->map(fn ($itemClass) => [
                'value' => (string) $itemClass->id,
                'label' => $itemClass->class_code.' - '.$itemClass->class_name,
            ])
            ->values();

        $itemCategories = InventoryItemCategory::byCompanyAndLocation($compId, $locationId)
            ->active()
            ->with([
                'inventoryGlAccount:id,account_code,account_name',
                'purchaseGlAccount:id,account_code,account_name',
                'salesGlAccount:id,account_code,account_name',
                'cogsGlAccount:id,account_code,account_name',
            ])
            ->orderBy('category_code')
            ->get();

        $itemCategoryOptions = $itemCategories
            ->map(fn ($category) => [
                'value' => (string) $category->id,
                'label' => $category->category_code.' - '.$category->category_name,
            ])
            ->values();

        $itemCategoryCoaById = $itemCategories->mapWithKeys(function ($category) {
            $fmt = fn ($acc) => $acc ? [
                'id' => (int) $acc->id,
                'code' => $acc->account_code,
                'name' => $acc->account_name,
            ] : null;

            return [
                (string) $category->id => [
                    'inventory_gl_account_id' => $category->inventory_gl_account_id,
                    'purchase_gl_account_id' => $category->purchase_gl_account_id,
                    'sales_gl_account_id' => $category->sales_gl_account_id,
                    'cogs_gl_account_id' => $category->cogs_gl_account_id,
                    'inventory' => $fmt($category->inventoryGlAccount),
                    'purchase' => $fmt($category->purchaseGlAccount),
                    'sales' => $fmt($category->salesGlAccount),
                    'cogs' => $fmt($category->cogsGlAccount),
                ],
            ];
        })->all();

        $itemGroupOptions = InventoryItemGroup::byCompanyAndLocation($compId, $locationId)
            ->active()
            ->orderBy('group_code')
            ->get(['id', 'group_code', 'group_name'])
            ->map(fn ($group) => [
                'value' => (string) $group->id,
                'label' => $group->group_code.' - '.$group->group_name,
            ])
            ->values();

        $uomOptions = UomMaster::byCompany($compId)
            ->active()
            ->orderBy('display_order')
            ->get(['id', 'uom_code', 'uom_name'])
            ->map(fn ($uom) => [
                'value' => (string) $uom->id,
                'label' => $uom->uom_code.' - '.$uom->uom_name,
            ])
            ->values();

        $taxCategoryOptions = TaxCategory::byCompany($compId)
            ->active()
            ->get(['id', 'tax_code', 'tax_name', 'tax_rate'])
            ->map(fn ($tax) => [
                'value' => (string) $tax->id,
                'label' => $tax->tax_code.' - '.$tax->tax_name.' ('.number_format($tax->tax_rate, 2).'%)',
            ])
            ->values();

        $categoryInventoryIds = $itemCategories->pluck('inventory_gl_account_id')->filter()->unique();
        $categoryPurchaseIds = $itemCategories->pluck('purchase_gl_account_id')->filter()->unique();
        $categorySalesIds = $itemCategories->pluck('sales_gl_account_id')->filter()->unique();
        $categoryCogsIds = $itemCategories->pluck('cogs_gl_account_id')->filter()->unique();

        $glAccountOptionsInventory = $this->glOptionsForItemField(
            $compId,
            $locationId,
            ['inventory'],
            $categoryInventoryIds,
            $itemForGlOptions?->inventory_gl_account_id
        );
        $glAccountOptionsPurchase = $this->glOptionsForItemField(
            $compId,
            $locationId,
            ['purchase'],
            $categoryPurchaseIds,
            $itemForGlOptions?->purchase_gl_account_id
        );
        $glAccountOptionsCogs = $this->glOptionsForItemField(
            $compId,
            $locationId,
            ['cost_of_goods_sold'],
            $categoryCogsIds,
            $itemForGlOptions?->cogs_gl_account_id
        );
        $glAccountOptionsSales = $this->glOptionsForItemField(
            $compId,
            $locationId,
            ['sales', 'service_income'],
            $categorySalesIds,
            $itemForGlOptions?->sales_gl_account_id
        );
        $glAccountOptionsWriteoff = $this->glOptionsForItemField(
            $compId,
            $locationId,
            ['other_expense', 'office_expense', 'maintenance_expense'],
            collect(),
            $itemForGlOptions?->writeoff_gl_account_id
        );
        $glAccountOptionsVariance = $this->glOptionsForItemField(
            $compId,
            $locationId,
            ['other_expense', 'office_expense', 'cost_of_goods_sold'],
            collect(),
            $itemForGlOptions?->price_variance_gl_account_id
        );

        $glAccountOptions = collect()
            ->concat($glAccountOptionsInventory)
            ->concat($glAccountOptionsPurchase)
            ->concat($glAccountOptionsCogs)
            ->concat($glAccountOptionsSales)
            ->concat($glAccountOptionsWriteoff)
            ->concat($glAccountOptionsVariance)
            ->unique('value')
            ->sortBy('label')
            ->values()
            ->all();

        $countryOptions = Country::active()
            ->get(['id', 'country_code', 'country_name'])
            ->map(fn ($country) => [
                'value' => (string) $country->id,
                'label' => $country->country_code.' - '.$country->country_name,
            ])
            ->values();

        $vendorOptions = ChartOfAccount::query()
            ->where('comp_id', $compId)
            ->where('party_type', 'vendor')
            ->where('status', 'Active')
            ->orderBy('account_code')
            ->get(['id', 'account_code', 'account_name'])
            ->map(fn ($row) => [
                'value' => (string) $row->id,
                'label' => $row->account_code.' - '.$row->account_name,
            ])
            ->values();

        return Inertia::render('Inventory/ItemMaster/Create', [
            'itemClassOptions' => $itemClassOptions,
            'itemCategoryOptions' => $itemCategoryOptions,
            'itemCategoryCoaById' => $itemCategoryCoaById,
            'itemGroupOptions' => $itemGroupOptions,
            'itemTypeOptions' => [
                ['value' => 'raw_material', 'label' => 'Raw Material'],
                ['value' => 'finished_good', 'label' => 'Finished Good'],
                ['value' => 'trading', 'label' => 'Trading'],
                ['value' => 'consumable', 'label' => 'Consumable'],
                ['value' => 'service', 'label' => 'Service (Non-Stock)'],
            ],
            'itemStatusOptions' => [
                ['value' => 'active', 'label' => 'Active'],
                ['value' => 'inactive', 'label' => 'Inactive'],
                ['value' => 'discontinued', 'label' => 'Discontinued'],
                ['value' => 'blocked', 'label' => 'Blocked'],
            ],
            'trackingModeOptions' => [
                ['value' => 'none', 'label' => 'None'],
                ['value' => 'lot', 'label' => 'Lot / Batch'],
                ['value' => 'serial', 'label' => 'Serial Number'],
            ],
            'costingMethodOptions' => [
                ['value' => 'fifo', 'label' => 'FIFO (First In, First Out)'],
                ['value' => 'weighted_avg', 'label' => 'Weighted Average'],
                ['value' => 'standard_cost', 'label' => 'Standard Cost'],
                ['value' => 'lifo', 'label' => 'LIFO (Last In, First Out)'],
            ],
            'uomOptions' => $uomOptions,
            'taxCategoryOptions' => $taxCategoryOptions,
            'temperatureClassOptions' => [
                ['value' => 'ambient', 'label' => 'Ambient (15-25°C)'],
                ['value' => 'chilled', 'label' => 'Chilled (0-8°C)'],
                ['value' => 'frozen', 'label' => 'Frozen (<-15°C)'],
                ['value' => 'controlled', 'label' => 'Controlled (Other)'],
            ],
            'countryOptions' => $countryOptions,
            'vendorOptions' => $vendorOptions,
            'glAccountOptions' => $glAccountOptions,
            'glAccountOptionsInventory' => $glAccountOptionsInventory,
            'glAccountOptionsPurchase' => $glAccountOptionsPurchase,
            'glAccountOptionsCogs' => $glAccountOptionsCogs,
            'glAccountOptionsSales' => $glAccountOptionsSales,
            'glAccountOptionsWriteoff' => $glAccountOptionsWriteoff,
            'glAccountOptionsVariance' => $glAccountOptionsVariance,
            'abcClassificationOptions' => [
                ['value' => 'a', 'label' => 'A (High Value)'],
                ['value' => 'b', 'label' => 'B (Medium Value)'],
                ['value' => 'c', 'label' => 'C (Low Value)'],
            ],
            'edit_mode' => false,
            'item' => null,
        ]);
    }

    /**
     * Store new item
     */
    public function store(Request $request)
    {
        $compId = $this->resolvedCompId($request);
        $locationId = $this->resolvedLocationId($request);

        if (! $compId || ! $locationId) {
            return back()->withErrors([
                'error' => 'Company and Location information is required.',
            ]);
        }

        // Validate input
        $validated = $request->validate([
            'item_code' => 'required|string|max:50|unique:inventory_items,item_code',
            'item_name_short' => 'required|string|max:50',
            'item_name_long' => 'nullable|string|max:250',
            'item_status' => 'required|in:active,inactive,discontinued,blocked',
            'item_type' => 'required|in:raw_material,finished_good,trading,consumable,service',
            'item_class_id' => 'required|exists:inventory_item_classes,id',
            'item_category_id' => 'required|exists:inventory_item_categories,id',
            'item_group_id' => 'nullable|exists:inventory_item_groups,id',
            'brand' => 'nullable|string|max:100',
            'tracking_mode' => 'required|in:none,lot,serial',
            'stock_uom_id' => 'required|exists:uom_masters,id',
            'purchase_uom_id' => 'required|exists:uom_masters,id',
            'sales_uom_id' => 'required|exists:uom_masters,id',
            'costing_method' => 'required|in:fifo,weighted_avg,standard_cost,lifo',
            'standard_cost' => 'nullable|numeric|min:0',
            'last_purchase_price' => 'nullable|numeric|min:0',
            'minimum_order_qty' => 'nullable|numeric|min:0',
            'reorder_point' => 'nullable|numeric|min:0',
            'safety_stock' => 'nullable|numeric|min:0',
            'maximum_stock_level' => 'nullable|numeric|min:0',
            'lead_time_days' => 'nullable|integer|min:0',
            'default_vendor_id' => [
                'nullable',
                Rule::exists('chart_of_accounts', 'id')->where(fn ($q) => $q->where('party_type', 'vendor')->where('comp_id', $compId)),
            ],
            'expiry_tracking' => 'boolean',
            'shelf_life_days' => 'nullable|integer|min:0',
            'expiry_basis' => 'nullable|in:manufacturing_date,receipt_date',
            'near_expiry_alert_days' => 'nullable|integer|min:0',
            'storage_temperature_class' => 'nullable|in:ambient,chilled,frozen,controlled',
            'hazardous_material' => 'boolean',
            'gross_weight_kg' => 'nullable|numeric|min:0',
            'net_weight_kg' => 'nullable|numeric|min:0',
            'volume_cbm' => 'nullable|numeric|min:0',
            'dimensions' => 'nullable|string|max:50',
            'tax_category_id' => 'required|exists:tax_categories,id',
            'hsn_code' => 'nullable|string|max:20',
            'hs_tariff_code' => 'nullable|string|max:10',
            'country_of_origin_id' => 'nullable|exists:countries,id',
            'barcode_gtin' => 'nullable|string|max:20|unique:inventory_items,barcode_gtin',
            'inventory_gl_account_id' => 'nullable|exists:chart_of_accounts,id',
            'purchase_gl_account_id' => 'nullable|exists:chart_of_accounts,id',
            'sales_gl_account_id' => 'nullable|exists:chart_of_accounts,id',
            'cogs_gl_account_id' => 'nullable|exists:chart_of_accounts,id',
            'writeoff_gl_account_id' => 'required|exists:chart_of_accounts,id',
            'price_variance_gl_account_id' => 'nullable|exists:chart_of_accounts,id',
            'abc_classification' => 'nullable|in:a,b,c',
            'slow_moving_threshold_days' => 'nullable|integer|min:0',
        ]);

        $this->categoryCostingAccounts->applyCategoryGlToItemPayload(
            $validated,
            (int) $validated['item_category_id'],
            (int) $compId,
            (int) $locationId
        );

        if (empty($validated['inventory_gl_account_id']) || empty($validated['cogs_gl_account_id'])) {
            return back()->withErrors([
                'item_category_id' => 'Set up costing accounts on the item category (save the category again) or choose Inventory and COGS GL accounts manually.',
            ])->withInput();
        }

        try {
            $item = new InventoryItem;
            $item->fill($validated);
            $item->comp_id = $compId;
            $item->location_id = $locationId;
            $item->is_active = $validated['item_status'] === 'active';
            $item->save();

            return redirect('/inventory/item-master')
                ->with('success', 'Item created successfully!');
        } catch (\Exception $e) {
            return back()->withErrors([
                'error' => 'Failed to create item: '.$e->getMessage(),
            ]);
        }
    }

    /**
     * Show edit form
     */
    public function edit($id, Request $request)
    {
        $compId = $this->resolvedCompId($request);
        $locationId = $this->resolvedLocationId($request);

        if (! $compId || ! $locationId) {
            return redirect('/inventory/item-master')
                ->with('error', 'Company and Location information is required.');
        }

        $item = InventoryItem::byCompanyAndLocation($compId, $locationId)
            ->find($id);

        if (! $item) {
            return redirect('/inventory/item-master')
                ->with('error', 'Item not found.');
        }

        return $this->create($request, $item)->with([
            'item' => $item,
            'edit_mode' => true,
        ]);
    }

    /**
     * Update item
     */
    public function update($id, Request $request)
    {
        $compId = $this->resolvedCompId($request);
        $locationId = $this->resolvedLocationId($request);

        if (! $compId || ! $locationId) {
            return back()->withErrors(['error' => 'Company and Location information is required.']);
        }

        $item = InventoryItem::byCompanyAndLocation($compId, $locationId)
            ->find($id);

        if (! $item) {
            return back()->withErrors(['error' => 'Item not found.']);
        }

        // Validate input (exclude item_code from unique check on this specific ID)
        $validated = $request->validate([
            'item_code' => 'required|string|max:50|unique:inventory_items,item_code,'.$id,
            'item_name_short' => 'required|string|max:50',
            'item_name_long' => 'nullable|string|max:250',
            'item_status' => 'required|in:active,inactive,discontinued,blocked',
            'item_type' => 'required|in:raw_material,finished_good,trading,consumable,service',
            'item_class_id' => 'required|exists:inventory_item_classes,id',
            'item_category_id' => 'required|exists:inventory_item_categories,id',
            'item_group_id' => 'nullable|exists:inventory_item_groups,id',
            'brand' => 'nullable|string|max:100',
            'tracking_mode' => 'required|in:none,lot,serial',
            'stock_uom_id' => 'required|exists:uom_masters,id',
            'purchase_uom_id' => 'required|exists:uom_masters,id',
            'sales_uom_id' => 'required|exists:uom_masters,id',
            'costing_method' => 'required|in:fifo,weighted_avg,standard_cost,lifo',
            'standard_cost' => 'nullable|numeric|min:0',
            'last_purchase_price' => 'nullable|numeric|min:0',
            'minimum_order_qty' => 'nullable|numeric|min:0',
            'reorder_point' => 'nullable|numeric|min:0',
            'safety_stock' => 'nullable|numeric|min:0',
            'maximum_stock_level' => 'nullable|numeric|min:0',
            'lead_time_days' => 'nullable|integer|min:0',
            'default_vendor_id' => [
                'nullable',
                Rule::exists('chart_of_accounts', 'id')->where(fn ($q) => $q->where('party_type', 'vendor')->where('comp_id', $compId)),
            ],
            'expiry_tracking' => 'boolean',
            'shelf_life_days' => 'nullable|integer|min:0',
            'expiry_basis' => 'nullable|in:manufacturing_date,receipt_date',
            'near_expiry_alert_days' => 'nullable|integer|min:0',
            'storage_temperature_class' => 'nullable|in:ambient,chilled,frozen,controlled',
            'hazardous_material' => 'boolean',
            'gross_weight_kg' => 'nullable|numeric|min:0',
            'net_weight_kg' => 'nullable|numeric|min:0',
            'volume_cbm' => 'nullable|numeric|min:0',
            'dimensions' => 'nullable|string|max:50',
            'tax_category_id' => 'required|exists:tax_categories,id',
            'hsn_code' => 'nullable|string|max:20',
            'hs_tariff_code' => 'nullable|string|max:10',
            'country_of_origin_id' => 'nullable|exists:countries,id',
            'barcode_gtin' => 'nullable|string|max:20|unique:inventory_items,barcode_gtin,'.$id,
            'inventory_gl_account_id' => 'nullable|exists:chart_of_accounts,id',
            'purchase_gl_account_id' => 'nullable|exists:chart_of_accounts,id',
            'sales_gl_account_id' => 'nullable|exists:chart_of_accounts,id',
            'cogs_gl_account_id' => 'nullable|exists:chart_of_accounts,id',
            'writeoff_gl_account_id' => 'required|exists:chart_of_accounts,id',
            'price_variance_gl_account_id' => 'nullable|exists:chart_of_accounts,id',
            'abc_classification' => 'nullable|in:a,b,c',
            'slow_moving_threshold_days' => 'nullable|integer|min:0',
        ]);

        $this->categoryCostingAccounts->applyCategoryGlToItemPayload(
            $validated,
            (int) $validated['item_category_id'],
            (int) $compId,
            (int) $locationId
        );

        if (empty($validated['inventory_gl_account_id']) || empty($validated['cogs_gl_account_id'])) {
            return back()->withErrors([
                'item_category_id' => 'Set up costing accounts on the item category (save the category again) or choose Inventory and COGS GL accounts manually.',
            ])->withInput();
        }

        try {
            $item->fill($validated);
            $item->is_active = $validated['item_status'] === 'active';
            $item->save();

            return redirect('/inventory/item-master')
                ->with('success', 'Item updated successfully!');
        } catch (\Exception $e) {
            return back()->withErrors([
                'error' => 'Failed to update item: '.$e->getMessage(),
            ]);
        }
    }

    /**
     * Delete item
     */
    public function destroy($id, Request $request)
    {
        $compId = $this->resolvedCompId($request);
        $locationId = $this->resolvedLocationId($request);

        if (! $compId || ! $locationId) {
            return back()->withErrors(['error' => 'Company and Location information is required.']);
        }

        $item = InventoryItem::byCompanyAndLocation($compId, $locationId)
            ->find($id);

        if (! $item) {
            return back()->withErrors(['error' => 'Item not found.']);
        }

        try {
            $item->delete();

            return redirect('/inventory/item-master')
                ->with('success', 'Item deleted successfully!');
        } catch (\Exception $e) {
            return back()->withErrors([
                'error' => 'Failed to delete item: '.$e->getMessage(),
            ]);
        }
    }

    /**
     * Bulk delete items
     */
    public function bulkDestroy(Request $request)
    {
        $compId = $this->resolvedCompId($request);
        $locationId = $this->resolvedLocationId($request);

        if (! $compId || ! $locationId) {
            return back()->withErrors(['error' => 'Company and Location information is required.']);
        }

        $ids = $request->input('ids', []);

        if (empty($ids)) {
            return back()->withErrors(['error' => 'No items selected.']);
        }

        try {
            InventoryItem::byCompanyAndLocation($compId, $locationId)
                ->whereIn('id', $ids)
                ->delete();

            return redirect('/inventory/item-master')
                ->with('success', count($ids).' item(s) deleted successfully!');
        } catch (\Exception $e) {
            return back()->withErrors([
                'error' => 'Failed to delete items: '.$e->getMessage(),
            ]);
        }
    }

    /**
     * Export to CSV
     */
    public function exportCsv(Request $request)
    {
        $compId = $this->resolvedCompId($request);
        $locationId = $this->resolvedLocationId($request);

        if (! $compId || ! $locationId) {
            return redirect('/inventory/item-master')
                ->with('error', 'Company and Location information is required.');
        }

        $items = InventoryItem::byCompanyAndLocation($compId, $locationId)
            ->with('itemClass', 'itemCategory')
            ->get();

        // Generate CSV
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename=items.csv',
        ];

        $callback = function () use ($items) {
            $file = fopen('php://output', 'w');

            // Header row
            fputcsv($file, ['Item Code', 'Item Name', 'Type', 'Class', 'Category', 'Costing Method', 'Status']);

            // Data rows
            foreach ($items as $item) {
                fputcsv($file, [
                    $item->item_code,
                    $item->item_name_short,
                    $item->item_type,
                    $item->itemClass->class_code ?? '',
                    $item->itemCategory->category_code ?? '',
                    strtoupper($item->costing_method),
                    $item->is_active ? 'Active' : 'Inactive',
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Select options for one Item Master GL field: accounts from account_configurations (by config_type),
     * plus category costing account ids and the current item's saved account (edit).
     *
     * @param  list<string>  $configTypes
     */
    private function glOptionsForItemField(
        int $compId,
        int $locationId,
        array $configTypes,
        Collection $categoryAccountIds,
        ?int $itemAccountId
    ): array {
        $accounts = $this->chartAccountsResolvedFromAccountConfiguration($compId, $locationId, $configTypes);
        $accounts = $this->mergeExtraChartAccountsByIds($accounts, $compId, $locationId, $categoryAccountIds);
        if ($itemAccountId) {
            $accounts = $this->mergeExtraChartAccountsByIds($accounts, $compId, $locationId, [$itemAccountId]);
        }

        return $this->chartAccountsToSelectOptions($accounts)->all();
    }

    /**
     * Resolve configured account_id rows into posting accounts (Level 4 under Level 3 parents when applicable).
     *
     * @param  list<string>  $configTypes
     * @return Collection<int, ChartOfAccount>
     */
    private function chartAccountsResolvedFromAccountConfiguration(int $compId, int $locationId, array $configTypes): Collection
    {
        if ($configTypes === [] || ! Schema::hasTable('account_configurations')) {
            return collect();
        }

        $accountIds = AccountConfiguration::query()
            ->active()
            ->byCompanyAndLocation($compId, $locationId)
            ->whereIn('config_type', $configTypes)
            ->whereNotNull('account_id')
            ->pluck('account_id')
            ->unique()
            ->filter()
            ->all();

        if ($accountIds === []) {
            return collect();
        }

        $roots = ChartOfAccount::query()
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->where('status', 'Active')
            ->whereIn('id', $accountIds)
            ->get();

        $out = collect();
        foreach ($roots as $acc) {
            $level = (int) $acc->account_level;
            if ($level === 4) {
                $out->push($acc);

                continue;
            }
            if ($level === 3) {
                $children = ChartOfAccount::query()
                    ->where('comp_id', $compId)
                    ->where('location_id', $locationId)
                    ->where('parent_account_id', $acc->id)
                    ->where('account_level', 4)
                    ->where('status', 'Active')
                    ->orderBy('account_code')
                    ->get();
                if ($children->isNotEmpty()) {
                    foreach ($children as $child) {
                        $out->push($child);
                    }
                } else {
                    $out->push($acc);
                }
            }
        }

        return $out->unique('id')->values();
    }

    /**
     * @param  iterable<int|string|null>  $ids
     * @return Collection<int, ChartOfAccount>
     */
    private function mergeExtraChartAccountsByIds(Collection $accounts, int $compId, int $locationId, iterable $ids): Collection
    {
        $existing = $accounts->keyBy('id');
        foreach ($ids as $rawId) {
            $id = (int) $rawId;
            if ($id <= 0 || $existing->has($id)) {
                continue;
            }
            $acc = ChartOfAccount::query()
                ->where('comp_id', $compId)
                ->where('location_id', $locationId)
                ->where('id', $id)
                ->where('status', 'Active')
                ->first();
            if ($acc) {
                $existing->put($id, $acc);
            }
        }

        return $existing->values();
    }

    /**
     * @param  Collection<int, ChartOfAccount>  $accounts
     * @return Collection<int, array{value: string, label: string}>
     */
    private function chartAccountsToSelectOptions(Collection $accounts): Collection
    {
        return $accounts
            ->sortBy('account_code')
            ->values()
            ->map(fn (ChartOfAccount $a) => [
                'value' => (string) $a->id,
                'label' => $a->account_code.' - '.$a->account_name,
            ]);
    }

    /**
     * Align with login session (user_comp_id / user_location_id) and MasterDataController.
     */
    private function resolvedCompId(Request $request): ?int
    {
        $raw = $request->input('comp_id')
            ?? $request->session()->get('comp_id')
            ?? $request->input('user_comp_id')
            ?? $request->session()->get('user_comp_id')
            ?? $request->user()?->comp_id;

        if ($raw === null || $raw === '') {
            return null;
        }

        return (int) $raw;
    }

    private function resolvedLocationId(Request $request): ?int
    {
        $raw = $request->input('location_id')
            ?? $request->session()->get('location_id')
            ?? $request->input('user_location_id')
            ?? $request->session()->get('user_location_id')
            ?? $request->user()?->location_id;

        if ($raw === null || $raw === '') {
            return null;
        }

        return (int) $raw;
    }
}

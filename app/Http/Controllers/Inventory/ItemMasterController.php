<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\InventoryItem;
use App\Models\InventoryItemClass;
use App\Models\InventoryItemCategory;
use App\Models\InventoryItemGroup;
use App\Models\UomMaster;
use App\Models\TaxCategory;
use App\Models\ChartOfAccount;
use App\Models\Vendor;
use App\Models\Country;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ItemMasterController extends Controller
{
    /**
     * Display list of items
     */
    public function list(Request $request)
    {
        $compId = $request->input('comp_id') ?? $request->session()->get('comp_id');
        $locationId = $request->input('location_id') ?? $request->session()->get('location_id');

        if (!$compId || !$locationId) {
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
    public function create(Request $request)
    {
        $compId = $request->input('comp_id') ?? $request->session()->get('comp_id');
        $locationId = $request->input('location_id') ?? $request->session()->get('location_id');

        if (!$compId || !$locationId) {
            return Inertia::render('Inventory/ItemMaster/Create', [
                'error' => 'Company and Location information is required.',
                'itemClassOptions' => [],
                'itemCategoryOptions' => [],
                'itemGroupOptions' => [],
                'itemTypeOptions' => [],
                'uomOptions' => [],
                'taxCategoryOptions' => [],
                'glAccountOptions' => [],
            ]);
        }

        $itemClassOptions = InventoryItemClass::byCompanyAndLocation($compId, $locationId)
            ->active()
            ->orderBy('display_order')
            ->get(['id', 'class_code', 'class_name'])
            ->map(fn ($itemClass) => [
                'value' => (string) $itemClass->id,
                'label' => $itemClass->class_code . ' - ' . $itemClass->class_name,
            ])
            ->values();

        $itemCategoryOptions = InventoryItemCategory::byCompanyAndLocation($compId, $locationId)
            ->active()
            ->orderBy('display_order')
            ->get(['id', 'category_code', 'category_name'])
            ->map(fn ($category) => [
                'value' => (string) $category->id,
                'label' => $category->category_code . ' - ' . $category->category_name,
            ])
            ->values();

        $itemGroupOptions = InventoryItemGroup::byCompanyAndLocation($compId, $locationId)
            ->active()
            ->orderBy('display_order')
            ->get(['id', 'group_code', 'group_name'])
            ->map(fn ($group) => [
                'value' => (string) $group->id,
                'label' => $group->group_code . ' - ' . $group->group_name,
            ])
            ->values();

        $uomOptions = UomMaster::byCompany($compId)
            ->active()
            ->orderBy('display_order')
            ->get(['id', 'uom_code', 'uom_name'])
            ->map(fn ($uom) => [
                'value' => (string) $uom->id,
                'label' => $uom->uom_code . ' - ' . $uom->uom_name,
            ])
            ->values();

        $taxCategoryOptions = TaxCategory::byCompany($compId)
            ->active()
            ->get(['id', 'tax_code', 'tax_name', 'tax_rate'])
            ->map(fn ($tax) => [
                'value' => (string) $tax->id,
                'label' => $tax->tax_code . ' - ' . $tax->tax_name . ' (' . number_format($tax->tax_rate, 2) . '%)',
            ])
            ->values();

        $glAccountOptions = ChartOfAccount::where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->where('status', true)
            ->get(['id', 'account_code', 'account_name'])
            ->map(fn ($account) => [
                'value' => (string) $account->id,
                'label' => $account->account_code . ' - ' . $account->account_name,
            ])
            ->values();

        $countryOptions = Country::active()
            ->get(['id', 'country_code', 'country_name'])
            ->map(fn ($country) => [
                'value' => (string) $country->id,
                'label' => $country->country_code . ' - ' . $country->country_name,
            ])
            ->values();

        $vendorOptions = Vendor::byCompany($compId)
            ->active()
            ->get(['id', 'vendor_code', 'vendor_name'])
            ->map(fn ($vendor) => [
                'value' => (string) $vendor->id,
                'label' => $vendor->vendor_code . ' - ' . $vendor->vendor_name,
            ])
            ->values();

        return Inertia::render('Inventory/ItemMaster/Create', [
            'itemClassOptions' => $itemClassOptions,
            'itemCategoryOptions' => $itemCategoryOptions,
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
        $compId = $request->input('comp_id') ?? $request->session()->get('comp_id');
        $locationId = $request->input('location_id') ?? $request->session()->get('location_id');

        if (!$compId || !$locationId) {
            return back()->withErrors([
                'error' => 'Company and Location information is required.'
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
            'default_vendor_id' => 'nullable|exists:vendors,id',
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
            'inventory_gl_account_id' => 'required|exists:chart_of_accounts,id',
            'cogs_gl_account_id' => 'required|exists:chart_of_accounts,id',
            'writeoff_gl_account_id' => 'required|exists:chart_of_accounts,id',
            'price_variance_gl_account_id' => 'nullable|exists:chart_of_accounts,id',
            'abc_classification' => 'nullable|in:a,b,c',
            'slow_moving_threshold_days' => 'nullable|integer|min:0',
        ]);

        try {
            $item = new InventoryItem();
            $item->fill($validated);
            $item->comp_id = $compId;
            $item->location_id = $locationId;
            $item->is_active = $validated['item_status'] === 'active';
            $item->save();

            return redirect('/inventory/item-master')
                ->with('success', 'Item created successfully!');
        } catch (\Exception $e) {
            return back()->withErrors([
                'error' => 'Failed to create item: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Show edit form
     */
    public function edit($id, Request $request)
    {
        $compId = $request->input('comp_id') ?? $request->session()->get('comp_id');
        $locationId = $request->input('location_id') ?? $request->session()->get('location_id');

        $item = InventoryItem::byCompanyAndLocation($compId, $locationId)
            ->find($id);

        if (!$item) {
            return redirect('/inventory/item-master')
                ->with('error', 'Item not found.');
        }

        // Reuse create() logic to get options
        return $this->create($request)->with([
            'item' => $item,
            'edit_mode' => true,
        ]);
    }

    /**
     * Update item
     */
    public function update($id, Request $request)
    {
        $compId = $request->input('comp_id') ?? $request->session()->get('comp_id');
        $locationId = $request->input('location_id') ?? $request->session()->get('location_id');

        $item = InventoryItem::byCompanyAndLocation($compId, $locationId)
            ->find($id);

        if (!$item) {
            return back()->withErrors(['error' => 'Item not found.']);
        }

        // Validate input (exclude item_code from unique check on this specific ID)
        $validated = $request->validate([
            'item_code' => 'required|string|max:50|unique:inventory_items,item_code,' . $id,
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
            'default_vendor_id' => 'nullable|exists:vendors,id',
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
            'barcode_gtin' => 'nullable|string|max:20|unique:inventory_items,barcode_gtin,' . $id,
            'inventory_gl_account_id' => 'required|exists:chart_of_accounts,id',
            'cogs_gl_account_id' => 'required|exists:chart_of_accounts,id',
            'writeoff_gl_account_id' => 'required|exists:chart_of_accounts,id',
            'price_variance_gl_account_id' => 'nullable|exists:chart_of_accounts,id',
            'abc_classification' => 'nullable|in:a,b,c',
            'slow_moving_threshold_days' => 'nullable|integer|min:0',
        ]);

        try {
            $item->fill($validated);
            $item->is_active = $validated['item_status'] === 'active';
            $item->save();

            return redirect('/inventory/item-master')
                ->with('success', 'Item updated successfully!');
        } catch (\Exception $e) {
            return back()->withErrors([
                'error' => 'Failed to update item: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Delete item
     */
    public function destroy($id, Request $request)
    {
        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');
        $locationId = $request->input('user_location_id') ?? $request->session()->get('user_location_id');

        $item = InventoryItem::byCompanyAndLocation($compId, $locationId)
            ->find($id);

        if (!$item) {
            return back()->withErrors(['error' => 'Item not found.']);
        }

        try {
            $item->delete();
            return redirect('/inventory/item-master')
                ->with('success', 'Item deleted successfully!');
        } catch (\Exception $e) {
            return back()->withErrors([
                'error' => 'Failed to delete item: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Bulk delete items
     */
    public function bulkDestroy(Request $request)
    {
        $compId = $request->input('comp_id') ?? $request->session()->get('comp_id');
        $locationId = $request->input('location_id') ?? $request->session()->get('location_id');

        $ids = $request->input('ids', []);

        if (empty($ids)) {
            return back()->withErrors(['error' => 'No items selected.']);
        }

        try {
            InventoryItem::byCompanyAndLocation($compId, $locationId)
                ->whereIn('id', $ids)
                ->delete();

            return redirect('/inventory/item-master')
                ->with('success', count($ids) . ' item(s) deleted successfully!');
        } catch (\Exception $e) {
            return back()->withErrors([
                'error' => 'Failed to delete items: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Export to CSV
     */
    public function exportCsv(Request $request)
    {
        $compId = $request->input('comp_id') ?? $request->session()->get('comp_id');
        $locationId = $request->input('location_id') ?? $request->session()->get('location_id');

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

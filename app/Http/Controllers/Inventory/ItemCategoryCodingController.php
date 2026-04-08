<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\InventoryItemCategory;
use App\Models\InventoryItemClass;
use App\Services\Inventory\ItemCategoryCostingAccountService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ItemCategoryCodingController extends Controller
{
    public function __construct(
        private ItemCategoryCostingAccountService $categoryCostingAccounts
    ) {}

    // Display list of item categories
    public function list(Request $request)
    {
        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');
        $locationId = $request->input('user_location_id') ?? $request->session()->get('user_location_id');

        if (! $compId || ! $locationId) {
            return Inertia::render('Inventory/ItemCategoryCoding/List', [
                'error' => 'Company and Location information is required.',
                'categories' => [],
            ]);
        }

        $search = $request->input('search');
        $status = $request->input('status');
        $sortBy = $request->input('sort_by', 'category_code');
        $sortDirection = $request->input('sort_direction', 'asc');
        $perPage = $request->input('per_page', 25);

        $query = InventoryItemCategory::byCompanyAndLocation($compId, $locationId)
            ->with([
                'itemClass:id,class_code,class_name',
                'inventoryGlAccount:id,account_code,account_name',
                'purchaseGlAccount:id,account_code,account_name',
                'salesGlAccount:id,account_code,account_name',
                'cogsGlAccount:id,account_code,account_name',
            ]);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('category_code', 'like', "%{$search}%")
                    ->orWhere('category_name', 'like', "%{$search}%");
            });
        }

        if ($status !== null && $status !== 'all') {
            $query->where('is_active', $status == '1');
        }

        $categories = $query->orderBy($sortBy, $sortDirection)
            ->paginate($perPage)
            ->appends($request->query());

        return Inertia::render('Inventory/ItemCategoryCoding/List', [
            'categories' => $categories,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'sort_by' => $sortBy,
                'sort_direction' => $sortDirection,
                'per_page' => $perPage,
            ],
        ]);
    }

    // Show create form
    public function create(Request $request)
    {
        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');
        $locationId = $request->input('user_location_id') ?? $request->session()->get('user_location_id');

        if (! $compId || ! $locationId) {
            return Inertia::render('Inventory/ItemCategoryCoding/Create', [
                'error' => 'Company and Location information is required.',
                'itemClassOptions' => [],
                'costingConfigurationStatus' => [],
            ]);
        }

        $itemClassOptions = InventoryItemClass::byCompanyAndLocation($compId, $locationId)
            ->orderBy('class_code')
            ->get(['id', 'class_code', 'class_name'])
            ->map(fn ($itemClass) => [
                'value' => (string) $itemClass->id,
                'label' => $itemClass->class_code.' - '.$itemClass->class_name,
            ])
            ->values();

        return Inertia::render('Inventory/ItemCategoryCoding/Create', [
            'itemClassOptions' => $itemClassOptions,
            'edit_mode' => false,
            'category' => null,
            'costingConfigurationStatus' => $this->categoryCostingAccounts->costingConfigurationStatus((int) $compId, (int) $locationId),
        ]);
    }

    // Store new category
    public function store(Request $request)
    {
        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');
        $locationId = $request->input('user_location_id') ?? $request->session()->get('user_location_id');

        if (! $compId || ! $locationId) {
            return back()->withErrors([
                'error' => 'Company and Location information is required.',
            ]);
        }

        $validated = $request->validate([
            'category_code' => [
                'required',
                'string',
                'max:30',
                Rule::unique('inventory_item_categories', 'category_code')
                    ->where(fn ($query) => $query
                        ->where('comp_id', $compId)
                        ->where('location_id', $locationId)
                        ->whereNull('deleted_at')),
            ],
            'category_name' => 'required|string|max:150',
            'item_class_id' => [
                'required',
                'integer',
                Rule::exists('inventory_item_classes', 'id')->where(fn ($query) => $query
                    ->where('comp_id', $compId)
                    ->where('location_id', $locationId)
                    ->whereNull('deleted_at')),
            ],
            'description' => 'nullable|string|max:500',
            'is_active' => 'nullable|boolean',
        ]);

        // Create category
        $category = InventoryItemCategory::create([
            'comp_id' => $compId,
            'location_id' => $locationId,
            'category_code' => strtoupper(trim($validated['category_code'])),
            'category_name' => trim($validated['category_name']),
            'item_class_id' => $validated['item_class_id'],
            'description' => $validated['description'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        try {
            $this->categoryCostingAccounts->ensureCostingHeads($category);
        } catch (\Throwable $e) {
            return redirect()->route('inventory.item-category-coding.list')
                ->with('error', 'Category was saved, but Chart of Accounts costing heads were not created. '.$e->getMessage());
        }

        return redirect()->route('inventory.item-category-coding.list')
            ->with('success', 'Item category created successfully. Costing accounts were added to Chart of Accounts and linked.');
    }

    // Show edit form
    public function edit(Request $request, $id)
    {
        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');
        $locationId = $request->input('user_location_id') ?? $request->session()->get('user_location_id');

        $category = InventoryItemCategory::byCompanyAndLocation($compId, $locationId)
            ->with([
                'inventoryGlAccount:id,account_code,account_name',
                'purchaseGlAccount:id,account_code,account_name',
                'salesGlAccount:id,account_code,account_name',
                'cogsGlAccount:id,account_code,account_name',
            ])
            ->findOrFail($id);

        $itemClassOptions = InventoryItemClass::byCompanyAndLocation($compId, $locationId)
            ->orderBy('class_code')
            ->get(['id', 'class_code', 'class_name'])
            ->map(fn ($itemClass) => [
                'value' => (string) $itemClass->id,
                'label' => $itemClass->class_code.' - '.$itemClass->class_name,
            ])
            ->values();

        return Inertia::render('Inventory/ItemCategoryCoding/Create', [
            'category' => $category,
            'itemClassOptions' => $itemClassOptions,
            'edit_mode' => true,
            'costingConfigurationStatus' => $this->categoryCostingAccounts->costingConfigurationStatus((int) $compId, (int) $locationId),
        ]);
    }

    // Update category
    public function update(Request $request, $id)
    {
        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');
        $locationId = $request->input('user_location_id') ?? $request->session()->get('user_location_id');

        $category = InventoryItemCategory::byCompanyAndLocation($compId, $locationId)
            ->findOrFail($id);

        $validated = $request->validate([
            'category_code' => [
                'required',
                'string',
                'max:30',
                Rule::unique('inventory_item_categories', 'category_code')
                    ->ignore($id)
                    ->where(fn ($query) => $query
                        ->where('comp_id', $compId)
                        ->where('location_id', $locationId)
                        ->whereNull('deleted_at')),
            ],
            'category_name' => 'required|string|max:150',
            'item_class_id' => [
                'required',
                'integer',
                Rule::exists('inventory_item_classes', 'id')->where(fn ($query) => $query
                    ->where('comp_id', $compId)
                    ->where('location_id', $locationId)
                    ->whereNull('deleted_at')),
            ],
            'description' => 'nullable|string|max:500',
            'is_active' => 'nullable|boolean',
        ]);

        $category->update([
            'category_code' => strtoupper(trim($validated['category_code'])),
            'category_name' => trim($validated['category_name']),
            'item_class_id' => $validated['item_class_id'],
            'description' => $validated['description'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        try {
            $this->categoryCostingAccounts->ensureCostingHeads($category->fresh());
        } catch (\Throwable $e) {
            return redirect()->route('inventory.item-category-coding.list')
                ->with('error', 'Category was updated, but costing accounts were not created or refreshed. '.$e->getMessage());
        }

        return redirect()->route('inventory.item-category-coding.list')
            ->with('success', 'Item category updated successfully. Costing accounts are linked; items in this category were synced where applicable.');
    }

    // Delete category
    public function destroy(Request $request, $id)
    {
        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');
        $locationId = $request->input('user_location_id') ?? $request->session()->get('user_location_id');

        $category = InventoryItemCategory::byCompanyAndLocation($compId, $locationId)
            ->findOrFail($id);

        $categoryName = $category->category_name;
        $category->delete();

        return response()->json([
            'success' => true,
            'message' => "Category '{$categoryName}' deleted successfully.",
        ]);
    }
}

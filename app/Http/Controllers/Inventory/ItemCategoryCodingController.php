<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\InventoryItemCategory;
use App\Models\InventoryItemClass;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ItemCategoryCodingController extends Controller
{
    // Display list of item categories
    public function list(Request $request)
    {
        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');
        $locationId = $request->input('user_location_id') ?? $request->session()->get('user_location_id');

        if (!$compId || !$locationId) {
            return Inertia::render('Inventory/ItemCategoryCoding/List', [
                'error' => 'Company and Location information is required.',
                'categories' => [],
            ]);
        }

        $search = $request->input('search');
        $status = $request->input('status');
        $inventoryType = $request->input('inventory_type');
        $sortBy = $request->input('sort_by', 'category_code');
        $sortDirection = $request->input('sort_direction', 'asc');
        $perPage = $request->input('per_page', 25);

        $query = InventoryItemCategory::byCompanyAndLocation($compId, $locationId);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('category_code', 'like', "%{$search}%")
                  ->orWhere('category_name', 'like', "%{$search}%");
            });
        }

        if ($status !== null && $status !== 'all') {
            $query->where('is_active', $status == '1');
        }

        if ($inventoryType && $inventoryType !== 'all') {
            $query->where('inventory_type', $inventoryType);
        }

        $categories = $query->orderBy($sortBy, $sortDirection)
            ->paginate($perPage)
            ->appends($request->query());

        return Inertia::render('Inventory/ItemCategoryCoding/List', [
            'categories' => $categories,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'inventory_type' => $inventoryType,
                'sort_by' => $sortBy,
                'sort_direction' => $sortDirection,
                'per_page' => $perPage,
            ],
            'inventoryTypeOptions' => InventoryItemCategory::inventoryTypeOptions(),
        ]);
    }

    // Show create form
    public function create(Request $request)
    {
        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');
        $locationId = $request->input('user_location_id') ?? $request->session()->get('user_location_id');

        if (!$compId || !$locationId) {
            return Inertia::render('Inventory/ItemCategoryCoding/Create', [
                'error' => 'Company and Location information is required.',
                'inventoryTypeOptions' => InventoryItemCategory::inventoryTypeOptions(),
                'valuationMethodOptions' => InventoryItemCategory::valuationMethodOptions(),
                'trackingTypeOptions' => InventoryItemClass::trackingTypeOptions(),
                'abcClassificationOptions' => InventoryItemClass::abcClassificationOptions(),
            ]);
        }

        return Inertia::render('Inventory/ItemCategoryCoding/Create', [
            'inventoryTypeOptions' => InventoryItemCategory::inventoryTypeOptions(),
            'valuationMethodOptions' => InventoryItemCategory::valuationMethodOptions(),
            'trackingTypeOptions' => InventoryItemClass::trackingTypeOptions(),
            'abcClassificationOptions' => InventoryItemClass::abcClassificationOptions(),
            'edit_mode' => false,
            'category' => null,
        ]);
    }

    // Store new category
    public function store(Request $request)
    {
        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');
        $locationId = $request->input('user_location_id') ?? $request->session()->get('user_location_id');

        if (!$compId || !$locationId) {
            return back()->withErrors([
                'error' => 'Company and Location information is required.'
            ]);
        }

        $inventoryTypeValues = collect(InventoryItemCategory::inventoryTypeOptions())
            ->pluck('value')
            ->toArray();

        $valuationMethodValues = collect(InventoryItemCategory::valuationMethodOptions())
            ->pluck('value')
            ->toArray();

        $trackingTypeValues = collect(InventoryItemClass::trackingTypeOptions())
            ->pluck('value')
            ->toArray();

        $abcValues = collect(InventoryItemClass::abcClassificationOptions())
            ->pluck('value')
            ->toArray();

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
            'inventory_type' => 'required|in:' . implode(',', $inventoryTypeValues),
            'valuation_method' => 'required|in:' . implode(',', $valuationMethodValues),
            'description' => 'nullable|string|max:500',
            'is_active' => 'nullable|boolean',
            'classes' => 'nullable|string',
        ]);

        // Create category
        $category = InventoryItemCategory::create([
            'comp_id' => $compId,
            'location_id' => $locationId,
            'category_code' => strtoupper(trim($validated['category_code'])),
            'category_name' => trim($validated['category_name']),
            'inventory_type' => $validated['inventory_type'],
            'valuation_method' => $validated['valuation_method'],
            'description' => $validated['description'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        // Create classes if provided
        $classCount = 0;
        if (!empty($validated['classes'])) {
            $classes = json_decode($validated['classes'], true);
            if (is_array($classes)) {
                $classIds = [];
                foreach ($classes as $classData) {
                    if (!empty($classData['class_code']) && !empty($classData['class_name'])) {
                        $class = InventoryItemClass::create([
                            'comp_id' => $compId,
                            'location_id' => $locationId,
                            'class_code' => strtoupper(trim($classData['class_code'])),
                            'class_name' => trim($classData['class_name']),
                            'tracking_type' => $classData['tracking_type'] ?? 'none',
                            'abc_classification' => $classData['abc_classification'] ?? 'B',
                            'description' => $classData['description'] ?? null,
                            'is_active' => $classData['is_active'] ?? true,
                        ]);
                        $classIds[] = $class->id;
                        $classCount++;
                    }
                }
                
                // Attach classes to category via pivot table
                if (!empty($classIds)) {
                    $category->classes()->attach($classIds);
                }
            }
        }

        $message = 'Item category created successfully';
        if ($classCount > 0) {
            $message .= ' with ' . $classCount . ' classes';
        }
        $message .= '.';

        return redirect()->route('inventory.item-category-coding.list')
            ->with('success', $message);
    }

    // Show edit form
    public function edit(Request $request, $id)
    {
        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');
        $locationId = $request->input('user_location_id') ?? $request->session()->get('user_location_id');

        $category = InventoryItemCategory::byCompanyAndLocation($compId, $locationId)
            ->findOrFail($id);

        // Get related classes through pivot table
        $relatedClasses = $category->classes()
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->get();

        return Inertia::render('Inventory/ItemCategoryCoding/Edit', [
            'category' => $category,
            'relatedClasses' => $relatedClasses,
            'inventoryTypeOptions' => InventoryItemCategory::inventoryTypeOptions(),
            'valuationMethodOptions' => InventoryItemCategory::valuationMethodOptions(),
            'edit_mode' => true,
        ]);
    }

    // Update category
    public function update(Request $request, $id)
    {
        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');
        $locationId = $request->input('user_location_id') ?? $request->session()->get('user_location_id');

        $category = InventoryItemCategory::byCompanyAndLocation($compId, $locationId)
            ->findOrFail($id);

        $inventoryTypeValues = collect(InventoryItemCategory::inventoryTypeOptions())
            ->pluck('value')
            ->toArray();

        $valuationMethodValues = collect(InventoryItemCategory::valuationMethodOptions())
            ->pluck('value')
            ->toArray();

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
            'inventory_type' => 'required|in:' . implode(',', $inventoryTypeValues),
            'valuation_method' => 'required|in:' . implode(',', $valuationMethodValues),
            'description' => 'nullable|string|max:500',
            'is_active' => 'nullable|boolean',
        ]);

        $category->update([
            'category_code' => strtoupper(trim($validated['category_code'])),
            'category_name' => trim($validated['category_name']),
            'inventory_type' => $validated['inventory_type'],
            'valuation_method' => $validated['valuation_method'],
            'description' => $validated['description'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return redirect()->route('inventory.item-category-coding.list')
            ->with('success', 'Item category updated successfully.');
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

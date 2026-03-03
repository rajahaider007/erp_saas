<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\InventoryItemCategory;
use App\Models\InventoryItemClass;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ItemClassCodingController extends Controller
{
    public function list(Request $request)
    {
        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');
        $locationId = $request->input('user_location_id') ?? $request->session()->get('user_location_id');

        if (!$compId || !$locationId) {
            return Inertia::render('Inventory/ItemClassCoding/List', [
                'items' => [],
                'total' => 0,
                'filters' => [],
            ]);
        }

        $query = InventoryItemClass::query()
            ->where('comp_id', $compId)
            ->where('location_id', $locationId);

        // Search by class_code or class_name
        if ($request->filled('search')) {
            $search = '%' . $request->input('search') . '%';
            $query->where(function ($q) use ($search) {
                $q->where('class_code', 'like', $search)
                  ->orWhere('class_name', 'like', $search);
            });
        }

        // Filter by tracking type
        if ($request->filled('tracking_type')) {
            $query->where('tracking_type', $request->input('tracking_type'));
        }

        // Filter by ABC classification
        if ($request->filled('abc_classification')) {
            $query->where('abc_classification', $request->input('abc_classification'));
        }

        // Filter by status
        if ($request->filled('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        // Sorting
        $sortBy = $request->input('sort_by', 'class_code');
        $sortOrder = $request->input('sort_order', 'asc');
        $query->orderBy($sortBy, $sortOrder);

        $items = $query->paginate(15);

        return Inertia::render('Inventory/ItemClassCoding/List', [
            'items' => $items,
            'filters' => [
                'search' => $request->input('search'),
                'tracking_type' => $request->input('tracking_type'),
                'abc_classification' => $request->input('abc_classification'),
                'is_active' => $request->input('is_active'),
                'sort_by' => $sortBy,
                'sort_order' => $sortOrder,
            ],
            'trackingTypeOptions' => InventoryItemClass::trackingTypeOptions(),
            'abcClassificationOptions' => InventoryItemClass::abcClassificationOptions(),
        ]);
    }

    public function create(Request $request)
    {
        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');
        $locationId = $request->input('user_location_id') ?? $request->session()->get('user_location_id');

        if (!$compId || !$locationId) {
            return Inertia::render('Inventory/ItemClassCoding/Create', [
                'error' => 'Company and Location information is required.',
                'trackingTypeOptions' => InventoryItemClass::trackingTypeOptions(),
                'abcClassificationOptions' => InventoryItemClass::abcClassificationOptions(),
            ]);
        }

        return Inertia::render('Inventory/ItemClassCoding/Create', [
            'trackingTypeOptions' => InventoryItemClass::trackingTypeOptions(),
            'abcClassificationOptions' => InventoryItemClass::abcClassificationOptions(),
        ]);
    }

    public function store(Request $request)
    {
        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');
        $locationId = $request->input('user_location_id') ?? $request->session()->get('user_location_id');

        if (!$compId || !$locationId) {
            return back()->withErrors([
                'error' => 'Company and Location information is required.'
            ]);
        }

        $trackingTypeValues = collect(InventoryItemClass::trackingTypeOptions())
            ->pluck('value')
            ->toArray();

        $abcValues = collect(InventoryItemClass::abcClassificationOptions())
            ->pluck('value')
            ->toArray();

        $validated = $request->validate([
            'class_code' => [
                'required',
                'string',
                'max:30',
                Rule::unique('inventory_item_classes', 'class_code')
                    ->where(fn ($query) => $query
                        ->where('comp_id', $compId)
                        ->where('location_id', $locationId)
                        ->whereNull('deleted_at')),
            ],
            'class_name' => 'required|string|max:150',
            'tracking_type' => 'required|in:' . implode(',', $trackingTypeValues),
            'abc_classification' => 'required|in:' . implode(',', $abcValues),
            'description' => 'nullable|string|max:500',
            'is_active' => 'nullable|boolean',
        ]);

        InventoryItemClass::create([
            'comp_id' => $compId,
            'location_id' => $locationId,
            'class_code' => strtoupper(trim($validated['class_code'])),
            'class_name' => trim($validated['class_name']),
            'tracking_type' => $validated['tracking_type'],
            'abc_classification' => $validated['abc_classification'],
            'description' => $validated['description'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return redirect()->route('inventory.item-class-coding.list')
            ->with('success', 'Item class created successfully.');
    }

    public function edit(Request $request, $id)
    {
        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');
        $locationId = $request->input('user_location_id') ?? $request->session()->get('user_location_id');

        if (!$compId || !$locationId) {
            return back()->withErrors(['error' => 'Company and Location information is required.']);
        }

        $itemClass = InventoryItemClass::where('id', $id)
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->first();

        if (!$itemClass) {
            return back()->withErrors(['error' => 'Item class not found.']);
        }

        return Inertia::render('Inventory/ItemClassCoding/Edit', [
            'itemClass' => $itemClass,
            'trackingTypeOptions' => InventoryItemClass::trackingTypeOptions(),
            'abcClassificationOptions' => InventoryItemClass::abcClassificationOptions(),
        ]);
    }

    public function update(Request $request, $id)
    {
        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');
        $locationId = $request->input('user_location_id') ?? $request->session()->get('user_location_id');

        if (!$compId || !$locationId) {
            return back()->withErrors(['error' => 'Company and Location information is required.']);
        }

        $itemClass = InventoryItemClass::where('id', $id)
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->first();

        if (!$itemClass) {
            return back()->withErrors(['error' => 'Item class not found.']);
        }

        $trackingTypeValues = collect(InventoryItemClass::trackingTypeOptions())
            ->pluck('value')
            ->toArray();

        $abcValues = collect(InventoryItemClass::abcClassificationOptions())
            ->pluck('value')
            ->toArray();

        $validated = $request->validate([
            'class_code' => [
                'required',
                'string',
                'max:30',
                Rule::unique('inventory_item_classes', 'class_code')
                    ->ignore($itemClass->id),
            ],
            'class_name' => 'required|string|max:150',
            'tracking_type' => 'required|in:' . implode(',', $trackingTypeValues),
            'abc_classification' => 'required|in:' . implode(',', $abcValues),
            'description' => 'nullable|string|max:500',
            'is_active' => 'nullable|boolean',
        ]);

        $itemClass->update([
            'class_code' => strtoupper(trim($validated['class_code'])),
            'class_name' => trim($validated['class_name']),
            'tracking_type' => $validated['tracking_type'],
            'abc_classification' => $validated['abc_classification'],
            'description' => $validated['description'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return redirect()->route('inventory.item-class-coding.list')
            ->with('success', 'Item class updated successfully.');
    }

    public function destroy(Request $request, $id)
    {
        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');
        $locationId = $request->input('user_location_id') ?? $request->session()->get('user_location_id');

        if (!$compId || !$locationId) {
            if ($request->expectsJson()) {
                return response()->json(['error' => 'Company and Location information is required.'], 400);
            }
            return back()->withErrors(['error' => 'Company and Location information is required.']);
        }

        $itemClass = InventoryItemClass::where('id', $id)
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->first();

        if (!$itemClass) {
            if ($request->expectsJson()) {
                return response()->json(['error' => 'Item class not found.'], 404);
            }
            return back()->withErrors(['error' => 'Item class not found.']);
        }

        $itemClass->delete();

        if ($request->expectsJson()) {
            return response()->json(['message' => 'Item class deleted successfully.']);
        }

        return redirect()->route('inventory.item-class-coding.list')
            ->with('success', 'Item class deleted successfully.');
    }
}

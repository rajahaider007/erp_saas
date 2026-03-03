<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\InventoryItemGroup;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ItemGroupCodingController extends Controller
{
    public function list(Request $request)
    {
        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');
        $locationId = $request->input('user_location_id') ?? $request->session()->get('user_location_id');

        if (!$compId || !$locationId) {
            return Inertia::render('Inventory/ItemGroupCoding/List', [
                'items' => [],
                'total' => 0,
                'filters' => [],
            ]);
        }

        $query = InventoryItemGroup::query()
            ->where('comp_id', $compId)
            ->where('location_id', $locationId);

        // Search by group_code or group_name
        if ($request->filled('search')) {
            $search = '%' . $request->input('search') . '%';
            $query->where(function ($q) use ($search) {
                $q->where('group_code', 'like', $search)
                  ->orWhere('group_name', 'like', $search);
            });
        }

        // Filter by status
        if ($request->filled('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        // Sorting
        $sortBy = $request->input('sort_by', 'group_code');
        $sortOrder = $request->input('sort_order', 'asc');
        $query->orderBy($sortBy, $sortOrder);

        $items = $query->paginate(15);

        return Inertia::render('Inventory/ItemGroupCoding/List', [
            'items' => $items,
            'filters' => [
                'search' => $request->input('search'),
                'is_active' => $request->input('is_active'),
                'sort_by' => $sortBy,
                'sort_order' => $sortOrder,
            ],
        ]);
    }

    public function create(Request $request)
    {
        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');
        $locationId = $request->input('user_location_id') ?? $request->session()->get('user_location_id');

        if (!$compId || !$locationId) {
            return Inertia::render('Inventory/ItemGroupCoding/Create', [
                'error' => 'Company and Location information is required.',
            ]);
        }

        return Inertia::render('Inventory/ItemGroupCoding/Create');
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

        $validated = $request->validate([
            'group_code' => [
                'required',
                'string',
                'max:30',
                Rule::unique('inventory_item_groups', 'group_code')
                    ->where(fn ($query) => $query
                        ->where('comp_id', $compId)
                        ->where('location_id', $locationId)
                        ->whereNull('deleted_at')),
            ],
            'group_name' => 'required|string|max:150',
            'description' => 'nullable|string|max:500',
            'is_active' => 'nullable|boolean',
        ]);

        InventoryItemGroup::create([
            'comp_id' => $compId,
            'location_id' => $locationId,
            'group_code' => strtoupper(trim($validated['group_code'])),
            'group_name' => trim($validated['group_name']),
            'description' => $validated['description'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return redirect()->route('inventory.item-group-coding.list')
            ->with('success', 'Item group created successfully.');
    }

    public function edit(Request $request, $id)
    {
        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');
        $locationId = $request->input('user_location_id') ?? $request->session()->get('user_location_id');

        if (!$compId || !$locationId) {
            return back()->withErrors(['error' => 'Company and Location information is required.']);
        }

        $itemGroup = InventoryItemGroup::where('id', $id)
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->first();

        if (!$itemGroup) {
            return back()->withErrors(['error' => 'Item group not found.']);
        }

        return Inertia::render('Inventory/ItemGroupCoding/Create', [
            'itemGroup' => $itemGroup,
        ]);
    }

    public function update(Request $request, $id)
    {
        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');
        $locationId = $request->input('user_location_id') ?? $request->session()->get('user_location_id');

        if (!$compId || !$locationId) {
            return back()->withErrors(['error' => 'Company and Location information is required.']);
        }

        $itemGroup = InventoryItemGroup::where('id', $id)
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->first();

        if (!$itemGroup) {
            return back()->withErrors(['error' => 'Item group not found.']);
        }

        $validated = $request->validate([
            'group_code' => [
                'required',
                'string',
                'max:30',
                Rule::unique('inventory_item_groups', 'group_code')
                    ->ignore($itemGroup->id),
            ],
            'group_name' => 'required|string|max:150',
            'description' => 'nullable|string|max:500',
            'is_active' => 'nullable|boolean',
        ]);

        $itemGroup->update([
            'group_code' => strtoupper(trim($validated['group_code'])),
            'group_name' => trim($validated['group_name']),
            'description' => $validated['description'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return redirect()->route('inventory.item-group-coding.list')
            ->with('success', 'Item group updated successfully.');
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

        $itemGroup = InventoryItemGroup::where('id', $id)
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->first();

        if (!$itemGroup) {
            if ($request->expectsJson()) {
                return response()->json(['error' => 'Item group not found.'], 404);
            }
            return back()->withErrors(['error' => 'Item group not found.']);
        }

        $itemGroup->delete();

        if ($request->expectsJson()) {
            return response()->json(['message' => 'Item group deleted successfully.']);
        }

        return redirect()->route('inventory.item-group-coding.list')
            ->with('success', 'Item group deleted successfully.');
    }

    public function bulkDestroy(Request $request)
    {
        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');
        $locationId = $request->input('user_location_id') ?? $request->session()->get('user_location_id');

        if (!$compId || !$locationId) {
            if ($request->expectsJson()) {
                return response()->json(['error' => 'Company and Location information is required.'], 400);
            }
            return back()->withErrors(['error' => 'Company and Location information is required.']);
        }

        $ids = $request->input('ids', []);

        if (empty($ids)) {
            if ($request->expectsJson()) {
                return response()->json(['error' => 'No items selected for deletion.'], 400);
            }
            return back()->withErrors(['error' => 'No items selected for deletion.']);
        }

        InventoryItemGroup::whereIn('id', $ids)
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->delete();

        if ($request->expectsJson()) {
            return response()->json(['message' => 'Selected item groups deleted successfully.']);
        }

        return redirect()->route('inventory.item-group-coding.list')
            ->with('success', 'Selected item groups deleted successfully.');
    }
}

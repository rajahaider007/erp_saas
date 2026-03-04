<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\UomMaster;
use App\Models\UomConversion;
use App\Models\InventoryItem;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class UomConversionController extends Controller
{
    public function list(Request $request)
    {
        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');

        if (!$compId) {
            return Inertia::render('Inventory/UomConversion/List', [
                'items' => [],
                'total' => 0,
                'filters' => [],
            ]);
        }

        $query = UomConversion::query()
            ->where('company_id', $compId)
            ->with(['fromUom', 'toUom']);

        // Search by From/To UOM code
        if ($request->filled('search')) {
            $search = '%' . $request->input('search') . '%';
            $query->whereHas('fromUom', function ($q) use ($search) {
                $q->where('uom_code', 'like', $search);
            })->orWhereHas('toUom', function ($q) use ($search) {
                $q->where('uom_code', 'like', $search);
            });
        }

        // Filter by status
        if ($request->filled('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        // Filter by Item-Specific
        if ($request->filled('is_item_specific')) {
            $query->where('is_item_specific', $request->boolean('is_item_specific'));
        }

        // Sorting
        $sortBy = $request->input('sort_by', 'from_uom_id');
        $sortOrder = $request->input('sort_order', 'asc');
        $query->orderBy($sortBy, $sortOrder);

        $items = $query->paginate(15);

        // Transform data for display
        $items->transform(function ($item) {
            return [
                'id' => $item->id,
                'from_uom_code' => $item->fromUom?->uom_code ?? 'N/A',
                'from_uom_name' => $item->fromUom?->uom_name ?? 'N/A',
                'to_uom_code' => $item->toUom?->uom_code ?? 'N/A',
                'to_uom_name' => $item->toUom?->uom_name ?? 'N/A',
                'conversion_factor' => $item->conversion_factor,
                'conversion_direction' => $item->conversion_direction,
                'effective_date' => $item->effective_date,
                'is_item_specific' => $item->is_item_specific,
                'is_active' => $item->is_active,
                'updated_at' => $item->updated_at,
            ];
        });

        return Inertia::render('Inventory/UomConversion/List', [
            'items' => $items,
            'filters' => [
                'search' => $request->input('search'),
                'is_active' => $request->input('is_active'),
                'is_item_specific' => $request->input('is_item_specific'),
                'sort_by' => $sortBy,
                'sort_order' => $sortOrder,
            ],
        ]);
    }

    public function create(Request $request)
    {
        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');

        if (!$compId) {
            return Inertia::render('Inventory/UomConversion/Create', [
                'error' => 'Company information is required.',
                'uoms' => [],
                'items' => [],
                'directionOptions' => ['Unidirectional', 'Bidirectional'],
                'roundingRuleOptions' => ['None', 'Round Up', 'Round Down', 'Round Nearest'],
                'conversionTypeOptions' => ['Standard', 'Item-Specific', 'Packaging'],
            ]);
        }

        $uoms = UomMaster::where('company_id', $compId)
            ->where('is_active', true)
            ->orderBy('uom_code')
            ->get(['id', 'uom_code', 'uom_name', 'symbol'])
            ->map(fn ($u) => [
                'value' => $u->id,
                'label' => "{$u->uom_code} - {$u->uom_name} ({$u->symbol})",
            ])
            ->toArray();

        $items = InventoryItem::where('comp_id', $compId)
            ->where('is_active', true)
            ->orderBy('item_code')
            ->get(['id', 'item_code', 'item_name_short'])
            ->map(fn ($i) => [
                'value' => $i->id,
                'label' => "{$i->item_code} - {$i->item_name_short}",
            ])
            ->toArray();

        return Inertia::render('Inventory/UomConversion/Create', [
            'uoms' => $uoms,
            'items' => $items,
            'directionOptions' => ['Unidirectional', 'Bidirectional'],
            'roundingRuleOptions' => ['None', 'Round Up', 'Round Down', 'Round Nearest'],
            'conversionTypeOptions' => ['Standard', 'Item-Specific', 'Packaging'],
        ]);
    }

    public function store(Request $request)
    {
        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');

        if (!$compId) {
            return back()->withErrors([
                'error' => 'Company information is required.'
            ]);
        }

        // Verify UOMs belong to the company
        $fromUom = UomMaster::where('id', $request->input('from_uom_id'))
            ->where('company_id', $compId)
            ->first();
        $toUom = UomMaster::where('id', $request->input('to_uom_id'))
            ->where('company_id', $compId)
            ->first();

        if (!$fromUom || !$toUom) {
            return back()->withErrors(['error' => 'Invalid UOM selection.']);
        }

        if ($fromUom->id === $toUom->id) {
            return back()->withErrors(['error' => 'From UOM and To UOM cannot be the same.']);
        }

        $validated = $request->validate([
            'from_uom_id' => 'required|integer|exists:uom_masters,id',
            'to_uom_id' => 'required|integer|exists:uom_masters,id|different:from_uom_id',
            'item_id' => 'nullable|integer|exists:inventory_items,id',
            'conversion_factor' => 'required|numeric|min:0.0001|max:999999.9999',
            'conversion_direction' => 'required|string|in:Unidirectional,Bidirectional',
            'rounding_rule' => 'required|string|in:None,Round Up,Round Down,Round Nearest',
            'effective_from' => 'required|date',
            'effective_to' => 'nullable|date|after_or_equal:effective_from',
            'conversion_type' => 'required|string|in:Standard,Item-Specific,Packaging',
            'notes' => 'nullable|string|max:500',
            'is_item_specific' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
        ]);

        UomConversion::create([
            'company_id' => $compId,
            'from_uom_id' => $validated['from_uom_id'],
            'to_uom_id' => $validated['to_uom_id'],
            'item_id' => $validated['item_id'] ?? null,
            'conversion_factor' => $validated['conversion_factor'],
            'conversion_direction' => trim($validated['conversion_direction']),
            'rounding_rule' => $validated['rounding_rule'],
            'effective_from' => $validated['effective_from'],
            'effective_to' => $validated['effective_to'] ?? null,
            'conversion_type' => $validated['conversion_type'],
            'notes' => $validated['notes'] ?? null,
            'is_item_specific' => $validated['is_item_specific'] ?? false,
            'is_active' => $validated['is_active'] ?? true,
            'created_by' => auth()->id(),
            'updated_by' => auth()->id(),
        ]);

        return redirect()->route('inventory.uom-conversion.list')
            ->with('success', 'UOM conversion created successfully.');
    }

    public function edit(Request $request, $id)
    {
        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');

        if (!$compId) {
            return back()->withErrors(['error' => 'Company information is required.']);
        }

        $conversion = UomConversion::where('id', $id)
            ->where('company_id', $compId)
            ->with(['fromUom', 'toUom'])
            ->first();

        if (!$conversion) {
            return back()->withErrors(['error' => 'UOM conversion not found.']);
        }

        $uoms = UomMaster::where('company_id', $compId)
            ->where('is_active', true)
            ->orderBy('uom_code')
            ->get(['id', 'uom_code', 'uom_name', 'symbol'])
            ->map(fn ($u) => [
                'value' => $u->id,
                'label' => "{$u->uom_code} - {$u->uom_name} ({$u->symbol})",
            ])
            ->toArray();

        $items = InventoryItem::where('comp_id', $compId)
            ->where('is_active', true)
            ->orderBy('item_code')
            ->get(['id', 'item_code', 'item_name_short'])
            ->map(fn ($i) => [
                'value' => $i->id,
                'label' => "{$i->item_code} - {$i->item_name_short}",
            ])
            ->toArray();

        return Inertia::render('Inventory/UomConversion/Create', [
            'conversion' => $conversion,
            'uoms' => $uoms,
            'items' => $items,
            'directionOptions' => ['Unidirectional', 'Bidirectional'],
            'roundingRuleOptions' => ['None', 'Round Up', 'Round Down', 'Round Nearest'],
            'conversionTypeOptions' => ['Standard', 'Item-Specific', 'Packaging'],
        ]);
    }

    public function update(Request $request, $id)
    {
        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');

        if (!$compId) {
            return back()->withErrors(['error' => 'Company information is required.']);
        }

        $conversion = UomConversion::where('id', $id)
            ->where('company_id', $compId)
            ->first();

        if (!$conversion) {
            return back()->withErrors(['error' => 'UOM conversion not found.']);
        }

        // Verify UOMs belong to the company
        $fromUom = UomMaster::where('id', $request->input('from_uom_id'))
            ->where('company_id', $compId)
            ->first();
        $toUom = UomMaster::where('id', $request->input('to_uom_id'))
            ->where('company_id', $compId)
            ->first();

        if (!$fromUom || !$toUom) {
            return back()->withErrors(['error' => 'Invalid UOM selection.']);
        }

        if ($fromUom->id === $toUom->id) {
            return back()->withErrors(['error' => 'From UOM and To UOM cannot be the same.']);
        }

        $validated = $request->validate([
            'from_uom_id' => 'required|integer|exists:uom_masters,id',
            'to_uom_id' => 'required|integer|exists:uom_masters,id|different:from_uom_id',
            'item_id' => 'nullable|integer|exists:inventory_items,id',
            'conversion_factor' => 'required|numeric|min:0.0001|max:999999.9999',
            'conversion_direction' => 'required|string|in:Unidirectional,Bidirectional',
            'rounding_rule' => 'required|string|in:None,Round Up,Round Down,Round Nearest',
            'effective_from' => 'required|date',
            'effective_to' => 'nullable|date|after_or_equal:effective_from',
            'conversion_type' => 'required|string|in:Standard,Item-Specific,Packaging',
            'notes' => 'nullable|string|max:500',
            'is_item_specific' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
        ]);

        $conversion->update([
            'from_uom_id' => $validated['from_uom_id'],
            'to_uom_id' => $validated['to_uom_id'],
            'item_id' => $validated['item_id'] ?? null,
            'conversion_factor' => $validated['conversion_factor'],
            'conversion_direction' => trim($validated['conversion_direction']),
            'rounding_rule' => $validated['rounding_rule'],
            'effective_from' => $validated['effective_from'],
            'effective_to' => $validated['effective_to'] ?? null,
            'conversion_type' => $validated['conversion_type'],
            'notes' => $validated['notes'] ?? null,
            'is_item_specific' => $validated['is_item_specific'] ?? false,
            'is_active' => $validated['is_active'] ?? true,
            'updated_by' => auth()->id(),
        ]);

        return redirect()->route('inventory.uom-conversion.list')
            ->with('success', 'UOM conversion updated successfully.');
    }

    public function destroy(Request $request, $id)
    {
        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');

        if (!$compId) {
            if ($request->expectsJson()) {
                return response()->json(['error' => 'Company information is required.'], 400);
            }
            return back()->withErrors(['error' => 'Company information is required.']);
        }

        $conversion = UomConversion::where('id', $id)
            ->where('company_id', $compId)
            ->first();

        if (!$conversion) {
            if ($request->expectsJson()) {
                return response()->json(['error' => 'UOM conversion not found.'], 404);
            }
            return back()->withErrors(['error' => 'UOM conversion not found.']);
        }

        $conversion->delete();

        if ($request->expectsJson()) {
            return response()->json(['message' => 'UOM conversion deleted successfully.']);
        }

        return redirect()->route('inventory.uom-conversion.list')
            ->with('success', 'UOM conversion deleted successfully.');
    }

    public function bulkDestroy(Request $request)
    {
        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');

        if (!$compId) {
            if ($request->expectsJson()) {
                return response()->json(['error' => 'Company information is required.'], 400);
            }
            return back()->withErrors(['error' => 'Company information is required.']);
        }

        $ids = $request->input('ids', []);

        if (empty($ids) || !is_array($ids)) {
            if ($request->expectsJson()) {
                return response()->json(['error' => 'No items selected.'], 422);
            }
            return back()->withErrors(['error' => 'No items selected.']);
        }

        UomConversion::where('company_id', $compId)
            ->whereIn('id', $ids)
            ->delete();

        if ($request->expectsJson()) {
            return response()->json(['message' => 'UOM conversions deleted successfully.']);
        }

        return back()->with('success', 'UOM conversions deleted successfully.');
    }
}

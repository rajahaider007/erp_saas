<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\UomMaster;
use App\Models\UomConversion;
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
                'is_active' => $item->is_active,
                'updated_at' => $item->updated_at,
            ];
        });

        return Inertia::render('Inventory/UomConversion/List', [
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

        if (!$compId) {
            return Inertia::render('Inventory/UomConversion/Create', [
                'error' => 'Company information is required.',
                'uoms' => [],
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

        return Inertia::render('Inventory/UomConversion/Create', [
            'uoms' => $uoms,
        ]);
    }

    public function store(Request $request)
    {
        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');

        if (!$compId) {
            return back()->withErrors(['error' => 'Company information is required.']);
        }

        $validated = $request->validate([
            'from_uom_id' => 'required|integer|exists:uom_masters,id',
            'conversions' => 'required|array|min:1',
            'conversions.*.to_uom_id' => 'required|integer|exists:uom_masters,id',
            'conversions.*.conversion_factor' => 'required|numeric|min:0.0001|max:999999.9999',
            'conversions.*.operation' => 'nullable|string|in:Multiply,Divide',
        ]);

        $fromUomId = (int) $validated['from_uom_id'];
        $fromUom = UomMaster::where('id', $fromUomId)->where('company_id', $compId)->first();
        if (!$fromUom) {
            return back()->withErrors(['error' => 'Invalid From UOM.']);
        }

        foreach ($validated['conversions'] as $row) {
            $toUomId = (int) $row['to_uom_id'];
            if ($toUomId === $fromUomId) {
                return back()->withErrors(['error' => 'From UOM and To UOM cannot be the same in any row.']);
            }
            $toUom = UomMaster::where('id', $toUomId)->where('company_id', $compId)->first();
            if (!$toUom) {
                return back()->withErrors(['error' => "Invalid To UOM in row (To UOM id: {$toUomId})."]);
            }

            $operation = isset($row['operation']) && in_array($row['operation'], ['Multiply', 'Divide'], true) ? $row['operation'] : 'Multiply';
            UomConversion::create([
                'company_id' => $compId,
                'from_uom_id' => $fromUomId,
                'to_uom_id' => $toUomId,
                'conversion_factor' => $row['conversion_factor'],
                'conversion_direction' => $operation,
                'is_active' => true,
            ]);
        }

        return redirect()->route('inventory.uom-conversion.list')
            ->with('success', 'UOM conversions saved successfully.');
    }

    public function edit(Request $request, $id)
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

        $fromUomId = $conversion->from_uom_id;
        $rows = UomConversion::where('company_id', $compId)
            ->where('from_uom_id', $fromUomId)
            ->orderBy('to_uom_id')
            ->get(['id', 'to_uom_id', 'conversion_factor', 'conversion_direction'])
            ->map(fn ($r) => [
                'id' => $r->id,
                'to_uom_id' => $r->to_uom_id,
                'conversion_factor' => (string) $r->conversion_factor,
                'operation' => in_array($r->conversion_direction, ['Multiply', 'Divide'], true) ? $r->conversion_direction : 'Multiply',
            ])
            ->toArray();

        $uoms = UomMaster::where('company_id', $compId)
            ->where('is_active', true)
            ->orderBy('uom_code')
            ->get(['id', 'uom_code', 'uom_name', 'symbol'])
            ->map(fn ($u) => [
                'value' => $u->id,
                'label' => "{$u->uom_code} - {$u->uom_name} ({$u->symbol})",
            ])
            ->toArray();

        return Inertia::render('Inventory/UomConversion/Create', [
            'conversionSet' => [
                'from_uom_id' => $fromUomId,
                'rows' => $rows,
            ],
            'uoms' => $uoms,
        ]);
    }

    public function update(Request $request, $id)
    {
        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');

        if (!$compId) {
            return back()->withErrors(['error' => 'Company information is required.']);
        }

        $existing = UomConversion::where('id', $id)
            ->where('company_id', $compId)
            ->first();

        if (!$existing) {
            return back()->withErrors(['error' => 'UOM conversion not found.']);
        }

        $validated = $request->validate([
            'from_uom_id' => 'required|integer|exists:uom_masters,id',
            'conversions' => 'required|array|min:1',
            'conversions.*.id' => 'nullable|integer|exists:uom_conversions,id',
            'conversions.*.to_uom_id' => 'required|integer|exists:uom_masters,id',
            'conversions.*.conversion_factor' => 'required|numeric|min:0.0001|max:999999.9999',
            'conversions.*.operation' => 'nullable|string|in:Multiply,Divide',
        ]);

        $fromUomId = (int) $validated['from_uom_id'];
        $fromUom = UomMaster::where('id', $fromUomId)->where('company_id', $compId)->first();
        if (!$fromUom) {
            return back()->withErrors(['error' => 'Invalid From UOM.']);
        }

        $existingIds = UomConversion::where('company_id', $compId)
            ->where('from_uom_id', $existing->from_uom_id)
            ->pluck('id')
            ->toArray();

        $submittedIds = [];

        foreach ($validated['conversions'] as $row) {
            $toUomId = (int) $row['to_uom_id'];
            if ($toUomId === $fromUomId) {
                return back()->withErrors(['error' => 'From UOM and To UOM cannot be the same in any row.']);
            }
            $toUom = UomMaster::where('id', $toUomId)->where('company_id', $compId)->first();
            if (!$toUom) {
                return back()->withErrors(['error' => "Invalid To UOM in row (To UOM id: {$toUomId})."]);
            }

            if (!empty($row['id'])) {
                $rec = UomConversion::where('id', $row['id'])
                    ->where('company_id', $compId)
                    ->where('from_uom_id', $existing->from_uom_id)
                    ->first();
                if ($rec) {
                    $operation = isset($row['operation']) && in_array($row['operation'], ['Multiply', 'Divide'], true) ? $row['operation'] : 'Multiply';
                    $rec->update([
                        'from_uom_id' => $fromUomId,
                        'to_uom_id' => $toUomId,
                        'conversion_factor' => $row['conversion_factor'],
                        'conversion_direction' => $operation,
                    ]);
                    $submittedIds[] = $rec->id;
                }
            } else {
                $operation = isset($row['operation']) && in_array($row['operation'], ['Multiply', 'Divide'], true) ? $row['operation'] : 'Multiply';
                $newRec = UomConversion::create([
                    'company_id' => $compId,
                    'from_uom_id' => $fromUomId,
                    'to_uom_id' => $toUomId,
                    'conversion_factor' => $row['conversion_factor'],
                    'conversion_direction' => $operation,
                    'is_active' => true,
                ]);
                $submittedIds[] = $newRec->id;
            }
        }

        $toDelete = array_diff($existingIds, $submittedIds);
        if (!empty($toDelete)) {
            UomConversion::where('company_id', $compId)
                ->whereIn('id', $toDelete)
                ->delete();
        }

        return redirect()->route('inventory.uom-conversion.list')
            ->with('success', 'UOM conversions updated successfully.');
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

<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\UomMaster;
use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class UomMasterController extends Controller
{
    public function list(Request $request)
    {
        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');

        if (!$compId) {
            return Inertia::render('Inventory/UomMaster/List', [
                'items' => [],
                'total' => 0,
                'filters' => [],
            ]);
        }

        $query = UomMaster::query()
            ->where('company_id', $compId)
            ->whereNull('base_uom_id');

        // Search by uom_code or uom_name
        if ($request->filled('search')) {
            $search = '%' . $request->input('search') . '%';
            $query->where(function ($q) use ($search) {
                $q->where('uom_code', 'like', $search)
                  ->orWhere('uom_name', 'like', $search)
                  ->orWhere('symbol', 'like', $search);
            });
        }

        // Filter by status
        if ($request->filled('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        // Filter by UOM Type
        if ($request->filled('uom_type')) {
            $query->where('uom_type', $request->input('uom_type'));
        }

        // Sorting
        $sortBy = $request->input('sort_by', 'uom_code');
        $sortOrder = $request->input('sort_order', 'asc');
        $query->orderBy($sortBy, $sortOrder);

        $items = $query->paginate(15);

        return Inertia::render('Inventory/UomMaster/List', [
            'items' => $items,
            'filters' => [
                'search' => $request->input('search'),
                'is_active' => $request->input('is_active'),
                'uom_type' => $request->input('uom_type'),
                'sort_by' => $sortBy,
                'sort_order' => $sortOrder,
            ],
        ]);
    }

    public function create(Request $request)
    {
        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');

        if (!$compId) {
            return Inertia::render('Inventory/UomMaster/Create', [
                'error' => 'Company information is required.',
                'uomTypes' => ['Length', 'Weight', 'Volume', 'Quantity', 'Time'],
            ]);
        }

        return Inertia::render('Inventory/UomMaster/Create', [
            'uomTypes' => ['Length', 'Weight', 'Volume', 'Quantity', 'Time', 'Area', 'Other'],
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

        $validated = $request->validate([
            'uom_code' => [
                'required',
                'string',
                'max:20',
                Rule::unique('uom_masters', 'uom_code')
                    ->where(fn ($query) => $query
                        ->where('company_id', $compId)
                        ->whereNull('deleted_at')),
            ],
            'uom_name' => 'required|string|max:100',
            'uom_type' => 'required|string|in:Length,Weight,Volume,Quantity,Time,Area,Other',
            'symbol' => 'required|string|max:10',
            'description' => 'nullable|string|max:200',
            'decimal_precision' => 'required|integer|min:0|max:10',
            'is_active' => 'nullable|boolean',
        ]);

        UomMaster::create([
            'company_id' => $compId,
            'uom_code' => strtoupper(trim($validated['uom_code'])),
            'uom_name' => trim($validated['uom_name']),
            'uom_type' => $validated['uom_type'],
            'symbol' => trim($validated['symbol']),
            'description' => $validated['description'] ?? null,
            'decimal_precision' => $validated['decimal_precision'],
            'is_base_uom' => true,
            'is_active' => $validated['is_active'] ?? true,
            'display_order' => UomMaster::where('company_id', $compId)->max('display_order') + 1,
            'created_by' => auth()->id(),
            'updated_by' => auth()->id(),
        ]);

        return redirect()->route('inventory.uom-master.list')
            ->with('success', 'UOM created successfully.');
    }

    public function edit(Request $request, $id)
    {
        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');

        if (!$compId) {
            return back()->withErrors(['error' => 'Company information is required.']);
        }

        $uom = UomMaster::where('id', $id)
            ->where('company_id', $compId)
            ->first();

        if (!$uom) {
            return back()->withErrors(['error' => 'UOM not found.']);
        }

        return Inertia::render('Inventory/UomMaster/Create', [
            'uom' => $uom,
            'uomTypes' => ['Length', 'Weight', 'Volume', 'Quantity', 'Time', 'Area', 'Other'],
        ]);
    }

    public function update(Request $request, $id)
    {
        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');

        if (!$compId) {
            return back()->withErrors(['error' => 'Company information is required.']);
        }

        $uom = UomMaster::where('id', $id)
            ->where('company_id', $compId)
            ->first();

        if (!$uom) {
            return back()->withErrors(['error' => 'UOM not found.']);
        }

        $validated = $request->validate([
            'uom_code' => [
                'required',
                'string',
                'max:20',
                Rule::unique('uom_masters', 'uom_code')
                    ->ignore($uom->id),
            ],
            'uom_name' => 'required|string|max:100',
            'uom_type' => 'required|string|in:Length,Weight,Volume,Quantity,Time,Area,Other',
            'symbol' => 'required|string|max:10',
            'description' => 'nullable|string|max:200',
            'decimal_precision' => 'required|integer|min:0|max:10',
            'is_active' => 'nullable|boolean',
        ]);

        $uom->update([
            'uom_code' => strtoupper(trim($validated['uom_code'])),
            'uom_name' => trim($validated['uom_name']),
            'uom_type' => $validated['uom_type'],
            'symbol' => trim($validated['symbol']),
            'description' => $validated['description'] ?? null,
            'decimal_precision' => $validated['decimal_precision'],
            'is_active' => $validated['is_active'] ?? true,
            'updated_by' => auth()->id(),
        ]);

        return redirect()->route('inventory.uom-master.list')
            ->with('success', 'UOM updated successfully.');
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

        $uom = UomMaster::where('id', $id)
            ->where('company_id', $compId)
            ->first();

        if (!$uom) {
            if ($request->expectsJson()) {
                return response()->json(['error' => 'UOM not found.'], 404);
            }
            return back()->withErrors(['error' => 'UOM not found.']);
        }

        $uom->delete();

        if ($request->expectsJson()) {
            return response()->json(['message' => 'UOM deleted successfully.']);
        }

        return redirect()->route('inventory.uom-master.list')
            ->with('success', 'UOM deleted successfully.');
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

        UomMaster::where('company_id', $compId)
            ->whereIn('id', $ids)
            ->delete();

        if ($request->expectsJson()) {
            return response()->json(['message' => 'UOMs deleted successfully.']);
        }

        return back()->with('success', 'UOMs deleted successfully.');
    }
}

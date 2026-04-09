<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\Currency;
use App\Models\Department;
use App\Models\InventoryItem;
use App\Models\Location;
use App\Models\PurchaseRequisition;
use App\Models\PurchaseRequisitionLine;
use App\Models\UomMaster;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class PurchaseRequisitionController extends Controller
{
    public function create(Request $request)
    {
        $compId = $this->resolvedCompId($request);
        $locationId = $this->resolvedLocationId($request);

        if (! $compId || ! $locationId) {
            return Inertia::render('Inventory/PurchaseRequisition/Create', [
                'error' => __('inventory_messages.purchase_requisition.errors.company_location_required'),
                'itemOptions' => [],
                'uomOptions' => [],
                'locationOptions' => [],
                'departmentOptions' => [],
                'currencyOptions' => [],
                'itemMetaById' => [],
            ]);
        }

        $uomOptions = UomMaster::query()
            ->byCompany($compId)
            ->active()
            ->orderBy('uom_code')
            ->get(['id', 'uom_code', 'uom_name'])
            ->map(fn ($u) => [
                'value' => (string) $u->id,
                'label' => $u->uom_code.' — '.$u->uom_name,
            ])
            ->values();

        $items = InventoryItem::query()
            ->byCompanyAndLocation($compId, $locationId)
            ->active()
            ->where('item_status', '!=', 'blocked')
            ->orderBy('item_code')
            ->get([
                'id', 'item_code', 'item_name_short', 'purchase_uom_id', 'stock_uom_id',
            ]);

        $itemOptions = $items
            ->map(fn ($r) => [
                'value' => (string) $r->id,
                'label' => $r->item_code.' — '.$r->item_name_short,
            ])
            ->values();

        $itemMetaById = $items->mapWithKeys(fn ($r) => [
            (string) $r->id => [
                'item_code' => $r->item_code,
                'item_name_short' => $r->item_name_short,
                'default_uom_id' => $r->purchase_uom_id
                    ? (string) $r->purchase_uom_id
                    : ($r->stock_uom_id ? (string) $r->stock_uom_id : ''),
            ],
        ]);

        $locationOptions = Location::query()
            ->where('company_id', $compId)
            ->where('status', true)
            ->orderBy('location_name')
            ->get(['id', 'location_name'])
            ->map(fn ($l) => [
                'value' => (string) $l->id,
                'label' => $l->location_name,
            ])
            ->values();

        $departmentOptions = Department::query()
            ->where('company_id', $compId)
            ->where('status', true)
            ->where(function ($q) use ($locationId) {
                $q->whereNull('location_id')
                    ->orWhere('location_id', $locationId);
            })
            ->orderBy('department_name')
            ->get(['id', 'department_name'])
            ->map(fn ($d) => [
                'value' => (string) $d->id,
                'label' => $d->department_name,
            ])
            ->values();

        $currencyOptions = Currency::query()
            ->active()
            ->orderBy('code')
            ->get(['id', 'code', 'name'])
            ->map(fn ($c) => [
                'value' => (string) $c->id,
                'label' => $c->code.' — '.$c->name,
            ])
            ->values();

        $defaultDeliverTo = $locationOptions->firstWhere('value', (string) $locationId);

        return Inertia::render('Inventory/PurchaseRequisition/Create', [
            'itemOptions' => $itemOptions,
            'uomOptions' => $uomOptions,
            'locationOptions' => $locationOptions,
            'departmentOptions' => $departmentOptions,
            'currencyOptions' => $currencyOptions,
            'itemMetaById' => $itemMetaById,
            'defaults' => [
                'pr_date' => now()->toDateString(),
                'deliver_to_location_id' => $defaultDeliverTo ? (string) $locationId : '',
                'currency_id' => '',
                'fx_rate' => '',
            ],
            'comp_id' => $compId,
            'location_id' => $locationId,
        ]);
    }

    public function store(Request $request)
    {
        $compId = $this->resolvedCompId($request);
        $locationId = $this->resolvedLocationId($request);

        if (! $compId || ! $locationId) {
            return back()->withErrors(['error' => __('inventory_messages.purchase_requisition.errors.company_location_required')]);
        }

        $validated = $request->validate([
            'pr_date' => ['required', 'date'],
            'required_by_date' => ['nullable', 'date'],
            'deliver_to_location_id' => [
                'nullable',
                Rule::exists('locations', 'id')->where('company_id', $compId),
            ],
            'delivery_address' => ['nullable', 'string', 'max:2000'],
            'currency_id' => ['nullable', 'exists:currencies,id'],
            'fx_rate' => ['nullable', 'numeric', 'min:0'],
            'priority' => ['required', Rule::in(['normal', 'high', 'urgent'])],
            'department_id' => [
                'nullable',
                Rule::exists('departments', 'id')->where('company_id', $compId),
            ],
            'requested_by' => ['nullable', 'string', 'max:120'],
            'justification' => ['nullable', 'string', 'max:5000'],
            'notes' => ['nullable', 'string', 'max:5000'],
            'lines' => ['required', 'array', 'min:1'],
            'lines.*.inventory_item_id' => [
                'required',
                Rule::exists('inventory_items', 'id')->where(function ($q) use ($compId, $locationId) {
                    $q->where('comp_id', $compId)
                        ->where('location_id', $locationId);
                }),
            ],
            'lines.*.uom_id' => [
                'required',
                Rule::exists('uom_masters', 'id')->where('company_id', $compId),
            ],
            'lines.*.quantity' => ['required', 'numeric', 'gt:0'],
            'lines.*.estimated_unit_price' => ['nullable', 'numeric', 'min:0'],
            'lines.*.need_by_date' => ['nullable', 'date'],
            'lines.*.item_description' => ['nullable', 'string', 'max:500'],
            'lines.*.line_notes' => ['nullable', 'string', 'max:500'],
        ]);

        $lines = $validated['lines'];

        try {
            $pr = DB::transaction(function () use ($validated, $lines, $compId, $locationId, $request) {
                /** @var PurchaseRequisition $doc */
                $doc = PurchaseRequisition::query()->create([
                    'comp_id' => $compId,
                    'location_id' => $locationId,
                    'pr_number' => 'T'.Str::ulid(),
                    'pr_date' => $validated['pr_date'],
                    'required_by_date' => $validated['required_by_date'] ?? null,
                    'deliver_to_location_id' => $validated['deliver_to_location_id'] ?? null,
                    'delivery_address' => $validated['delivery_address'] ?? null,
                    'currency_id' => $validated['currency_id'] ?? null,
                    'fx_rate' => $validated['fx_rate'] ?? null,
                    'priority' => $validated['priority'],
                    'department_id' => $validated['department_id'] ?? null,
                    'requested_by' => $validated['requested_by'] ?? null,
                    'justification' => $validated['justification'] ?? null,
                    'notes' => $validated['notes'] ?? null,
                    'status' => 'draft',
                    'created_by' => $request->user()?->id ?? $request->session()->get('user_id'),
                    'updated_by' => $request->user()?->id ?? $request->session()->get('user_id'),
                ]);

                $doc->pr_number = sprintf('PR-%d-%06d', $compId, $doc->id);
                $doc->save();

                foreach ($lines as $idx => $row) {
                    PurchaseRequisitionLine::query()->create([
                        'purchase_requisition_id' => $doc->id,
                        'line_no' => $idx + 1,
                        'inventory_item_id' => $row['inventory_item_id'],
                        'item_description' => $row['item_description'] ?? null,
                        'uom_id' => $row['uom_id'],
                        'quantity' => $row['quantity'],
                        'estimated_unit_price' => $row['estimated_unit_price'] ?? null,
                        'need_by_date' => $row['need_by_date'] ?? null,
                        'line_notes' => $row['line_notes'] ?? null,
                    ]);
                }

                return $doc;
            });
        } catch (\Throwable $e) {
            report($e);

            return back()
                ->withInput()
                ->with('error', __('inventory_messages.purchase_requisition.errors.save_failed'));
        }

        return redirect()
            ->route('inventory.purchase-requisition.create')
            ->with('success', __('inventory_messages.purchase_requisition.messages.created', ['number' => $pr->pr_number]));
    }

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

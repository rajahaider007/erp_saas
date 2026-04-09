<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\Currency;
use App\Models\Department;
use App\Models\InventoryItem;
use App\Models\Location;
use App\Models\PurchaseRequisition;
use App\Models\PurchaseRequisitionLine;
use App\Models\UomMaster;
use App\Services\AuditLogService;
use App\Services\InventoryDocumentNumberService;
use App\Services\RecoveryService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class PurchaseRequisitionController extends Controller
{
    public function index(Request $request)
    {
        $compId = $this->resolvedCompId($request);
        $locationId = $this->resolvedLocationId($request);

        $filters = [
            'search' => $request->input('search'),
            'status' => $request->input('status') ?? 'all',
            'priority' => $request->input('priority') ?? 'all',
            'department_id' => $request->input('department_id') ?? '',
            'from_date' => $request->input('from_date'),
            'to_date' => $request->input('to_date'),
        ];

        $departmentOptions = [];
        if ($compId && $locationId) {
            $departmentOptions = $this->departmentOptions($compId, $locationId);
        }

        if (! $compId || ! $locationId) {
            $emptyPaginator = new LengthAwarePaginator(
                [],
                0,
                15,
                1,
                ['path' => $request->url(), 'query' => $request->query()]
            );

            return Inertia::render('Inventory/PurchaseRequisition/List', [
                'requisitions' => $emptyPaginator,
                'filters' => $filters,
                'departmentOptions' => $departmentOptions,
                'error' => __('inventory_messages.purchase_requisition.errors.company_location_required'),
            ]);
        }

        $query = PurchaseRequisition::query()
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->withCount('lines')
            ->with([
                'department:id,department_name',
                'currency:id,code',
                'deliverToLocation:id,location_name',
            ]);

        if ($request->filled('search')) {
            $term = '%'.$request->input('search').'%';
            $query->where(function ($q) use ($term) {
                $q->where('pr_number', 'like', $term)
                    ->orWhere('requested_by', 'like', $term)
                    ->orWhere('notes', 'like', $term);
            });
        }

        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('priority') && $request->input('priority') !== 'all') {
            $query->where('priority', $request->input('priority'));
        }

        if ($request->filled('department_id')) {
            $deptId = (int) $request->input('department_id');
            if ($deptId > 0) {
                $query->where('department_id', $deptId);
            }
        }

        if ($request->filled('from_date')) {
            $query->whereDate('pr_date', '>=', $request->input('from_date'));
        }

        if ($request->filled('to_date')) {
            $query->whereDate('pr_date', '<=', $request->input('to_date'));
        }

        $requisitions = $query
            ->orderByDesc('pr_date')
            ->orderByDesc('id')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Inventory/PurchaseRequisition/List', [
            'requisitions' => $requisitions,
            'filters' => $filters,
            'departmentOptions' => $departmentOptions,
        ]);
    }

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
                'requisition' => null,
                'preview_pr_number' => null,
            ]);
        }

        return Inertia::render('Inventory/PurchaseRequisition/Create', $this->purchaseRequisitionFormPageData($compId, $locationId));
    }

    public function edit(Request $request, int $id)
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
                'requisition' => null,
                'preview_pr_number' => null,
            ]);
        }

        /** @var PurchaseRequisition|null $doc */
        $doc = PurchaseRequisition::query()
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->whereKey($id)
            ->with(['lines' => fn ($q) => $q->orderBy('line_no')])
            ->first();

        if (! $doc) {
            return redirect()
                ->route('inventory.purchase-requisition.index')
                ->with('error', __('inventory_messages.purchase_requisition.errors.not_found'));
        }

        if ($doc->status !== 'draft') {
            return redirect()
                ->route('inventory.purchase-requisition.index')
                ->with('error', __('inventory_messages.purchase_requisition.errors.only_draft_can_edit'));
        }

        $page = $this->purchaseRequisitionFormPageData($compId, $locationId);
        $page['requisition'] = $this->serializeRequisitionForForm($doc);

        return Inertia::render('Inventory/PurchaseRequisition/Create', $page);
    }

    /**
     * @return array<string, mixed>
     */
    private function purchaseRequisitionFormPageData(int $compId, int $locationId): array
    {
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

        $departmentOptions = $this->departmentOptions($compId, $locationId);

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

        return [
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
            'requisition' => null,
            'preview_pr_number' => InventoryDocumentNumberService::previewNext(
                $compId,
                $locationId,
                InventoryDocumentNumberService::DOCUMENT_PURCHASE_REQUISITION
            ),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeRequisitionForForm(PurchaseRequisition $doc): array
    {
        return [
            'id' => $doc->id,
            'pr_number' => $doc->pr_number,
            'status' => $doc->status,
            'pr_date' => $doc->pr_date->format('Y-m-d'),
            'required_by_date' => $doc->required_by_date?->format('Y-m-d'),
            'deliver_to_location_id' => $doc->deliver_to_location_id,
            'delivery_address' => $doc->delivery_address,
            'currency_id' => $doc->currency_id,
            'fx_rate' => $doc->fx_rate,
            'priority' => $doc->priority,
            'department_id' => $doc->department_id,
            'requested_by' => $doc->requested_by,
            'justification' => $doc->justification,
            'notes' => $doc->notes,
            'lines' => $doc->lines
                ->map(fn (PurchaseRequisitionLine $l) => [
                    'inventory_item_id' => $l->inventory_item_id,
                    'item_description' => $l->item_description,
                    'uom_id' => $l->uom_id,
                    'quantity' => $l->quantity,
                    'estimated_unit_price' => $l->estimated_unit_price,
                    'need_by_date' => $l->need_by_date?->format('Y-m-d'),
                    'line_notes' => $l->line_notes,
                ])
                ->values()
                ->all(),
        ];
    }

    public function store(Request $request)
    {
        $compId = $this->resolvedCompId($request);
        $locationId = $this->resolvedLocationId($request);

        if (! $compId || ! $locationId) {
            return back()->withErrors(['error' => __('inventory_messages.purchase_requisition.errors.company_location_required')]);
        }

        $validated = $request->validate([
            'initial_status' => ['required', Rule::in(['draft', 'approved'])],
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
        $userId = $this->resolvedUserId($request);
        $initialApproved = $validated['initial_status'] === 'approved';

        try {
            $pr = DB::transaction(function () use ($validated, $lines, $compId, $locationId, $userId, $initialApproved) {
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
                    'status' => $initialApproved ? 'approved' : 'draft',
                    'approved_at' => $initialApproved ? now() : null,
                    'approved_by' => $initialApproved ? $userId : null,
                    'created_by' => $userId,
                    'updated_by' => $userId,
                ]);

                $doc->pr_number = InventoryDocumentNumberService::allocateNext(
                    $compId,
                    $locationId,
                    InventoryDocumentNumberService::DOCUMENT_PURCHASE_REQUISITION
                );
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

        $prFresh = $pr->fresh();
        if ($prFresh) {
            AuditLogService::logPurchaseRequisition(
                'CREATE',
                (int) $prFresh->id,
                $prFresh->toArray()
            );
        }

        $msgKey = $initialApproved
            ? 'inventory_messages.purchase_requisition.messages.created_approved'
            : 'inventory_messages.purchase_requisition.messages.created';

        return redirect()
            ->route('inventory.purchase-requisition.index')
            ->with('success', __($msgKey, ['number' => $pr->pr_number]));
    }

    public function update(Request $request, int $id)
    {
        $compId = $this->resolvedCompId($request);
        $locationId = $this->resolvedLocationId($request);

        if (! $compId || ! $locationId) {
            return back()->withErrors(['error' => __('inventory_messages.purchase_requisition.errors.company_location_required')]);
        }

        $doc = PurchaseRequisition::query()
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->whereKey($id)
            ->first();

        if (! $doc) {
            return back()->with('error', __('inventory_messages.purchase_requisition.errors.not_found'));
        }

        if ($doc->status !== 'draft') {
            return back()->with('error', __('inventory_messages.purchase_requisition.errors.only_draft_can_edit'));
        }

        $validated = $request->validate([
            'initial_status' => ['required', Rule::in(['draft', 'approved'])],
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
        $userId = $this->resolvedUserId($request);
        $initialApproved = $validated['initial_status'] === 'approved';
        $oldData = $doc->fresh()->toArray();

        try {
            DB::transaction(function () use ($validated, $lines, $doc, $userId, $initialApproved) {
                $doc->pr_date = $validated['pr_date'];
                $doc->required_by_date = $validated['required_by_date'] ?? null;
                $doc->deliver_to_location_id = $validated['deliver_to_location_id'] ?? null;
                $doc->delivery_address = $validated['delivery_address'] ?? null;
                $doc->currency_id = $validated['currency_id'] ?? null;
                $doc->fx_rate = $validated['fx_rate'] ?? null;
                $doc->priority = $validated['priority'];
                $doc->department_id = $validated['department_id'] ?? null;
                $doc->requested_by = $validated['requested_by'] ?? null;
                $doc->justification = $validated['justification'] ?? null;
                $doc->notes = $validated['notes'] ?? null;
                $doc->status = $initialApproved ? 'approved' : 'draft';
                $doc->approved_at = $initialApproved ? now() : null;
                $doc->approved_by = $initialApproved ? $userId : null;
                $doc->updated_by = $userId;
                $doc->save();

                PurchaseRequisitionLine::query()
                    ->where('purchase_requisition_id', $doc->id)
                    ->delete();

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
            });
        } catch (\Throwable $e) {
            report($e);

            return back()
                ->withInput()
                ->with('error', __('inventory_messages.purchase_requisition.errors.save_failed'));
        }

        $docRefresh = $doc->fresh();
        if ($docRefresh) {
            AuditLogService::logPurchaseRequisition(
                'UPDATE',
                (int) $docRefresh->id,
                $docRefresh->toArray(),
                $oldData
            );
        }

        $msgKey = $initialApproved
            ? 'inventory_messages.purchase_requisition.messages.updated_approved'
            : 'inventory_messages.purchase_requisition.messages.updated';

        return redirect()
            ->route('inventory.purchase-requisition.index')
            ->with('success', __($msgKey, ['number' => $doc->fresh()->pr_number]));
    }

    public function approve(Request $request, int $id)
    {
        $compId = $this->resolvedCompId($request);
        $locationId = $this->resolvedLocationId($request);
        $userId = $this->resolvedUserId($request);

        if (! $compId || ! $locationId) {
            return back()->with('error', __('inventory_messages.purchase_requisition.errors.company_location_required'));
        }

        $doc = PurchaseRequisition::query()
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->whereKey($id)
            ->first();

        if (! $doc) {
            return back()->with('error', __('inventory_messages.purchase_requisition.errors.not_found'));
        }

        if ($doc->status !== 'draft') {
            return back()->with('error', __('inventory_messages.purchase_requisition.errors.only_draft_can_approve', ['status' => $doc->status]));
        }

        $oldData = $doc->fresh()->toArray();
        $doc->status = 'approved';
        $doc->approved_at = now();
        $doc->approved_by = $userId;
        $doc->updated_by = $userId;
        $doc->save();

        $docFresh = $doc->fresh();
        if ($docFresh) {
            AuditLogService::logPurchaseRequisition(
                'APPROVE',
                (int) $docFresh->id,
                $docFresh->toArray(),
                $oldData
            );
        }

        return back()->with('success', __('inventory_messages.purchase_requisition.messages.approved', ['number' => $doc->pr_number]));
    }

    public function bulkApprove(Request $request)
    {
        $compId = $this->resolvedCompId($request);
        $locationId = $this->resolvedLocationId($request);
        $userId = $this->resolvedUserId($request);

        if (! $compId || ! $locationId) {
            return back()->with('error', __('inventory_messages.purchase_requisition.errors.company_location_required'));
        }

        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer'],
        ]);

        $ids = array_values(array_unique(array_map('intval', $validated['ids'])));

        $docs = PurchaseRequisition::query()
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->whereIn('id', $ids)
            ->where('status', 'draft')
            ->get();

        if ($docs->isEmpty()) {
            return back()->with('error', __('inventory_messages.purchase_requisition.errors.bulk_approve_none'));
        }

        $now = now();
        foreach ($docs as $doc) {
            $oldData = $doc->fresh()->toArray();
            $doc->status = 'approved';
            $doc->approved_at = $now;
            $doc->approved_by = $userId;
            $doc->updated_by = $userId;
            $doc->save();
            $docFresh = $doc->fresh();
            if ($docFresh) {
                AuditLogService::logPurchaseRequisition(
                    'APPROVE',
                    (int) $docFresh->id,
                    $docFresh->toArray(),
                    $oldData
                );
            }
        }

        return back()->with('success', __('inventory_messages.purchase_requisition.messages.bulk_approved', ['count' => $docs->count()]));
    }

    public function destroy(Request $request, int $id)
    {
        $compId = $this->resolvedCompId($request);
        $locationId = $this->resolvedLocationId($request);

        if (! $compId || ! $locationId) {
            return back()->with('error', __('inventory_messages.purchase_requisition.errors.company_location_required'));
        }

        $permanent = $request->boolean('permanent');

        $doc = PurchaseRequisition::query()
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->whereKey($id)
            ->first();

        if (! $doc) {
            return back()->with('error', __('inventory_messages.purchase_requisition.errors.not_found'));
        }

        if ($doc->status !== 'draft') {
            return back()->with('error', __('inventory_messages.purchase_requisition.errors.only_draft_can_delete'));
        }

        $prNumber = $doc->pr_number;
        $auditBeforeDelete = $doc->fresh()->toArray();

        try {
            if (! $permanent) {
                $mainRow = DB::table('purchase_requisitions')->where('id', $doc->id)->first();
                if (! $mainRow) {
                    return back()->with('error', __('inventory_messages.purchase_requisition.errors.not_found'));
                }
                $mainArr = json_decode(json_encode($mainRow), true);

                $lineRows = DB::table('purchase_requisition_lines')
                    ->where('purchase_requisition_id', $doc->id)
                    ->get()
                    ->map(fn ($r) => json_decode(json_encode($r), true))
                    ->all();

                $relatedData = ['purchase_requisition_lines' => $lineRows];

                try {
                    RecoveryService::saveForRecovery(
                        'purchase_requisitions',
                        $doc->id,
                        $mainArr,
                        $relatedData,
                        $prNumber,
                        'Purchase requisition deleted from list'
                    );
                } catch (\Exception $recoveryException) {
                    Log::warning('PR recovery snapshot failed', [
                        'purchase_requisition_id' => $doc->id,
                        'error' => $recoveryException->getMessage(),
                    ]);
                }
            }

            DB::transaction(function () use ($doc) {
                DB::table('purchase_requisition_lines')
                    ->where('purchase_requisition_id', $doc->id)
                    ->delete();
                DB::table('purchase_requisitions')->where('id', $doc->id)->delete();
            });

            AuditLogService::logPurchaseRequisition(
                'DELETE',
                (int) $auditBeforeDelete['id'],
                [],
                $auditBeforeDelete
            );
        } catch (\Throwable $e) {
            report($e);

            return back()->with('error', __('inventory_messages.purchase_requisition.errors.delete_failed'));
        }

        $msg = $permanent
            ? __('inventory_messages.purchase_requisition.messages.deleted_permanent', ['number' => $prNumber])
            : __('inventory_messages.purchase_requisition.messages.deleted_recycle', ['number' => $prNumber]);

        return redirect()
            ->route('inventory.purchase-requisition.index')
            ->with('success', $msg);
    }

    public function invoice(Request $request, int $id, string $variant): Response
    {
        $compId = $this->resolvedCompId($request);
        $locationId = $this->resolvedLocationId($request);

        if (! $compId || ! $locationId) {
            abort(403);
        }

        if (! in_array($variant, ['summary', 'detailed'], true)) {
            abort(404);
        }

        $company = Company::query()
            ->whereKey($compId)
            ->first([
                'company_name',
                'legal_name',
                'trading_name',
                'address_line_1',
                'address_line_2',
                'city',
                'state_province',
                'postal_code',
                'country',
                'phone',
                'email',
                'tax_id',
                'vat_number',
                'registration_number',
            ]);

        $pr = PurchaseRequisition::query()
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->whereKey($id)
            ->with([
                'lines.inventoryItem:id,item_code,item_name_short',
                'lines.uom:id,uom_code,uom_name',
                'department:id,department_name',
                'deliverToLocation:id,location_name',
                'requestingLocation:id,location_name',
                'currency:id,code,name',
            ])
            ->firstOrFail();

        $view = $variant === 'summary'
            ? 'inventory.purchase_requisition.invoice_summary'
            : 'inventory.purchase_requisition.invoice_detailed';

        return response()->view($view, [
            'pr' => $pr,
            'company' => $company,
        ]);
    }

    private function departmentOptions(int $compId, int $locationId): array
    {
        return Department::query()
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
            ->values()
            ->all();
    }

    private function resolvedUserId(Request $request): ?int
    {
        $raw = $request->user()?->id ?? $request->session()->get('user_id');

        if ($raw === null || $raw === '') {
            return null;
        }

        return (int) $raw;
    }

    private function resolvedCompId(Request $request): ?int
    {
        foreach ([
            $request->session()->get('user_comp_id'),
            $request->input('user_comp_id'),
            $request->user()?->comp_id,
            $request->input('comp_id'),
            $request->session()->get('comp_id'),
        ] as $raw) {
            if ($raw === null || $raw === '') {
                continue;
            }

            return (int) $raw;
        }

        return null;
    }

    private function resolvedLocationId(Request $request): ?int
    {
        foreach ([
            $request->session()->get('user_location_id'),
            $request->input('user_location_id'),
            $request->user()?->location_id,
            $request->input('location_id'),
            $request->session()->get('location_id'),
        ] as $raw) {
            if ($raw === null || $raw === '') {
                continue;
            }

            return (int) $raw;
        }

        return null;
    }
}

<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\ChartOfAccount;
use App\Models\Currency;
use App\Models\InventoryItem;
use App\Models\Location;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderLine;
use App\Models\PurchaseRequisition;
use App\Models\PurchaseRequisitionLine;
use App\Models\TaxCategory;
use App\Models\UomMaster;
use App\Services\AuditLogService;
use App\Services\InventoryDocumentNumberService;
use App\Services\RecoveryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class PurchaseOrderController extends Controller
{
    public function index(Request $request)
    {
        $compId = $this->resolvedCompId($request);
        $locationId = $this->resolvedLocationId($request);

        $filters = [
            'search' => $request->input('search'),
            'status' => $request->input('status') ?? 'all',
            'vendor_id' => $request->input('vendor_id') ?? '',
            'from_date' => $request->input('from_date'),
            'to_date' => $request->input('to_date'),
        ];

        $vendorOptions = [];
        if ($compId) {
            $vendorOptions = $this->vendorOptions($compId);
        }

        if (! $compId || ! $locationId) {
            $emptyPaginator = new LengthAwarePaginator(
                [],
                0,
                15,
                1,
                ['path' => $request->url(), 'query' => $request->query()]
            );

            return Inertia::render('Inventory/PurchaseOrder/List', [
                'orders' => $emptyPaginator,
                'filters' => $filters,
                'vendorOptions' => $vendorOptions,
                'error' => __('inventory_messages.purchase_order.errors.company_location_required'),
            ]);
        }

        $query = PurchaseOrder::query()
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->withCount('lines')
            ->with([
                'vendor:id,account_code,account_name',
                'purchaseRequisition:id,pr_number',
                'shipToLocation:id,location_name',
            ]);

        if ($request->filled('search')) {
            $term = '%'.$request->input('search').'%';
            $query->where(function ($q) use ($term) {
                $q->where('po_number', 'like', $term)
                    ->orWhere('vendor_reference', 'like', $term)
                    ->orWhere('notes', 'like', $term);
            });
        }

        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('vendor_id')) {
            $vid = (int) $request->input('vendor_id');
            if ($vid > 0) {
                $query->where('vendor_id', $vid);
            }
        }

        if ($request->filled('from_date')) {
            $query->whereDate('po_date', '>=', $request->input('from_date'));
        }

        if ($request->filled('to_date')) {
            $query->whereDate('po_date', '<=', $request->input('to_date'));
        }

        $orders = $query
            ->orderByDesc('po_date')
            ->orderByDesc('id')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Inventory/PurchaseOrder/List', [
            'orders' => $orders,
            'filters' => $filters,
            'vendorOptions' => $vendorOptions,
        ]);
    }

    public function create(Request $request)
    {
        $compId = $this->resolvedCompId($request);
        $locationId = $this->resolvedLocationId($request);

        if (! $compId || ! $locationId) {
            return Inertia::render('Inventory/PurchaseOrder/Create', [
                'error' => __('inventory_messages.purchase_order.errors.company_location_required'),
                'itemOptions' => [],
                'uomOptions' => [],
                'locationOptions' => [],
                'vendorOptions' => [],
                'currencyOptions' => [],
                'taxCategoryOptions' => [],
                'approvedPrOptions' => [],
                'itemMetaById' => [],
                'order' => null,
                'preview_po_number' => null,
            ]);
        }

        return Inertia::render('Inventory/PurchaseOrder/Create', $this->purchaseOrderFormPageData($compId, $locationId));
    }

    public function edit(Request $request, int $id)
    {
        $compId = $this->resolvedCompId($request);
        $locationId = $this->resolvedLocationId($request);

        if (! $compId || ! $locationId) {
            return Inertia::render('Inventory/PurchaseOrder/Create', [
                'error' => __('inventory_messages.purchase_order.errors.company_location_required'),
                'itemOptions' => [],
                'uomOptions' => [],
                'locationOptions' => [],
                'vendorOptions' => [],
                'currencyOptions' => [],
                'taxCategoryOptions' => [],
                'approvedPrOptions' => [],
                'itemMetaById' => [],
                'order' => null,
                'preview_po_number' => null,
            ]);
        }

        /** @var PurchaseOrder|null $doc */
        $doc = PurchaseOrder::query()
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->whereKey($id)
            ->with(['lines' => fn ($q) => $q->orderBy('line_no')])
            ->first();

        if (! $doc) {
            return redirect()
                ->route('inventory.purchase-order.index')
                ->with('error', __('inventory_messages.purchase_order.errors.not_found'));
        }

        if ($doc->status !== 'draft') {
            return redirect()
                ->route('inventory.purchase-order.index')
                ->with('error', __('inventory_messages.purchase_order.errors.only_draft_can_edit'));
        }

        $page = $this->purchaseOrderFormPageData($compId, $locationId);
        $page['order'] = $this->serializeOrderForForm($doc);

        return Inertia::render('Inventory/PurchaseOrder/Create', $page);
    }

    public function prefillFromPr(Request $request, int $id): JsonResponse
    {
        $compId = $this->resolvedCompId($request);
        $locationId = $this->resolvedLocationId($request);

        if (! $compId || ! $locationId) {
            return response()->json(['message' => __('inventory_messages.purchase_order.errors.company_location_required')], 422);
        }

        /** @var PurchaseRequisition|null $pr */
        $pr = PurchaseRequisition::query()
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->whereKey($id)
            ->where('status', 'approved')
            ->with(['lines' => fn ($q) => $q->orderBy('line_no')])
            ->first();

        if (! $pr) {
            return response()->json(['message' => __('inventory_messages.purchase_order.errors.pr_not_available')], 404);
        }

        return response()->json([
            'ship_to_location_id' => $pr->deliver_to_location_id,
            'delivery_address' => $pr->delivery_address,
            'currency_id' => $pr->currency_id,
            'fx_rate' => $pr->fx_rate,
            'lines' => $pr->lines->map(fn (PurchaseRequisitionLine $l) => [
                'purchase_requisition_line_id' => $l->id,
                'inventory_item_id' => $l->inventory_item_id,
                'item_description' => $l->item_description,
                'uom_id' => $l->uom_id,
                'ordered_qty' => $l->quantity,
                'unit_price' => $l->estimated_unit_price,
                'need_by_date' => $l->need_by_date?->format('Y-m-d'),
            ])->values(),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function purchaseOrderFormPageData(int $compId, int $locationId): array
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
                'id', 'item_code', 'item_name_short', 'purchase_uom_id', 'stock_uom_id', 'tax_category_id',
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
                'default_tax_category_id' => $r->tax_category_id ? (string) $r->tax_category_id : '',
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

        $vendorOptions = $this->vendorOptions($compId);

        $currencyOptions = Currency::query()
            ->active()
            ->orderBy('code')
            ->get(['id', 'code', 'name'])
            ->map(fn ($c) => [
                'value' => (string) $c->id,
                'label' => $c->code.' — '.$c->name,
            ])
            ->values();

        $taxCategoryOptions = TaxCategory::query()
            ->where('company_id', $compId)
            ->where('is_active', true)
            ->orderBy('tax_code')
            ->get(['id', 'tax_code', 'tax_name'])
            ->map(fn ($t) => [
                'value' => (string) $t->id,
                'label' => $t->tax_code.' — '.$t->tax_name,
            ])
            ->values();

        $approvedPrOptions = PurchaseRequisition::query()
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->where('status', 'approved')
            ->orderByDesc('pr_date')
            ->orderByDesc('id')
            ->limit(500)
            ->get(['id', 'pr_number', 'pr_date'])
            ->map(fn ($p) => [
                'value' => (string) $p->id,
                'label' => $p->pr_number.' · '.$p->pr_date->format('Y-m-d'),
            ])
            ->values();

        $defaultShipTo = $locationOptions->firstWhere('value', (string) $locationId);

        return [
            'itemOptions' => $itemOptions,
            'uomOptions' => $uomOptions,
            'locationOptions' => $locationOptions,
            'vendorOptions' => $vendorOptions,
            'currencyOptions' => $currencyOptions,
            'taxCategoryOptions' => $taxCategoryOptions,
            'approvedPrOptions' => $approvedPrOptions,
            'itemMetaById' => $itemMetaById,
            'defaults' => [
                'po_date' => now()->toDateString(),
                'ship_to_location_id' => $defaultShipTo ? (string) $locationId : '',
                'currency_id' => '',
                'fx_rate' => '',
            ],
            'comp_id' => $compId,
            'location_id' => $locationId,
            'order' => null,
            'preview_po_number' => InventoryDocumentNumberService::previewNext(
                $compId,
                $locationId,
                InventoryDocumentNumberService::DOCUMENT_PURCHASE_ORDER
            ),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeOrderForForm(PurchaseOrder $doc): array
    {
        return [
            'id' => $doc->id,
            'po_number' => $doc->po_number,
            'status' => $doc->status,
            'link_pr' => $doc->purchase_requisition_id ? 'yes' : 'no',
            'purchase_requisition_id' => $doc->purchase_requisition_id
                ? (string) $doc->purchase_requisition_id
                : '',
            'vendor_id' => (string) $doc->vendor_id,
            'po_type' => $doc->po_type,
            'is_blanket' => $doc->is_blanket,
            'vendor_reference' => $doc->vendor_reference,
            'po_date' => $doc->po_date->format('Y-m-d'),
            'expected_delivery_date' => $doc->expected_delivery_date?->format('Y-m-d'),
            'ship_to_location_id' => $doc->ship_to_location_id,
            'delivery_address' => $doc->delivery_address,
            'currency_id' => $doc->currency_id,
            'fx_rate' => $doc->fx_rate,
            'incoterms' => $doc->incoterms,
            'incoterms_location' => $doc->incoterms_location,
            'payment_terms' => $doc->payment_terms,
            'advance_payment_percent' => $doc->advance_payment_percent,
            'tax_inclusive' => $doc->tax_inclusive,
            'header_discount_percent' => $doc->header_discount_percent,
            'notes' => $doc->notes,
            'lines' => $doc->lines
                ->map(fn (PurchaseOrderLine $l) => [
                    'purchase_requisition_line_id' => $l->purchase_requisition_line_id,
                    'inventory_item_id' => $l->inventory_item_id,
                    'item_description' => $l->item_description,
                    'uom_id' => $l->uom_id,
                    'ordered_qty' => $l->ordered_qty,
                    'unit_price' => $l->unit_price,
                    'line_discount_percent' => $l->line_discount_percent,
                    'tax_category_id' => $l->tax_category_id,
                    'expected_line_delivery_date' => $l->expected_line_delivery_date?->format('Y-m-d'),
                    'receive_location_id' => $l->receive_location_id,
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
            return back()->withErrors(['error' => __('inventory_messages.purchase_order.errors.company_location_required')]);
        }

        $validated = $this->validatedOrderPayload($request, $compId, $locationId);
        $lines = $this->normalizedLines($validated['lines'], $validated['purchase_requisition_id']);

        $userId = $this->resolvedUserId($request);
        $initialApproved = $validated['initial_status'] === 'approved';

        try {
            $order = DB::transaction(function () use ($validated, $lines, $compId, $locationId, $userId, $initialApproved) {
                /** @var PurchaseOrder $doc */
                $doc = PurchaseOrder::query()->create([
                    'comp_id' => $compId,
                    'location_id' => $locationId,
                    'po_number' => 'T'.Str::ulid(),
                    'purchase_requisition_id' => $validated['purchase_requisition_id'],
                    'vendor_id' => $validated['vendor_id'],
                    'po_type' => $validated['po_type'],
                    'is_blanket' => $validated['is_blanket'],
                    'vendor_reference' => $validated['vendor_reference'] ?? null,
                    'po_date' => $validated['po_date'],
                    'expected_delivery_date' => $validated['expected_delivery_date'] ?? null,
                    'ship_to_location_id' => $validated['ship_to_location_id'] ?? null,
                    'delivery_address' => $validated['delivery_address'] ?? null,
                    'currency_id' => $validated['currency_id'] ?? null,
                    'fx_rate' => $validated['fx_rate'] ?? null,
                    'incoterms' => $validated['incoterms'] ?? null,
                    'incoterms_location' => $validated['incoterms_location'] ?? null,
                    'payment_terms' => $validated['payment_terms'] ?? null,
                    'advance_payment_percent' => $validated['advance_payment_percent'] ?? null,
                    'tax_inclusive' => $validated['tax_inclusive'],
                    'header_discount_percent' => $validated['header_discount_percent'] ?? null,
                    'notes' => $validated['notes'] ?? null,
                    'status' => $initialApproved ? 'approved' : 'draft',
                    'approved_at' => $initialApproved ? now() : null,
                    'approved_by' => $initialApproved ? $userId : null,
                    'created_by' => $userId,
                    'updated_by' => $userId,
                ]);

                $doc->po_number = InventoryDocumentNumberService::allocateNext(
                    $compId,
                    $locationId,
                    InventoryDocumentNumberService::DOCUMENT_PURCHASE_ORDER
                );
                $doc->save();

                foreach ($lines as $idx => $row) {
                    PurchaseOrderLine::query()->create([
                        'purchase_order_id' => $doc->id,
                        'line_no' => $idx + 1,
                        'purchase_requisition_line_id' => $row['purchase_requisition_line_id'],
                        'inventory_item_id' => $row['inventory_item_id'],
                        'item_description' => $row['item_description'] ?? null,
                        'uom_id' => $row['uom_id'],
                        'ordered_qty' => $row['ordered_qty'],
                        'unit_price' => $row['unit_price'],
                        'line_discount_percent' => $row['line_discount_percent'] ?? null,
                        'tax_category_id' => $row['tax_category_id'] ?? null,
                        'expected_line_delivery_date' => $row['expected_line_delivery_date'] ?? null,
                        'receive_location_id' => $row['receive_location_id'] ?? null,
                        'line_notes' => $row['line_notes'] ?? null,
                        'received_qty' => 0,
                        'line_status' => 'open',
                    ]);
                }

                return $doc;
            });
        } catch (\Throwable $e) {
            report($e);

            return back()
                ->withInput()
                ->with('error', __('inventory_messages.purchase_order.errors.save_failed'));
        }

        $fresh = $order->fresh();
        if ($fresh) {
            AuditLogService::logPurchaseOrder(
                'CREATE',
                (int) $fresh->id,
                $fresh->toArray()
            );
        }

        $msgKey = $initialApproved
            ? 'inventory_messages.purchase_order.messages.created_approved'
            : 'inventory_messages.purchase_order.messages.created';

        return redirect()
            ->route('inventory.purchase-order.index')
            ->with('success', __($msgKey, ['number' => $order->po_number]));
    }

    public function update(Request $request, int $id)
    {
        $compId = $this->resolvedCompId($request);
        $locationId = $this->resolvedLocationId($request);

        if (! $compId || ! $locationId) {
            return back()->withErrors(['error' => __('inventory_messages.purchase_order.errors.company_location_required')]);
        }

        $doc = PurchaseOrder::query()
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->whereKey($id)
            ->first();

        if (! $doc) {
            return back()->with('error', __('inventory_messages.purchase_order.errors.not_found'));
        }

        if ($doc->status !== 'draft') {
            return back()->with('error', __('inventory_messages.purchase_order.errors.only_draft_can_edit'));
        }

        $validated = $this->validatedOrderPayload($request, $compId, $locationId);
        $lines = $this->normalizedLines($validated['lines'], $validated['purchase_requisition_id']);

        $userId = $this->resolvedUserId($request);
        $initialApproved = $validated['initial_status'] === 'approved';
        $oldData = $doc->fresh()->toArray();

        try {
            DB::transaction(function () use ($validated, $lines, $doc, $userId, $initialApproved) {
                $doc->purchase_requisition_id = $validated['purchase_requisition_id'];
                $doc->vendor_id = $validated['vendor_id'];
                $doc->po_type = $validated['po_type'];
                $doc->is_blanket = $validated['is_blanket'];
                $doc->vendor_reference = $validated['vendor_reference'] ?? null;
                $doc->po_date = $validated['po_date'];
                $doc->expected_delivery_date = $validated['expected_delivery_date'] ?? null;
                $doc->ship_to_location_id = $validated['ship_to_location_id'] ?? null;
                $doc->delivery_address = $validated['delivery_address'] ?? null;
                $doc->currency_id = $validated['currency_id'] ?? null;
                $doc->fx_rate = $validated['fx_rate'] ?? null;
                $doc->incoterms = $validated['incoterms'] ?? null;
                $doc->incoterms_location = $validated['incoterms_location'] ?? null;
                $doc->payment_terms = $validated['payment_terms'] ?? null;
                $doc->advance_payment_percent = $validated['advance_payment_percent'] ?? null;
                $doc->tax_inclusive = $validated['tax_inclusive'];
                $doc->header_discount_percent = $validated['header_discount_percent'] ?? null;
                $doc->notes = $validated['notes'] ?? null;
                $doc->status = $initialApproved ? 'approved' : 'draft';
                $doc->approved_at = $initialApproved ? now() : null;
                $doc->approved_by = $initialApproved ? $userId : null;
                $doc->updated_by = $userId;
                $doc->save();

                PurchaseOrderLine::query()
                    ->where('purchase_order_id', $doc->id)
                    ->delete();

                foreach ($lines as $idx => $row) {
                    PurchaseOrderLine::query()->create([
                        'purchase_order_id' => $doc->id,
                        'line_no' => $idx + 1,
                        'purchase_requisition_line_id' => $row['purchase_requisition_line_id'],
                        'inventory_item_id' => $row['inventory_item_id'],
                        'item_description' => $row['item_description'] ?? null,
                        'uom_id' => $row['uom_id'],
                        'ordered_qty' => $row['ordered_qty'],
                        'unit_price' => $row['unit_price'],
                        'line_discount_percent' => $row['line_discount_percent'] ?? null,
                        'tax_category_id' => $row['tax_category_id'] ?? null,
                        'expected_line_delivery_date' => $row['expected_line_delivery_date'] ?? null,
                        'receive_location_id' => $row['receive_location_id'] ?? null,
                        'line_notes' => $row['line_notes'] ?? null,
                        'received_qty' => 0,
                        'line_status' => 'open',
                    ]);
                }
            });
        } catch (\Throwable $e) {
            report($e);

            return back()
                ->withInput()
                ->with('error', __('inventory_messages.purchase_order.errors.save_failed'));
        }

        $docRefresh = $doc->fresh();
        if ($docRefresh) {
            AuditLogService::logPurchaseOrder(
                'UPDATE',
                (int) $docRefresh->id,
                $docRefresh->toArray(),
                $oldData
            );
        }

        $msgKey = $initialApproved
            ? 'inventory_messages.purchase_order.messages.updated_approved'
            : 'inventory_messages.purchase_order.messages.updated';

        return redirect()
            ->route('inventory.purchase-order.index')
            ->with('success', __($msgKey, ['number' => $doc->fresh()->po_number]));
    }

    public function approve(Request $request, int $id)
    {
        $compId = $this->resolvedCompId($request);
        $locationId = $this->resolvedLocationId($request);
        $userId = $this->resolvedUserId($request);

        if (! $compId || ! $locationId) {
            return back()->with('error', __('inventory_messages.purchase_order.errors.company_location_required'));
        }

        $doc = PurchaseOrder::query()
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->whereKey($id)
            ->first();

        if (! $doc) {
            return back()->with('error', __('inventory_messages.purchase_order.errors.not_found'));
        }

        if ($doc->status !== 'draft') {
            return back()->with('error', __('inventory_messages.purchase_order.errors.only_draft_can_approve', ['status' => $doc->status]));
        }

        $oldData = $doc->fresh()->toArray();
        $doc->status = 'approved';
        $doc->approved_at = now();
        $doc->approved_by = $userId;
        $doc->updated_by = $userId;
        $doc->save();

        $docFresh = $doc->fresh();
        if ($docFresh) {
            AuditLogService::logPurchaseOrder(
                'APPROVE',
                (int) $docFresh->id,
                $docFresh->toArray(),
                $oldData
            );
        }

        return back()->with('success', __('inventory_messages.purchase_order.messages.approved', ['number' => $doc->po_number]));
    }

    public function bulkApprove(Request $request)
    {
        $compId = $this->resolvedCompId($request);
        $locationId = $this->resolvedLocationId($request);
        $userId = $this->resolvedUserId($request);

        if (! $compId || ! $locationId) {
            return back()->with('error', __('inventory_messages.purchase_order.errors.company_location_required'));
        }

        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer'],
        ]);

        $ids = array_values(array_unique(array_map('intval', $validated['ids'])));

        $docs = PurchaseOrder::query()
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->whereIn('id', $ids)
            ->where('status', 'draft')
            ->get();

        if ($docs->isEmpty()) {
            return back()->with('error', __('inventory_messages.purchase_order.errors.bulk_approve_none'));
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
                AuditLogService::logPurchaseOrder(
                    'APPROVE',
                    (int) $docFresh->id,
                    $docFresh->toArray(),
                    $oldData
                );
            }
        }

        return back()->with('success', __('inventory_messages.purchase_order.messages.bulk_approved', ['count' => $docs->count()]));
    }

    public function destroy(Request $request, int $id)
    {
        $compId = $this->resolvedCompId($request);
        $locationId = $this->resolvedLocationId($request);

        if (! $compId || ! $locationId) {
            return back()->with('error', __('inventory_messages.purchase_order.errors.company_location_required'));
        }

        $permanent = $request->boolean('permanent');

        $doc = PurchaseOrder::query()
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->whereKey($id)
            ->first();

        if (! $doc) {
            return back()->with('error', __('inventory_messages.purchase_order.errors.not_found'));
        }

        if ($doc->status !== 'draft') {
            return back()->with('error', __('inventory_messages.purchase_order.errors.only_draft_can_delete'));
        }

        $poNumber = $doc->po_number;
        $auditBeforeDelete = $doc->fresh()->toArray();

        try {
            if (! $permanent) {
                $mainRow = DB::table('purchase_orders')->where('id', $doc->id)->first();
                if (! $mainRow) {
                    return back()->with('error', __('inventory_messages.purchase_order.errors.not_found'));
                }
                $mainArr = json_decode(json_encode($mainRow), true);

                $lineRows = DB::table('purchase_order_lines')
                    ->where('purchase_order_id', $doc->id)
                    ->get()
                    ->map(fn ($r) => json_decode(json_encode($r), true))
                    ->all();

                $relatedData = ['purchase_order_lines' => $lineRows];

                try {
                    RecoveryService::saveForRecovery(
                        'purchase_orders',
                        $doc->id,
                        $mainArr,
                        $relatedData,
                        $poNumber,
                        'Purchase order deleted from list'
                    );
                } catch (\Exception $recoveryException) {
                    Log::warning('PO recovery snapshot failed', [
                        'purchase_order_id' => $doc->id,
                        'error' => $recoveryException->getMessage(),
                    ]);
                }
            }

            DB::transaction(function () use ($doc) {
                DB::table('purchase_order_lines')
                    ->where('purchase_order_id', $doc->id)
                    ->delete();
                DB::table('purchase_orders')->where('id', $doc->id)->delete();
            });

            AuditLogService::logPurchaseOrder(
                'DELETE',
                (int) $auditBeforeDelete['id'],
                [],
                $auditBeforeDelete
            );
        } catch (\Throwable $e) {
            report($e);

            return back()->with('error', __('inventory_messages.purchase_order.errors.delete_failed'));
        }

        $msg = $permanent
            ? __('inventory_messages.purchase_order.messages.deleted_permanent', ['number' => $poNumber])
            : __('inventory_messages.purchase_order.messages.deleted_recycle', ['number' => $poNumber]);

        return redirect()
            ->route('inventory.purchase-order.index')
            ->with('success', $msg);
    }

    /**
     * @return array<string, mixed>
     */
    private function validatedOrderPayload(Request $request, int $compId, int $locationId): array
    {
        $validated = $request->validate([
            'link_pr' => ['required', Rule::in(['yes', 'no'])],
            'purchase_requisition_id' => ['nullable', 'integer'],
            'initial_status' => ['required', Rule::in(['draft', 'approved'])],
            'vendor_id' => [
                'required',
                Rule::exists('chart_of_accounts', 'id')->where(fn ($q) => $q
                    ->where('comp_id', $compId)
                    ->where('party_type', 'vendor')
                    ->where('status', 'Active')),
            ],
            'po_type' => ['required', Rule::in(['standard', 'blanket', 'import'])],
            'is_blanket' => ['required', 'boolean'],
            'vendor_reference' => ['nullable', 'string', 'max:120'],
            'po_date' => ['required', 'date'],
            'expected_delivery_date' => ['nullable', 'date'],
            'ship_to_location_id' => [
                'nullable',
                Rule::exists('locations', 'id')->where('company_id', $compId),
            ],
            'delivery_address' => ['nullable', 'string', 'max:2000'],
            'currency_id' => ['nullable', 'exists:currencies,id'],
            'fx_rate' => ['nullable', 'numeric', 'min:0'],
            'incoterms' => ['nullable', 'string', 'max:16'],
            'incoterms_location' => ['nullable', 'string', 'max:120'],
            'payment_terms' => ['nullable', 'string', 'max:120'],
            'advance_payment_percent' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'tax_inclusive' => ['required', 'boolean'],
            'header_discount_percent' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'notes' => ['nullable', 'string', 'max:5000'],
            'lines' => ['required', 'array', 'min:1'],
            'lines.*.purchase_requisition_line_id' => ['nullable', 'integer'],
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
            'lines.*.ordered_qty' => ['required', 'numeric', 'gt:0'],
            'lines.*.unit_price' => ['required', 'numeric', 'gt:0'],
            'lines.*.line_discount_percent' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'lines.*.tax_category_id' => [
                'nullable',
                Rule::exists('tax_categories', 'id')->where('company_id', $compId),
            ],
            'lines.*.expected_line_delivery_date' => ['nullable', 'date'],
            'lines.*.receive_location_id' => [
                'nullable',
                Rule::exists('locations', 'id')->where('company_id', $compId),
            ],
            'lines.*.item_description' => ['nullable', 'string', 'max:500'],
            'lines.*.line_notes' => ['nullable', 'string', 'max:500'],
        ]);

        if ($validated['link_pr'] === 'yes') {
            $request->validate([
                'purchase_requisition_id' => [
                    'required',
                    Rule::exists('purchase_requisitions', 'id')->where(function ($q) use ($compId, $locationId) {
                        $q->where('comp_id', $compId)
                            ->where('location_id', $locationId)
                            ->where('status', 'approved');
                    }),
                ],
            ]);
        } else {
            $validated['purchase_requisition_id'] = null;
        }

        $validated['purchase_requisition_id'] = $validated['purchase_requisition_id'] !== null && $validated['purchase_requisition_id'] !== ''
            ? (int) $validated['purchase_requisition_id']
            : null;
        $validated['vendor_id'] = (int) $validated['vendor_id'];

        return $validated;
    }

    /**
     * @param  array<int, array<string, mixed>>  $lines
     * @return array<int, array<string, mixed>>
     */
    private function normalizedLines(array $lines, ?int $purchaseRequisitionId): array
    {
        $prId = $purchaseRequisitionId;

        return collect($lines)
            ->map(function (array $row) use ($prId) {
                $linePrId = $row['purchase_requisition_line_id'] ?? null;
                if (! $prId || ! $linePrId) {
                    $row['purchase_requisition_line_id'] = null;
                } else {
                    $belongs = PurchaseRequisitionLine::query()
                        ->whereKey($linePrId)
                        ->where('purchase_requisition_id', $prId)
                        ->exists();
                    if (! $belongs) {
                        $row['purchase_requisition_line_id'] = null;
                    }
                }

                return $row;
            })
            ->all();
    }

    /**
     * @return array<int, array{value: string, label: string}>
     */
    private function vendorOptions(int $compId): array
    {
        return ChartOfAccount::query()
            ->where('comp_id', $compId)
            ->where('party_type', 'vendor')
            ->where('status', 'Active')
            ->orderBy('account_code')
            ->get(['id', 'account_code', 'account_name'])
            ->map(fn ($row) => [
                'value' => (string) $row->id,
                'label' => $row->account_code.' - '.$row->account_name,
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

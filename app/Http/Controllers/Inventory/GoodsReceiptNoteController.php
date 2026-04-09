<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Http\Traits\CheckUserPermissions;
use App\Models\ChartOfAccount;
use App\Models\Company;
use App\Models\GoodsReceiptNote;
use App\Models\GoodsReceiptNoteLine;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderLine;
use App\Services\InventoryDocumentNumberService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class GoodsReceiptNoteController extends Controller
{
    use CheckUserPermissions;

    public function index(Request $request)
    {
        $this->requirePermission($request, null, 'can_view');

        $compId = $this->resolvedCompId($request);
        $locationId = $this->resolvedLocationId($request);

        $filters = [
            'search' => $request->input('search'),
            'status' => $request->input('status') ?? 'all',
            'vendor_id' => $request->input('vendor_id') ?? '',
            'from_date' => $request->input('from_date'),
            'to_date' => $request->input('to_date'),
        ];

        $vendorOptions = $compId ? $this->vendorOptions($compId) : [];

        if (! $compId || ! $locationId) {
            $emptyPaginator = new LengthAwarePaginator(
                [],
                0,
                15,
                1,
                ['path' => $request->url(), 'query' => $request->query()]
            );

            return Inertia::render('Inventory/GoodsReceiptNote/List', [
                'grns' => $emptyPaginator,
                'filters' => $filters,
                'vendorOptions' => $vendorOptions,
                'error' => __('inventory_messages.goods_receipt_note.errors.company_location_required'),
            ]);
        }

        $query = GoodsReceiptNote::query()
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->withCount('lines')
            ->with([
                'vendor:id,account_code,account_name',
                'purchaseOrder:id,po_number',
                'receiveLocation:id,location_name',
            ]);

        if ($request->filled('search')) {
            $term = '%'.$request->input('search').'%';
            $query->where(function ($q) use ($term) {
                $q->where('grn_number', 'like', $term)
                    ->orWhere('notes', 'like', $term)
                    ->orWhere('vendor_delivery_note_no', 'like', $term)
                    ->orWhereHas('purchaseOrder', fn ($pq) => $pq->where('po_number', 'like', $term));
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
            $query->whereDate('receipt_date', '>=', $request->input('from_date'));
        }

        if ($request->filled('to_date')) {
            $query->whereDate('receipt_date', '<=', $request->input('to_date'));
        }

        $grns = $query
            ->orderByDesc('receipt_date')
            ->orderByDesc('id')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Inventory/GoodsReceiptNote/List', [
            'grns' => $grns,
            'filters' => $filters,
            'vendorOptions' => $vendorOptions,
        ]);
    }

    public function create(Request $request)
    {
        $this->requirePermission($request, null, 'can_add');

        $compId = $this->resolvedCompId($request);
        $locationId = $this->resolvedLocationId($request);

        if (! $compId || ! $locationId) {
            return Inertia::render('Inventory/GoodsReceiptNote/Create', [
                'error' => __('inventory_messages.goods_receipt_note.errors.company_location_required'),
                'locationOptions' => [],
                'currencyOptions' => [],
                'approvedPoOptions' => [],
                'itemMetaById' => [],
                'defaults' => [],
                'preview_grn_number' => null,
            ]);
        }

        return Inertia::render('Inventory/GoodsReceiptNote/Create', $this->formPageData($compId, $locationId));
    }

    public function prefillFromPo(Request $request, int $id): JsonResponse
    {
        $this->requirePermission($request, null, 'can_add');

        $compId = $this->resolvedCompId($request);
        $locationId = $this->resolvedLocationId($request);

        if (! $compId || ! $locationId) {
            return response()->json(['message' => __('inventory_messages.goods_receipt_note.errors.company_location_required')], 422);
        }

        $po = $this->findReceivablePurchaseOrder($compId, $locationId, $id);
        if (! $po) {
            return response()->json(['message' => __('inventory_messages.goods_receipt_note.errors.po_not_receivable')], 404);
        }

        $po->load([
            'lines' => fn ($q) => $q->with(['inventoryItem:id,item_code,item_name_short', 'uom:id,uom_code,uom_name'])->orderBy('line_no'),
            'vendor:id,account_code,account_name',
            'currency:id,code,name',
        ]);

        $lines = $po->lines
            ->map(function (PurchaseOrderLine $l) {
                $ordered = (float) $l->ordered_qty;
                $received = (float) $l->received_qty;
                $pending = $ordered - $received;
                if ($pending <= 0.000001) {
                    return null;
                }

                $netUnit = self::netUnitPriceFromPoLine($l);

                return [
                    'purchase_order_line_id' => (string) $l->id,
                    'inventory_item_id' => (string) $l->inventory_item_id,
                    'item_label' => $l->item_description
                        ?: (
                            $l->inventoryItem
                            ? $l->inventoryItem->item_code.' — '.$l->inventoryItem->item_name_short
                            : (string) $l->inventory_item_id
                        ),
                    'item_description' => $l->item_description ?? '',
                    'uom_id' => (string) $l->uom_id,
                    'uom_label' => $l->uom
                        ? $l->uom->uom_code.' — '.$l->uom->uom_name
                        : (string) $l->uom_id,
                    'po_ordered_qty' => (string) $l->ordered_qty,
                    'previously_received_qty' => (string) $l->received_qty,
                    'pending_qty' => (string) round($pending, 6),
                    'unit_cost' => (string) round($netUnit, 6),
                    'receive_location_id' => $l->receive_location_id ? (string) $l->receive_location_id : '',
                    'put_away_location_id' => $l->receive_location_id ? (string) $l->receive_location_id : '',
                ];
            })
            ->filter()
            ->values();

        $vendorLabel = $po->vendor
            ? $po->vendor->account_code.' - '.$po->vendor->account_name
            : '';

        return response()->json([
            'purchase_order_id' => (string) $po->id,
            'po_number' => $po->po_number,
            'vendor_display' => $vendorLabel,
            'vendor_id' => (string) $po->vendor_id,
            'ship_to_location_id' => $po->ship_to_location_id ? (string) $po->ship_to_location_id : '',
            'currency_id' => $po->currency_id ? (string) $po->currency_id : '',
            'fx_rate' => $po->fx_rate !== null && $po->fx_rate !== '' ? (string) $po->fx_rate : '',
            'lines' => $lines,
        ]);
    }

    public static function netUnitPriceFromPoLine(PurchaseOrderLine $l): float
    {
        $price = (float) $l->unit_price;
        $disc = $l->line_discount_percent !== null && $l->line_discount_percent !== ''
            ? (float) $l->line_discount_percent
            : 0.0;
        if ($disc > 0) {
            $price = $price * (1 - $disc / 100);
        }

        return $price;
    }

    public function store(Request $request)
    {
        $this->requirePermission($request, null, 'can_add');

        $compId = $this->resolvedCompId($request);
        $locationId = $this->resolvedLocationId($request);

        if (! $compId || ! $locationId) {
            return back()->withErrors(['error' => __('inventory_messages.goods_receipt_note.errors.company_location_required')]);
        }

        $validated = $this->validatedPayload($request, $compId, $locationId);
        $userId = $this->resolvedUserId($request);
        $submitForQc = $validated['initial_status'] === 'qc_pending';

        $linesToPersist = array_values(array_filter(
            $validated['lines'],
            fn (array $row) => (float) ($row['receipt_qty'] ?? 0) > 0
        ));

        if ($linesToPersist === []) {
            throw ValidationException::withMessages([
                'lines' => __('inventory_messages.goods_receipt_note.errors.no_receipt_lines'),
            ]);
        }

        if ($submitForQc) {
            $this->assertReceiptQtyWithinPending($linesToPersist, (int) $validated['purchase_order_id']);
        }

        try {
            $grn = DB::transaction(function () use (
                $validated,
                $linesToPersist,
                $compId,
                $locationId,
                $userId,
                $submitForQc
            ) {
                /** @var GoodsReceiptNote $doc */
                $doc = GoodsReceiptNote::query()->create([
                    'comp_id' => $compId,
                    'location_id' => $locationId,
                    'grn_number' => 'T'.Str::ulid(),
                    'purchase_order_id' => $validated['purchase_order_id'],
                    'vendor_id' => $validated['vendor_id'],
                    'grn_type' => $validated['grn_type'],
                    'receipt_date' => $validated['receipt_date'],
                    'posting_date' => $validated['posting_date'] ?? null,
                    'receive_location_id' => $validated['receive_location_id'] ?? null,
                    'vehicle_number' => $validated['vehicle_number'] ?? null,
                    'transporter_name' => $validated['transporter_name'] ?? null,
                    'driver_contact' => $validated['driver_contact'] ?? null,
                    'seal_number' => $validated['seal_number'] ?? null,
                    'container_number' => $validated['container_number'] ?? null,
                    'bol_awb' => $validated['bol_awb'] ?? null,
                    'packing_list_ref' => $validated['packing_list_ref'] ?? null,
                    'vendor_delivery_note_no' => $validated['vendor_delivery_note_no'] ?? null,
                    'currency_id' => $validated['currency_id'] ?? null,
                    'fx_rate' => $validated['fx_rate'] ?? null,
                    'overall_qc_status' => $validated['overall_qc_status'],
                    'landed_cost_applies' => $validated['landed_cost_applies'],
                    'landed_cost_reference' => $validated['landed_cost_reference'] ?? null,
                    'three_way_match_status' => 'pending',
                    'notes' => $validated['notes'] ?? null,
                    'status' => $submitForQc ? 'qc_pending' : 'draft',
                    'created_by' => $userId,
                    'updated_by' => $userId,
                ]);

                $doc->grn_number = InventoryDocumentNumberService::allocateNext(
                    $compId,
                    $locationId,
                    InventoryDocumentNumberService::DOCUMENT_GOODS_RECEIPT_NOTE
                );
                $doc->save();

                foreach ($linesToPersist as $idx => $row) {
                    /** @var PurchaseOrderLine $poLine */
                    $poLine = PurchaseOrderLine::query()
                        ->whereKey($row['purchase_order_line_id'])
                        ->whereHas('purchaseOrder', fn ($q) => $q
                            ->where('comp_id', $compId)
                            ->where('location_id', $locationId)
                            ->whereKey($validated['purchase_order_id']))
                        ->firstOrFail();

                    $receiptQty = (float) $row['receipt_qty'];
                    $accepted = isset($row['accepted_qty']) && $row['accepted_qty'] !== '' && $row['accepted_qty'] !== null
                        ? (float) $row['accepted_qty']
                        : $receiptQty;
                    $accepted = min($accepted, $receiptQty);
                    $rejected = max(0, $receiptQty - $accepted);

                    GoodsReceiptNoteLine::query()->create([
                        'goods_receipt_note_id' => $doc->id,
                        'line_no' => $idx + 1,
                        'purchase_order_line_id' => $poLine->id,
                        'inventory_item_id' => $poLine->inventory_item_id,
                        'item_description' => $row['item_description'] ?? $poLine->item_description,
                        'uom_id' => $poLine->uom_id,
                        'po_ordered_qty' => $poLine->ordered_qty,
                        'snapshot_previously_received_qty' => $poLine->received_qty,
                        'receipt_qty' => $receiptQty,
                        'unit_cost' => $row['unit_cost'],
                        'accepted_qty' => $accepted,
                        'rejected_qty' => $rejected,
                        'rejection_reason' => $rejected > 0 ? ($row['rejection_reason'] ?? null) : null,
                        'qc_line_status' => $row['qc_line_status'],
                        'lot_batch_no' => $row['lot_batch_no'] ?? null,
                        'manufacturing_date' => $row['manufacturing_date'] ?? null,
                        'expiry_date' => $row['expiry_date'] ?? null,
                        'temperature_at_receipt' => $row['temperature_at_receipt'] ?? null,
                        'put_away_location_id' => $row['put_away_location_id'] ?? null,
                        'line_notes' => $row['line_notes'] ?? null,
                    ]);
                }

                if ($submitForQc) {
                    $this->applyReceiptQuantitiesToPurchaseOrder($doc->fresh(['lines']));
                }

                return $doc;
            });
        } catch (ValidationException $e) {
            throw $e;
        } catch (\Throwable $e) {
            report($e);

            return back()
                ->withInput()
                ->with('error', __('inventory_messages.goods_receipt_note.errors.save_failed'));
        }

        $msgKey = $submitForQc
            ? 'inventory_messages.goods_receipt_note.messages.created_qc_pending'
            : 'inventory_messages.goods_receipt_note.messages.created_draft';

        return redirect()
            ->route('inventory.goods-receipt-note.index')
            ->with('success', __($msgKey, ['number' => $grn->grn_number]));
    }

    public function edit(Request $request, int $id)
    {
        $this->requirePermission($request, null, 'can_edit');

        $compId = $this->resolvedCompId($request);
        $locationId = $this->resolvedLocationId($request);

        if (! $compId || ! $locationId) {
            return redirect()
                ->route('inventory.goods-receipt-note.index')
                ->with('error', __('inventory_messages.goods_receipt_note.errors.company_location_required'));
        }

        $grn = GoodsReceiptNote::query()
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->whereKey($id)
            ->first();

        if (! $grn || $grn->status !== 'draft') {
            return redirect()
                ->route('inventory.goods-receipt-note.index')
                ->with('error', __('inventory_messages.goods_receipt_note.errors.only_draft_editable'));
        }

        return Inertia::render('Inventory/GoodsReceiptNote/Create', array_merge(
            $this->formPageData($compId, $locationId),
            ['grn' => $this->serializeGrnForEdit($grn)]
        ));
    }

    public function update(Request $request, int $id)
    {
        $this->requirePermission($request, null, 'can_edit');

        $compId = $this->resolvedCompId($request);
        $locationId = $this->resolvedLocationId($request);

        if (! $compId || ! $locationId) {
            return back()->withErrors(['error' => __('inventory_messages.goods_receipt_note.errors.company_location_required')]);
        }

        $grn = GoodsReceiptNote::query()
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->whereKey($id)
            ->first();

        if (! $grn || $grn->status !== 'draft') {
            return redirect()
                ->route('inventory.goods-receipt-note.index')
                ->with('error', __('inventory_messages.goods_receipt_note.errors.only_draft_editable'));
        }

        $validated = $this->validatedPayload($request, $compId, $locationId);
        if ((int) $validated['purchase_order_id'] !== (int) $grn->purchase_order_id) {
            throw ValidationException::withMessages([
                'purchase_order_id' => __('inventory_messages.goods_receipt_note.errors.po_locked_on_edit'),
            ]);
        }

        $userId = $this->resolvedUserId($request);
        $submitForQc = $validated['initial_status'] === 'qc_pending';

        $linesToPersist = array_values(array_filter(
            $validated['lines'],
            fn (array $row) => (float) ($row['receipt_qty'] ?? 0) > 0
        ));

        if ($linesToPersist === []) {
            throw ValidationException::withMessages([
                'lines' => __('inventory_messages.goods_receipt_note.errors.no_receipt_lines'),
            ]);
        }

        if ($submitForQc) {
            $this->assertReceiptQtyWithinPending($linesToPersist, (int) $validated['purchase_order_id']);
        }

        try {
            DB::transaction(function () use (
                $validated,
                $linesToPersist,
                $grn,
                $userId,
                $submitForQc
            ) {
                $grn->update([
                    'vendor_id' => $validated['vendor_id'],
                    'grn_type' => $validated['grn_type'],
                    'receipt_date' => $validated['receipt_date'],
                    'posting_date' => $validated['posting_date'] ?? null,
                    'receive_location_id' => $validated['receive_location_id'] ?? null,
                    'vehicle_number' => $validated['vehicle_number'] ?? null,
                    'transporter_name' => $validated['transporter_name'] ?? null,
                    'driver_contact' => $validated['driver_contact'] ?? null,
                    'seal_number' => $validated['seal_number'] ?? null,
                    'container_number' => $validated['container_number'] ?? null,
                    'bol_awb' => $validated['bol_awb'] ?? null,
                    'packing_list_ref' => $validated['packing_list_ref'] ?? null,
                    'vendor_delivery_note_no' => $validated['vendor_delivery_note_no'] ?? null,
                    'currency_id' => $validated['currency_id'] ?? null,
                    'fx_rate' => $validated['fx_rate'] ?? null,
                    'overall_qc_status' => $validated['overall_qc_status'],
                    'landed_cost_applies' => $validated['landed_cost_applies'],
                    'landed_cost_reference' => $validated['landed_cost_reference'] ?? null,
                    'notes' => $validated['notes'] ?? null,
                    'status' => $submitForQc ? 'qc_pending' : 'draft',
                    'updated_by' => $userId,
                ]);

                GoodsReceiptNoteLine::query()
                    ->where('goods_receipt_note_id', $grn->id)
                    ->delete();

                foreach ($linesToPersist as $idx => $row) {
                    /** @var PurchaseOrderLine $poLine */
                    $poLine = PurchaseOrderLine::query()
                        ->whereKey($row['purchase_order_line_id'])
                        ->whereHas('purchaseOrder', fn ($q) => $q
                            ->where('comp_id', $grn->comp_id)
                            ->where('location_id', $grn->location_id)
                            ->whereKey($validated['purchase_order_id']))
                        ->firstOrFail();

                    $receiptQty = (float) $row['receipt_qty'];
                    $accepted = isset($row['accepted_qty']) && $row['accepted_qty'] !== '' && $row['accepted_qty'] !== null
                        ? (float) $row['accepted_qty']
                        : $receiptQty;
                    $accepted = min($accepted, $receiptQty);
                    $rejected = max(0, $receiptQty - $accepted);

                    GoodsReceiptNoteLine::query()->create([
                        'goods_receipt_note_id' => $grn->id,
                        'line_no' => $idx + 1,
                        'purchase_order_line_id' => $poLine->id,
                        'inventory_item_id' => $poLine->inventory_item_id,
                        'item_description' => $row['item_description'] ?? $poLine->item_description,
                        'uom_id' => $poLine->uom_id,
                        'po_ordered_qty' => $poLine->ordered_qty,
                        'snapshot_previously_received_qty' => $poLine->received_qty,
                        'receipt_qty' => $receiptQty,
                        'unit_cost' => $row['unit_cost'],
                        'accepted_qty' => $accepted,
                        'rejected_qty' => $rejected,
                        'rejection_reason' => $rejected > 0 ? ($row['rejection_reason'] ?? null) : null,
                        'qc_line_status' => $row['qc_line_status'],
                        'lot_batch_no' => $row['lot_batch_no'] ?? null,
                        'manufacturing_date' => $row['manufacturing_date'] ?? null,
                        'expiry_date' => $row['expiry_date'] ?? null,
                        'temperature_at_receipt' => $row['temperature_at_receipt'] ?? null,
                        'put_away_location_id' => $row['put_away_location_id'] ?? null,
                        'line_notes' => $row['line_notes'] ?? null,
                    ]);
                }

                if ($submitForQc) {
                    $this->applyReceiptQuantitiesToPurchaseOrder($grn->fresh(['lines']));
                }
            });
        } catch (ValidationException $e) {
            throw $e;
        } catch (\Throwable $e) {
            report($e);

            return back()
                ->withInput()
                ->with('error', __('inventory_messages.goods_receipt_note.errors.save_failed'));
        }

        $msgKey = $submitForQc
            ? 'inventory_messages.goods_receipt_note.messages.updated_qc_pending'
            : 'inventory_messages.goods_receipt_note.messages.updated_draft';

        return redirect()
            ->route('inventory.goods-receipt-note.index')
            ->with('success', __($msgKey, ['number' => $grn->fresh()->grn_number]));
    }

    public function approve(Request $request, int $id)
    {
        $this->requirePermission($request, null, 'can_edit');

        $compId = $this->resolvedCompId($request);
        $locationId = $this->resolvedLocationId($request);

        if (! $compId || ! $locationId) {
            return back()->with('error', __('inventory_messages.goods_receipt_note.errors.company_location_required'));
        }

        $grn = GoodsReceiptNote::query()
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->whereKey($id)
            ->first();

        if (! $grn) {
            return back()->with('error', __('inventory_messages.goods_receipt_note.errors.not_found'));
        }

        if ($grn->status !== 'draft') {
            return back()->with('error', __('inventory_messages.goods_receipt_note.errors.only_draft_can_submit_qc'));
        }

        $grn->load('lines');
        $linesToPersist = $grn->lines
            ->map(fn (GoodsReceiptNoteLine $l) => [
                'purchase_order_line_id' => $l->purchase_order_line_id,
                'receipt_qty' => $l->receipt_qty,
            ])
            ->all();

        try {
            $this->assertReceiptQtyWithinPending($linesToPersist, (int) $grn->purchase_order_id);
        } catch (ValidationException $e) {
            return back()->withErrors($e->errors());
        }

        $userId = $this->resolvedUserId($request);

        try {
            DB::transaction(function () use ($grn, $userId) {
                $doc = GoodsReceiptNote::query()->whereKey($grn->id)->lockForUpdate()->firstOrFail();
                $doc->load('lines');
                $this->applyReceiptQuantitiesToPurchaseOrder($doc);
                $doc->status = 'qc_pending';
                $doc->updated_by = $userId;
                $doc->save();
            });
        } catch (\Throwable $e) {
            report($e);

            return back()->with('error', __('inventory_messages.goods_receipt_note.errors.save_failed'));
        }

        return back()->with('success', __('inventory_messages.goods_receipt_note.messages.submitted_qc', ['number' => $grn->grn_number]));
    }

    public function destroy(Request $request, int $id)
    {
        $this->requirePermission($request, null, 'can_delete');

        $compId = $this->resolvedCompId($request);
        $locationId = $this->resolvedLocationId($request);

        if (! $compId || ! $locationId) {
            return back()->with('error', __('inventory_messages.goods_receipt_note.errors.company_location_required'));
        }

        $grn = GoodsReceiptNote::query()
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->whereKey($id)
            ->first();

        if (! $grn) {
            return back()->with('error', __('inventory_messages.goods_receipt_note.errors.not_found'));
        }

        if ($grn->status !== 'draft') {
            return back()->with('error', __('inventory_messages.goods_receipt_note.errors.only_draft_can_delete'));
        }

        $number = $grn->grn_number;

        try {
            $grn->delete();
        } catch (\Throwable $e) {
            report($e);

            return back()->with('error', __('inventory_messages.goods_receipt_note.errors.delete_failed'));
        }

        return redirect()
            ->route('inventory.goods-receipt-note.index')
            ->with('success', __('inventory_messages.goods_receipt_note.messages.deleted', ['number' => $number]));
    }

    public function invoice(Request $request, int $id, string $variant): Response
    {
        $this->requirePermission($request, null, 'can_view');

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

        $grn = GoodsReceiptNote::query()
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->whereKey($id)
            ->with([
                'lines.inventoryItem:id,item_code,item_name_short',
                'lines.uom:id,uom_code,uom_name',
                'lines.putAwayLocation:id,location_name',
                'vendor:id,account_code,account_name',
                'purchaseOrder:id,po_number',
                'receiveLocation:id,location_name',
                'currency:id,code,name',
            ])
            ->firstOrFail();

        $view = $variant === 'summary'
            ? 'inventory.goods_receipt_note.invoice_summary'
            : 'inventory.goods_receipt_note.invoice_detailed';

        return response()->view($view, [
            'grn' => $grn,
            'company' => $company,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeGrnForEdit(GoodsReceiptNote $doc): array
    {
        $doc->load([
            'lines.purchaseOrderLine',
            'lines.inventoryItem:id,item_code,item_name_short',
            'lines.uom:id,uom_code,uom_name',
            'purchaseOrder:id,po_number',
            'vendor:id,account_code,account_name',
        ]);

        $lines = $doc->lines->map(function (GoodsReceiptNoteLine $l) {
            $poLine = $l->purchaseOrderLine;
            $item = $l->inventoryItem;
            $u = $l->uom;

            return [
                'purchase_order_line_id' => (string) $l->purchase_order_line_id,
                'inventory_item_id' => (string) $l->inventory_item_id,
                'item_label' => $item
                    ? $item->item_code.' — '.$item->item_name_short
                    : (string) $l->inventory_item_id,
                'item_description' => $l->item_description ?? '',
                'uom_label' => $u
                    ? $u->uom_code.' — '.$u->uom_name
                    : (string) $l->uom_id,
                'po_ordered_qty' => $poLine ? (string) $poLine->ordered_qty : (string) $l->po_ordered_qty,
                'previously_received_qty' => $poLine ? (string) $poLine->received_qty : (string) $l->snapshot_previously_received_qty,
                'receipt_qty' => (string) $l->receipt_qty,
                'unit_cost' => (string) $l->unit_cost,
                'accepted_qty' => $l->accepted_qty !== null ? (string) $l->accepted_qty : '',
                'rejection_reason' => $l->rejection_reason ?? '',
                'qc_line_status' => $l->qc_line_status,
                'lot_batch_no' => $l->lot_batch_no ?? '',
                'manufacturing_date' => $l->manufacturing_date ? $l->manufacturing_date->format('Y-m-d') : '',
                'expiry_date' => $l->expiry_date ? $l->expiry_date->format('Y-m-d') : '',
                'temperature_at_receipt' => $l->temperature_at_receipt !== null ? (string) $l->temperature_at_receipt : '',
                'put_away_location_id' => $l->put_away_location_id ? (string) $l->put_away_location_id : '',
                'line_notes' => $l->line_notes ?? '',
            ];
        })->values()->all();

        return [
            'id' => $doc->id,
            'status' => $doc->status,
            'purchase_order_id' => (string) $doc->purchase_order_id,
            'po_number' => $doc->purchaseOrder?->po_number ?? '',
            'vendor_id' => (string) $doc->vendor_id,
            'vendor_display' => $doc->vendor
                ? $doc->vendor->account_code.' - '.$doc->vendor->account_name
                : '',
            'grn_number' => $doc->grn_number,
            'grn_type' => $doc->grn_type,
            'receipt_date' => $doc->receipt_date?->format('Y-m-d') ?? '',
            'posting_date' => $doc->posting_date?->format('Y-m-d') ?? '',
            'receive_location_id' => $doc->receive_location_id ? (string) $doc->receive_location_id : '',
            'vehicle_number' => $doc->vehicle_number ?? '',
            'transporter_name' => $doc->transporter_name ?? '',
            'driver_contact' => $doc->driver_contact ?? '',
            'seal_number' => $doc->seal_number ?? '',
            'container_number' => $doc->container_number ?? '',
            'bol_awb' => $doc->bol_awb ?? '',
            'packing_list_ref' => $doc->packing_list_ref ?? '',
            'vendor_delivery_note_no' => $doc->vendor_delivery_note_no ?? '',
            'currency_id' => $doc->currency_id ? (string) $doc->currency_id : '',
            'fx_rate' => $doc->fx_rate !== null && $doc->fx_rate !== '' ? (string) $doc->fx_rate : '',
            'overall_qc_status' => $doc->overall_qc_status,
            'landed_cost_applies' => (bool) $doc->landed_cost_applies,
            'landed_cost_reference' => $doc->landed_cost_reference ?? '',
            'three_way_match_status' => $doc->three_way_match_status ?? 'pending',
            'notes' => $doc->notes ?? '',
            'initial_status' => 'draft',
            'lines' => $lines,
        ];
    }

    private function applyReceiptQuantitiesToPurchaseOrder(GoodsReceiptNote $doc): void
    {
        $doc->load('lines');
        foreach ($doc->lines as $line) {
            /** @var PurchaseOrderLine $poLine */
            $poLine = PurchaseOrderLine::query()
                ->whereKey($line->purchase_order_line_id)
                ->where('purchase_order_id', $doc->purchase_order_id)
                ->firstOrFail();

            $receiptQty = (float) $line->receipt_qty;
            $newReceived = (float) $poLine->received_qty + $receiptQty;
            $poLine->received_qty = $newReceived;
            $ordered = (float) $poLine->ordered_qty;
            if ($newReceived + 0.000001 >= $ordered) {
                $poLine->line_status = 'closed';
            } elseif ($newReceived > 0) {
                $poLine->line_status = 'partial';
            }
            $poLine->save();
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function formPageData(int $compId, int $locationId): array
    {
        $locationOptions = \App\Models\Location::query()
            ->where('company_id', $compId)
            ->where('status', true)
            ->orderBy('location_name')
            ->get(['id', 'location_name'])
            ->map(fn ($l) => [
                'value' => (string) $l->id,
                'label' => $l->location_name,
            ])
            ->values();

        $currencyOptions = \App\Models\Currency::query()
            ->active()
            ->orderBy('code')
            ->get(['id', 'code', 'name'])
            ->map(fn ($c) => [
                'value' => (string) $c->id,
                'label' => $c->code.' — '.$c->name,
            ])
            ->values();

        $items = \App\Models\InventoryItem::query()
            ->byCompanyAndLocation($compId, $locationId)
            ->active()
            ->where('item_status', '!=', 'blocked')
            ->orderBy('item_code')
            ->get([
                'id', 'item_code', 'item_name_short', 'purchase_uom_id', 'stock_uom_id', 'tax_category_id',
            ]);

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

        $defaultShipTo = $locationOptions->firstWhere('value', (string) $locationId);

        return [
            'locationOptions' => $locationOptions,
            'currencyOptions' => $currencyOptions,
            'approvedPoOptions' => $this->approvedPurchaseOrderOptions($compId, $locationId),
            'itemMetaById' => $itemMetaById,
            'defaults' => [
                'receipt_date' => now()->toDateString(),
                'posting_date' => now()->toDateString(),
                'receive_location_id' => $defaultShipTo ? (string) $locationId : '',
                'currency_id' => '',
                'fx_rate' => '',
            ],
            'preview_grn_number' => InventoryDocumentNumberService::previewNext(
                $compId,
                $locationId,
                InventoryDocumentNumberService::DOCUMENT_GOODS_RECEIPT_NOTE
            ),
        ];
    }

    /**
     * @return \Illuminate\Support\Collection<int, array{value: string, label: string}>
     */
    private function approvedPurchaseOrderOptions(int $compId, int $locationId)
    {
        $orders = PurchaseOrder::query()
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->where('status', 'approved')
            ->with(['lines'])
            ->orderByDesc('po_date')
            ->orderByDesc('id')
            ->limit(400)
            ->get();

        return $orders
            ->filter(function (PurchaseOrder $po) {
                foreach ($po->lines as $line) {
                    $pending = (float) $line->ordered_qty - (float) $line->received_qty;
                    if ($pending > 0.000001) {
                        return true;
                    }
                }

                return false;
            })
            ->map(fn (PurchaseOrder $p) => [
                'value' => (string) $p->id,
                'label' => $p->po_number.' · '.$p->po_date->format('Y-m-d'),
            ])
            ->values();
    }

    private function findReceivablePurchaseOrder(int $compId, int $locationId, int $poId): ?PurchaseOrder
    {
        $po = PurchaseOrder::query()
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->whereKey($poId)
            ->where('status', 'approved')
            ->first();

        if (! $po) {
            return null;
        }

        $po->load('lines');
        foreach ($po->lines as $line) {
            if ((float) $line->ordered_qty - (float) $line->received_qty > 0.000001) {
                return $po;
            }
        }

        return null;
    }

    /**
     * @param  array<int, array<string, mixed>>  $linesToPersist
     */
    private function assertReceiptQtyWithinPending(array $linesToPersist, int $purchaseOrderId): void
    {
        foreach ($linesToPersist as $row) {
            $poLine = PurchaseOrderLine::query()
                ->whereKey($row['purchase_order_line_id'])
                ->where('purchase_order_id', $purchaseOrderId)
                ->first();

            if (! $poLine) {
                throw ValidationException::withMessages([
                    'lines' => __('inventory_messages.goods_receipt_note.errors.line_not_on_po'),
                ]);
            }

            $pending = (float) $poLine->ordered_qty - (float) $poLine->received_qty;
            $want = (float) $row['receipt_qty'];
            if ($want > $pending + 0.000001) {
                throw ValidationException::withMessages([
                    'lines' => __('inventory_messages.goods_receipt_note.errors.receipt_exceeds_pending', [
                        'line' => $poLine->line_no,
                        'max' => $this->formatQtyForMessage($pending),
                    ]),
                ]);
            }
        }
    }

    private function formatQtyForMessage(float $qty): string
    {
        $s = number_format($qty, 6, '.', '');
        $s = rtrim(rtrim($s, '0'), '.');

        return $s === '' ? '0' : $s;
    }

    /**
     * @return array<string, mixed>
     */
    private function validatedPayload(Request $request, int $compId, int $locationId): array
    {
        $validated = $request->validate([
            'purchase_order_id' => [
                'required',
                'integer',
                Rule::exists('purchase_orders', 'id')->where(function ($q) use ($compId, $locationId) {
                    $q->where('comp_id', $compId)
                        ->where('location_id', $locationId)
                        ->where('status', 'approved');
                }),
            ],
            'vendor_id' => [
                'required',
                'integer',
                Rule::exists('chart_of_accounts', 'id')->where(fn ($q) => $q
                    ->where('comp_id', $compId)
                    ->where('party_type', 'vendor')
                    ->where('status', 'Active')),
            ],
            'initial_status' => ['required', Rule::in(['draft', 'qc_pending'])],
            'grn_type' => ['required', Rule::in(['standard', 'import', 'return_from_vendor', 'sample', 'consolidated'])],
            'receipt_date' => ['required', 'date'],
            'posting_date' => ['nullable', 'date'],
            'receive_location_id' => [
                'nullable',
                Rule::exists('locations', 'id')->where('company_id', $compId),
            ],
            'vehicle_number' => ['nullable', 'string', 'max:80'],
            'transporter_name' => ['nullable', 'string', 'max:160'],
            'driver_contact' => ['nullable', 'string', 'max:160'],
            'seal_number' => ['nullable', 'string', 'max:80'],
            'container_number' => ['nullable', 'string', 'max:80'],
            'bol_awb' => ['nullable', 'string', 'max:120'],
            'packing_list_ref' => ['nullable', 'string', 'max:120'],
            'vendor_delivery_note_no' => ['nullable', 'string', 'max:120'],
            'currency_id' => ['nullable', 'exists:currencies,id'],
            'fx_rate' => ['nullable', 'numeric', 'min:0'],
            'overall_qc_status' => ['required', Rule::in(['pending', 'passed', 'failed', 'partial'])],
            'landed_cost_applies' => ['required', 'boolean'],
            'landed_cost_reference' => [
                'nullable',
                'string',
                'max:120',
                Rule::requiredIf(fn () => $request->boolean('landed_cost_applies')),
            ],
            'notes' => ['nullable', 'string', 'max:5000'],
            'lines' => ['required', 'array', 'min:1'],
            'lines.*.purchase_order_line_id' => ['required', 'integer'],
            'lines.*.item_description' => ['nullable', 'string', 'max:500'],
            'lines.*.receipt_qty' => ['required', 'numeric', 'min:0'],
            'lines.*.unit_cost' => ['required', 'numeric', 'min:0'],
            'lines.*.accepted_qty' => ['nullable', 'numeric', 'min:0'],
            'lines.*.rejection_reason' => ['nullable', 'string', 'max:120'],
            'lines.*.qc_line_status' => ['required', Rule::in(['passed', 'failed', 'partial', 'waived'])],
            'lines.*.lot_batch_no' => ['nullable', 'string', 'max:120'],
            'lines.*.manufacturing_date' => ['nullable', 'date'],
            'lines.*.expiry_date' => ['nullable', 'date'],
            'lines.*.temperature_at_receipt' => ['nullable', 'numeric'],
            'lines.*.put_away_location_id' => [
                'nullable',
                Rule::exists('locations', 'id')->where('company_id', $compId),
            ],
            'lines.*.line_notes' => ['nullable', 'string', 'max:500'],
        ]);

        $po = PurchaseOrder::query()
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->whereKey((int) $validated['purchase_order_id'])
            ->where('status', 'approved')
            ->with('lines')
            ->first();

        if (! $po || (int) $po->vendor_id !== (int) $validated['vendor_id']) {
            throw ValidationException::withMessages([
                'vendor_id' => __('inventory_messages.goods_receipt_note.errors.vendor_mismatch'),
            ]);
        }

        $lineIds = collect($validated['lines'])->pluck('purchase_order_line_id')->map(fn ($v) => (int) $v);
        $uniqueIds = $lineIds->unique()->values();
        if ($lineIds->count() !== $uniqueIds->count()) {
            throw ValidationException::withMessages([
                'lines' => __('inventory_messages.goods_receipt_note.errors.duplicate_po_line'),
            ]);
        }
        $lineIdArr = $uniqueIds->all();
        $belongs = $po->lines->whereIn('id', $lineIdArr)->count();
        if ($belongs !== count($lineIdArr)) {
            throw ValidationException::withMessages([
                'lines' => __('inventory_messages.goods_receipt_note.errors.line_not_on_po'),
            ]);
        }

        foreach ($validated['lines'] as $i => $row) {
            if ((float) $row['receipt_qty'] <= 0) {
                continue;
            }
            $receiptQty = (float) $row['receipt_qty'];
            $accepted = isset($row['accepted_qty']) && $row['accepted_qty'] !== '' && $row['accepted_qty'] !== null
                ? (float) $row['accepted_qty']
                : $receiptQty;
            if ($accepted - $receiptQty > 0.000001) {
                throw ValidationException::withMessages([
                    "lines.$i.accepted_qty" => __('inventory_messages.goods_receipt_note.errors.accepted_gt_receipt'),
                ]);
            }
            $rejected = $receiptQty - min($accepted, $receiptQty);
            if ($rejected > 0.000001) {
                $reason = $row['rejection_reason'] ?? '';
                if ($reason === '' || $reason === null) {
                    throw ValidationException::withMessages([
                        "lines.$i.rejection_reason" => __('inventory_messages.goods_receipt_note.errors.rejection_reason_required'),
                    ]);
                }
            }
        }

        $validated['purchase_order_id'] = (int) $validated['purchase_order_id'];
        $validated['vendor_id'] = (int) $validated['vendor_id'];

        return $validated;
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
}

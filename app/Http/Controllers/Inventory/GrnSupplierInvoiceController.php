<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Http\Traits\CheckUserPermissions;
use App\Models\ChartOfAccount;
use App\Models\Company;
use App\Models\GoodsReceiptNote;
use App\Models\GrnSupplierInvoice;
use App\Models\GrnSupplierInvoiceLineTax;
use App\Services\GrnPurchaseInvoicePayloadService;
use App\Services\GrnPurchaseInvoicePostingService;
use App\Services\InventoryDocumentNumberService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class GrnSupplierInvoiceController extends Controller
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
        ];

        if (! $compId || ! $locationId) {
            $emptyPaginator = new LengthAwarePaginator(
                [],
                0,
                15,
                1,
                ['path' => $request->url(), 'query' => $request->query()]
            );

            return Inertia::render('Inventory/GrnSupplierInvoice/List', [
                'invoices' => $emptyPaginator,
                'filters' => $filters,
                'error' => __('inventory_messages.grn_supplier_invoice.errors.company_location_required'),
            ]);
        }

        $query = GrnSupplierInvoice::query()
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->withCount('goodsReceiptNotes')
            ->with(['vendor:id,account_code,account_name']);

        if ($request->filled('search')) {
            $term = '%'.$request->input('search').'%';
            $query->where(function ($q) use ($term) {
                $q->where('invoice_number', 'like', $term)
                    ->orWhere('reference_number', 'like', $term)
                    ->orWhere('notes', 'like', $term);
            });
        }

        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }

        $invoices = $query
            ->orderByDesc('id')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Inventory/GrnSupplierInvoice/List', [
            'invoices' => $invoices,
            'filters' => $filters,
        ]);
    }

    public function create(Request $request)
    {
        $this->requirePermission($request, null, 'can_add');

        $compId = $this->resolvedCompId($request);
        $locationId = $this->resolvedLocationId($request);

        if (! $compId || ! $locationId) {
            return Inertia::render('Inventory/GrnSupplierInvoice/Create', [
                'error' => __('inventory_messages.grn_supplier_invoice.errors.company_location_required'),
                'vendorOptions' => [],
                'preview_invoice_number' => null,
                'invoice' => null,
                'gl_accounts' => [],
                'missing_inventory_gl' => false,
                'missing_tax_gl' => false,
            ]);
        }

        $preview = InventoryDocumentNumberService::previewNext(
            $compId,
            $locationId,
            InventoryDocumentNumberService::DOCUMENT_GRN_SUPPLIER_INVOICE
        );

        return Inertia::render('Inventory/GrnSupplierInvoice/Create', [
            'vendorOptions' => $this->vendorOptions($compId),
            'preview_invoice_number' => $preview,
            'invoice' => null,
            'gl_accounts' => $this->transactionalGlAccounts($compId, $locationId),
            'missing_inventory_gl' => false,
            'missing_tax_gl' => false,
        ]);
    }

    public function eligibleGrns(Request $request): JsonResponse
    {
        $this->requirePermission($request, null, 'can_view');

        $compId = $this->resolvedCompId($request);
        $locationId = $this->resolvedLocationId($request);
        $vendorId = (int) $request->input('vendor_id', 0);
        $exceptInvoiceId = $request->filled('except_invoice_id')
            ? (int) $request->input('except_invoice_id')
            : null;

        if (! $compId || ! $locationId || $vendorId <= 0) {
            return response()->json(['grns' => []], 422);
        }

        $reserved = $this->grnIdsReservedOnDraftInvoices($compId, $locationId, $exceptInvoiceId);

        $rows = GoodsReceiptNote::query()
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->where('vendor_id', $vendorId)
            ->where('status', 'qc_pending')
            ->whereNull('posted_transaction_id')
            ->whereNotIn('id', $reserved)
            ->with(['purchaseOrder:id,po_number'])
            ->orderByDesc('receipt_date')
            ->orderByDesc('id')
            ->get(['id', 'grn_number', 'receipt_date', 'purchase_order_id']);

        return response()->json([
            'grns' => $rows->map(fn (GoodsReceiptNote $g) => [
                'id' => $g->id,
                'grn_number' => $g->grn_number,
                'receipt_date' => $g->receipt_date?->format('Y-m-d') ?? '',
                'po_number' => $g->purchaseOrder?->po_number ?? '',
            ])->values()->all(),
        ]);
    }

    public function previewLines(Request $request): JsonResponse
    {
        $this->requirePermission($request, null, 'can_view');

        $compId = $this->resolvedCompId($request);
        $locationId = $this->resolvedLocationId($request);
        $vendorId = (int) $request->input('vendor_id', 0);
        $grnIds = array_map('intval', (array) $request->input('grn_ids', []));
        $grnIds = array_values(array_unique(array_filter($grnIds, fn ($id) => $id > 0)));
        $exceptInvoiceId = $request->filled('except_invoice_id')
            ? (int) $request->input('except_invoice_id')
            : null;

        if (! $compId || ! $locationId || $vendorId <= 0 || $grnIds === []) {
            return response()->json(['message' => __('inventory_messages.grn_supplier_invoice.errors.invalid_grn_selection')], 422);
        }

        try {
            $grns = $this->loadValidatedGrnsForVendor($compId, $locationId, $vendorId, $grnIds, $exceptInvoiceId);
        } catch (ValidationException $e) {
            return response()->json(['message' => collect($e->errors())->flatten()->first()], 422);
        }

        $flatLines = [];
        $missingGl = 0;
        $missingTaxGl = 0;
        foreach ($grns as $grn) {
            $payload = GrnPurchaseInvoicePayloadService::serializeGrn($grn);
            $missingGl += (int) ($payload['missing_inventory_gl_lines'] ?? 0);
            $missingTaxGl += (int) ($payload['missing_input_tax_gl_lines'] ?? 0);
            foreach ($payload['lines'] as $l) {
                $flatLines[] = array_merge($l, [
                    'grn_id' => $grn->id,
                    'grn_number' => $grn->grn_number,
                ]);
            }
        }

        return response()->json([
            'lines' => $flatLines,
            'missing_inventory_gl' => $missingGl > 0,
            'missing_tax_gl' => $missingTaxGl > 0,
        ]);
    }

    public function store(Request $request, GrnPurchaseInvoicePostingService $posting)
    {
        $this->requirePermission($request, null, 'can_add');

        $compId = $this->resolvedCompId($request);
        $locationId = $this->resolvedLocationId($request);
        $userId = $this->resolvedUserId($request) ?: 1;

        if (! $compId || ! $locationId) {
            return back()->with('error', __('inventory_messages.grn_supplier_invoice.errors.company_location_required'));
        }

        $validated = $this->validatePayload($request);
        $grnIds = array_values(array_unique(array_map('intval', $validated['grn_ids'])));

        try {
            $grns = $this->loadValidatedGrnsForVendor($compId, $locationId, (int) $validated['vendor_id'], $grnIds, null);
            $this->assertAllLinesCovered($grns, $validated['lines']);
        } catch (ValidationException $e) {
            return back()->withErrors($e->errors())->withInput();
        }

        try {
            $invoice = DB::transaction(function () use (
                $compId,
                $locationId,
                $validated,
                $grnIds,
                $userId,
                $request,
                $posting
            ) {
                $invoice = new GrnSupplierInvoice;
                $invoice->comp_id = $compId;
                $invoice->location_id = $locationId;
                $invoice->invoice_number = InventoryDocumentNumberService::allocateNext(
                    $compId,
                    $locationId,
                    InventoryDocumentNumberService::DOCUMENT_GRN_SUPPLIER_INVOICE
                );
                $invoice->vendor_id = (int) $validated['vendor_id'];
                $invoice->reference_number = $validated['reference_number'] ?? null;
                $invoice->supplier_invoice_date = $validated['supplier_invoice_date'] ?? null;
                $invoice->due_date = $validated['due_date'] ?? null;
                $invoice->description = $validated['description'] ?? null;
                $invoice->notes = $validated['notes'] ?? null;
                $invoice->voucher_date = $validated['voucher_date'] ?? null;
                $invoice->status = 'draft';
                $invoice->created_by = $userId;
                $invoice->updated_by = $userId;
                $invoice->save();

                $invoice->goodsReceiptNotes()->sync($grnIds);
                $this->syncLineTaxes($invoice, $validated['lines']);

                if ($request->boolean('post_now')) {
                    $this->executePost($invoice, $validated, $userId, $posting);
                }

                return $invoice->fresh(['lineTaxes', 'goodsReceiptNotes']);
            });
        } catch (ValidationException $e) {
            return back()->withErrors($e->errors())->withInput();
        } catch (\Throwable $e) {
            report($e);

            return back()->withInput()->with('error', __('inventory_messages.grn_supplier_invoice.errors.post_failed'));
        }

        if ($request->boolean('post_now')) {
            return redirect()
                ->route('inventory.grn-supplier-invoice.index')
                ->with('success', __('inventory_messages.grn_supplier_invoice.messages.posted', [
                    'number' => $invoice->invoice_number,
                    'voucher_id' => (string) ($invoice->posted_transaction_id ?? ''),
                ]));
        }

        return redirect()
            ->route('inventory.grn-supplier-invoice.edit', $invoice->id)
            ->with('success', __('inventory_messages.grn_supplier_invoice.messages.created_draft', [
                'number' => $invoice->invoice_number,
            ]));
    }

    public function edit(Request $request, int $id)
    {
        $this->requirePermission($request, null, 'can_edit');

        $compId = $this->resolvedCompId($request);
        $locationId = $this->resolvedLocationId($request);

        if (! $compId || ! $locationId) {
            return redirect()
                ->route('inventory.grn-supplier-invoice.index')
                ->with('error', __('inventory_messages.grn_supplier_invoice.errors.company_location_required'));
        }

        $invoice = GrnSupplierInvoice::query()
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->whereKey($id)
            ->with([
                'goodsReceiptNotes.purchaseOrder:id,po_number',
                'lineTaxes',
                'vendor:id,account_code,account_name',
            ])
            ->first();

        if (! $invoice) {
            return redirect()
                ->route('inventory.grn-supplier-invoice.index')
                ->with('error', __('inventory_messages.grn_supplier_invoice.errors.not_found'));
        }

        if ($invoice->status !== 'draft') {
            return redirect()
                ->route('inventory.grn-supplier-invoice.index')
                ->with('error', __('inventory_messages.grn_supplier_invoice.errors.only_draft_editable'));
        }

        $taxByLineId = $invoice->lineTaxes->keyBy('goods_receipt_note_line_id');

        $grns = $invoice->goodsReceiptNotes()
            ->orderByDesc('receipt_date')
            ->orderByDesc('goods_receipt_notes.id')
            ->get();

        $flatLines = [];
        $missingGl = 0;
        $missingTaxGl = 0;
        foreach ($grns as $grn) {
            $payload = GrnPurchaseInvoicePayloadService::serializeGrn($grn);
            $missingGl += (int) ($payload['missing_inventory_gl_lines'] ?? 0);
            $missingTaxGl += (int) ($payload['missing_input_tax_gl_lines'] ?? 0);
            foreach ($payload['lines'] as $l) {
                $tid = (int) $l['id'];
                $override = $taxByLineId->get($tid);

                $flatLines[] = array_merge($l, [
                    'grn_id' => $grn->id,
                    'grn_number' => $grn->grn_number,
                    'saved_tax_amount' => $override !== null
                        ? (string) $override->tax_amount
                        : (string) ($l['default_tax_amount'] ?? 0),
                ]);
            }
        }

        return Inertia::render('Inventory/GrnSupplierInvoice/Create', [
            'vendorOptions' => $this->vendorOptions($compId),
            'preview_invoice_number' => $invoice->invoice_number,
            'invoice' => [
                'id' => $invoice->id,
                'invoice_number' => $invoice->invoice_number,
                'vendor_id' => (string) $invoice->vendor_id,
                'reference_number' => $invoice->reference_number ?? '',
                'supplier_invoice_date' => $invoice->supplier_invoice_date?->format('Y-m-d') ?? '',
                'due_date' => $invoice->due_date?->format('Y-m-d') ?? '',
                'description' => $invoice->description ?? '',
                'notes' => $invoice->notes ?? '',
                'voucher_date' => $invoice->voucher_date?->format('Y-m-d') ?? '',
                'grn_ids' => $grns->pluck('id')->map(fn ($id) => (int) $id)->values()->all(),
            ],
            'initial_lines' => $flatLines,
            'gl_accounts' => $this->transactionalGlAccounts($compId, $locationId),
            'missing_inventory_gl' => $missingGl > 0,
            'missing_tax_gl' => $missingTaxGl > 0,
        ]);
    }

    public function update(Request $request, int $id, GrnPurchaseInvoicePostingService $posting)
    {
        $this->requirePermission($request, null, 'can_edit');

        $compId = $this->resolvedCompId($request);
        $locationId = $this->resolvedLocationId($request);
        $userId = $this->resolvedUserId($request) ?: 1;

        if (! $compId || ! $locationId) {
            return back()->with('error', __('inventory_messages.grn_supplier_invoice.errors.company_location_required'));
        }

        $invoice = GrnSupplierInvoice::query()
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->whereKey($id)
            ->first();

        if (! $invoice) {
            return back()->with('error', __('inventory_messages.grn_supplier_invoice.errors.not_found'));
        }

        if ($invoice->status !== 'draft') {
            return back()->with('error', __('inventory_messages.grn_supplier_invoice.errors.only_draft_editable'));
        }

        $validated = $this->validatePayload($request);
        $grnIds = array_values(array_unique(array_map('intval', $validated['grn_ids'])));

        if ((int) $validated['vendor_id'] !== (int) $invoice->vendor_id) {
            return back()
                ->withErrors(['vendor_id' => __('inventory_messages.goods_receipt_note.errors.vendor_mismatch')])
                ->withInput();
        }

        try {
            $grns = $this->loadValidatedGrnsForVendor($compId, $locationId, (int) $validated['vendor_id'], $grnIds, $invoice->id);
            $this->assertAllLinesCovered($grns, $validated['lines']);
        } catch (ValidationException $e) {
            return back()->withErrors($e->errors())->withInput();
        }

        try {
            DB::transaction(function () use ($invoice, $validated, $grnIds, $userId, $request, $posting) {
                $invoice->reference_number = $validated['reference_number'] ?? null;
                $invoice->supplier_invoice_date = $validated['supplier_invoice_date'] ?? null;
                $invoice->due_date = $validated['due_date'] ?? null;
                $invoice->description = $validated['description'] ?? null;
                $invoice->notes = $validated['notes'] ?? null;
                $invoice->voucher_date = $validated['voucher_date'] ?? null;
                $invoice->updated_by = $userId;
                $invoice->save();

                $invoice->goodsReceiptNotes()->sync($grnIds);
                $this->syncLineTaxes($invoice, $validated['lines']);

                if ($request->boolean('post_now')) {
                    $invoice->refresh();
                    $this->executePost($invoice, $validated, $userId, $posting);
                }
            });
        } catch (ValidationException $e) {
            return back()->withErrors($e->errors())->withInput();
        } catch (\Throwable $e) {
            report($e);

            return back()->withInput()->with('error', __('inventory_messages.grn_supplier_invoice.errors.post_failed'));
        }

        $invoice->refresh();

        if ($request->boolean('post_now')) {
            return redirect()
                ->route('inventory.grn-supplier-invoice.index')
                ->with('success', __('inventory_messages.grn_supplier_invoice.messages.posted', [
                    'number' => $invoice->invoice_number,
                    'voucher_id' => (string) ($invoice->posted_transaction_id ?? ''),
                ]));
        }

        return redirect()
            ->route('inventory.grn-supplier-invoice.edit', $invoice->id)
            ->with('success', __('inventory_messages.grn_supplier_invoice.messages.updated', [
                'number' => $invoice->invoice_number,
            ]));
    }

    public function post(Request $request, int $id, GrnPurchaseInvoicePostingService $posting)
    {
        $this->requirePermission($request, null, 'can_edit');

        $compId = $this->resolvedCompId($request);
        $locationId = $this->resolvedLocationId($request);
        $userId = $this->resolvedUserId($request) ?: 1;

        if (! $compId || ! $locationId) {
            return back()->with('error', __('inventory_messages.grn_supplier_invoice.errors.company_location_required'));
        }

        $invoice = GrnSupplierInvoice::query()
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->whereKey($id)
            ->with(['lineTaxes', 'goodsReceiptNotes'])
            ->first();

        if (! $invoice) {
            return back()->with('error', __('inventory_messages.grn_supplier_invoice.errors.not_found'));
        }

        if ($invoice->status !== 'draft') {
            return back()->with('error', __('inventory_messages.grn_supplier_invoice.errors.only_draft_postable'));
        }

        $validated = $request->validate([
            'voucher_date' => ['required', 'date'],
            'reference_number' => ['nullable', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:250'],
            'supplier_invoice_date' => ['nullable', 'date'],
            'due_date' => ['nullable', 'date'],
            'additional_entries' => ['nullable', 'array', 'max:40'],
            'additional_entries.*.account_id' => ['nullable', 'integer'],
            'additional_entries.*.debit_amount' => ['nullable', 'numeric', 'min:0'],
            'additional_entries.*.credit_amount' => ['nullable', 'numeric', 'min:0'],
            'additional_entries.*.description' => ['nullable', 'string', 'max:500'],
        ]);

        $linesPayload = $invoice->lineTaxes->map(fn ($t) => [
            'goods_receipt_note_line_id' => $t->goods_receipt_note_line_id,
            'tax_amount' => (float) $t->tax_amount,
        ])->values()->all();

        $merged = array_merge($validated, [
            'lines' => $linesPayload,
        ]);

        try {
            DB::transaction(function () use ($invoice, $merged, $userId, $posting) {
                $invoice->voucher_date = $merged['voucher_date'];
                $invoice->reference_number = $merged['reference_number'] ?? $invoice->reference_number;
                $invoice->description = $merged['description'] ?? $invoice->description;
                $invoice->supplier_invoice_date = $merged['supplier_invoice_date'] ?? $invoice->supplier_invoice_date;
                $invoice->due_date = $merged['due_date'] ?? $invoice->due_date;
                $invoice->save();

                $this->executePost($invoice, $merged, $userId, $posting);
            });
        } catch (ValidationException $e) {
            return back()->withErrors($e->errors())->withInput();
        } catch (\Throwable $e) {
            report($e);

            return back()->with('error', __('inventory_messages.grn_supplier_invoice.errors.post_failed'));
        }

        $invoice->refresh();

        return redirect()
            ->route('inventory.grn-supplier-invoice.index')
            ->with('success', __('inventory_messages.grn_supplier_invoice.messages.posted', [
                'number' => $invoice->invoice_number,
                'voucher_id' => (string) ($invoice->posted_transaction_id ?? ''),
            ]));
    }

    public function destroy(Request $request, int $id)
    {
        $this->requirePermission($request, null, 'can_delete');

        $compId = $this->resolvedCompId($request);
        $locationId = $this->resolvedLocationId($request);

        if (! $compId || ! $locationId) {
            return back()->with('error', __('inventory_messages.grn_supplier_invoice.errors.company_location_required'));
        }

        $invoice = GrnSupplierInvoice::query()
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->whereKey($id)
            ->first();

        if (! $invoice) {
            return back()->with('error', __('inventory_messages.grn_supplier_invoice.errors.not_found'));
        }

        if ($invoice->status !== 'draft') {
            return back()->with('error', __('inventory_messages.grn_supplier_invoice.errors.only_draft_deletable'));
        }

        $number = $invoice->invoice_number;
        $invoice->delete();

        return redirect()
            ->route('inventory.grn-supplier-invoice.index')
            ->with('success', __('inventory_messages.grn_supplier_invoice.messages.deleted', ['number' => $number]));
    }

    public function invoice(Request $request, int $id, string $variant): Response
    {
        $this->requirePermission($request, null, 'can_view');

        if (! in_array($variant, ['summary', 'detailed', 'voucher'], true)) {
            abort(404);
        }

        $compId = $this->resolvedCompId($request);
        $locationId = $this->resolvedLocationId($request);

        if (! $compId || ! $locationId) {
            abort(403);
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

        $invoice = GrnSupplierInvoice::query()
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->whereKey($id)
            ->with(['vendor:id,account_code,account_name', 'lineTaxes', 'goodsReceiptNotes:id,grn_number,receipt_date,purchase_order_id'])
            ->firstOrFail();

        if ($variant === 'voucher') {
            if ($invoice->status !== 'posted' || ! $invoice->posted_transaction_id) {
                abort(404);
            }

            $transaction = DB::table('transactions')
                ->where('id', $invoice->posted_transaction_id)
                ->where('comp_id', $compId)
                ->where('location_id', $locationId)
                ->first();

            if (! $transaction) {
                abort(404);
            }

            $entries = DB::table('transaction_entries as te')
                ->join('chart_of_accounts as coa', 'coa.id', '=', 'te.account_id')
                ->where('te.transaction_id', $invoice->posted_transaction_id)
                ->where('te.comp_id', $compId)
                ->where('te.location_id', $locationId)
                ->orderBy('te.line_number')
                ->get([
                    'te.line_number',
                    'te.description',
                    'te.debit_amount',
                    'te.credit_amount',
                    'te.base_debit_amount',
                    'te.base_credit_amount',
                    'te.reference',
                    'coa.account_code',
                    'coa.account_name',
                ]);

            return response()->view('inventory.grn_supplier_invoice.invoice_voucher', [
                'invoice' => $invoice,
                'company' => $company,
                'transaction' => $transaction,
                'entries' => $entries,
            ]);
        }

        $grns = $invoice->goodsReceiptNotes()
            ->orderByDesc('receipt_date')
            ->orderByDesc('goods_receipt_notes.id')
            ->with(['purchaseOrder:id,po_number'])
            ->get();

        $grns->load([
            'lines.purchaseOrderLine.taxCategory.inputTaxGlAccount',
            'lines.inventoryItem.inventoryGlAccount',
            'lines.inventoryItem.taxCategory.inputTaxGlAccount',
            'vendor:id,account_code,account_name',
            'purchaseOrder:id,po_number',
            'receiveLocation:id,location_name',
            'currency:id,code,name',
        ]);

        $flatLines = $this->flatLinesForSupplierInvoicePrint($invoice, $grns);

        $postedVoucher = $invoice->posted_transaction_id
            ? DB::table('transactions')
                ->where('id', $invoice->posted_transaction_id)
                ->where('comp_id', $compId)
                ->where('location_id', $locationId)
                ->first(['voucher_number', 'voucher_date'])
            : null;

        $view = $variant === 'summary'
            ? 'inventory.grn_supplier_invoice.invoice_summary'
            : 'inventory.grn_supplier_invoice.invoice_detailed';

        return response()->view($view, [
            'invoice' => $invoice,
            'company' => $company,
            'grns' => $grns,
            'flatLines' => $flatLines,
            'postedVoucher' => $postedVoucher,
        ]);
    }

    /**
     * @param  \Illuminate\Support\Collection<int, GoodsReceiptNote>  $grns
     * @return array<int, array<string, mixed>>
     */
    private function flatLinesForSupplierInvoicePrint(GrnSupplierInvoice $invoice, $grns): array
    {
        $taxByLineId = $invoice->lineTaxes->keyBy('goods_receipt_note_line_id');
        $flatLines = [];
        foreach ($grns as $grn) {
            $payload = GrnPurchaseInvoicePayloadService::serializeGrn($grn);
            foreach ($payload['lines'] as $l) {
                $tid = (int) $l['id'];
                $override = $taxByLineId->get($tid);
                $taxAmt = $override !== null
                    ? (float) $override->tax_amount
                    : (float) ($l['default_tax_amount'] ?? 0);
                $net = (float) ($l['line_value'] ?? 0);
                $flatLines[] = array_merge($l, [
                    'grn_number' => $grn->grn_number,
                    'tax_amount' => round($taxAmt, 2),
                    'line_gross' => round($net + $taxAmt, 2),
                ]);
            }
        }

        return $flatLines;
    }

    /**
     * @param  array<string, mixed>  $validated
     */
    private function executePost(GrnSupplierInvoice $invoice, array $validated, int $userId, GrnPurchaseInvoicePostingService $posting): void
    {
        $voucherDate = $validated['voucher_date'] ?? $invoice->voucher_date?->format('Y-m-d');
        if (! $voucherDate) {
            throw ValidationException::withMessages([
                'voucher_date' => __('validation.required', ['attribute' => 'voucher_date']),
            ]);
        }

        $grns = $invoice->goodsReceiptNotes()
            ->orderByDesc('receipt_date')
            ->orderByDesc('goods_receipt_notes.id')
            ->get();

        if ($grns->isEmpty()) {
            throw ValidationException::withMessages([
                'grn_ids' => __('validation.required', ['attribute' => 'grn_ids']),
            ]);
        }

        $taxByLineId = [];
        foreach ($validated['lines'] as $row) {
            $taxByLineId[(int) $row['goods_receipt_note_line_id']] = (float) $row['tax_amount'];
        }

        $extras = $this->normalizeAdditionalEntries(
            $validated['additional_entries'] ?? [],
            (int) $invoice->comp_id,
            (int) $invoice->location_id
        );

        $description = $validated['description'] ?? $invoice->description;
        $descBits = array_filter([
            $description,
            ! empty($validated['supplier_invoice_date'] ?? $invoice->supplier_invoice_date)
                ? 'Supplier invoice date: '.($validated['supplier_invoice_date'] ?? $invoice->supplier_invoice_date?->format('Y-m-d'))
                : null,
            ! empty($validated['due_date'] ?? $invoice->due_date)
                ? 'Due date: '.($validated['due_date'] ?? $invoice->due_date?->format('Y-m-d'))
                : null,
        ], fn ($v) => $v !== null && $v !== '');
        $description = $descBits !== [] ? implode(' · ', $descBits) : null;

        $transactionId = $posting->postMultiple(
            $grns,
            $voucherDate,
            $validated['reference_number'] ?? $invoice->reference_number,
            $description,
            $userId,
            $taxByLineId,
            $extras
        );

        $invoice->posted_transaction_id = $transactionId;
        $invoice->status = 'posted';
        $invoice->voucher_date = $voucherDate;
        $invoice->updated_by = $userId;
        $invoice->save();
    }

    /**
     * @param  array<int, array{goods_receipt_note_line_id: int, tax_amount: float|int|string}>  $lines
     */
    private function syncLineTaxes(GrnSupplierInvoice $invoice, array $lines): void
    {
        GrnSupplierInvoiceLineTax::query()->where('grn_supplier_invoice_id', $invoice->id)->delete();
        foreach ($lines as $row) {
            GrnSupplierInvoiceLineTax::create([
                'grn_supplier_invoice_id' => $invoice->id,
                'goods_receipt_note_line_id' => (int) $row['goods_receipt_note_line_id'],
                'tax_amount' => round((float) $row['tax_amount'], 2),
            ]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function validatePayload(Request $request): array
    {
        $rules = [
            'vendor_id' => ['required', 'integer'],
            'grn_ids' => ['required', 'array', 'min:1'],
            'grn_ids.*' => ['integer'],
            'reference_number' => ['nullable', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:250'],
            'supplier_invoice_date' => ['nullable', 'date'],
            'due_date' => ['nullable', 'date'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'voucher_date' => ['nullable', 'date'],
            'lines' => ['required', 'array', 'min:1'],
            'lines.*.goods_receipt_note_line_id' => ['required', 'integer'],
            'lines.*.tax_amount' => ['required', 'numeric', 'min:0'],
            'additional_entries' => ['nullable', 'array', 'max:40'],
            'additional_entries.*.account_id' => ['nullable', 'integer'],
            'additional_entries.*.debit_amount' => ['nullable', 'numeric', 'min:0'],
            'additional_entries.*.credit_amount' => ['nullable', 'numeric', 'min:0'],
            'additional_entries.*.description' => ['nullable', 'string', 'max:500'],
        ];

        if ($request->boolean('post_now')) {
            $rules['voucher_date'] = ['required', 'date'];
        }

        return $request->validate($rules);
    }

    /**
     * @param  \Illuminate\Support\Collection<int, GoodsReceiptNote>  $grns
     * @param  array<int, array{goods_receipt_note_line_id: int, tax_amount: mixed}>  $lines
     */
    private function assertAllLinesCovered($grns, array $lines): void
    {
        $allowedLineIds = $grns->flatMap(fn (GoodsReceiptNote $g) => $g->lines->pluck('id'))
            ->map(fn ($id) => (int) $id)
            ->sort()
            ->values();
        $sentLineIds = collect($lines)
            ->pluck('goods_receipt_note_line_id')
            ->map(fn ($v) => (int) $v)
            ->sort()
            ->values();
        if ($sentLineIds->count() !== $allowedLineIds->count() || $sentLineIds->diff($allowedLineIds)->isNotEmpty()) {
            throw ValidationException::withMessages([
                'lines' => __('inventory_messages.goods_receipt_note.errors.purchase_invoice_lines_incomplete'),
            ]);
        }
    }

    /**
     * @param  array<int, int>  $grnIds
     * @return \Illuminate\Support\Collection<int, GoodsReceiptNote>
     */
    private function loadValidatedGrnsForVendor(
        int $compId,
        int $locationId,
        int $vendorId,
        array $grnIds,
        ?int $exceptInvoiceId
    ) {
        $reserved = $this->grnIdsReservedOnDraftInvoices($compId, $locationId, $exceptInvoiceId);

        $grns = GoodsReceiptNote::query()
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->where('vendor_id', $vendorId)
            ->whereIn('id', $grnIds)
            ->with([
                'lines.purchaseOrderLine.taxCategory.inputTaxGlAccount',
                'lines.inventoryItem.inventoryGlAccount',
                'lines.inventoryItem.taxCategory.inputTaxGlAccount',
                'vendor:id,account_code,account_name',
                'purchaseOrder:id,po_number',
                'receiveLocation:id,location_name',
                'currency:id,code,name',
            ])
            ->get()
            ->keyBy('id');

        if ($grns->count() !== count($grnIds)) {
            throw ValidationException::withMessages([
                'grn_ids' => __('inventory_messages.grn_supplier_invoice.errors.invalid_grn_selection'),
            ]);
        }

        foreach ($grnIds as $gid) {
            /** @var GoodsReceiptNote|null $g */
            $g = $grns->get($gid);
            if (! $g || $g->status !== 'qc_pending' || $g->posted_transaction_id) {
                throw ValidationException::withMessages([
                    'grn_ids' => __('inventory_messages.grn_supplier_invoice.errors.invalid_grn_selection'),
                ]);
            }
            if (in_array((int) $gid, $reserved, true)) {
                throw ValidationException::withMessages([
                    'grn_ids' => __('inventory_messages.grn_supplier_invoice.errors.grn_on_other_invoice'),
                ]);
            }
        }

        return $grns;
    }

    /**
     * @return array<int, int>
     */
    private function grnIdsReservedOnDraftInvoices(int $compId, int $locationId, ?int $exceptInvoiceId): array
    {
        $q = DB::table('grn_supplier_invoice_grns as g')
            ->join('grn_supplier_invoices as i', 'i.id', '=', 'g.grn_supplier_invoice_id')
            ->where('i.comp_id', $compId)
            ->where('i.location_id', $locationId)
            ->where('i.status', 'draft');

        if ($exceptInvoiceId) {
            $q->where('i.id', '!=', $exceptInvoiceId);
        }

        return $q->pluck('g.goods_receipt_note_id')->map(fn ($id) => (int) $id)->unique()->values()->all();
    }

    /**
     * @param  array<int, mixed>  $rows
     * @return array<int, array{account_id: int, debit_amount: float, credit_amount: float, description?: string|null}>
     */
    private function normalizeAdditionalEntries(array $rows, int $compId, int $locationId): array
    {
        $extras = [];
        foreach ($rows as $i => $row) {
            $dr = isset($row['debit_amount']) ? (float) $row['debit_amount'] : 0.0;
            $cr = isset($row['credit_amount']) ? (float) $row['credit_amount'] : 0.0;
            if ($dr <= 0 && $cr <= 0) {
                continue;
            }
            if ($dr > 0 && $cr > 0) {
                throw ValidationException::withMessages([
                    "additional_entries.$i" => __('inventory_messages.goods_receipt_note.errors.purchase_invoice_extra_both_sides'),
                ]);
            }
            $aid = isset($row['account_id']) ? (int) $row['account_id'] : 0;
            $accountOk = $aid > 0 && DB::table('chart_of_accounts')
                ->where('id', $aid)
                ->where('comp_id', $compId)
                ->where('location_id', $locationId)
                ->where('status', 'Active')
                ->where('account_level', 4)
                ->where('is_transactional', true)
                ->exists();
            if (! $accountOk) {
                throw ValidationException::withMessages([
                    "additional_entries.$i.account_id" => __('validation.exists', ['attribute' => 'account']),
                ]);
            }
            $extras[] = [
                'account_id' => $aid,
                'debit_amount' => $dr,
                'credit_amount' => $cr,
                'description' => $row['description'] ?? null,
            ];
        }

        return $extras;
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

    /**
     * @return array<int, array<string, mixed>>
     */
    private function transactionalGlAccounts(int $compId, int $locationId): array
    {
        return DB::table('chart_of_accounts')
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->where('status', 'Active')
            ->where('account_level', 4)
            ->where('is_transactional', true)
            ->orderBy('account_code')
            ->get(['id', 'account_code', 'account_name', 'account_type'])
            ->map(fn ($r) => [
                'id' => (int) $r->id,
                'account_code' => $r->account_code,
                'account_name' => $r->account_name,
                'account_type' => $r->account_type,
            ])
            ->values()
            ->all();
    }
}

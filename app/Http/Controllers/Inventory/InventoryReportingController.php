<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Http\Traits\CheckUserPermissions;
use App\Models\ChartOfAccount;
use App\Models\Location;
use App\Services\Inventory\InventoryMovementReports;
use App\Services\Inventory\Phase2InventoryReports;
use Dompdf\Dompdf;
use Dompdf\Options;
use Illuminate\Database\Query\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;

class InventoryReportingController extends Controller
{
    use CheckUserPermissions;

    private const GRR_EXPORT_MAX_ROWS = 25000;

    private const GRR_PDF_MAX_ROWS = 3000;

    private const GRR_PRINT_MAX_ROWS = 10000;

    private const POL_EXPORT_MAX_ROWS = 25000;

    private const POL_PDF_MAX_ROWS = 3000;

    private const POL_PRINT_MAX_ROWS = 10000;

    private const STOCK_POS_EXPORT_MAX_ROWS = 10000;

    private const PHASE2_EXPORT_MAX_ROWS = 25000;

    public function index(Request $request)
    {
        $this->requirePermission($request, null, 'can_view');

        return Inertia::render('Inventory/Reports/Index', [
            'error' => $this->missingContextMessage($request),
        ]);
    }

    public function goodsReceiptRegister(Request $request)
    {
        $this->requirePermission($request, null, 'can_view');

        $compId = $this->resolvedCompId($request);

        return Inertia::render('Inventory/Reports/GoodsReceiptRegisterSearch', [
            'vendorOptions' => $compId ? $this->vendorOptions($compId) : [],
            'initialFilters' => $this->goodsReceiptRegisterFiltersFromRequest($request),
            'error' => $this->missingContextMessage($request),
        ]);
    }

    /**
     * Line-level register results (filters from query string; data loaded via POST /data).
     */
    public function goodsReceiptRegisterReport(Request $request)
    {
        $this->requirePermission($request, null, 'can_view');

        $compId = $this->resolvedCompId($request);

        return Inertia::render('Inventory/Reports/GoodsReceiptRegisterReport', [
            'vendorOptions' => $compId ? $this->vendorOptions($compId) : [],
            'appliedFilters' => $this->goodsReceiptRegisterFiltersFromRequest($request),
            'error' => $this->missingContextMessage($request),
        ]);
    }

    public function goodsReceiptRegisterExportCsv(Request $request): StreamedResponse|JsonResponse
    {
        return $this->goodsReceiptRegisterStreamCsv($request, 'text/csv; charset=UTF-8', 'csv');
    }

    public function goodsReceiptRegisterExportExcel(Request $request): StreamedResponse|JsonResponse
    {
        return $this->goodsReceiptRegisterStreamCsv($request, 'application/vnd.ms-excel', 'xls');
    }

    public function goodsReceiptRegisterExportPdf(Request $request): JsonResponse|\Illuminate\Http\Response
    {
        $this->requirePermission($request, null, 'can_view');

        $compId = $this->resolvedCompId($request);
        $locationId = $this->resolvedLocationId($request);

        if (! $compId || ! $locationId) {
            return response()->json([
                'success' => false,
                'message' => $this->missingContextMessage($request) ?? __('inventory_messages.reports.company_location_required'),
            ], 422);
        }

        $filters = $this->validateGoodsReceiptRegisterFiltersForExport($request);
        $query = $this->goodsReceiptRegisterBaseQuery($compId, $locationId, $filters);
        $total = (clone $query)->count();
        $query->limit(self::GRR_PDF_MAX_ROWS);
        $rawRows = $query->get();
        $rows = $rawRows->map(fn ($row) => $this->mapGoodsReceiptRegisterRow($row))->values()->all();

        $truncated = $total > self::GRR_PDF_MAX_ROWS;
        $html = view('inventory.reports.goods_receipt_register_pdf', [
            'title' => __('inventory_messages.reports.grr_report_title'),
            'generatedAt' => now()->format('Y-m-d H:i'),
            'scopeLines' => $this->goodsReceiptRegisterScopeLines($filters),
            'rows' => $rows,
            'totalMatching' => $total,
            'pdfRowCap' => self::GRR_PDF_MAX_ROWS,
            'truncated' => $truncated,
        ])->render();

        $options = new Options;
        $options->set('isRemoteEnabled', false);
        $options->set('defaultFont', 'DejaVu Sans');
        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html, 'UTF-8');
        $dompdf->setPaper('A4', 'landscape');
        $dompdf->render();

        $filename = 'goods_receipt_register_'.now()->format('Ymd_His').'.pdf';

        return response($dompdf->output(), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
        ]);
    }

    /**
     * Minimal HTML page for browser print (new window): report only, auto print dialog, close on afterprint.
     */
    public function goodsReceiptRegisterPrint(Request $request): \Illuminate\Contracts\View\View
    {
        $this->requirePermission($request, null, 'can_view');

        $compId = $this->resolvedCompId($request);
        $locationId = $this->resolvedLocationId($request);

        if (! $compId || ! $locationId) {
            return view('inventory.reports.goods_receipt_register_print_error', [
                'message' => $this->missingContextMessage($request) ?? __('inventory_messages.reports.company_location_required'),
            ]);
        }

        $filters = $this->validateGoodsReceiptRegisterFiltersForExport($request);
        $query = $this->goodsReceiptRegisterBaseQuery($compId, $locationId, $filters);
        $total = (clone $query)->count();
        $query->limit(self::GRR_PRINT_MAX_ROWS);
        $rawRows = $query->get();
        $rows = $rawRows->map(fn ($row) => $this->mapGoodsReceiptRegisterRow($row))->values()->all();
        $truncated = $total > self::GRR_PRINT_MAX_ROWS;

        return view('inventory.reports.goods_receipt_register_print', [
            'title' => __('inventory_messages.reports.grr_report_title'),
            'generatedAt' => now()->format('Y-m-d H:i'),
            'scopeLines' => $this->goodsReceiptRegisterScopeLines($filters),
            'rows' => $rows,
            'totalMatching' => $total,
            'printRowCap' => self::GRR_PRINT_MAX_ROWS,
            'truncated' => $truncated,
        ]);
    }

    public function purchaseOrderLinesRegister(Request $request)
    {
        $this->requirePermission($request, null, 'can_view');

        $compId = $this->resolvedCompId($request);

        return Inertia::render('Inventory/Reports/PurchaseOrderLinesSearch', [
            'vendorOptions' => $compId ? $this->vendorOptions($compId) : [],
            'initialFilters' => $this->purchaseOrderLinesFiltersFromRequest($request),
            'error' => $this->missingContextMessage($request),
        ]);
    }

    /**
     * Receipt-based stock position (sum of GRN accepted quantities) for the current branch location.
     * Default scope matches accounting: only GRNs with a posted purchase-invoice voucher
     * (posted_transaction_id), so quantities align with inventory GL from GrnPurchaseInvoicePostingService.
     * Users may unset "posted only" for a logistics view (QC-pending receipts not yet invoiced).
     * Persisted quantity ledger: choose **Quantity basis → Posted movements (subledger)** to sum `inventory_transactions`
     * (same rows as **Posted inventory movements**). Default **GRN lines** keeps receipt-date semantics; subledger uses voucher date.
     * Issues/transfers/adjustments are not in the subledger yet.
     */
    public function stockPositionRegister(Request $request)
    {
        $this->requirePermission($request, null, 'can_view');

        return Inertia::render('Inventory/Reports/StockPositionSearch', [
            'initialFilters' => $this->stockPositionFiltersFromRequest($request),
            'error' => $this->missingContextMessage($request),
        ]);
    }

    public function stockPositionReport(Request $request)
    {
        $this->requirePermission($request, null, 'can_view');

        return Inertia::render('Inventory/Reports/StockPositionReport', [
            'appliedFilters' => $this->stockPositionFiltersFromRequest($request),
            'error' => $this->missingContextMessage($request),
        ]);
    }

    public function stockPositionData(Request $request): JsonResponse
    {
        $this->requirePermission($request, null, 'can_view');

        $compId = $this->resolvedCompId($request);
        $locationId = $this->resolvedLocationId($request);

        if (! $compId || ! $locationId) {
            return response()->json([
                'success' => false,
                'message' => $this->missingContextMessage($request) ?? __('inventory_messages.reports.company_location_required'),
                'rows' => [],
                'meta' => $this->emptyMeta(),
            ], 422);
        }

        $filters = $this->validateStockPositionFiltersForApi($request);

        if (($filters['qty_basis'] ?? 'grn_lines') === 'subledger' && ! Schema::hasTable('inventory_transactions')) {
            return response()->json([
                'success' => false,
                'message' => __('inventory_messages.reports.inventory_movements_table_missing'),
                'rows' => [],
                'meta' => $this->emptyMeta(),
            ], 422);
        }

        $grouped = $this->stockPositionGroupedSubquery($compId, $locationId, $filters);
        $wrapped = DB::query()->fromSub($grouped, 'sp');

        $total = (int) (clone $wrapped)->count();
        $perPage = (int) ($filters['per_page'] ?? 50);
        $page = max(1, (int) ($filters['page'] ?? 1));
        $lastPage = max(1, (int) ceil($total / $perPage));

        $sortBy = $filters['sort_by'] ?? 'item_code';
        $sortOrder = strtolower((string) ($filters['sort_order'] ?? 'asc')) === 'desc' ? 'desc' : 'asc';
        $orderCol = match ($sortBy) {
            'qty_on_hand' => 'qty_on_hand',
            'value_on_hand' => 'value_on_hand',
            default => 'item_code',
        };

        $rawRows = (clone $wrapped)
            ->orderBy($orderCol, $sortOrder)
            ->orderBy('item_code')
            ->offset(($page - 1) * $perPage)
            ->limit($perPage)
            ->get();

        $locIds = $rawRows->pluck('at_location_id')->filter()->unique()->all();
        $locNames = $locIds !== []
            ? Location::query()->whereIn('id', $locIds)->pluck('location_name', 'id')
            : collect();

        $rows = $rawRows->map(function ($row) use ($locNames) {
            $qty = (float) $row->qty_on_hand;
            $val = (float) $row->value_on_hand;
            $avg = $qty > 0.0000001 ? round($val / $qty, 6) : null;

            return [
                'at_location_id' => (int) $row->at_location_id,
                'location_name' => (string) ($locNames[(int) $row->at_location_id] ?? ''),
                'inventory_item_id' => (int) $row->inventory_item_id,
                'item_code' => (string) ($row->item_code ?? ''),
                'item_name' => (string) ($row->item_name ?? ''),
                'uom_code' => (string) ($row->uom_code ?? ''),
                'qty_on_hand' => $qty,
                'value_on_hand' => round($val, 2),
                'avg_unit_cost' => $avg,
            ];
        })->values()->all();

        return response()->json([
            'success' => true,
            'rows' => $rows,
            'meta' => [
                'total' => $total,
                'per_page' => $perPage,
                'current_page' => $page,
                'last_page' => $lastPage,
            ],
        ]);
    }

    public function stockPositionExportCsv(Request $request): StreamedResponse|JsonResponse
    {
        return $this->stockPositionStreamCsv($request, 'text/csv; charset=UTF-8', 'csv');
    }

    public function stockPositionExportExcel(Request $request): StreamedResponse|JsonResponse
    {
        return $this->stockPositionStreamCsv($request, 'application/vnd.ms-excel', 'xls');
    }

    public function purchaseOrderLinesReport(Request $request)
    {
        $this->requirePermission($request, null, 'can_view');

        $compId = $this->resolvedCompId($request);

        return Inertia::render('Inventory/Reports/PurchaseOrderLinesReport', [
            'vendorOptions' => $compId ? $this->vendorOptions($compId) : [],
            'appliedFilters' => $this->purchaseOrderLinesFiltersFromRequest($request),
            'error' => $this->missingContextMessage($request),
        ]);
    }

    public function purchaseOrderLinesExportCsv(Request $request): StreamedResponse|JsonResponse
    {
        return $this->purchaseOrderLinesStreamCsv($request, 'text/csv; charset=UTF-8', 'csv');
    }

    public function purchaseOrderLinesExportExcel(Request $request): StreamedResponse|JsonResponse
    {
        return $this->purchaseOrderLinesStreamCsv($request, 'application/vnd.ms-excel', 'xls');
    }

    public function purchaseOrderLinesExportPdf(Request $request): JsonResponse|\Illuminate\Http\Response
    {
        $this->requirePermission($request, null, 'can_view');

        $compId = $this->resolvedCompId($request);
        $locationId = $this->resolvedLocationId($request);

        if (! $compId || ! $locationId) {
            return response()->json([
                'success' => false,
                'message' => $this->missingContextMessage($request) ?? __('inventory_messages.reports.company_location_required'),
            ], 422);
        }

        $filters = $this->validatePurchaseOrderLinesFiltersForExport($request);
        $query = $this->purchaseOrderLinesBaseQuery($compId, $locationId, $filters);
        $total = (clone $query)->count();
        $query->limit(self::POL_PDF_MAX_ROWS);
        $rawRows = $query->get();
        $rows = $rawRows->map(fn ($row) => $this->mapPurchaseOrderLinesRow($row))->values()->all();

        $truncated = $total > self::POL_PDF_MAX_ROWS;
        $html = view('inventory.reports.purchase_order_lines_pdf', [
            'title' => __('inventory_messages.reports.pol_report_title'),
            'generatedAt' => now()->format('Y-m-d H:i'),
            'scopeLines' => $this->purchaseOrderLinesScopeLines($filters),
            'rows' => $rows,
            'totalMatching' => $total,
            'pdfRowCap' => self::POL_PDF_MAX_ROWS,
            'truncated' => $truncated,
        ])->render();

        $options = new Options;
        $options->set('isRemoteEnabled', false);
        $options->set('defaultFont', 'DejaVu Sans');
        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html, 'UTF-8');
        $dompdf->setPaper('A4', 'landscape');
        $dompdf->render();

        $filename = 'purchase_order_lines_'.now()->format('Ymd_His').'.pdf';

        return response($dompdf->output(), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
        ]);
    }

    public function purchaseOrderLinesPrint(Request $request): \Illuminate\Contracts\View\View
    {
        $this->requirePermission($request, null, 'can_view');

        $compId = $this->resolvedCompId($request);
        $locationId = $this->resolvedLocationId($request);

        if (! $compId || ! $locationId) {
            return view('inventory.reports.goods_receipt_register_print_error', [
                'message' => $this->missingContextMessage($request) ?? __('inventory_messages.reports.company_location_required'),
            ]);
        }

        $filters = $this->validatePurchaseOrderLinesFiltersForExport($request);
        $query = $this->purchaseOrderLinesBaseQuery($compId, $locationId, $filters);
        $total = (clone $query)->count();
        $query->limit(self::POL_PRINT_MAX_ROWS);
        $rawRows = $query->get();
        $rows = $rawRows->map(fn ($row) => $this->mapPurchaseOrderLinesRow($row))->values()->all();
        $truncated = $total > self::POL_PRINT_MAX_ROWS;

        return view('inventory.reports.purchase_order_lines_print', [
            'title' => __('inventory_messages.reports.pol_report_title'),
            'generatedAt' => now()->format('Y-m-d H:i'),
            'scopeLines' => $this->purchaseOrderLinesScopeLines($filters),
            'rows' => $rows,
            'totalMatching' => $total,
            'printRowCap' => self::POL_PRINT_MAX_ROWS,
            'truncated' => $truncated,
        ]);
    }

    /**
     * Line-level goods receipt register (IAS 2 receipt / cost audit trail).
     */
    public function goodsReceiptRegisterData(Request $request): JsonResponse
    {
        $this->requirePermission($request, null, 'can_view');

        $compId = $this->resolvedCompId($request);
        $locationId = $this->resolvedLocationId($request);

        if (! $compId || ! $locationId) {
            return response()->json([
                'success' => false,
                'message' => $this->missingContextMessage($request) ?? __('inventory_messages.reports.company_location_required'),
                'rows' => [],
                'meta' => $this->emptyMeta(),
            ], 422);
        }

        $filters = $this->validateGoodsReceiptRegisterFiltersForApi($request);
        $query = $this->goodsReceiptRegisterBaseQuery($compId, $locationId, $filters);

        $perPage = (int) ($filters['per_page'] ?? 50);
        $page = (int) ($filters['page'] ?? 1);

        $paginator = $query->paginate($perPage, ['*'], 'page', $page);

        $rows = collect($paginator->items())
            ->map(fn ($row) => $this->mapGoodsReceiptRegisterRow($row))
            ->values()
            ->all();

        return response()->json([
            'success' => true,
            'rows' => $rows,
            'meta' => [
                'total' => $paginator->total(),
                'per_page' => $paginator->perPage(),
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
            ],
        ]);
    }

    /**
     * Purchase order lines register (open PO / delivery performance).
     */
    public function purchaseOrderLinesData(Request $request): JsonResponse
    {
        $this->requirePermission($request, null, 'can_view');

        $compId = $this->resolvedCompId($request);
        $locationId = $this->resolvedLocationId($request);

        if (! $compId || ! $locationId) {
            return response()->json([
                'success' => false,
                'message' => $this->missingContextMessage($request) ?? __('inventory_messages.reports.company_location_required'),
                'rows' => [],
                'meta' => $this->emptyMeta(),
            ], 422);
        }

        $filters = $this->validatePurchaseOrderLinesFiltersForApi($request);
        $query = $this->purchaseOrderLinesBaseQuery($compId, $locationId, $filters);

        $perPage = (int) ($filters['per_page'] ?? 50);
        $page = (int) ($filters['page'] ?? 1);

        $paginator = $query->paginate($perPage, ['*'], 'page', $page);

        $rows = collect($paginator->items())
            ->map(fn ($row) => $this->mapPurchaseOrderLinesRow($row))
            ->values()
            ->all();

        return response()->json([
            'success' => true,
            'rows' => $rows,
            'meta' => [
                'total' => $paginator->total(),
                'per_page' => $paginator->perPage(),
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
            ],
        ]);
    }

    // --- Phase 2 inventory reports (INVENTORY_REPORTING_STANDARDS.md A3, A4, B1, B2) ---

    public function grnPoVarianceRegister(Request $request)
    {
        $this->requirePermission($request, null, 'can_view');
        $compId = $this->resolvedCompId($request);

        return Inertia::render('Inventory/Reports/GrnPoVarianceSearch', [
            'vendorOptions' => $compId ? $this->vendorOptions($compId) : [],
            'initialFilters' => $this->grnPoVarianceFiltersFromRequest($request),
            'error' => $this->missingContextMessage($request),
        ]);
    }

    public function grnPoVarianceReport(Request $request)
    {
        $this->requirePermission($request, null, 'can_view');
        $compId = $this->resolvedCompId($request);

        return Inertia::render('Inventory/Reports/GrnPoVarianceReport', [
            'vendorOptions' => $compId ? $this->vendorOptions($compId) : [],
            'appliedFilters' => $this->grnPoVarianceFiltersFromRequest($request),
            'error' => $this->missingContextMessage($request),
        ]);
    }

    public function grnPoVarianceData(Request $request): JsonResponse
    {
        $this->requirePermission($request, null, 'can_view');
        $compId = $this->resolvedCompId($request);
        $locationId = $this->resolvedLocationId($request);
        if (! $compId || ! $locationId) {
            return response()->json([
                'success' => false,
                'message' => $this->missingContextMessage($request) ?? __('inventory_messages.reports.company_location_required'),
                'rows' => [],
                'meta' => $this->emptyMeta(),
            ], 422);
        }
        $filters = $this->validateGrnPoVarianceFiltersForApi($request);
        $query = Phase2InventoryReports::grnPoVarianceBaseQuery($compId, $locationId, $filters);
        $perPage = (int) ($filters['per_page'] ?? 50);
        $page = (int) ($filters['page'] ?? 1);
        $paginator = $query->paginate($perPage, ['*'], 'page', $page);
        $rows = collect($paginator->items())->map(fn ($row) => $this->mapGrnPoVarianceRow($row))->values()->all();

        return response()->json([
            'success' => true,
            'rows' => $rows,
            'meta' => [
                'total' => $paginator->total(),
                'per_page' => $paginator->perPage(),
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
            ],
        ]);
    }

    public function grnPoVarianceExportCsv(Request $request): StreamedResponse|JsonResponse
    {
        return $this->phase2StreamCsv($request, 'grn_po_variance', 'text/csv; charset=UTF-8', 'csv');
    }

    public function grnPoVarianceExportExcel(Request $request): StreamedResponse|JsonResponse
    {
        return $this->phase2StreamCsv($request, 'grn_po_variance', 'application/vnd.ms-excel', 'xls');
    }

    public function grnSupplierInvoiceListingRegister(Request $request)
    {
        $this->requirePermission($request, null, 'can_view');
        $compId = $this->resolvedCompId($request);

        return Inertia::render('Inventory/Reports/GrnSupplierInvoiceListingSearch', [
            'vendorOptions' => $compId ? $this->vendorOptions($compId) : [],
            'initialFilters' => $this->grnSupplierInvoiceListingFiltersFromRequest($request),
            'error' => $this->missingContextMessage($request),
        ]);
    }

    public function grnSupplierInvoiceListingReport(Request $request)
    {
        $this->requirePermission($request, null, 'can_view');
        $compId = $this->resolvedCompId($request);

        return Inertia::render('Inventory/Reports/GrnSupplierInvoiceListingReport', [
            'vendorOptions' => $compId ? $this->vendorOptions($compId) : [],
            'appliedFilters' => $this->grnSupplierInvoiceListingFiltersFromRequest($request),
            'error' => $this->missingContextMessage($request),
        ]);
    }

    public function grnSupplierInvoiceListingData(Request $request): JsonResponse
    {
        $this->requirePermission($request, null, 'can_view');
        $compId = $this->resolvedCompId($request);
        $locationId = $this->resolvedLocationId($request);
        if (! $compId || ! $locationId) {
            return response()->json([
                'success' => false,
                'message' => $this->missingContextMessage($request) ?? __('inventory_messages.reports.company_location_required'),
                'rows' => [],
                'meta' => $this->emptyMeta(),
            ], 422);
        }
        $filters = $this->validateGrnSupplierInvoiceListingFiltersForApi($request);
        $query = Phase2InventoryReports::grnSupplierInvoiceListingQuery($compId, $locationId, $filters);
        $perPage = (int) ($filters['per_page'] ?? 50);
        $page = (int) ($filters['page'] ?? 1);
        $paginator = $query->paginate($perPage, ['*'], 'page', $page);
        $rows = collect($paginator->items())->map(fn ($row) => $this->mapGrnSupplierInvoiceListingRow($row))->values()->all();

        return response()->json([
            'success' => true,
            'rows' => $rows,
            'meta' => [
                'total' => $paginator->total(),
                'per_page' => $paginator->perPage(),
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
            ],
        ]);
    }

    public function grnSupplierInvoiceListingExportCsv(Request $request): StreamedResponse|JsonResponse
    {
        return $this->phase2StreamCsv($request, 'grn_supplier_invoice_listing', 'text/csv; charset=UTF-8', 'csv');
    }

    public function grnSupplierInvoiceListingExportExcel(Request $request): StreamedResponse|JsonResponse
    {
        return $this->phase2StreamCsv($request, 'grn_supplier_invoice_listing', 'application/vnd.ms-excel', 'xls');
    }

    public function purchaseRequisitionLinesRegister(Request $request)
    {
        $this->requirePermission($request, null, 'can_view');
        $compId = $this->resolvedCompId($request);
        $locationId = $this->resolvedLocationId($request);

        return Inertia::render('Inventory/Reports/PurchaseRequisitionLinesSearch', [
            'departmentOptions' => ($compId && $locationId) ? $this->departmentOptions($compId, $locationId) : [],
            'initialFilters' => $this->purchaseRequisitionLinesFiltersFromRequest($request),
            'error' => $this->missingContextMessage($request),
        ]);
    }

    public function purchaseRequisitionLinesReport(Request $request)
    {
        $this->requirePermission($request, null, 'can_view');
        $compId = $this->resolvedCompId($request);
        $locationId = $this->resolvedLocationId($request);

        return Inertia::render('Inventory/Reports/PurchaseRequisitionLinesReport', [
            'departmentOptions' => ($compId && $locationId) ? $this->departmentOptions($compId, $locationId) : [],
            'appliedFilters' => $this->purchaseRequisitionLinesFiltersFromRequest($request),
            'error' => $this->missingContextMessage($request),
        ]);
    }

    public function purchaseRequisitionLinesData(Request $request): JsonResponse
    {
        $this->requirePermission($request, null, 'can_view');
        $compId = $this->resolvedCompId($request);
        $locationId = $this->resolvedLocationId($request);
        if (! $compId || ! $locationId) {
            return response()->json([
                'success' => false,
                'message' => $this->missingContextMessage($request) ?? __('inventory_messages.reports.company_location_required'),
                'rows' => [],
                'meta' => $this->emptyMeta(),
            ], 422);
        }
        $filters = $this->validatePurchaseRequisitionLinesFiltersForApi($request);
        $query = Phase2InventoryReports::purchaseRequisitionLinesQuery($compId, $locationId, $filters);
        $perPage = (int) ($filters['per_page'] ?? 50);
        $page = (int) ($filters['page'] ?? 1);
        $paginator = $query->paginate($perPage, ['*'], 'page', $page);
        $rows = collect($paginator->items())->map(fn ($row) => $this->mapPurchaseRequisitionLinesRow($row))->values()->all();

        return response()->json([
            'success' => true,
            'rows' => $rows,
            'meta' => [
                'total' => $paginator->total(),
                'per_page' => $paginator->perPage(),
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
            ],
        ]);
    }

    public function purchaseRequisitionLinesExportCsv(Request $request): StreamedResponse|JsonResponse
    {
        return $this->phase2StreamCsv($request, 'purchase_requisition_lines', 'text/csv; charset=UTF-8', 'csv');
    }

    public function purchaseRequisitionLinesExportExcel(Request $request): StreamedResponse|JsonResponse
    {
        return $this->phase2StreamCsv($request, 'purchase_requisition_lines', 'application/vnd.ms-excel', 'xls');
    }

    public function prToPoConversionRegister(Request $request)
    {
        $this->requirePermission($request, null, 'can_view');

        return Inertia::render('Inventory/Reports/PrToPoConversionSearch', [
            'initialFilters' => $this->prToPoConversionFiltersFromRequest($request),
            'error' => $this->missingContextMessage($request),
        ]);
    }

    public function prToPoConversionReport(Request $request)
    {
        $this->requirePermission($request, null, 'can_view');

        return Inertia::render('Inventory/Reports/PrToPoConversionReport', [
            'appliedFilters' => $this->prToPoConversionFiltersFromRequest($request),
            'error' => $this->missingContextMessage($request),
        ]);
    }

    public function prToPoConversionData(Request $request): JsonResponse
    {
        $this->requirePermission($request, null, 'can_view');
        $compId = $this->resolvedCompId($request);
        $locationId = $this->resolvedLocationId($request);
        if (! $compId || ! $locationId) {
            return response()->json([
                'success' => false,
                'message' => $this->missingContextMessage($request) ?? __('inventory_messages.reports.company_location_required'),
                'rows' => [],
                'meta' => $this->emptyMeta(),
            ], 422);
        }
        $filters = $this->validatePrToPoConversionFiltersForApi($request);
        $query = Phase2InventoryReports::prToPoConversionQuery($compId, $locationId, $filters);
        $perPage = (int) ($filters['per_page'] ?? 50);
        $page = (int) ($filters['page'] ?? 1);
        $paginator = $query->paginate($perPage, ['*'], 'page', $page);
        $rows = collect($paginator->items())->map(fn ($row) => $this->mapPrToPoConversionRow($row))->values()->all();

        return response()->json([
            'success' => true,
            'rows' => $rows,
            'meta' => [
                'total' => $paginator->total(),
                'per_page' => $paginator->perPage(),
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
            ],
        ]);
    }

    public function prToPoConversionExportCsv(Request $request): StreamedResponse|JsonResponse
    {
        return $this->phase2StreamCsv($request, 'pr_to_po_conversion', 'text/csv; charset=UTF-8', 'csv');
    }

    public function prToPoConversionExportExcel(Request $request): StreamedResponse|JsonResponse
    {
        return $this->phase2StreamCsv($request, 'pr_to_po_conversion', 'application/vnd.ms-excel', 'xls');
    }

    public function inventoryMovementsRegister(Request $request)
    {
        $this->requirePermission($request, null, 'can_view');

        return Inertia::render('Inventory/Reports/InventoryMovementsSearch', [
            'initialFilters' => $this->inventoryMovementsFiltersFromRequest($request),
            'error' => $this->missingContextMessage($request) ?? $this->inventoryLedgerTableMissingMessage(),
        ]);
    }

    public function inventoryMovementsReport(Request $request)
    {
        $this->requirePermission($request, null, 'can_view');

        return Inertia::render('Inventory/Reports/InventoryMovementsReport', [
            'appliedFilters' => $this->inventoryMovementsFiltersFromRequest($request),
            'error' => $this->missingContextMessage($request) ?? $this->inventoryLedgerTableMissingMessage(),
        ]);
    }

    public function inventoryMovementsData(Request $request): JsonResponse
    {
        $this->requirePermission($request, null, 'can_view');
        $compId = $this->resolvedCompId($request);
        $locationId = $this->resolvedLocationId($request);
        if (! $compId || ! $locationId) {
            return response()->json([
                'success' => false,
                'message' => $this->missingContextMessage($request) ?? __('inventory_messages.reports.company_location_required'),
                'rows' => [],
                'meta' => $this->emptyMeta(),
            ], 422);
        }
        if (! Schema::hasTable('inventory_transactions')) {
            return response()->json([
                'success' => false,
                'message' => __('inventory_messages.reports.inventory_movements_table_missing'),
                'rows' => [],
                'meta' => $this->emptyMeta(),
            ], 422);
        }
        $filters = $this->validateInventoryMovementsFiltersForApi($request);
        $query = InventoryMovementReports::movementRegisterBaseQuery($compId, $locationId, $filters);
        $perPage = (int) ($filters['per_page'] ?? 50);
        $page = (int) ($filters['page'] ?? 1);
        $paginator = $query->paginate($perPage, ['*'], 'page', $page);
        $rows = collect($paginator->items())->map(fn ($row) => $this->mapInventoryMovementRow($row))->values()->all();

        return response()->json([
            'success' => true,
            'rows' => $rows,
            'meta' => [
                'total' => $paginator->total(),
                'per_page' => $paginator->perPage(),
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
            ],
        ]);
    }

    public function inventoryMovementsExportCsv(Request $request): StreamedResponse|JsonResponse
    {
        return $this->phase2StreamCsv($request, 'inventory_movements', 'text/csv; charset=UTF-8', 'csv');
    }

    public function inventoryMovementsExportExcel(Request $request): StreamedResponse|JsonResponse
    {
        return $this->phase2StreamCsv($request, 'inventory_movements', 'application/vnd.ms-excel', 'xls');
    }

    private function emptyMeta(): array
    {
        return [
            'total' => 0,
            'per_page' => 50,
            'current_page' => 1,
            'last_page' => 1,
        ];
    }

    private function missingContextMessage(Request $request): ?string
    {
        $compId = $this->resolvedCompId($request);
        $locationId = $this->resolvedLocationId($request);

        if (! $compId || ! $locationId) {
            return __('inventory_messages.reports.company_location_required');
        }

        return null;
    }

    private function inventoryLedgerTableMissingMessage(): ?string
    {
        if (! Schema::hasTable('inventory_transactions')) {
            return __('inventory_messages.reports.inventory_movements_table_missing');
        }

        return null;
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
     * @return array<string, mixed>
     */
    private function goodsReceiptRegisterFiltersFromRequest(Request $request): array
    {
        $q = $request->query();
        $validated = Validator::make($q, $this->goodsReceiptRegisterFilterRules(false))->validate();

        return $this->normalizeGoodsReceiptRegisterFilters($validated);
    }

    /**
     * @param  bool  $withPagination  include per_page, page (API only)
     * @return array<string, string>
     */
    private function goodsReceiptRegisterFilterRules(bool $withPagination): array
    {
        $rules = [
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date',
            'date_basis' => 'nullable|string|in:receipt,posting',
            'vendor_id' => 'nullable|integer',
            'status' => 'nullable|string|max:64',
            'posted_only' => 'nullable|boolean',
            'search' => 'nullable|string|max:255',
            'sort_by' => 'nullable|string|in:receipt_date,grn_number,vendor,item_code,line_amount',
            'sort_order' => 'nullable|string|in:asc,desc',
        ];
        if ($withPagination) {
            $rules['per_page'] = 'nullable|integer|min:10|max:200';
            $rules['page'] = 'nullable|integer|min:1';
        }

        return $rules;
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return array<string, mixed>
     */
    private function normalizeGoodsReceiptRegisterFilters(array $validated): array
    {
        return [
            'date_from' => $validated['date_from'] ?? null,
            'date_to' => $validated['date_to'] ?? null,
            'date_basis' => $validated['date_basis'] ?? 'receipt',
            'vendor_id' => isset($validated['vendor_id']) ? (int) $validated['vendor_id'] : null,
            'status' => $validated['status'] ?? 'all',
            'posted_only' => ! empty($validated['posted_only'] ?? false),
            'search' => isset($validated['search']) ? trim((string) $validated['search']) : '',
            'sort_by' => $validated['sort_by'] ?? 'receipt_date',
            'sort_order' => $validated['sort_order'] ?? 'desc',
            'per_page' => isset($validated['per_page']) ? (int) $validated['per_page'] : 50,
            'page' => isset($validated['page']) ? (int) $validated['page'] : 1,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function validateGoodsReceiptRegisterFiltersForApi(Request $request): array
    {
        $validated = $request->validate($this->goodsReceiptRegisterFilterRules(true));

        return $this->normalizeGoodsReceiptRegisterFilters($validated);
    }

    /**
     * @return array<string, mixed>
     */
    private function validateGoodsReceiptRegisterFiltersForExport(Request $request): array
    {
        $validated = Validator::make($request->query(), $this->goodsReceiptRegisterFilterRules(false))->validate();

        return $this->normalizeGoodsReceiptRegisterFilters($validated);
    }

    private function goodsReceiptRegisterStreamCsv(Request $request, string $contentType, string $ext): StreamedResponse|JsonResponse
    {
        $this->requirePermission($request, null, 'can_view');

        $compId = $this->resolvedCompId($request);
        $locationId = $this->resolvedLocationId($request);

        if (! $compId || ! $locationId) {
            return response()->json([
                'success' => false,
                'message' => $this->missingContextMessage($request) ?? __('inventory_messages.reports.company_location_required'),
            ], 422);
        }

        $filters = $this->validateGoodsReceiptRegisterFiltersForExport($request);
        $query = $this->goodsReceiptRegisterBaseQuery($compId, $locationId, $filters);
        $query->limit(self::GRR_EXPORT_MAX_ROWS + 1);
        $rawRows = $query->get();
        $truncated = $rawRows->count() > self::GRR_EXPORT_MAX_ROWS;
        $rawRows = $rawRows->take(self::GRR_EXPORT_MAX_ROWS);

        $headers = [
            __('inventory_messages.reports.grr_col_grn'),
            __('inventory_messages.reports.grr_col_receipt_date'),
            __('inventory_messages.reports.grr_col_posting_date'),
            __('inventory_messages.reports.grr_col_po'),
            __('inventory_messages.reports.grr_col_vendor'),
            __('inventory_messages.reports.grr_col_line'),
            __('inventory_messages.reports.grr_col_item'),
            __('inventory_messages.reports.grr_col_uom'),
            __('inventory_messages.reports.grr_col_receipt_qty'),
            __('inventory_messages.reports.grr_col_accepted_qty'),
            __('inventory_messages.reports.grr_col_rejected_qty'),
            __('inventory_messages.reports.grr_col_unit_cost'),
            __('inventory_messages.reports.grr_col_line_amount'),
            __('inventory_messages.reports.grr_col_currency'),
            __('inventory_messages.reports.grr_col_lot'),
            __('inventory_messages.reports.grr_col_expiry'),
            __('inventory_messages.reports.grr_col_grn_status'),
            __('inventory_messages.reports.grr_col_posted'),
            __('inventory_messages.reports.grr_col_posted_voucher'),
            __('inventory_messages.reports.grr_col_match'),
        ];

        $filename = 'goods_receipt_register_'.now()->format('Ymd_His').'.'.$ext;

        return response()->streamDownload(function () use ($rawRows, $headers, $truncated) {
            $out = fopen('php://output', 'w');
            fwrite($out, "\xEF\xBB\xBF");
            fputcsv($out, $headers);
            foreach ($rawRows as $row) {
                $r = $this->mapGoodsReceiptRegisterRow($row);
                fputcsv($out, [
                    $r['grn_number'],
                    $r['receipt_date'],
                    $r['posting_date'],
                    $r['po_number'],
                    ($r['vendor_code'] ?? '').' — '.($r['vendor_name'] ?? ''),
                    $r['line_no'],
                    trim(($r['item_code'] ?? '').' '.($r['item_name'] ?? '')),
                    $r['uom_code'],
                    $r['receipt_qty'],
                    $r['accepted_qty'],
                    $r['rejected_qty'] ?? '',
                    $r['unit_cost'],
                    $r['line_amount'],
                    $r['currency_code'],
                    $r['lot_batch_no'],
                    $r['expiry_date'],
                    $r['grn_status'],
                    $r['posted'] ? __('inventory_messages.reports.grr_yes') : __('inventory_messages.reports.grr_no'),
                    $r['posted_transaction_id'] ?? '',
                    $r['three_way_match_status'] ?? '',
                ]);
            }
            if ($truncated) {
                fputcsv($out, []);
                fputcsv($out, [__('inventory_messages.reports.grr_export_truncated_note', ['max' => (string) self::GRR_EXPORT_MAX_ROWS])]);
            }
        }, $filename, [
            'Content-Type' => $contentType,
        ]);
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    private function goodsReceiptRegisterScopeLines(array $filters): array
    {
        $lines = [];
        $basisLabel = ($filters['date_basis'] ?? 'receipt') === 'posting'
            ? __('inventory_messages.reports.grr_pdf_date_basis_posting')
            : __('inventory_messages.reports.grr_pdf_date_basis_receipt');
        $lines[] = __('inventory_messages.reports.grr_pdf_scope_date_basis', ['basis' => $basisLabel]);
        if (! empty($filters['date_from']) || ! empty($filters['date_to'])) {
            $lines[] = __('inventory_messages.reports.grr_pdf_scope_period', [
                'from' => $filters['date_from'] ?? '—',
                'to' => $filters['date_to'] ?? '—',
            ]);
        }
        if (! empty($filters['vendor_id'])) {
            $lines[] = __('inventory_messages.reports.grr_pdf_scope_vendor_id', ['id' => (string) $filters['vendor_id']]);
        }
        if (! empty($filters['status']) && $filters['status'] !== 'all') {
            $lines[] = __('inventory_messages.reports.grr_pdf_scope_status', ['status' => (string) $filters['status']]);
        }
        if (! empty($filters['posted_only'])) {
            $lines[] = __('inventory_messages.reports.grr_pdf_scope_posted_only');
        }
        if (! empty($filters['search'])) {
            $lines[] = __('inventory_messages.reports.grr_pdf_scope_search', ['q' => (string) $filters['search']]);
        }

        return $lines;
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    private function goodsReceiptRegisterBaseQuery(int $compId, int $locationId, array $filters): Builder
    {
        $dateBasis = $filters['date_basis'] ?? 'receipt';
        $dateCol = $dateBasis === 'posting' ? 'g.posting_date' : 'g.receipt_date';

        $query = DB::table('goods_receipt_note_lines as l')
            ->join('goods_receipt_notes as g', 'g.id', '=', 'l.goods_receipt_note_id')
            ->leftJoin('purchase_orders as po', 'po.id', '=', 'g.purchase_order_id')
            ->leftJoin('inventory_items as i', 'i.id', '=', 'l.inventory_item_id')
            ->leftJoin('chart_of_accounts as v', 'v.id', '=', 'g.vendor_id')
            ->leftJoin('uom_masters as u', 'u.id', '=', 'l.uom_id')
            ->leftJoin('currencies as cur', 'cur.id', '=', 'g.currency_id')
            ->where('g.comp_id', $compId)
            ->where('g.location_id', $locationId)
            ->select([
                'l.id as line_id',
                'g.id as grn_id',
                'g.grn_number',
                'g.receipt_date',
                'g.posting_date',
                'g.status as grn_status',
                'g.posted_transaction_id',
                'g.three_way_match_status',
                'po.po_number',
                'v.account_code as vendor_code',
                'v.account_name as vendor_name',
                'l.line_no',
                'i.item_code',
                'i.item_name_short as item_name',
                'l.item_description',
                'u.uom_code',
                'l.po_ordered_qty',
                'l.snapshot_previously_received_qty',
                'l.receipt_qty',
                'l.accepted_qty',
                'l.rejected_qty',
                'l.unit_cost',
                'l.lot_batch_no',
                'l.expiry_date',
                'l.qc_line_status',
                'cur.code as currency_code',
            ]);

        if (! empty($filters['date_from'])) {
            $query->whereDate($dateCol, '>=', $filters['date_from']);
        }
        if (! empty($filters['date_to'])) {
            $query->whereDate($dateCol, '<=', $filters['date_to']);
        }

        if (! empty($filters['vendor_id'])) {
            $query->where('g.vendor_id', (int) $filters['vendor_id']);
        }

        if (! empty($filters['status']) && $filters['status'] !== 'all') {
            $query->where('g.status', $filters['status']);
        }

        if (! empty($filters['posted_only'])) {
            $query->whereNotNull('g.posted_transaction_id');
        }

        if (! empty($filters['search'])) {
            $term = '%'.str_replace(['%', '_'], ['\\%', '\\_'], $filters['search']).'%';
            $query->where(function ($q) use ($term) {
                $q->where('g.grn_number', 'like', $term)
                    ->orWhere('po.po_number', 'like', $term)
                    ->orWhere('i.item_code', 'like', $term)
                    ->orWhere('i.item_name_short', 'like', $term)
                    ->orWhere('l.item_description', 'like', $term);
            });
        }

        $query->selectRaw(
            '(CASE WHEN l.accepted_qty IS NOT NULL THEN LEAST(CAST(l.accepted_qty AS DECIMAL(18,6)), CAST(l.receipt_qty AS DECIMAL(18,6))) ELSE CAST(l.receipt_qty AS DECIMAL(18,6)) END) * CAST(l.unit_cost AS DECIMAL(18,6)) as line_amount_raw'
        );

        $sortBy = $filters['sort_by'] ?? 'receipt_date';
        $sortOrder = strtolower((string) ($filters['sort_order'] ?? 'desc')) === 'asc' ? 'asc' : 'desc';
        $sortMap = [
            'receipt_date' => 'g.receipt_date',
            'grn_number' => 'g.grn_number',
            'vendor' => 'v.account_code',
            'item_code' => 'i.item_code',
            'line_amount' => 'line_amount_raw',
        ];
        $orderCol = $sortMap[$sortBy] ?? 'g.receipt_date';

        if ($sortBy === 'line_amount') {
            $query->orderByRaw("line_amount_raw {$sortOrder}");
        } else {
            $query->orderBy($orderCol, $sortOrder);
        }
        $query->orderBy('g.grn_number')->orderBy('l.line_no');

        return $query;
    }

    /**
     * @param  object  $row
     * @return array<string, mixed>
     */
    private function mapGoodsReceiptRegisterRow($row): array
    {
        $receipt = (float) $row->receipt_qty;
        $acceptedRaw = $row->accepted_qty;
        $accepted = $acceptedRaw !== null && $acceptedRaw !== ''
            ? min((float) $acceptedRaw, $receipt)
            : $receipt;
        $unitCost = (float) $row->unit_cost;
        $lineAmount = round($accepted * $unitCost, 2);

        return [
            'line_id' => (int) $row->line_id,
            'grn_id' => (int) $row->grn_id,
            'grn_number' => $row->grn_number,
            'receipt_date' => $row->receipt_date,
            'posting_date' => $row->posting_date,
            'grn_status' => $row->grn_status,
            'posted' => $row->posted_transaction_id !== null,
            'posted_transaction_id' => $row->posted_transaction_id ? (int) $row->posted_transaction_id : null,
            'three_way_match_status' => $row->three_way_match_status,
            'po_number' => $row->po_number,
            'vendor_code' => $row->vendor_code,
            'vendor_name' => $row->vendor_name,
            'line_no' => (int) $row->line_no,
            'item_code' => $row->item_code,
            'item_name' => $row->item_name,
            'item_description' => $row->item_description,
            'uom_code' => $row->uom_code,
            'currency_code' => $row->currency_code,
            'po_ordered_qty' => $row->po_ordered_qty !== null ? (float) $row->po_ordered_qty : null,
            'snapshot_previously_received_qty' => $row->snapshot_previously_received_qty !== null ? (float) $row->snapshot_previously_received_qty : null,
            'receipt_qty' => $receipt,
            'accepted_qty' => $accepted,
            'rejected_qty' => $row->rejected_qty !== null ? (float) $row->rejected_qty : null,
            'unit_cost' => $unitCost,
            'line_amount' => $lineAmount,
            'lot_batch_no' => $row->lot_batch_no,
            'expiry_date' => $row->expiry_date,
            'qc_line_status' => $row->qc_line_status,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function purchaseOrderLinesFiltersFromRequest(Request $request): array
    {
        $validated = Validator::make($request->query(), $this->purchaseOrderLinesFilterRules(false))->validate();

        return $this->normalizePurchaseOrderLinesFilters($validated);
    }

    /**
     * @return array<string, string>
     */
    private function purchaseOrderLinesFilterRules(bool $withPagination): array
    {
        $rules = [
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date',
            'vendor_id' => 'nullable|integer',
            'status' => 'nullable|string|max:64',
            'open_lines_only' => 'nullable|boolean',
            'search' => 'nullable|string|max:255',
            'sort_by' => 'nullable|string|in:po_date,po_number,vendor,item_code,balance_qty',
            'sort_order' => 'nullable|string|in:asc,desc',
        ];
        if ($withPagination) {
            $rules['per_page'] = 'nullable|integer|min:10|max:200';
            $rules['page'] = 'nullable|integer|min:1';
        }

        return $rules;
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return array<string, mixed>
     */
    private function normalizePurchaseOrderLinesFilters(array $validated): array
    {
        return [
            'date_from' => $validated['date_from'] ?? null,
            'date_to' => $validated['date_to'] ?? null,
            'vendor_id' => isset($validated['vendor_id']) ? (int) $validated['vendor_id'] : null,
            'status' => $validated['status'] ?? 'all',
            'open_lines_only' => ! empty($validated['open_lines_only'] ?? false),
            'search' => isset($validated['search']) ? trim((string) $validated['search']) : '',
            'sort_by' => $validated['sort_by'] ?? 'po_date',
            'sort_order' => $validated['sort_order'] ?? 'desc',
            'per_page' => isset($validated['per_page']) ? (int) $validated['per_page'] : 50,
            'page' => isset($validated['page']) ? (int) $validated['page'] : 1,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function validatePurchaseOrderLinesFiltersForApi(Request $request): array
    {
        $validated = $request->validate($this->purchaseOrderLinesFilterRules(true));

        return $this->normalizePurchaseOrderLinesFilters($validated);
    }

    /**
     * @return array<string, mixed>
     */
    private function validatePurchaseOrderLinesFiltersForExport(Request $request): array
    {
        $validated = Validator::make($request->query(), $this->purchaseOrderLinesFilterRules(false))->validate();

        return $this->normalizePurchaseOrderLinesFilters($validated);
    }

    private function purchaseOrderLinesStreamCsv(Request $request, string $contentType, string $ext): StreamedResponse|JsonResponse
    {
        $this->requirePermission($request, null, 'can_view');

        $compId = $this->resolvedCompId($request);
        $locationId = $this->resolvedLocationId($request);

        if (! $compId || ! $locationId) {
            return response()->json([
                'success' => false,
                'message' => $this->missingContextMessage($request) ?? __('inventory_messages.reports.company_location_required'),
            ], 422);
        }

        $filters = $this->validatePurchaseOrderLinesFiltersForExport($request);
        $query = $this->purchaseOrderLinesBaseQuery($compId, $locationId, $filters);
        $query->limit(self::POL_EXPORT_MAX_ROWS + 1);
        $rawRows = $query->get();
        $truncated = $rawRows->count() > self::POL_EXPORT_MAX_ROWS;
        $rawRows = $rawRows->take(self::POL_EXPORT_MAX_ROWS);

        $headers = [
            __('inventory_messages.reports.pol_col_po'),
            __('inventory_messages.reports.pol_col_po_date'),
            __('inventory_messages.reports.pol_col_expected'),
            __('inventory_messages.reports.pol_col_vendor'),
            __('inventory_messages.reports.pol_col_line'),
            __('inventory_messages.reports.pol_col_item'),
            __('inventory_messages.reports.pol_col_uom'),
            __('inventory_messages.reports.pol_col_ordered'),
            __('inventory_messages.reports.pol_col_received'),
            __('inventory_messages.reports.pol_col_balance'),
            __('inventory_messages.reports.pol_col_unit_price'),
            __('inventory_messages.reports.pol_col_discount_pct'),
            __('inventory_messages.reports.pol_col_net_unit'),
            __('inventory_messages.reports.pol_col_open_value'),
            __('inventory_messages.reports.pol_col_currency'),
            __('inventory_messages.reports.pol_col_line_status'),
            __('inventory_messages.reports.pol_col_po_status'),
        ];

        $filename = 'purchase_order_lines_'.now()->format('Ymd_His').'.'.$ext;

        return response()->streamDownload(function () use ($rawRows, $headers, $truncated) {
            $out = fopen('php://output', 'w');
            fwrite($out, "\xEF\xBB\xBF");
            fputcsv($out, $headers);
            foreach ($rawRows as $row) {
                $r = $this->mapPurchaseOrderLinesRow($row);
                fputcsv($out, [
                    $r['po_number'],
                    $r['po_date'],
                    $r['expected_delivery_date'],
                    ($r['vendor_code'] ?? '').' — '.($r['vendor_name'] ?? ''),
                    $r['line_no'],
                    trim(($r['item_code'] ?? '').' '.($r['item_name'] ?? '')),
                    $r['uom_code'],
                    $r['ordered_qty'],
                    $r['received_qty'],
                    $r['balance_qty'],
                    $r['unit_price'],
                    $r['line_discount_percent'],
                    $r['net_unit_price'],
                    $r['open_line_value'],
                    $r['currency_code'],
                    $r['line_status'] ?? '',
                    $r['po_status'],
                ]);
            }
            if ($truncated) {
                fputcsv($out, []);
                fputcsv($out, [__('inventory_messages.reports.pol_export_truncated_note', ['max' => (string) self::POL_EXPORT_MAX_ROWS])]);
            }
        }, $filename, [
            'Content-Type' => $contentType,
        ]);
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    private function purchaseOrderLinesScopeLines(array $filters): array
    {
        $lines = [];
        $lines[] = __('inventory_messages.reports.pol_pdf_scope_po_date');
        if (! empty($filters['date_from']) || ! empty($filters['date_to'])) {
            $lines[] = __('inventory_messages.reports.pol_pdf_scope_period', [
                'from' => $filters['date_from'] ?? '—',
                'to' => $filters['date_to'] ?? '—',
            ]);
        }
        if (! empty($filters['vendor_id'])) {
            $lines[] = __('inventory_messages.reports.pol_pdf_scope_vendor_id', ['id' => (string) $filters['vendor_id']]);
        }
        if (! empty($filters['status']) && $filters['status'] !== 'all') {
            $lines[] = __('inventory_messages.reports.pol_pdf_scope_po_status', ['status' => (string) $filters['status']]);
        }
        if (! empty($filters['open_lines_only'])) {
            $lines[] = __('inventory_messages.reports.pol_pdf_scope_open_lines');
        }
        if (! empty($filters['search'])) {
            $lines[] = __('inventory_messages.reports.pol_pdf_scope_search', ['q' => (string) $filters['search']]);
        }

        return $lines;
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    private function purchaseOrderLinesBaseQuery(int $compId, int $locationId, array $filters): Builder
    {
        $query = DB::table('purchase_order_lines as l')
            ->join('purchase_orders as p', 'p.id', '=', 'l.purchase_order_id')
            ->leftJoin('inventory_items as i', 'i.id', '=', 'l.inventory_item_id')
            ->leftJoin('chart_of_accounts as v', 'v.id', '=', 'p.vendor_id')
            ->leftJoin('uom_masters as u', 'u.id', '=', 'l.uom_id')
            ->leftJoin('currencies as cur', 'cur.id', '=', 'p.currency_id')
            ->where('p.comp_id', $compId)
            ->where('p.location_id', $locationId)
            ->select([
                'l.id as line_id',
                'p.id as purchase_order_id',
                'p.po_number',
                'p.po_date',
                'p.status as po_status',
                'p.expected_delivery_date',
                'v.account_code as vendor_code',
                'v.account_name as vendor_name',
                'l.line_no',
                'l.line_status',
                'i.item_code',
                'i.item_name_short as item_name',
                'l.item_description',
                'u.uom_code',
                'l.ordered_qty',
                'l.received_qty',
                'l.unit_price',
                'l.line_discount_percent',
                'cur.code as currency_code',
            ]);

        if (! empty($filters['date_from'])) {
            $query->whereDate('p.po_date', '>=', $filters['date_from']);
        }
        if (! empty($filters['date_to'])) {
            $query->whereDate('p.po_date', '<=', $filters['date_to']);
        }

        if (! empty($filters['vendor_id'])) {
            $query->where('p.vendor_id', (int) $filters['vendor_id']);
        }

        if (! empty($filters['status']) && $filters['status'] !== 'all') {
            $query->where('p.status', $filters['status']);
        }

        if (! empty($filters['open_lines_only'])) {
            $query->whereRaw('CAST(COALESCE(l.received_qty, 0) AS DECIMAL(18,6)) < CAST(l.ordered_qty AS DECIMAL(18,6))');
        }

        if (! empty($filters['search'])) {
            $term = '%'.str_replace(['%', '_'], ['\\%', '\\_'], $filters['search']).'%';
            $query->where(function ($q) use ($term) {
                $q->where('p.po_number', 'like', $term)
                    ->orWhere('i.item_code', 'like', $term)
                    ->orWhere('i.item_name_short', 'like', $term)
                    ->orWhere('l.item_description', 'like', $term);
            });
        }

        $query->selectRaw(
            '(CAST(l.ordered_qty AS DECIMAL(18,6)) - CAST(COALESCE(l.received_qty, 0) AS DECIMAL(18,6))) as balance_qty_raw'
        );

        $sortBy = $filters['sort_by'] ?? 'po_date';
        $sortOrder = strtolower((string) ($filters['sort_order'] ?? 'desc')) === 'asc' ? 'asc' : 'desc';
        $sortMap = [
            'po_date' => 'p.po_date',
            'po_number' => 'p.po_number',
            'vendor' => 'v.account_code',
            'item_code' => 'i.item_code',
            'balance_qty' => 'balance_qty_raw',
        ];
        $orderCol = $sortMap[$sortBy] ?? 'p.po_date';

        if ($sortBy === 'balance_qty') {
            $query->orderByRaw("balance_qty_raw {$sortOrder}");
        } else {
            $query->orderBy($orderCol, $sortOrder);
        }
        $query->orderBy('p.po_number')->orderBy('l.line_no');

        return $query;
    }

    /**
     * @return array<string, mixed>
     */
    private function stockPositionFiltersFromRequest(Request $request): array
    {
        $validated = Validator::make($request->query(), $this->stockPositionFilterRules(false))->validate();

        return $this->normalizeStockPositionFilters($validated);
    }

    /**
     * @return array<string, string|int|bool|null>
     */
    private function stockPositionFilterRules(bool $withPagination): array
    {
        $rules = [
            'as_of_date' => 'nullable|date',
            'posted_only' => 'nullable|boolean',
            'qty_basis' => 'nullable|string|in:grn_lines,subledger',
            'search' => 'nullable|string|max:255',
            'sort_by' => 'nullable|string|in:item_code,qty_on_hand,value_on_hand',
            'sort_order' => 'nullable|string|in:asc,desc',
        ];
        if ($withPagination) {
            $rules['per_page'] = 'nullable|integer|min:10|max:200';
            $rules['page'] = 'nullable|integer|min:1';
        }

        return $rules;
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return array<string, mixed>
     */
    private function normalizeStockPositionFilters(array $validated): array
    {
        // Default true: same scope as posted GL (Purchase Invoice); omitting posted_only means accounting-aligned stock.
        $postedOnly = true;
        if (array_key_exists('posted_only', $validated)) {
            $postedOnly = filter_var($validated['posted_only'], FILTER_VALIDATE_BOOLEAN);
        }

        $qtyBasis = isset($validated['qty_basis']) && $validated['qty_basis'] === 'subledger'
            ? 'subledger'
            : 'grn_lines';

        return [
            'as_of_date' => $validated['as_of_date'] ?? null,
            'posted_only' => $postedOnly,
            'qty_basis' => $qtyBasis,
            'search' => isset($validated['search']) ? trim((string) $validated['search']) : '',
            'sort_by' => $validated['sort_by'] ?? 'item_code',
            'sort_order' => $validated['sort_order'] ?? 'asc',
            'per_page' => isset($validated['per_page']) ? (int) $validated['per_page'] : 50,
            'page' => isset($validated['page']) ? (int) $validated['page'] : 1,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function validateStockPositionFiltersForApi(Request $request): array
    {
        $validated = $request->validate($this->stockPositionFilterRules(true));

        return $this->normalizeStockPositionFilters($validated);
    }

    /**
     * @return array<string, mixed>
     */
    private function validateStockPositionFiltersForExport(Request $request): array
    {
        $validated = Validator::make($request->query(), $this->stockPositionFilterRules(false))->validate();

        return $this->normalizeStockPositionFilters($validated);
    }

    /**
     * Aggregated on-hand by item / storage location / UoM.
     * Default: GRN lines (receipt date, optional posted-only).
     * Optional: sum persisted `inventory_transactions` (voucher date) — see {@see stockPositionSubledgerGroupedSubquery}.
     *
     * @param  array<string, mixed>  $filters
     */
    private function stockPositionGroupedSubquery(int $compId, int $locationId, array $filters): Builder
    {
        if (($filters['qty_basis'] ?? 'grn_lines') === 'subledger') {
            return $this->stockPositionSubledgerGroupedSubquery($compId, $locationId, $filters);
        }

        $acceptedSql = '(CASE WHEN l.accepted_qty IS NOT NULL THEN LEAST(CAST(l.accepted_qty AS DECIMAL(18,6)), CAST(l.receipt_qty AS DECIMAL(18,6))) ELSE CAST(l.receipt_qty AS DECIMAL(18,6)) END)';

        $q = DB::table('goods_receipt_note_lines as l')
            ->join('goods_receipt_notes as g', 'g.id', '=', 'l.goods_receipt_note_id')
            ->leftJoin('inventory_items as i', 'i.id', '=', 'l.inventory_item_id')
            ->leftJoin('uom_masters as u', 'u.id', '=', 'l.uom_id')
            ->where('g.comp_id', $compId)
            ->whereRaw('COALESCE(g.receive_location_id, g.location_id) = ?', [$locationId])
            ->whereIn('g.status', ['qc_pending', 'posted']);

        if (! empty($filters['as_of_date'])) {
            $q->whereDate('g.receipt_date', '<=', $filters['as_of_date']);
        }

        if (! empty($filters['posted_only'])) {
            $q->whereNotNull('g.posted_transaction_id');
        }

        if (! empty($filters['search'])) {
            $term = '%'.str_replace(['%', '_'], ['\\%', '\\_'], $filters['search']).'%';
            $q->where(function ($w) use ($term) {
                $w->where('i.item_code', 'like', $term)
                    ->orWhere('i.item_name_short', 'like', $term);
            });
        }

        return $q
            ->groupByRaw('COALESCE(g.receive_location_id, g.location_id)')
            ->groupBy('l.inventory_item_id', 'l.uom_id')
            ->selectRaw('COALESCE(g.receive_location_id, g.location_id) as at_location_id')
            ->selectRaw('l.inventory_item_id as inventory_item_id')
            ->selectRaw('MAX(i.item_code) as item_code')
            ->selectRaw('MAX(i.item_name_short) as item_name')
            ->selectRaw('MAX(u.uom_code) as uom_code')
            ->selectRaw("SUM({$acceptedSql}) as qty_on_hand")
            ->selectRaw("SUM(({$acceptedSql}) * CAST(l.unit_cost AS DECIMAL(18,6))) as value_on_hand")
            ->havingRaw("SUM({$acceptedSql}) > 0.0000001");
    }

    /**
     * Sum of posted inventory movement rows (GRN purchase invoice post), by receive/storage location on the GRN header.
     *
     * @param  array<string, mixed>  $filters  expects qty_basis=subledger, as_of_date, search
     */
    private function stockPositionSubledgerGroupedSubquery(int $compId, int $locationId, array $filters): Builder
    {
        $q = DB::table('inventory_transactions as m')
            ->join('goods_receipt_notes as g', 'g.id', '=', 'm.goods_receipt_note_id')
            ->leftJoin('inventory_items as i', 'i.id', '=', 'm.inventory_item_id')
            ->leftJoin('uom_masters as u', 'u.id', '=', 'm.uom_id')
            ->where('m.comp_id', $compId)
            ->whereRaw('COALESCE(g.receive_location_id, g.location_id) = ?', [$locationId]);

        if (! empty($filters['as_of_date'])) {
            $q->whereDate('m.voucher_date', '<=', $filters['as_of_date']);
        }

        if (! empty($filters['search'])) {
            $term = '%'.str_replace(['%', '_'], ['\\%', '\\_'], $filters['search']).'%';
            $q->where(function ($w) use ($term) {
                $w->where('i.item_code', 'like', $term)
                    ->orWhere('i.item_name_short', 'like', $term);
            });
        }

        return $q
            ->groupByRaw('COALESCE(g.receive_location_id, g.location_id)')
            ->groupBy('m.inventory_item_id', 'm.uom_id')
            ->selectRaw('COALESCE(g.receive_location_id, g.location_id) as at_location_id')
            ->selectRaw('m.inventory_item_id as inventory_item_id')
            ->selectRaw('MAX(i.item_code) as item_code')
            ->selectRaw('MAX(i.item_name_short) as item_name')
            ->selectRaw('MAX(u.uom_code) as uom_code')
            ->selectRaw('SUM(CAST(m.quantity_delta AS DECIMAL(18,6))) as qty_on_hand')
            ->selectRaw('SUM(CAST(m.line_value_foreign AS DECIMAL(18,6))) as value_on_hand')
            ->havingRaw('SUM(CAST(m.quantity_delta AS DECIMAL(18,6))) > 0.0000001');
    }

    private function stockPositionStreamCsv(Request $request, string $contentType, string $ext): StreamedResponse|JsonResponse
    {
        $this->requirePermission($request, null, 'can_view');

        $compId = $this->resolvedCompId($request);
        $locationId = $this->resolvedLocationId($request);

        if (! $compId || ! $locationId) {
            return response()->json([
                'success' => false,
                'message' => $this->missingContextMessage($request) ?? __('inventory_messages.reports.company_location_required'),
            ], 422);
        }

        $filters = $this->validateStockPositionFiltersForExport($request);

        if (($filters['qty_basis'] ?? 'grn_lines') === 'subledger' && ! Schema::hasTable('inventory_transactions')) {
            return response()->json([
                'success' => false,
                'message' => __('inventory_messages.reports.inventory_movements_table_missing'),
            ], 422);
        }

        $grouped = $this->stockPositionGroupedSubquery($compId, $locationId, $filters);
        $wrapped = DB::query()->fromSub($grouped, 'sp')
            ->orderBy('item_code')
            ->limit(self::STOCK_POS_EXPORT_MAX_ROWS + 1);

        $rawRows = $wrapped->get();
        $truncated = $rawRows->count() > self::STOCK_POS_EXPORT_MAX_ROWS;
        $rawRows = $rawRows->take(self::STOCK_POS_EXPORT_MAX_ROWS);

        $locIds = $rawRows->pluck('at_location_id')->filter()->unique()->all();
        $locNames = $locIds !== []
            ? Location::query()->whereIn('id', $locIds)->pluck('location_name', 'id')
            : collect();

        $headers = [
            __('inventory_messages.reports.spp_col_location_id'),
            __('inventory_messages.reports.spp_col_location_name'),
            __('inventory_messages.reports.spp_col_item_code'),
            __('inventory_messages.reports.spp_col_item_name'),
            __('inventory_messages.reports.spp_col_uom'),
            __('inventory_messages.reports.spp_col_qty'),
            __('inventory_messages.reports.spp_col_value'),
            __('inventory_messages.reports.spp_col_avg_unit_cost'),
        ];

        $basisTag = (($filters['qty_basis'] ?? 'grn_lines') === 'subledger') ? 'subledger' : 'grn';
        $filename = 'stock_position_'.$basisTag.'_'.now()->format('Ymd_His').'.'.$ext;

        return response()->streamDownload(function () use ($rawRows, $locNames, $headers, $truncated) {
            $out = fopen('php://output', 'w');
            fwrite($out, "\xEF\xBB\xBF");
            fputcsv($out, $headers);
            foreach ($rawRows as $row) {
                $qty = (float) $row->qty_on_hand;
                $val = (float) $row->value_on_hand;
                $avg = $qty > 0.0000001 ? round($val / $qty, 6) : '';
                fputcsv($out, [
                    (int) $row->at_location_id,
                    (string) ($locNames[(int) $row->at_location_id] ?? ''),
                    (string) ($row->item_code ?? ''),
                    (string) ($row->item_name ?? ''),
                    (string) ($row->uom_code ?? ''),
                    $qty,
                    round($val, 2),
                    $avg,
                ]);
            }
            if ($truncated) {
                fputcsv($out, []);
                fputcsv($out, [__('inventory_messages.reports.spp_export_truncated_note', ['max' => (string) self::STOCK_POS_EXPORT_MAX_ROWS])]);
            }
        }, $filename, [
            'Content-Type' => $contentType,
        ]);
    }

    /**
     * @return array<int, array{value: string, label: string}>
     */
    private function departmentOptions(int $compId, int $locationId): array
    {
        if (! \Illuminate\Support\Facades\Schema::hasTable('departments')) {
            return [];
        }

        return DB::table('departments')
            ->where('company_id', $compId)
            ->where('location_id', $locationId)
            ->where('status', true)
            ->orderBy('department_name')
            ->get(['id', 'department_name'])
            ->map(fn ($r) => [
                'value' => (string) $r->id,
                'label' => (string) $r->department_name,
            ])
            ->values()
            ->all();
    }

    /**
     * @return 'grn_po_variance'|'grn_supplier_invoice_listing'|'purchase_requisition_lines'|'pr_to_po_conversion'|'inventory_movements'
     */
    private function phase2StreamCsv(Request $request, string $kind, string $contentType, string $ext): StreamedResponse|JsonResponse
    {
        $this->requirePermission($request, null, 'can_view');
        $compId = $this->resolvedCompId($request);
        $locationId = $this->resolvedLocationId($request);
        if (! $compId || ! $locationId) {
            return response()->json([
                'success' => false,
                'message' => $this->missingContextMessage($request) ?? __('inventory_messages.reports.company_location_required'),
            ], 422);
        }

        if ($kind === 'inventory_movements' && ! Schema::hasTable('inventory_transactions')) {
            return response()->json([
                'success' => false,
                'message' => __('inventory_messages.reports.inventory_movements_table_missing'),
            ], 422);
        }

        $query = match ($kind) {
            'grn_po_variance' => Phase2InventoryReports::grnPoVarianceBaseQuery(
                $compId,
                $locationId,
                $this->validateGrnPoVarianceFiltersForExport($request)
            ),
            'grn_supplier_invoice_listing' => Phase2InventoryReports::grnSupplierInvoiceListingQuery(
                $compId,
                $locationId,
                $this->validateGrnSupplierInvoiceListingFiltersForExport($request)
            ),
            'purchase_requisition_lines' => Phase2InventoryReports::purchaseRequisitionLinesQuery(
                $compId,
                $locationId,
                $this->validatePurchaseRequisitionLinesFiltersForExport($request)
            ),
            'pr_to_po_conversion' => Phase2InventoryReports::prToPoConversionQuery(
                $compId,
                $locationId,
                $this->validatePrToPoConversionFiltersForExport($request)
            ),
            'inventory_movements' => InventoryMovementReports::movementRegisterBaseQuery(
                $compId,
                $locationId,
                $this->validateInventoryMovementsFiltersForExport($request)
            ),
            default => null,
        };
        if ($query === null) {
            return response()->json(['success' => false, 'message' => 'Invalid export kind.'], 400);
        }

        $query->limit(self::PHASE2_EXPORT_MAX_ROWS + 1);
        $rawRows = $query->get();
        $truncated = $rawRows->count() > self::PHASE2_EXPORT_MAX_ROWS;
        $rawRows = $rawRows->take(self::PHASE2_EXPORT_MAX_ROWS);

        [$headers, $filenamePrefix, $rowMapper] = match ($kind) {
            'grn_po_variance' => [
                [
                    __('inventory_messages.reports.gpv_col_po'),
                    __('inventory_messages.reports.gpv_col_po_date'),
                    __('inventory_messages.reports.gpv_col_vendor'),
                    __('inventory_messages.reports.gpv_col_line'),
                    __('inventory_messages.reports.gpv_col_item'),
                    __('inventory_messages.reports.gpv_col_uom'),
                    __('inventory_messages.reports.gpv_col_ordered'),
                    __('inventory_messages.reports.gpv_col_po_received'),
                    __('inventory_messages.reports.gpv_col_grn_accepted'),
                    __('inventory_messages.reports.gpv_col_delta_recv'),
                    __('inventory_messages.reports.gpv_col_po_net_unit'),
                    __('inventory_messages.reports.gpv_col_grn_avg_unit'),
                    __('inventory_messages.reports.gpv_col_price_var_pct'),
                    __('inventory_messages.reports.gpv_col_receipt_vs_ordered_pct'),
                    __('inventory_messages.reports.gpv_col_currency'),
                ],
                'grn_po_variance_',
                function ($row) {
                    $r = $this->mapGrnPoVarianceRow($row);

                    return [
                        $r['po_number'],
                        $r['po_date'],
                        ($r['vendor_code'] ?? '').' — '.($r['vendor_name'] ?? ''),
                        $r['line_no'],
                        trim(($r['item_code'] ?? '').' '.($r['item_name'] ?? '')),
                        $r['uom_code'] ?? '',
                        $r['ordered_qty'],
                        $r['received_qty'],
                        $r['grn_accepted_qty'],
                        $r['grn_vs_po_received_delta'],
                        $r['net_unit_price'],
                        $r['grn_avg_unit_cost'],
                        $r['price_variance_pct'],
                        $r['receipt_vs_ordered_pct'],
                        $r['currency_code'] ?? '',
                    ];
                },
            ],
            'grn_supplier_invoice_listing' => [
                [
                    __('inventory_messages.reports.gsi_col_invoice'),
                    __('inventory_messages.reports.gsi_col_voucher_date'),
                    __('inventory_messages.reports.gsi_col_vendor'),
                    __('inventory_messages.reports.gsi_col_status'),
                    __('inventory_messages.reports.gsi_col_linked_grns'),
                    __('inventory_messages.reports.gsi_col_posted_tx'),
                    __('inventory_messages.reports.gsi_col_reference'),
                ],
                'grn_supplier_invoices_',
                function ($row) {
                    $r = $this->mapGrnSupplierInvoiceListingRow($row);

                    return [
                        $r['invoice_number'],
                        $r['voucher_date'],
                        ($r['vendor_code'] ?? '').' — '.($r['vendor_name'] ?? ''),
                        $r['status'],
                        $r['linked_grn_count'],
                        $r['posted_transaction_id'] ?? '',
                        $r['reference_number'] ?? '',
                    ];
                },
            ],
            'purchase_requisition_lines' => [
                [
                    __('inventory_messages.reports.prl_col_pr'),
                    __('inventory_messages.reports.prl_col_pr_date'),
                    __('inventory_messages.reports.prl_col_status'),
                    __('inventory_messages.reports.prl_col_dept'),
                    __('inventory_messages.reports.prl_col_line'),
                    __('inventory_messages.reports.prl_col_item'),
                    __('inventory_messages.reports.prl_col_uom'),
                    __('inventory_messages.reports.prl_col_qty'),
                    __('inventory_messages.reports.prl_col_est_price'),
                    __('inventory_messages.reports.prl_col_currency'),
                ],
                'purchase_requisition_lines_',
                function ($row) {
                    $r = $this->mapPurchaseRequisitionLinesRow($row);

                    return [
                        $r['pr_number'],
                        $r['pr_date'],
                        $r['pr_status'],
                        $r['department_name'] ?? '',
                        $r['line_no'],
                        trim(($r['item_code'] ?? '').' '.($r['item_name'] ?? '')),
                        $r['uom_code'] ?? '',
                        $r['quantity'],
                        $r['estimated_unit_price'],
                        $r['currency_code'] ?? '',
                    ];
                },
            ],
            'pr_to_po_conversion' => [
                [
                    __('inventory_messages.reports.p2p_col_pr'),
                    __('inventory_messages.reports.p2p_col_pr_date'),
                    __('inventory_messages.reports.p2p_col_pr_status'),
                    __('inventory_messages.reports.p2p_col_pr_line'),
                    __('inventory_messages.reports.p2p_col_item'),
                    __('inventory_messages.reports.p2p_col_pr_qty'),
                    __('inventory_messages.reports.p2p_col_po'),
                    __('inventory_messages.reports.p2p_col_po_date'),
                    __('inventory_messages.reports.p2p_col_po_status'),
                    __('inventory_messages.reports.p2p_col_po_line'),
                    __('inventory_messages.reports.p2p_col_po_ordered'),
                    __('inventory_messages.reports.p2p_col_vendor'),
                    __('inventory_messages.reports.p2p_col_days'),
                ],
                'pr_to_po_conversion_',
                function ($row) {
                    $r = $this->mapPrToPoConversionRow($row);

                    return [
                        $r['pr_number'],
                        $r['pr_date'],
                        $r['pr_status'],
                        $r['pr_line_no'],
                        trim(($r['item_code'] ?? '').' '.($r['item_name'] ?? '')),
                        $r['pr_quantity'],
                        $r['po_number'] ?? '',
                        $r['po_date'] ?? '',
                        $r['po_status'] ?? '',
                        $r['po_line_no'] ?? '',
                        $r['po_ordered_qty'] ?? '',
                        (($r['vendor_code'] ?? '').' — '.($r['vendor_name'] ?? '')) !== ' — ' ? (($r['vendor_code'] ?? '').' — '.($r['vendor_name'] ?? '')) : '',
                        $r['days_pr_to_po'] ?? '',
                    ];
                },
            ],
            'inventory_movements' => [
                [
                    __('inventory_messages.reports.imv_col_voucher_date'),
                    __('inventory_messages.reports.imv_col_grn'),
                    __('inventory_messages.reports.imv_col_grn_line_id'),
                    __('inventory_messages.reports.imv_col_item'),
                    __('inventory_messages.reports.imv_col_uom'),
                    __('inventory_messages.reports.imv_col_qty'),
                    __('inventory_messages.reports.imv_col_unit_cost'),
                    __('inventory_messages.reports.imv_col_line_value'),
                    __('inventory_messages.reports.imv_col_currency'),
                    __('inventory_messages.reports.imv_col_posted_voucher'),
                    __('inventory_messages.reports.imv_col_source'),
                ],
                'inventory_movements_',
                function ($row) {
                    $r = $this->mapInventoryMovementRow($row);

                    return [
                        $r['voucher_date'],
                        $r['grn_number'],
                        $r['goods_receipt_note_line_id'],
                        trim(($r['item_code'] ?? '').' '.($r['item_name'] ?? '')),
                        $r['uom_code'] ?? '',
                        $r['quantity_delta'],
                        $r['unit_cost'],
                        $r['line_value_foreign'],
                        $r['document_currency_code'] ?? '',
                        $r['posted_transaction_id'],
                        $r['source_type'],
                    ];
                },
            ],
        };

        $filename = $filenamePrefix.now()->format('Ymd_His').'.'.$ext;

        return response()->streamDownload(function () use ($rawRows, $headers, $truncated, $rowMapper) {
            $out = fopen('php://output', 'w');
            fwrite($out, "\xEF\xBB\xBF");
            fputcsv($out, $headers);
            foreach ($rawRows as $row) {
                fputcsv($out, $rowMapper($row));
            }
            if ($truncated) {
                fputcsv($out, []);
                fputcsv($out, [__('inventory_messages.reports.phase2_export_truncated', ['max' => (string) self::PHASE2_EXPORT_MAX_ROWS])]);
            }
        }, $filename, ['Content-Type' => $contentType]);
    }

    private function grnPoVarianceFiltersFromRequest(Request $request): array
    {
        $validated = Validator::make($request->query(), $this->grnPoVarianceFilterRules(false))->validate();

        return $this->normalizeGrnPoVarianceFilters($validated);
    }

    private function grnPoVarianceFilterRules(bool $withPagination): array
    {
        $rules = [
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date',
            'vendor_id' => 'nullable|integer',
            'status' => 'nullable|string|max:64',
            'open_lines_only' => 'nullable|boolean',
            'variance_only' => 'nullable|boolean',
            'search' => 'nullable|string|max:255',
            'sort_by' => 'nullable|string|in:po_date,po_number,vendor,item_code,balance_qty,price_variance_pct',
            'sort_order' => 'nullable|string|in:asc,desc',
        ];
        if ($withPagination) {
            $rules['per_page'] = 'nullable|integer|min:10|max:200';
            $rules['page'] = 'nullable|integer|min:1';
        }

        return $rules;
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return array<string, mixed>
     */
    private function normalizeGrnPoVarianceFilters(array $validated): array
    {
        return [
            'date_from' => $validated['date_from'] ?? null,
            'date_to' => $validated['date_to'] ?? null,
            'vendor_id' => isset($validated['vendor_id']) ? (int) $validated['vendor_id'] : null,
            'status' => $validated['status'] ?? 'all',
            'open_lines_only' => ! empty($validated['open_lines_only'] ?? false),
            'variance_only' => ! empty($validated['variance_only'] ?? false),
            'search' => isset($validated['search']) ? trim((string) $validated['search']) : '',
            'sort_by' => $validated['sort_by'] ?? 'po_date',
            'sort_order' => $validated['sort_order'] ?? 'desc',
            'per_page' => isset($validated['per_page']) ? (int) $validated['per_page'] : 50,
            'page' => isset($validated['page']) ? (int) $validated['page'] : 1,
        ];
    }

    private function validateGrnPoVarianceFiltersForApi(Request $request): array
    {
        return $this->normalizeGrnPoVarianceFilters($request->validate($this->grnPoVarianceFilterRules(true)));
    }

    private function validateGrnPoVarianceFiltersForExport(Request $request): array
    {
        return $this->normalizeGrnPoVarianceFilters(Validator::make($request->query(), $this->grnPoVarianceFilterRules(false))->validate());
    }

    private function grnSupplierInvoiceListingFiltersFromRequest(Request $request): array
    {
        return $this->normalizeGrnSupplierInvoiceListingFilters(
            Validator::make($request->query(), $this->grnSupplierInvoiceListingFilterRules(false))->validate()
        );
    }

    private function grnSupplierInvoiceListingFilterRules(bool $withPagination): array
    {
        $rules = [
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date',
            'vendor_id' => 'nullable|integer',
            'status' => 'nullable|string|max:64',
            'search' => 'nullable|string|max:255',
            'sort_by' => 'nullable|string|in:voucher_date,invoice_number,vendor,status',
            'sort_order' => 'nullable|string|in:asc,desc',
        ];
        if ($withPagination) {
            $rules['per_page'] = 'nullable|integer|min:10|max:200';
            $rules['page'] = 'nullable|integer|min:1';
        }

        return $rules;
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return array<string, mixed>
     */
    private function normalizeGrnSupplierInvoiceListingFilters(array $validated): array
    {
        return [
            'date_from' => $validated['date_from'] ?? null,
            'date_to' => $validated['date_to'] ?? null,
            'vendor_id' => isset($validated['vendor_id']) ? (int) $validated['vendor_id'] : null,
            'status' => $validated['status'] ?? 'all',
            'search' => isset($validated['search']) ? trim((string) $validated['search']) : '',
            'sort_by' => $validated['sort_by'] ?? 'voucher_date',
            'sort_order' => $validated['sort_order'] ?? 'desc',
            'per_page' => isset($validated['per_page']) ? (int) $validated['per_page'] : 50,
            'page' => isset($validated['page']) ? (int) $validated['page'] : 1,
        ];
    }

    private function validateGrnSupplierInvoiceListingFiltersForApi(Request $request): array
    {
        return $this->normalizeGrnSupplierInvoiceListingFilters($request->validate($this->grnSupplierInvoiceListingFilterRules(true)));
    }

    private function validateGrnSupplierInvoiceListingFiltersForExport(Request $request): array
    {
        return $this->normalizeGrnSupplierInvoiceListingFilters(
            Validator::make($request->query(), $this->grnSupplierInvoiceListingFilterRules(false))->validate()
        );
    }

    private function purchaseRequisitionLinesFiltersFromRequest(Request $request): array
    {
        return $this->normalizePurchaseRequisitionLinesFilters(
            Validator::make($request->query(), $this->purchaseRequisitionLinesFilterRules(false))->validate()
        );
    }

    private function purchaseRequisitionLinesFilterRules(bool $withPagination): array
    {
        $rules = [
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date',
            'status' => 'nullable|string|max:64',
            'department_id' => 'nullable|integer',
            'search' => 'nullable|string|max:255',
            'sort_by' => 'nullable|string|in:pr_date,pr_number,item_code,quantity',
            'sort_order' => 'nullable|string|in:asc,desc',
        ];
        if ($withPagination) {
            $rules['per_page'] = 'nullable|integer|min:10|max:200';
            $rules['page'] = 'nullable|integer|min:1';
        }

        return $rules;
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return array<string, mixed>
     */
    private function normalizePurchaseRequisitionLinesFilters(array $validated): array
    {
        return [
            'date_from' => $validated['date_from'] ?? null,
            'date_to' => $validated['date_to'] ?? null,
            'status' => $validated['status'] ?? 'all',
            'department_id' => isset($validated['department_id']) ? (int) $validated['department_id'] : null,
            'search' => isset($validated['search']) ? trim((string) $validated['search']) : '',
            'sort_by' => $validated['sort_by'] ?? 'pr_date',
            'sort_order' => $validated['sort_order'] ?? 'desc',
            'per_page' => isset($validated['per_page']) ? (int) $validated['per_page'] : 50,
            'page' => isset($validated['page']) ? (int) $validated['page'] : 1,
        ];
    }

    private function validatePurchaseRequisitionLinesFiltersForApi(Request $request): array
    {
        return $this->normalizePurchaseRequisitionLinesFilters($request->validate($this->purchaseRequisitionLinesFilterRules(true)));
    }

    private function validatePurchaseRequisitionLinesFiltersForExport(Request $request): array
    {
        return $this->normalizePurchaseRequisitionLinesFilters(
            Validator::make($request->query(), $this->purchaseRequisitionLinesFilterRules(false))->validate()
        );
    }

    private function prToPoConversionFiltersFromRequest(Request $request): array
    {
        return $this->normalizePrToPoConversionFilters(
            Validator::make($request->query(), $this->prToPoConversionFilterRules(false))->validate()
        );
    }

    private function prToPoConversionFilterRules(bool $withPagination): array
    {
        $rules = [
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date',
            'pr_status' => 'nullable|string|max:64',
            'po_linked_only' => 'nullable|boolean',
            'search' => 'nullable|string|max:255',
            'sort_by' => 'nullable|string|in:pr_date,pr_number,po_number,item_code',
            'sort_order' => 'nullable|string|in:asc,desc',
        ];
        if ($withPagination) {
            $rules['per_page'] = 'nullable|integer|min:10|max:200';
            $rules['page'] = 'nullable|integer|min:1';
        }

        return $rules;
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return array<string, mixed>
     */
    private function normalizePrToPoConversionFilters(array $validated): array
    {
        $poLinkedOnly = false;
        if (array_key_exists('po_linked_only', $validated)) {
            $poLinkedOnly = filter_var($validated['po_linked_only'], FILTER_VALIDATE_BOOLEAN);
        }

        return [
            'date_from' => $validated['date_from'] ?? null,
            'date_to' => $validated['date_to'] ?? null,
            'pr_status' => $validated['pr_status'] ?? 'all',
            'po_linked_only' => $poLinkedOnly,
            'search' => isset($validated['search']) ? trim((string) $validated['search']) : '',
            'sort_by' => $validated['sort_by'] ?? 'pr_date',
            'sort_order' => $validated['sort_order'] ?? 'desc',
            'per_page' => isset($validated['per_page']) ? (int) $validated['per_page'] : 50,
            'page' => isset($validated['page']) ? (int) $validated['page'] : 1,
        ];
    }

    private function validatePrToPoConversionFiltersForApi(Request $request): array
    {
        return $this->normalizePrToPoConversionFilters($request->validate($this->prToPoConversionFilterRules(true)));
    }

    private function validatePrToPoConversionFiltersForExport(Request $request): array
    {
        return $this->normalizePrToPoConversionFilters(
            Validator::make($request->query(), $this->prToPoConversionFilterRules(false))->validate()
        );
    }

    private function inventoryMovementsFiltersFromRequest(Request $request): array
    {
        return $this->normalizeInventoryMovementsFilters(
            Validator::make($request->query(), $this->inventoryMovementsFilterRules(false))->validate()
        );
    }

    private function inventoryMovementsFilterRules(bool $withPagination): array
    {
        $rules = [
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date',
            'search' => 'nullable|string|max:255',
            'sort_by' => 'nullable|string|in:voucher_date,grn_number,item_code,quantity_delta,posted_transaction_id,line_value',
            'sort_order' => 'nullable|string|in:asc,desc',
        ];
        if ($withPagination) {
            $rules['per_page'] = 'nullable|integer|min:10|max:200';
            $rules['page'] = 'nullable|integer|min:1';
        }

        return $rules;
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return array<string, mixed>
     */
    private function normalizeInventoryMovementsFilters(array $validated): array
    {
        return [
            'date_from' => $validated['date_from'] ?? null,
            'date_to' => $validated['date_to'] ?? null,
            'search' => isset($validated['search']) ? trim((string) $validated['search']) : '',
            'sort_by' => $validated['sort_by'] ?? 'voucher_date',
            'sort_order' => $validated['sort_order'] ?? 'desc',
            'per_page' => isset($validated['per_page']) ? (int) $validated['per_page'] : 50,
            'page' => isset($validated['page']) ? (int) $validated['page'] : 1,
        ];
    }

    private function validateInventoryMovementsFiltersForApi(Request $request): array
    {
        return $this->normalizeInventoryMovementsFilters($request->validate($this->inventoryMovementsFilterRules(true)));
    }

    private function validateInventoryMovementsFiltersForExport(Request $request): array
    {
        return $this->normalizeInventoryMovementsFilters(
            Validator::make($request->query(), $this->inventoryMovementsFilterRules(false))->validate()
        );
    }

    /**
     * @param  object  $row
     * @return array<string, mixed>
     */
    private function mapInventoryMovementRow($row): array
    {
        $vd = $row->voucher_date;
        $voucherDateStr = $vd instanceof \DateTimeInterface
            ? $vd->format('Y-m-d')
            : (string) $vd;
        $ma = $row->movement_at;
        $movementAtStr = $ma instanceof \DateTimeInterface
            ? $ma->format('c')
            : (string) $ma;

        return [
            'movement_id' => (int) $row->movement_id,
            'voucher_date' => $voucherDateStr,
            'movement_at' => $movementAtStr,
            'posted_transaction_id' => (int) $row->posted_transaction_id,
            'quantity_delta' => round((float) $row->quantity_delta, 6),
            'unit_cost' => $row->unit_cost !== null ? round((float) $row->unit_cost, 6) : null,
            'line_value_foreign' => round((float) ($row->line_value_foreign ?? 0), 2),
            'document_currency_code' => (string) ($row->document_currency_code ?? ''),
            'source_type' => (string) $row->source_type,
            'goods_receipt_note_line_id' => (int) $row->goods_receipt_note_line_id,
            'grn_number' => (string) $row->grn_number,
            'item_code' => $row->item_code,
            'item_name' => $row->item_name,
            'uom_code' => $row->uom_code,
        ];
    }

    /**
     * @param  object  $row
     * @return array<string, mixed>
     */
    private function mapGrnPoVarianceRow($row): array
    {
        $base = $this->mapPurchaseOrderLinesRow($row);
        $grnAccepted = (float) ($row->grn_accepted_qty ?? 0);
        $delta = (float) ($row->grn_vs_po_received_delta ?? 0);
        $grnAvg = $row->grn_avg_unit_cost !== null ? (float) $row->grn_avg_unit_cost : null;
        $pv = $row->price_variance_pct !== null ? (float) $row->price_variance_pct : null;
        $rv = $row->receipt_vs_ordered_pct !== null ? (float) $row->receipt_vs_ordered_pct : null;

        return array_merge($base, [
            'grn_accepted_qty' => $grnAccepted,
            'grn_line_value' => round((float) ($row->grn_line_value ?? 0), 2),
            'grn_avg_unit_cost' => $grnAvg !== null ? round($grnAvg, 6) : null,
            'grn_vs_po_received_delta' => round($delta, 6),
            'price_variance_pct' => $pv !== null ? round($pv, 2) : null,
            'receipt_vs_ordered_pct' => $rv !== null ? round($rv, 2) : null,
        ]);
    }

    /**
     * @param  object  $row
     * @return array<string, mixed>
     */
    private function mapGrnSupplierInvoiceListingRow($row): array
    {
        return [
            'id' => (int) $row->id,
            'invoice_number' => (string) $row->invoice_number,
            'voucher_date' => $row->voucher_date,
            'supplier_invoice_date' => $row->supplier_invoice_date,
            'due_date' => $row->due_date,
            'reference_number' => $row->reference_number,
            'status' => (string) $row->status,
            'posted_transaction_id' => $row->posted_transaction_id ? (int) $row->posted_transaction_id : null,
            'description' => $row->description,
            'vendor_code' => $row->vendor_code,
            'vendor_name' => $row->vendor_name,
            'linked_grn_count' => (int) ($row->linked_grn_count ?? 0),
        ];
    }

    /**
     * @param  object  $row
     * @return array<string, mixed>
     */
    private function mapPurchaseRequisitionLinesRow($row): array
    {
        $qty = (float) $row->quantity;
        $est = $row->estimated_unit_price !== null ? (float) $row->estimated_unit_price : null;

        return [
            'line_id' => (int) $row->line_id,
            'purchase_requisition_id' => (int) $row->purchase_requisition_id,
            'pr_number' => $row->pr_number,
            'pr_date' => $row->pr_date,
            'pr_status' => $row->pr_status,
            'requested_by' => $row->requested_by,
            'priority' => $row->priority,
            'department_name' => $row->department_name,
            'line_no' => (int) $row->line_no,
            'item_code' => $row->item_code,
            'item_name' => $row->item_name,
            'item_description' => $row->item_description,
            'uom_code' => $row->uom_code,
            'quantity' => $qty,
            'estimated_unit_price' => $est,
            'line_value_estimate' => $est !== null ? round($qty * $est, 2) : null,
            'need_by_date' => $row->need_by_date,
            'currency_code' => $row->currency_code,
        ];
    }

    /**
     * @param  object  $row
     * @return array<string, mixed>
     */
    private function mapPrToPoConversionRow($row): array
    {
        $days = $row->days_pr_to_po !== null ? (int) $row->days_pr_to_po : null;

        return [
            'pr_line_id' => (int) $row->pr_line_id,
            'purchase_requisition_id' => (int) $row->purchase_requisition_id,
            'pr_number' => $row->pr_number,
            'pr_date' => $row->pr_date,
            'pr_status' => $row->pr_status,
            'pr_line_no' => (int) $row->pr_line_no,
            'pr_quantity' => (float) $row->pr_quantity,
            'item_code' => $row->item_code,
            'item_name' => $row->item_name,
            'uom_code' => $row->uom_code,
            'po_line_id' => $row->po_line_id ? (int) $row->po_line_id : null,
            'purchase_order_id' => $row->purchase_order_id ? (int) $row->purchase_order_id : null,
            'po_number' => $row->po_number,
            'po_date' => $row->po_date,
            'po_status' => $row->po_status,
            'po_line_no' => $row->po_line_no !== null ? (int) $row->po_line_no : null,
            'po_ordered_qty' => $row->po_ordered_qty !== null ? (float) $row->po_ordered_qty : null,
            'vendor_code' => $row->vendor_code,
            'vendor_name' => $row->vendor_name,
            'days_pr_to_po' => $days,
        ];
    }

    /**
     * @param  object  $row
     * @return array<string, mixed>
     */
    private function mapPurchaseOrderLinesRow($row): array
    {
        $ordered = (float) $row->ordered_qty;
        $received = $row->received_qty !== null ? (float) $row->received_qty : 0.0;
        $balance = $ordered - $received;
        $unitPrice = (float) $row->unit_price;
        $discPct = $row->line_discount_percent !== null ? (float) $row->line_discount_percent : 0.0;
        $netUnit = $unitPrice * (1 - $discPct / 100);
        $openValue = round($balance * $netUnit, 2);

        return [
            'line_id' => (int) $row->line_id,
            'purchase_order_id' => (int) $row->purchase_order_id,
            'po_number' => $row->po_number,
            'po_date' => $row->po_date,
            'po_status' => $row->po_status,
            'expected_delivery_date' => $row->expected_delivery_date,
            'vendor_code' => $row->vendor_code,
            'vendor_name' => $row->vendor_name,
            'line_no' => (int) $row->line_no,
            'line_status' => $row->line_status,
            'item_code' => $row->item_code,
            'item_name' => $row->item_name,
            'item_description' => $row->item_description,
            'uom_code' => $row->uom_code,
            'currency_code' => $row->currency_code,
            'ordered_qty' => $ordered,
            'received_qty' => $received,
            'balance_qty' => $balance,
            'unit_price' => $unitPrice,
            'line_discount_percent' => $discPct,
            'net_unit_price' => round($netUnit, 6),
            'open_line_value' => $openValue,
        ];
    }
}

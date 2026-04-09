<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Http\Traits\CheckUserPermissions;
use App\Models\ChartOfAccount;
use Dompdf\Dompdf;
use Dompdf\Options;
use Illuminate\Database\Query\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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

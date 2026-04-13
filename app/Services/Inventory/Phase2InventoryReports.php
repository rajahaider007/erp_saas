<?php

namespace App\Services\Inventory;

use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\DB;

/**
 * Read-only report queries for Phase 2 inventory reports (see docs/INVENTORY_REPORTING_STANDARDS.md).
 */
class Phase2InventoryReports
{
    private static function grnAcceptedQtyExpression(): string
    {
        return 'CASE WHEN gl.accepted_qty IS NOT NULL THEN LEAST(CAST(gl.accepted_qty AS DECIMAL(18,6)), CAST(gl.receipt_qty AS DECIMAL(18,6))) ELSE CAST(gl.receipt_qty AS DECIMAL(18,6)) END';
    }

    /**
     * A3 — PO line vs aggregated GRN (qc_pending + posted) quantities and weighted average unit cost.
     *
     * @param  array<string, mixed>  $filters  date_from, date_to, vendor_id, status, search, open_lines_only, variance_only
     */
    public static function grnPoVarianceBaseQuery(int $compId, int $locationId, array $filters): Builder
    {
        $acc = self::grnAcceptedQtyExpression();

        $grnAgg = DB::table('goods_receipt_note_lines as gl')
            ->join('goods_receipt_notes as g', 'g.id', '=', 'gl.goods_receipt_note_id')
            ->where('g.comp_id', $compId)
            ->where('g.location_id', $locationId)
            ->whereIn('g.status', ['qc_pending', 'posted'])
            ->groupBy('gl.purchase_order_line_id')
            ->selectRaw('gl.purchase_order_line_id as grn_pol_id')
            ->selectRaw("SUM({$acc}) as grn_accepted_qty")
            ->selectRaw("SUM(({$acc}) * CAST(gl.unit_cost AS DECIMAL(18,6))) as grn_line_value");

        $netUnitSql = '(l.unit_price * (1 - COALESCE(l.line_discount_percent, 0) / 100))';

        $query = DB::table('purchase_order_lines as l')
            ->join('purchase_orders as p', 'p.id', '=', 'l.purchase_order_id')
            ->leftJoinSub($grnAgg, 'grn', function ($join) {
                $join->on('grn.grn_pol_id', '=', 'l.id');
            })
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
                'p.expected_delivery_date',
                'p.status as po_status',
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
            ])
            ->selectRaw("CAST(COALESCE(l.received_qty, 0) AS DECIMAL(18,6)) as received_qty_num")
            ->selectRaw('CAST(COALESCE(grn.grn_accepted_qty, 0) AS DECIMAL(18,6)) as grn_accepted_qty')
            ->selectRaw('CAST(COALESCE(grn.grn_line_value, 0) AS DECIMAL(18,6)) as grn_line_value')
            ->selectRaw("CAST({$netUnitSql} AS DECIMAL(18,8)) as po_net_unit_price")
            ->selectRaw('(CASE WHEN COALESCE(grn.grn_accepted_qty, 0) > 0.0000001 THEN grn.grn_line_value / grn.grn_accepted_qty ELSE NULL END) as grn_avg_unit_cost')
            ->selectRaw('(CAST(l.ordered_qty AS DECIMAL(18,6)) - CAST(COALESCE(l.received_qty, 0) AS DECIMAL(18,6))) as balance_qty_raw')
            ->selectRaw('(CAST(COALESCE(grn.grn_accepted_qty, 0) AS DECIMAL(18,6)) - CAST(COALESCE(l.received_qty, 0) AS DECIMAL(18,6))) as grn_vs_po_received_delta')
            ->selectRaw('(CASE WHEN CAST(l.ordered_qty AS DECIMAL(18,6)) > 0.0000001 THEN (CAST(COALESCE(l.received_qty, 0) AS DECIMAL(18,6)) - CAST(l.ordered_qty AS DECIMAL(18,6))) / CAST(l.ordered_qty AS DECIMAL(18,6)) * 100 ELSE NULL END) as receipt_vs_ordered_pct')
            ->selectRaw('(CASE WHEN '.$netUnitSql.' != 0 AND grn.grn_accepted_qty > 0.0000001 THEN ((grn.grn_line_value / grn.grn_accepted_qty) - ('.$netUnitSql.')) / ABS('.$netUnitSql.') * 100 ELSE NULL END) as price_variance_pct');

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
            $term = '%'.str_replace(['%', '_'], ['\\%', '\\_'], (string) $filters['search']).'%';
            $query->where(function ($q) use ($term) {
                $q->where('p.po_number', 'like', $term)
                    ->orWhere('i.item_code', 'like', $term)
                    ->orWhere('i.item_name_short', 'like', $term)
                    ->orWhere('l.item_description', 'like', $term);
            });
        }
        if (! empty($filters['variance_only'])) {
            $query->where(function ($w) use ($netUnitSql) {
                $w->whereRaw('ABS(CAST(COALESCE(grn.grn_accepted_qty, 0) AS DECIMAL(18,6)) - CAST(COALESCE(l.received_qty, 0) AS DECIMAL(18,6))) > 0.000001')
                    ->orWhereRaw('(grn.grn_accepted_qty > 0.0000001 AND '.$netUnitSql.' != 0 AND ABS((grn.grn_line_value / grn.grn_accepted_qty) - ('.$netUnitSql.')) / ABS('.$netUnitSql.') * 100 >= 0.5)');
            });
        }

        $sortBy = $filters['sort_by'] ?? 'po_date';
        $sortOrder = strtolower((string) ($filters['sort_order'] ?? 'desc')) === 'asc' ? 'asc' : 'desc';
        $sortMap = [
            'po_date' => 'p.po_date',
            'po_number' => 'p.po_number',
            'vendor' => 'v.account_code',
            'item_code' => 'i.item_code',
            'balance_qty' => 'balance_qty_raw',
            'price_variance_pct' => 'price_variance_pct',
        ];
        $orderCol = $sortMap[$sortBy] ?? 'p.po_date';
        if ($sortBy === 'balance_qty' || $sortBy === 'price_variance_pct') {
            $query->orderByRaw("{$orderCol} {$sortOrder}");
        } else {
            $query->orderBy($orderCol, $sortOrder);
        }
        $query->orderBy('p.po_number')->orderBy('l.line_no');

        return $query;
    }

    /**
     * A4 — GRN-linked supplier invoices (AP reconciliation list).
     *
     * @param  array<string, mixed>  $filters  date_from, date_to, vendor_id, status, search
     */
    public static function grnSupplierInvoiceListingQuery(int $compId, int $locationId, array $filters): Builder
    {
        $grnCounts = DB::table('grn_supplier_invoice_grns')
            ->selectRaw('grn_supplier_invoice_id')
            ->selectRaw('COUNT(*) as linked_grn_count')
            ->groupBy('grn_supplier_invoice_id');

        $query = DB::table('grn_supplier_invoices as inv')
            ->leftJoinSub($grnCounts, 'gc', function ($join) {
                $join->on('gc.grn_supplier_invoice_id', '=', 'inv.id');
            })
            ->leftJoin('chart_of_accounts as v', 'v.id', '=', 'inv.vendor_id')
            ->where('inv.comp_id', $compId)
            ->where('inv.location_id', $locationId)
            ->select([
                'inv.id',
                'inv.invoice_number',
                'inv.voucher_date',
                'inv.supplier_invoice_date',
                'inv.due_date',
                'inv.reference_number',
                'inv.status',
                'inv.posted_transaction_id',
                'inv.description',
                'v.account_code as vendor_code',
                'v.account_name as vendor_name',
            ])
            ->selectRaw('COALESCE(gc.linked_grn_count, 0) as linked_grn_count');

        if (! empty($filters['date_from'])) {
            $query->whereDate('inv.voucher_date', '>=', $filters['date_from']);
        }
        if (! empty($filters['date_to'])) {
            $query->whereDate('inv.voucher_date', '<=', $filters['date_to']);
        }
        if (! empty($filters['vendor_id'])) {
            $query->where('inv.vendor_id', (int) $filters['vendor_id']);
        }
        if (! empty($filters['status']) && $filters['status'] !== 'all') {
            $query->where('inv.status', $filters['status']);
        }
        if (! empty($filters['search'])) {
            $term = '%'.str_replace(['%', '_'], ['\\%', '\\_'], (string) $filters['search']).'%';
            $query->where(function ($q) use ($term) {
                $q->where('inv.invoice_number', 'like', $term)
                    ->orWhere('inv.reference_number', 'like', $term)
                    ->orWhere('inv.description', 'like', $term);
            });
        }

        $sortBy = $filters['sort_by'] ?? 'voucher_date';
        $sortOrder = strtolower((string) ($filters['sort_order'] ?? 'desc')) === 'asc' ? 'asc' : 'desc';
        $sortMap = [
            'voucher_date' => 'inv.voucher_date',
            'invoice_number' => 'inv.invoice_number',
            'vendor' => 'v.account_code',
            'status' => 'inv.status',
        ];
        $orderCol = $sortMap[$sortBy] ?? 'inv.voucher_date';
        $query->orderBy($orderCol, $sortOrder)->orderBy('inv.invoice_number');

        return $query;
    }

    /**
     * B1 — Purchase requisition lines register.
     *
     * @param  array<string, mixed>  $filters  date_from, date_to, status, department_id, search
     */
    public static function purchaseRequisitionLinesQuery(int $compId, int $locationId, array $filters): Builder
    {
        $query = DB::table('purchase_requisition_lines as l')
            ->join('purchase_requisitions as h', 'h.id', '=', 'l.purchase_requisition_id')
            ->leftJoin('inventory_items as i', 'i.id', '=', 'l.inventory_item_id')
            ->leftJoin('uom_masters as u', 'u.id', '=', 'l.uom_id')
            ->leftJoin('departments as d', 'd.id', '=', 'h.department_id')
            ->leftJoin('currencies as cur', 'cur.id', '=', 'h.currency_id')
            ->where('h.comp_id', $compId)
            ->where('h.location_id', $locationId)
            ->select([
                'l.id as line_id',
                'h.id as purchase_requisition_id',
                'h.pr_number',
                'h.pr_date',
                'h.status as pr_status',
                'h.requested_by',
                'h.priority',
                'd.department_name',
                'l.line_no',
                'i.item_code',
                'i.item_name_short as item_name',
                'l.item_description',
                'u.uom_code',
                'l.quantity',
                'l.estimated_unit_price',
                'l.need_by_date',
                'cur.code as currency_code',
            ]);

        if (! empty($filters['date_from'])) {
            $query->whereDate('h.pr_date', '>=', $filters['date_from']);
        }
        if (! empty($filters['date_to'])) {
            $query->whereDate('h.pr_date', '<=', $filters['date_to']);
        }
        if (! empty($filters['status']) && $filters['status'] !== 'all') {
            $query->where('h.status', $filters['status']);
        }
        if (! empty($filters['department_id'])) {
            $query->where('h.department_id', (int) $filters['department_id']);
        }
        if (! empty($filters['search'])) {
            $term = '%'.str_replace(['%', '_'], ['\\%', '\\_'], (string) $filters['search']).'%';
            $query->where(function ($q) use ($term) {
                $q->where('h.pr_number', 'like', $term)
                    ->orWhere('i.item_code', 'like', $term)
                    ->orWhere('i.item_name_short', 'like', $term)
                    ->orWhere('l.item_description', 'like', $term)
                    ->orWhere('h.requested_by', 'like', $term);
            });
        }

        $sortBy = $filters['sort_by'] ?? 'pr_date';
        $sortOrder = strtolower((string) ($filters['sort_order'] ?? 'desc')) === 'asc' ? 'asc' : 'desc';
        $sortMap = [
            'pr_date' => 'h.pr_date',
            'pr_number' => 'h.pr_number',
            'item_code' => 'i.item_code',
            'quantity' => 'l.quantity',
        ];
        $orderCol = $sortMap[$sortBy] ?? 'h.pr_date';
        $query->orderBy($orderCol, $sortOrder)->orderBy('h.pr_number')->orderBy('l.line_no');

        return $query;
    }

    /**
     * B2 — PR line to PO line conversion (pipeline).
     *
     * @param  array<string, mixed>  $filters  date_from, date_to, pr_status, po_linked_only, search
     */
    public static function prToPoConversionQuery(int $compId, int $locationId, array $filters): Builder
    {
        $query = DB::table('purchase_requisition_lines as prl')
            ->join('purchase_requisitions as pr', 'pr.id', '=', 'prl.purchase_requisition_id')
            ->leftJoin('purchase_order_lines as pol', 'pol.purchase_requisition_line_id', '=', 'prl.id')
            ->leftJoin('purchase_orders as po', 'po.id', '=', 'pol.purchase_order_id')
            ->leftJoin('inventory_items as i', 'i.id', '=', 'prl.inventory_item_id')
            ->leftJoin('uom_masters as u', 'u.id', '=', 'prl.uom_id')
            ->leftJoin('chart_of_accounts as v', 'v.id', '=', 'po.vendor_id')
            ->where('pr.comp_id', $compId)
            ->where('pr.location_id', $locationId)
            ->select([
                'prl.id as pr_line_id',
                'pr.id as purchase_requisition_id',
                'pr.pr_number',
                'pr.pr_date',
                'pr.status as pr_status',
                'prl.line_no as pr_line_no',
                'prl.quantity as pr_quantity',
                'i.item_code',
                'i.item_name_short as item_name',
                'u.uom_code',
                'pol.id as po_line_id',
                'po.id as purchase_order_id',
                'po.po_number',
                'po.po_date',
                'po.status as po_status',
                'pol.line_no as po_line_no',
                'pol.ordered_qty as po_ordered_qty',
                'v.account_code as vendor_code',
                'v.account_name as vendor_name',
            ])
            ->selectRaw('(CASE WHEN po.po_date IS NOT NULL AND pr.pr_date IS NOT NULL THEN DATEDIFF(po.po_date, pr.pr_date) ELSE NULL END) as days_pr_to_po');

        if (! empty($filters['date_from'])) {
            $query->whereDate('pr.pr_date', '>=', $filters['date_from']);
        }
        if (! empty($filters['date_to'])) {
            $query->whereDate('pr.pr_date', '<=', $filters['date_to']);
        }
        if (! empty($filters['pr_status']) && $filters['pr_status'] !== 'all') {
            $query->where('pr.status', $filters['pr_status']);
        }
        if (! empty($filters['po_linked_only'])) {
            $query->whereNotNull('pol.id');
        }
        if (! empty($filters['search'])) {
            $term = '%'.str_replace(['%', '_'], ['\\%', '\\_'], (string) $filters['search']).'%';
            $query->where(function ($q) use ($term) {
                $q->where('pr.pr_number', 'like', $term)
                    ->orWhere('po.po_number', 'like', $term)
                    ->orWhere('i.item_code', 'like', $term)
                    ->orWhere('i.item_name_short', 'like', $term);
            });
        }

        $sortBy = $filters['sort_by'] ?? 'pr_date';
        $sortOrder = strtolower((string) ($filters['sort_order'] ?? 'desc')) === 'asc' ? 'asc' : 'desc';
        $sortMap = [
            'pr_date' => 'pr.pr_date',
            'pr_number' => 'pr.pr_number',
            'po_number' => 'po.po_number',
            'item_code' => 'i.item_code',
        ];
        $orderCol = $sortMap[$sortBy] ?? 'pr.pr_date';
        $query->orderBy($orderCol, $sortOrder)->orderBy('pr.pr_number')->orderBy('prl.line_no');

        return $query;
    }
}

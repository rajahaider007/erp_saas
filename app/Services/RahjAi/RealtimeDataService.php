<?php

namespace App\Services\RahjAi;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Read-only snapshots for RAG "live data" chunks. Uses this ERP's real tables (comp_id, chart_of_accounts, transactions).
 */
class RealtimeDataService
{
    public function getAccountBalance(string $accountCode, string $date, int $companyId): array
    {
        try {
            if (! Schema::hasTable('chart_of_accounts') || ! Schema::hasTable('transaction_entries') || ! Schema::hasTable('transactions')) {
                return ['error' => 'Accounting tables are not available in this database.'];
            }

            $account = DB::table('chart_of_accounts')
                ->where('account_code', $accountCode)
                ->where(function ($q) use ($companyId) {
                    $q->where('comp_id', $companyId)->orWhereNull('comp_id');
                })
                ->first();

            if (! $account) {
                return ['error' => "Account code '{$accountCode}' was not found for this company."];
            }

            $debit = (float) DB::table('transaction_entries as te')
                ->join('transactions as t', 't.id', '=', 'te.transaction_id')
                ->where('te.account_id', $account->id)
                ->where('t.comp_id', $companyId)
                ->where('t.status', 'Posted')
                ->whereDate('t.voucher_date', '<=', $date)
                ->sum('te.debit_amount');

            $credit = (float) DB::table('transaction_entries as te')
                ->join('transactions as t', 't.id', '=', 'te.transaction_id')
                ->where('te.account_id', $account->id)
                ->where('t.comp_id', $companyId)
                ->where('t.status', 'Posted')
                ->whereDate('t.voucher_date', '<=', $date)
                ->sum('te.credit_amount');

            $balance = $debit - $credit;

            return [
                'account_code' => $accountCode,
                'account_name' => $account->account_name,
                'as_of_date' => $date,
                'debit_total' => $debit,
                'credit_total' => $credit,
                'balance' => $balance,
                'balance_formatted' => number_format($balance, 2),
                'currency' => (string) ($account->currency ?? 'PKR'),
                'note' => 'Balance from posted vouchers only (transaction_entries + transactions).',
            ];
        } catch (\Throwable $e) {
            return ['error' => 'Could not read account balance.', 'detail' => $e->getMessage()];
        }
    }

    public function getInventoryStock(string $itemCode, ?int $warehouseId = null, ?int $companyId = null): array
    {
        try {
            if (! Schema::hasTable('inventory_items')) {
                return ['error' => 'Inventory is not available in this database.'];
            }

            $q = DB::table('inventory_items')->where('item_code', $itemCode);
            if ($companyId) {
                $q->where(function ($q2) use ($companyId) {
                    $q2->where('comp_id', $companyId)->orWhereNull('comp_id');
                });
            }

            $item = $q->first();

            if (! $item) {
                return ['error' => "Item code '{$itemCode}' was not found."];
            }

            return [
                'item_code' => $itemCode,
                'item_name' => $item->item_name_short ?? $item->item_name_long ?? '',
                'item_status' => $item->item_status ?? null,
                'reorder_point' => $item->reorder_point ?? null,
                'standard_cost' => $item->standard_cost ?? null,
                'note' => 'On-hand quantity is not computed here. For quantities aligned with posted GL (supplier invoice posted), use [Stock position (GRN)](/inventory/reports/stock-position) with “Posted vouchers only” (default). Uncheck that filter for receipts still in QC only.',
            ];
        } catch (\Throwable $e) {
            return ['error' => 'Could not read inventory item.', 'detail' => $e->getMessage()];
        }
    }

    public function getPendingPurchaseOrders(int $companyId, ?int $locationId = null): array
    {
        try {
            if (! Schema::hasTable('purchase_orders')) {
                return ['pending_orders_count' => 0, 'orders' => [], 'note' => 'No purchase_orders table.'];
            }

            $query = DB::table('purchase_orders as h')
                ->where('h.comp_id', $companyId)
                ->whereIn('h.status', ['draft', 'pending', 'approved']);

            if ($locationId) {
                $query->where('h.location_id', $locationId);
            }

            if (Schema::hasTable('chart_of_accounts')) {
                $query->leftJoin('chart_of_accounts as v', 'v.id', '=', 'h.vendor_id')
                    ->select('h.id', 'h.po_number', 'h.po_date', 'h.expected_delivery_date', 'h.status', 'v.account_name as supplier_name');
            } else {
                $query->select('h.id', 'h.po_number', 'h.po_date', 'h.expected_delivery_date', 'h.status', DB::raw('NULL as supplier_name'));
            }

            $orders = $query->get();

            $list = [];
            foreach ($orders as $o) {
                $lineTotal = 0.0;
                if (Schema::hasTable('purchase_order_lines')) {
                    $lineTotal = (float) DB::table('purchase_order_lines')
                        ->where('purchase_order_id', $o->id)
                        ->selectRaw('COALESCE(SUM(ordered_qty * unit_price), 0) as amt')
                        ->value('amt');
                }

                $list[] = [
                    'po_number' => $o->po_number,
                    'supplier_name' => $o->supplier_name ?? '—',
                    'po_date' => $o->po_date,
                    'expected_delivery' => $o->expected_delivery_date,
                    'line_total_estimate' => round($lineTotal, 2),
                    'status' => $o->status,
                ];
            }

            return [
                'pending_orders_count' => count($list),
                'pending_amount_estimate' => round(array_sum(array_column($list, 'line_total_estimate')), 2),
                'orders' => $list,
                'rahj_ui_links' => [
                    'po_list' => '/inventory/purchase-order',
                    'po_create' => '/inventory/purchase-order/create',
                    'markdown_po_list' => '[Purchase orders](/inventory/purchase-order)',
                ],
            ];
        } catch (\Throwable $e) {
            return ['error' => 'Could not read purchase orders.', 'detail' => $e->getMessage()];
        }
    }

    public function getPendingGoodsReceipts(int $companyId, ?int $locationId = null): array
    {
        try {
            if (! Schema::hasTable('goods_receipt_notes')) {
                return ['pending_receipts_count' => 0, 'receipts' => []];
            }

            // Status values match GoodsReceiptNote / GrnSupplierInvoice flows (not legacy pending_qc/partial).
            $q = DB::table('goods_receipt_notes')
                ->where('comp_id', $companyId)
                ->where(function ($w) {
                    $w->where('status', 'draft')
                        ->orWhere(function ($w2) {
                            $w2->where('status', 'qc_pending')
                                ->whereNull('posted_transaction_id');
                        });
                });

            if ($locationId) {
                $q->where('location_id', $locationId);
            }

            $countQ = clone $q;
            $pendingReceiptsCount = (int) $countQ->count();
            $draftGrnCount = (int) (clone $q)->where('status', 'draft')->count();
            $qcPendingAwaitingInvoiceCount = (int) (clone $q)->where('status', 'qc_pending')->count();

            $receipts = (clone $q)->orderByDesc('receipt_date')
                ->orderByDesc('id')
                ->limit(80)
                ->get(['grn_number', 'receipt_date', 'status', 'location_id', 'posted_transaction_id']);

            return [
                'pending_receipts_count' => $pendingReceiptsCount,
                'draft_grn_count' => $draftGrnCount,
                'qc_pending_awaiting_supplier_invoice_count' => $qcPendingAwaitingInvoiceCount,
                'note' => 'Draft = not submitted to QC. QC pending without posted_transaction_id = received operationally but not yet capitalised in GL; post via [GRN supplier invoice](/inventory/grn-supplier-invoice).',
                'receipts' => $receipts->map(fn ($r) => [
                    'grn_number' => $r->grn_number,
                    'receipt_date' => $r->receipt_date,
                    'status' => $r->status,
                    'location_id' => $r->location_id,
                ])->all(),
                'rahj_ui_links' => [
                    'grn_list' => '/inventory/goods-receipt-note',
                    'markdown_grn_list' => '[Goods receipt (GRN)](/inventory/goods-receipt-note)',
                    'grn_supplier_invoice' => '/inventory/grn-supplier-invoice',
                    'markdown_supplier_invoice' => '[GRN supplier invoice](/inventory/grn-supplier-invoice)',
                    'stock_position_report' => '/inventory/reports/stock-position',
                    'markdown_stock_position' => '[Stock position (GRN)](/inventory/reports/stock-position)',
                ],
            ];
        } catch (\Throwable $e) {
            return ['error' => 'Could not read goods receipts.', 'detail' => $e->getMessage()];
        }
    }

    public function getTrialBalance(string $asOfDate, int $companyId): array
    {
        try {
            if (! Schema::hasTable('chart_of_accounts') || ! Schema::hasTable('transaction_entries') || ! Schema::hasTable('transactions')) {
                return ['error' => 'Accounting tables are not available.'];
            }

            $aggregates = DB::table('transaction_entries as te')
                ->join('transactions as t', 't.id', '=', 'te.transaction_id')
                ->where('t.comp_id', $companyId)
                ->where('t.status', 'Posted')
                ->whereDate('t.voucher_date', '<=', $asOfDate)
                ->groupBy('te.account_id')
                ->selectRaw('te.account_id, SUM(te.debit_amount) as debit, SUM(te.credit_amount) as credit')
                ->havingRaw('SUM(te.debit_amount) > 0.00001 OR SUM(te.credit_amount) > 0.00001')
                ->get();

            if ($aggregates->isEmpty()) {
                return [
                    'as_of_date' => $asOfDate,
                    'total_debit' => '0.00',
                    'total_credit' => '0.00',
                    'is_balanced' => true,
                    'accounts' => [],
                    'note' => 'No posted activity found for this company up to the given date.',
                ];
            }

            $ids = $aggregates->pluck('account_id')->filter()->unique()->all();
            $names = DB::table('chart_of_accounts')->whereIn('id', $ids)->get()->keyBy('id');

            $trialBalance = [];
            $totalDebit = 0.0;
            $totalCredit = 0.0;

            foreach ($aggregates as $row) {
                $coa = $names->get($row->account_id);
                if (! $coa) {
                    continue;
                }
                $d = (float) $row->debit;
                $c = (float) $row->credit;
                $trialBalance[] = [
                    'account_code' => $coa->account_code,
                    'account_name' => $coa->account_name,
                    'debit' => $d,
                    'credit' => $c,
                ];
                $totalDebit += $d;
                $totalCredit += $c;
            }

            return [
                'as_of_date' => $asOfDate,
                'total_debit' => number_format($totalDebit, 2),
                'total_credit' => number_format($totalCredit, 2),
                'is_balanced' => abs($totalDebit - $totalCredit) < 0.01,
                'accounts' => $trialBalance,
                'note' => 'Unofficial snapshot for assistant use; use formal Trial Balance report for accounting sign-off.',
            ];
        } catch (\Throwable $e) {
            return ['error' => 'Could not compute trial balance.', 'detail' => $e->getMessage()];
        }
    }

    public function getSalesSummary(string $fromDate, string $toDate, int $companyId): array
    {
        return [
            'from_date' => $fromDate,
            'to_date' => $toDate,
            'company_id' => $companyId,
            'note' => 'Sales order aggregates are not wired in this build. Use AR / sales reports in the app when available.',
        ];
    }

    /**
     * Same mapping as AccountsDashboardController::getAccountsByDashboardType configTypeMap.
     *
     * @return list<string>
     */
    public static function dashboardReportConfigTypes(string $reportType): array
    {
        $map = [
            'main-payable' => ['accounts_payable'],
            'main-receivable' => ['accounts_receivable'],
            'current-cash' => ['cash', 'petty_cash'],
            'all-cash-codes' => ['cash', 'petty_cash', 'bank'],
            'bank-balances' => ['bank'],
        ];

        return $map[$reportType] ?? [];
    }

    /**
     * Closing balances for any accounts-dashboard financial card (config-driven report types).
     */
    public function getAccountsDashboardFinancialSnapshot(
        int $companyId,
        int $locationId,
        string $reportType,
        ?array $dateRange = null
    ): array {
        $configTypes = self::dashboardReportConfigTypes($reportType);
        if ($configTypes === []) {
            return ['error' => 'Unknown financial report type.', 'report_type' => $reportType];
        }

        try {
            if (
                ! Schema::hasTable('chart_of_accounts')
                || ! Schema::hasTable('account_configurations')
                || ! Schema::hasTable('transaction_entries')
                || ! Schema::hasTable('transactions')
            ) {
                return ['error' => 'Accounting tables are not available in this database.'];
            }

            $fromDate = $dateRange['from'] ?? null;
            $toDate = $dateRange['to'] ?? null;

            $openingBalanceExpression = Schema::hasColumn('chart_of_accounts', 'opening_balance')
                ? 'COALESCE(coa.opening_balance, 0)'
                : '0';

            $movements = DB::table('transaction_entries as te')
                ->join('transactions as t', 'te.transaction_id', '=', 't.id')
                ->where('t.comp_id', $companyId)
                ->where('t.location_id', $locationId)
                ->where('t.status', 'Posted');

            if ($fromDate) {
                $movements->whereDate('t.voucher_date', '>=', $fromDate);
            }
            if ($toDate) {
                $movements->whereDate('t.voucher_date', '<=', $toDate);
            }

            $movements->groupBy('te.account_id')
                ->select(
                    'te.account_id',
                    DB::raw('SUM(COALESCE(te.base_debit_amount, 0) - COALESCE(te.base_credit_amount, 0)) as movement_balance')
                );

            $rows = DB::table('chart_of_accounts as coa')
                ->join('account_configurations as ac', function ($join) {
                    $join->on('coa.id', '=', 'ac.account_id');
                })
                ->leftJoinSub($movements, 'mv', function ($join) {
                    $join->on('coa.id', '=', 'mv.account_id');
                })
                ->where('coa.comp_id', $companyId)
                ->where('coa.location_id', $locationId)
                ->where('ac.comp_id', $companyId)
                ->where('ac.location_id', $locationId)
                ->where('ac.is_active', true)
                ->whereIn('ac.config_type', $configTypes)
                ->where('coa.is_transactional', true)
                ->where('coa.status', 'Active')
                ->select(
                    'coa.account_code',
                    'coa.account_name',
                    DB::raw($openingBalanceExpression.' as opening_balance'),
                    DB::raw('COALESCE(mv.movement_balance, 0) as movement_balance'),
                    DB::raw('('.$openingBalanceExpression.' + COALESCE(mv.movement_balance, 0)) as closing_balance')
                )
                ->orderBy('coa.account_code')
                ->get();

            $accounts = [];
            foreach ($rows as $r) {
                $accounts[] = [
                    'account_code' => (string) $r->account_code,
                    'account_name' => (string) $r->account_name,
                    'closing_balance' => round((float) $r->closing_balance, 2),
                ];
            }

            $total = round(array_sum(array_column($accounts, 'closing_balance')), 2);

            return [
                'accounts' => $accounts,
                'total_closing' => $total,
                'report_type' => $reportType,
                'as_of_note' => ($fromDate || $toDate)
                    ? 'Movement filtered by voucher date in range; opening + movement = closing (same as dashboard report with dates).'
                    : 'All posted vouchers included (same logic as accounts dashboard financial card for this report type).',
            ];
        } catch (\Throwable $e) {
            return ['error' => 'Could not read financial balances.', 'detail' => $e->getMessage()];
        }
    }

    /** Backwards-compatible alias for bank-balances dashboard snapshot. */
    public function getBankBalancesSnapshot(int $companyId, int $locationId, ?array $dateRange = null): array
    {
        return $this->getAccountsDashboardFinancialSnapshot($companyId, $locationId, 'bank-balances', $dateRange);
    }
}

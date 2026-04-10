<?php

namespace App\Services\RahjAi;

use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

/**
 * Real-Time Database Query Service
 * 
 * Enables RAHJAI to query live data from system:
 * - Account balances and transactions
 * - Inventory levels and values
 * - Pending orders and receipts
 * - Amounts, counts, summaries
 */
class RealtimeDataService
{
    /**
     * Get account balance for a specific date
     */
    public function getAccountBalance(string $accountCode, string $date, int $companyId): array
    {
        try {
            $account = DB::table('accounts')
                ->where('code', $accountCode)
                ->where('company_id', $companyId)
                ->first();

            if (!$account) {
                return ['error' => "Account '{$accountCode}' not found"];
            }

            $debit = DB::table('journal_voucher_lines')
                ->whereHas('voucher', function ($q) use ($companyId, $date) {
                    $q->where('company_id', $companyId)
                      ->whereDate('voucher_date', '<=', $date)
                      ->where('status', 'posted');
                })
                ->where('account_id', $account->id)
                ->where('line_type', 'debit')
                ->sum('amount');

            $credit = DB::table('journal_voucher_lines')
                ->whereHas('voucher', function ($q) use ($companyId, $date) {
                    $q->where('company_id', $companyId)
                      ->whereDate('voucher_date', '<=', $date)
                      ->where('status', 'posted');
                })
                ->where('account_id', $account->id)
                ->where('line_type', 'credit')
                ->sum('amount');

            $balance = $debit - $credit;

            return [
                'account_code' => $accountCode,
                'account_name' => $account->name,
                'as_of_date' => $date,
                'debit_total' => $debit,
                'credit_total' => $credit,
                'balance' => $balance,
                'balance_formatted' => number_format($balance, 2),
                'currency' => 'PKR', // From system config
            ];
        } catch (\Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }

    /**
     * Get inventory stock levels for an item
     */
    public function getInventoryStock(string $itemCode, int $warehouseId = null, int $companyId = null): array
    {
        try {
            $item = DB::table('items')
                ->where('code', $itemCode)
                ->first();

            if (!$item) {
                return ['error' => "Item '{$itemCode}' not found"];
            }

            $query = DB::table('inventory_balances')
                ->where('item_id', $item->id);

            if ($warehouseId) {
                $query->where('warehouse_id', $warehouseId);
            }

            if ($companyId) {
                $query->where('company_id', $companyId);
            }

            $balances = $query->get();

            if ($balances->isEmpty()) {
                return [
                    'item_code' => $itemCode,
                    'item_name' => $item->name,
                    'total_quantity' => 0,
                    'total_value' => 0,
                    'warehouses' => [],
                ];
            }

            $totalQty = $balances->sum('quantity');
            $totalValue = $balances->sum('value');

            return [
                'item_code' => $itemCode,
                'item_name' => $item->name,
                'total_quantity' => $totalQty,
                'total_value' => $totalValue,
                'total_value_formatted' => number_format($totalValue, 2),
                'warehouses' => $balances->map(fn($b) => [
                    'warehouse_id' => $b->warehouse_id,
                    'warehouse_name' => $this->getWarehouseNameById($b->warehouse_id),
                    'quantity' => $b->quantity,
                    'unit_price' => $b->unit_price,
                    'value' => number_format($b->value, 2),
                ])->toArray(),
                'last_updated' => now()->toDateTimeString(),
            ];
        } catch (\Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }

    /**
     * Get pending purchase orders
     */
    public function getPendingPurchaseOrders(int $companyId, int $locationId = null): array
    {
        try {
            $query = DB::table('purchase_orders')
                ->where('company_id', $companyId)
                ->whereIn('status', ['draft', 'pending', 'approved']);

            if ($locationId) {
                $query->where('location_id', $locationId);
            }

            $orders = $query->with(['supplier', 'lines'])->get();

            return [
                'pending_orders_count' => $orders->count(),
                'pending_amount' => $orders->sum('total_amount'),
                'pending_amount_formatted' => number_format($orders->sum('total_amount'), 2),
                'orders' => $orders->map(fn($o) => [
                    'po_number' => $o->po_number,
                    'supplier_name' => $o->supplier->name ?? 'Unknown',
                    'po_date' => $o->po_date,
                    'expected_delivery' => $o->expected_delivery_date,
                    'total_amount' => number_format($o->total_amount, 2),
                    'status' => $o->status,
                    'items_count' => $o->lines->count(),
                ])->toArray(),
            ];
        } catch (\Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }

    /**
     * Get pending goods receipts
     */
    public function getPendingGoodsReceipts(int $companyId): array
    {
        try {
            $receipts = DB::table('goods_receipt_notes')
                ->where('company_id', $companyId)
                ->whereIn('status', ['draft', 'pending_qc', 'partial'])
                ->get();

            return [
                'pending_receipts_count' => $receipts->count(),
                'total_items' => $receipts->sum('total_items'),
                'receipts' => $receipts->map(fn($r) => [
                    'grn_number' => $r->grn_number,
                    'receipt_date' => $r->receipt_date,
                    'po_reference' => $r->po_reference,
                    'total_items' => $r->total_items,
                    'status' => $r->status,
                ])->toArray(),
            ];
        } catch (\Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }

    /**
     * Get account trial balance as of date
     */
    public function getTrialBalance(string $asOfDate, int $companyId): array
    {
        try {
            $accounts = DB::table('accounts')
                ->where('company_id', $companyId)
                ->where('level', 4) // Only leaf accounts
                ->get();

            $trialBalance = [];
            $totalDebit = 0;
            $totalCredit = 0;

            foreach ($accounts as $account) {
                $debit = DB::table('journal_voucher_lines')
                    ->whereHas('voucher', function ($q) use ($companyId, $asOfDate) {
                        $q->where('company_id', $companyId)
                          ->whereDate('voucher_date', '<=', $asOfDate)
                          ->where('status', 'posted');
                    })
                    ->where('account_id', $account->id)
                    ->where('line_type', 'debit')
                    ->sum('amount');

                $credit = DB::table('journal_voucher_lines')
                    ->whereHas('voucher', function ($q) use ($companyId, $asOfDate) {
                        $q->where('company_id', $companyId)
                          ->whereDate('voucher_date', '<=', $asOfDate)
                          ->where('status', 'posted');
                    })
                    ->where('account_id', $account->id)
                    ->where('line_type', 'credit')
                    ->sum('amount');

                if ($debit > 0 || $credit > 0) {
                    $trialBalance[] = [
                        'account_code' => $account->code,
                        'account_name' => $account->name,
                        'debit' => $debit,
                        'credit' => $credit,
                    ];

                    $totalDebit += $debit;
                    $totalCredit += $credit;
                }
            }

            return [
                'as_of_date' => $asOfDate,
                'total_debit' => number_format($totalDebit, 2),
                'total_credit' => number_format($totalCredit, 2),
                'is_balanced' => abs($totalDebit - $totalCredit) < 0.01,
                'accounts' => $trialBalance,
            ];
        } catch (\Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }

    /**
     * Get sales summary
     */
    public function getSalesSummary(string $fromDate, string $toDate, int $companyId): array
    {
        try {
            $summary = DB::table('sales_orders')
                ->where('company_id', $companyId)
                ->whereDate('order_date', '>=', $fromDate)
                ->whereDate('order_date', '<=', $toDate)
                ->select(
                    DB::raw('COUNT(*) as order_count'),
                    DB::raw('SUM(total_amount) as total_amount'),
                    'status'
                )
                ->groupBy('status')
                ->get();

            return [
                'from_date' => $fromDate,
                'to_date' => $toDate,
                'period_days' => (new Carbon($toDate))->diffInDays(new Carbon($fromDate)),
                'total_orders' => $summary->sum('order_count'),
                'total_amount' => number_format($summary->sum('total_amount'), 2),
                'by_status' => $summary->toArray(),
            ];
        } catch (\Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }

    // Helper methods
    protected function getWarehouseNameById(int $id): string
    {
        return DB::table('warehouses')->where('id', $id)->value('name') ?? "Warehouse {$id}";
    }
}

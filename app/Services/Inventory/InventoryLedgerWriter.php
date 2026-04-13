<?php

namespace App\Services\Inventory;

use App\Models\GoodsReceiptNote;
use App\Models\GoodsReceiptNoteLine;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Writes rows to {@see \App\Models\InventoryTransaction} when inventory is recognised in GL.
 */
class InventoryLedgerWriter
{
    /**
     * @param  Collection<int, GoodsReceiptNote>  $grns
     */
    public static function recordPurchaseInvoicePosting(
        Collection $grns,
        int $postedTransactionId,
        int $userId,
        string $voucherDate,
        string $documentCurrency,
        \DateTimeInterface $movementAt
    ): void {
        if (! Schema::hasTable('inventory_transactions')) {
            return;
        }

        foreach ($grns as $grn) {
            $grn->loadMissing('lines');
            foreach ($grn->lines as $line) {
                /** @var GoodsReceiptNoteLine $line */
                $receiptQty = (float) $line->receipt_qty;
                $accepted = $line->accepted_qty !== null && $line->accepted_qty !== ''
                    ? (float) $line->accepted_qty
                    : $receiptQty;
                $accepted = min($accepted, $receiptQty);
                $unitCost = (float) $line->unit_cost;
                $lineForeign = round($accepted * $unitCost, 2);
                if ($lineForeign <= 0.000001) {
                    continue;
                }

                DB::table('inventory_transactions')->insert([
                    'comp_id' => (int) $grn->comp_id,
                    'location_id' => (int) $grn->location_id,
                    'source_type' => 'grn_purchase_invoice_post',
                    'goods_receipt_note_id' => (int) $grn->id,
                    'goods_receipt_note_line_id' => (int) $line->id,
                    'inventory_item_id' => (int) $line->inventory_item_id,
                    'quantity_delta' => $accepted,
                    'uom_id' => $line->uom_id ? (int) $line->uom_id : null,
                    'unit_cost' => $unitCost,
                    'line_value_foreign' => $lineForeign,
                    'document_currency_code' => mb_substr(mb_strtoupper(trim($documentCurrency)), 0, 8),
                    'posted_transaction_id' => $postedTransactionId,
                    'voucher_date' => $voucherDate,
                    'movement_at' => $movementAt,
                    'created_by' => $userId,
                    'created_at' => $movementAt,
                    'updated_at' => $movementAt,
                ]);
            }
        }
    }
}

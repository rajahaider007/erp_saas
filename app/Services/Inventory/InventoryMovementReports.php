<?php

namespace App\Services\Inventory;

use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\DB;

/**
 * Read-only queries for persisted inventory movement register (posted GRN purchase invoice lines).
 */
class InventoryMovementReports
{
    /**
     * @param  array<string, mixed>  $filters  date_from, date_to, search, sort_by, sort_order
     */
    public static function movementRegisterBaseQuery(int $compId, int $locationId, array $filters): Builder
    {
        $query = DB::table('inventory_transactions as m')
            ->join('goods_receipt_notes as g', 'g.id', '=', 'm.goods_receipt_note_id')
            ->join('inventory_items as i', 'i.id', '=', 'm.inventory_item_id')
            ->leftJoin('uom_masters as u', 'u.id', '=', 'm.uom_id')
            ->where('m.comp_id', $compId)
            ->where('m.location_id', $locationId)
            ->select([
                'm.id as movement_id',
                'm.voucher_date',
                'm.movement_at',
                'm.posted_transaction_id',
                'm.quantity_delta',
                'm.unit_cost',
                'm.line_value_foreign',
                'm.document_currency_code',
                'm.source_type',
                'm.goods_receipt_note_line_id',
                'g.grn_number',
                'i.item_code',
                'i.item_name_short as item_name',
                'u.uom_code',
            ]);

        if (! empty($filters['date_from'])) {
            $query->whereDate('m.voucher_date', '>=', $filters['date_from']);
        }
        if (! empty($filters['date_to'])) {
            $query->whereDate('m.voucher_date', '<=', $filters['date_to']);
        }

        $search = isset($filters['search']) ? trim((string) $filters['search']) : '';
        if ($search !== '') {
            $like = '%'.addcslashes($search, '%_\\').'%';
            $query->where(function ($q) use ($like, $search) {
                $q->where('g.grn_number', 'like', $like)
                    ->orWhere('i.item_code', 'like', $like)
                    ->orWhere('i.item_name_short', 'like', $like);
                if (ctype_digit($search)) {
                    $q->orWhere('m.posted_transaction_id', (int) $search);
                }
            });
        }

        $sortBy = $filters['sort_by'] ?? 'voucher_date';
        $dir = (($filters['sort_order'] ?? 'desc') === 'asc') ? 'asc' : 'desc';
        $col = match ($sortBy) {
            'grn_number' => 'g.grn_number',
            'item_code' => 'i.item_code',
            'quantity_delta' => 'm.quantity_delta',
            'posted_transaction_id' => 'm.posted_transaction_id',
            'line_value' => 'm.line_value_foreign',
            default => 'm.voucher_date',
        };
        $query->orderBy($col, $dir)->orderBy('m.id', 'desc');

        return $query;
    }
}

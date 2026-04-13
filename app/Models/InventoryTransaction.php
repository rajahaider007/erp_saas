<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InventoryTransaction extends Model
{
    protected $fillable = [
        'comp_id',
        'location_id',
        'source_type',
        'goods_receipt_note_id',
        'goods_receipt_note_line_id',
        'inventory_item_id',
        'quantity_delta',
        'uom_id',
        'unit_cost',
        'line_value_foreign',
        'document_currency_code',
        'posted_transaction_id',
        'voucher_date',
        'movement_at',
        'created_by',
    ];

    protected $casts = [
        'quantity_delta' => 'decimal:6',
        'unit_cost' => 'decimal:6',
        'line_value_foreign' => 'decimal:2',
        'voucher_date' => 'date',
        'movement_at' => 'datetime',
    ];

    public function goodsReceiptNote(): BelongsTo
    {
        return $this->belongsTo(GoodsReceiptNote::class);
    }

    public function inventoryItem(): BelongsTo
    {
        return $this->belongsTo(InventoryItem::class);
    }
}

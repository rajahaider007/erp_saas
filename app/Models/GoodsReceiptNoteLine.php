<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GoodsReceiptNoteLine extends Model
{
    protected $fillable = [
        'goods_receipt_note_id',
        'line_no',
        'purchase_order_line_id',
        'inventory_item_id',
        'item_description',
        'uom_id',
        'po_ordered_qty',
        'snapshot_previously_received_qty',
        'receipt_qty',
        'unit_cost',
        'accepted_qty',
        'rejected_qty',
        'rejection_reason',
        'qc_line_status',
        'lot_batch_no',
        'manufacturing_date',
        'expiry_date',
        'temperature_at_receipt',
        'put_away_location_id',
        'line_notes',
    ];

    protected $casts = [
        'po_ordered_qty' => 'decimal:6',
        'snapshot_previously_received_qty' => 'decimal:6',
        'receipt_qty' => 'decimal:6',
        'unit_cost' => 'decimal:6',
        'accepted_qty' => 'decimal:6',
        'rejected_qty' => 'decimal:6',
        'manufacturing_date' => 'date',
        'expiry_date' => 'date',
        'temperature_at_receipt' => 'decimal:4',
    ];

    public function goodsReceiptNote(): BelongsTo
    {
        return $this->belongsTo(GoodsReceiptNote::class);
    }

    public function purchaseOrderLine(): BelongsTo
    {
        return $this->belongsTo(PurchaseOrderLine::class);
    }

    public function inventoryItem(): BelongsTo
    {
        return $this->belongsTo(InventoryItem::class);
    }

    public function uom(): BelongsTo
    {
        return $this->belongsTo(UomMaster::class, 'uom_id');
    }

    public function putAwayLocation(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'put_away_location_id');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PurchaseRequisitionLine extends Model
{
    protected $fillable = [
        'purchase_requisition_id',
        'line_no',
        'inventory_item_id',
        'item_description',
        'uom_id',
        'quantity',
        'estimated_unit_price',
        'need_by_date',
        'line_notes',
    ];

    protected $casts = [
        'quantity' => 'decimal:6',
        'estimated_unit_price' => 'decimal:6',
        'need_by_date' => 'date',
    ];

    public function purchaseRequisition(): BelongsTo
    {
        return $this->belongsTo(PurchaseRequisition::class);
    }

    public function inventoryItem(): BelongsTo
    {
        return $this->belongsTo(InventoryItem::class);
    }

    public function uom(): BelongsTo
    {
        return $this->belongsTo(UomMaster::class, 'uom_id');
    }
}

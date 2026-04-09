<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PurchaseOrderLine extends Model
{
    protected $fillable = [
        'purchase_order_id',
        'line_no',
        'purchase_requisition_line_id',
        'inventory_item_id',
        'item_description',
        'uom_id',
        'ordered_qty',
        'unit_price',
        'line_discount_percent',
        'tax_category_id',
        'expected_line_delivery_date',
        'receive_location_id',
        'line_notes',
        'received_qty',
        'line_status',
    ];

    protected $casts = [
        'ordered_qty' => 'decimal:6',
        'unit_price' => 'decimal:6',
        'line_discount_percent' => 'decimal:4',
        'expected_line_delivery_date' => 'date',
        'received_qty' => 'decimal:6',
    ];

    public function purchaseOrder(): BelongsTo
    {
        return $this->belongsTo(PurchaseOrder::class);
    }

    public function purchaseRequisitionLine(): BelongsTo
    {
        return $this->belongsTo(PurchaseRequisitionLine::class);
    }

    public function inventoryItem(): BelongsTo
    {
        return $this->belongsTo(InventoryItem::class);
    }

    public function uom(): BelongsTo
    {
        return $this->belongsTo(UomMaster::class, 'uom_id');
    }

    public function taxCategory(): BelongsTo
    {
        return $this->belongsTo(TaxCategory::class);
    }

    public function receiveLocation(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'receive_location_id');
    }
}

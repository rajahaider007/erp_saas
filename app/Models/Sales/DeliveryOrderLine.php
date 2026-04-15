<?php

namespace App\Models\Sales;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DeliveryOrderLine extends Model
{
    protected $table = 'sales_delivery_order_lines';

    protected $fillable = [
        'delivery_order_id',
        'line_no',
        'product_id',
        'ordered_qty',
        'done_qty',
        'lot_serial_no',
        'expiry_date',
        'source_location',
        'notes',
    ];

    protected $casts = [
        'ordered_qty' => 'decimal:4',
        'done_qty' => 'decimal:4',
        'expiry_date' => 'date',
    ];

    public function deliveryOrder(): BelongsTo
    {
        return $this->belongsTo(DeliveryOrder::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(\App\Models\InventoryItem::class);
    }
}

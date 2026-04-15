<?php

namespace App\Models\Sales;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SalesOrderLine extends Model
{
    protected $table = 'sales_order_lines';

    protected $fillable = [
        'sales_order_id',
        'line_no',
        'product_id',
        'description',
        'quantity',
        'uom_id',
        'unit_price',
        'discount_percent',
        'discount_amount',
        'net_price',
        'tax_group_id',
        'tax_amount',
        'subtotal',
        'delivered_qty',
        'invoiced_qty',
        'remaining_qty',
        'margin_percent',
        'delivery_date',
        'notes',
        'status',
    ];

    protected $casts = [
        'quantity' => 'decimal:4',
        'unit_price' => 'decimal:2',
        'discount_percent' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'net_price' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'delivered_qty' => 'decimal:4',
        'invoiced_qty' => 'decimal:4',
        'remaining_qty' => 'decimal:4',
        'margin_percent' => 'decimal:2',
        'delivery_date' => 'date',
    ];

    public function salesOrder(): BelongsTo
    {
        return $this->belongsTo(SalesOrder::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(\App\Models\InventoryItem::class);
    }
}

<?php

namespace App\Models\Sales;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuotationLine extends Model
{
    protected $table = 'sales_quotation_lines';

    protected $fillable = [
        'quotation_id',
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
        'margin_percent',
        'delivery_date',
        'notes',
    ];

    protected $casts = [
        'quantity' => 'decimal:4',
        'unit_price' => 'decimal:2',
        'discount_percent' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'net_price' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'margin_percent' => 'decimal:2',
        'delivery_date' => 'date',
    ];

    public function quotation(): BelongsTo
    {
        return $this->belongsTo(Quotation::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(\App\Models\InventoryItem::class);
    }
}

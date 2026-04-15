<?php

namespace App\Models\Sales;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InvoiceLine extends Model
{
    protected $table = 'sales_invoice_lines';

    protected $fillable = [
        'invoice_id',
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
        'analytic_account_id',
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
    ];

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(\App\Models\InventoryItem::class);
    }
}

<?php

namespace App\Models\Sales;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Quotation extends Model
{
    protected $table = 'sales_quotations';

    protected $fillable = [
        'comp_id',
        'location_id',
        'quotation_no',
        'state',
        'customer_id',
        'currency_id',
        'exchange_rate',
        'pricelist_id',
        'salesperson_id',
        'quotation_date',
        'valid_until',
        'customer_reference',
        'payment_terms',
        'delivery_terms',
        'delivery_date',
        'shipping_address_id',
        'warehouse_id',
        'language_id',
        'notes_to_customer',
        'internal_notes',
        'tags',
        'source',
        'amount_untaxed',
        'amount_tax',
        'amount_total',
        'amount_total_base',
        'status',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'quotation_date' => 'date',
        'valid_until' => 'date',
        'delivery_date' => 'date',
        'exchange_rate' => 'decimal:6',
        'amount_untaxed' => 'decimal:2',
        'amount_tax' => 'decimal:2',
        'amount_total' => 'decimal:2',
        'amount_total_base' => 'decimal:2',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function lines(): HasMany
    {
        return $this->hasMany(QuotationLine::class)->orderBy('line_no');
    }

    public function currency(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Currency::class);
    }
}

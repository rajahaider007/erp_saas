<?php

namespace App\Models\Sales;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SalesOrder extends Model
{
    protected $table = 'sales_orders';

    protected $fillable = [
        'comp_id',
        'location_id',
        'so_number',
        'state',
        'customer_id',
        'quotation_id',
        'customer_po_no',
        'customer_po_date',
        'commitment_date',
        'priority',
        'project_id',
        'currency_id',
        'exchange_rate',
        'pricelist_id',
        'salesperson_id',
        'so_date',
        'payment_terms',
        'delivery_terms',
        'shipping_address_id',
        'warehouse_id',
        'language_id',
        'notes_to_customer',
        'internal_notes',
        'tags',
        'amount_untaxed',
        'amount_tax',
        'amount_total',
        'amount_total_base',
        'status',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'so_date' => 'date',
        'customer_po_date' => 'date',
        'commitment_date' => 'date',
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

    public function quotation(): BelongsTo
    {
        return $this->belongsTo(Quotation::class);
    }

    public function lines(): HasMany
    {
        return $this->hasMany(SalesOrderLine::class)->orderBy('line_no');
    }

    public function currency(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Currency::class);
    }

    public function deliveryOrders(): HasMany
    {
        return $this->hasMany(DeliveryOrder::class);
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }
}

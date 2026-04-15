<?php

namespace App\Models\Sales;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Invoice extends Model
{
    protected $table = 'sales_invoices';

    protected $fillable = [
        'comp_id',
        'location_id',
        'invoice_no',
        'state',
        'customer_id',
        'sales_order_id',
        'delivery_order_id',
        'customer_po_no',
        'invoice_date',
        'due_date',
        'source',
        'currency_id',
        'exchange_rate',
        'payment_terms',
        'bank_account_id',
        'fiscal_position_id',
        'analytic_account_id',
        'notes_to_customer',
        'internal_notes',
        'tags',
        'amount_untaxed',
        'amount_tax',
        'amount_total',
        'amount_total_base',
        'amount_paid',
        'outstanding_amount',
        'payment_status',
        'status',
        'posted_at',
        'posted_by',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'invoice_date' => 'date',
        'due_date' => 'date',
        'exchange_rate' => 'decimal:6',
        'amount_untaxed' => 'decimal:2',
        'amount_tax' => 'decimal:2',
        'amount_total' => 'decimal:2',
        'amount_total_base' => 'decimal:2',
        'amount_paid' => 'decimal:2',
        'outstanding_amount' => 'decimal:2',
        'posted_at' => 'datetime',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function salesOrder(): BelongsTo
    {
        return $this->belongsTo(SalesOrder::class);
    }

    public function deliveryOrder(): BelongsTo
    {
        return $this->belongsTo(DeliveryOrder::class);
    }

    public function lines(): HasMany
    {
        return $this->hasMany(InvoiceLine::class)->orderBy('line_no');
    }

    public function currency(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Currency::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }
}

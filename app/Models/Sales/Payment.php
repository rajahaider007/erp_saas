<?php

namespace App\Models\Sales;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Payment extends Model
{
    protected $table = 'sales_payments';

    protected $fillable = [
        'comp_id',
        'location_id',
        'payment_reference',
        'payment_date',
        'customer_id',
        'payment_method',
        'bank_reference',
        'cheque_no',
        'cheque_date',
        'amount_received',
        'payment_currency_id',
        'exchange_rate',
        'amount_in_base_currency',
        'bank_account_id',
        'customer_bank_ref',
        'is_advance',
        'notes',
        'status',
        'reconciled_at',
        'reconciled_by',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'payment_date' => 'date',
        'cheque_date' => 'date',
        'amount_received' => 'decimal:2',
        'exchange_rate' => 'decimal:6',
        'amount_in_base_currency' => 'decimal:2',
        'is_advance' => 'boolean',
        'reconciled_at' => 'datetime',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function currency(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Currency::class, 'payment_currency_id');
    }

    public function allocations(): HasMany
    {
        return $this->hasMany(PaymentAllocation::class);
    }
}

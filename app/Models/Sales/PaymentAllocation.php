<?php

namespace App\Models\Sales;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentAllocation extends Model
{
    protected $table = 'sales_payment_allocations';

    protected $fillable = [
        'payment_id',
        'invoice_id',
        'allocated_amount',
        'forex_gain_loss',
    ];

    protected $casts = [
        'allocated_amount' => 'decimal:2',
        'forex_gain_loss' => 'decimal:2',
    ];

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }
}

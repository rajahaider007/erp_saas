<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PurchaseRequisition extends Model
{
    protected $fillable = [
        'comp_id',
        'location_id',
        'pr_number',
        'pr_date',
        'required_by_date',
        'deliver_to_location_id',
        'delivery_address',
        'vendor_id',
        'currency_id',
        'fx_rate',
        'priority',
        'department_id',
        'requested_by',
        'justification',
        'notes',
        'status',
        'approved_at',
        'approved_by',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'pr_date' => 'date',
        'required_by_date' => 'date',
        'fx_rate' => 'decimal:6',
        'approved_at' => 'datetime',
    ];

    public function lines(): HasMany
    {
        return $this->hasMany(PurchaseRequisitionLine::class)->orderBy('line_no');
    }

    public function deliverToLocation(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'deliver_to_location_id');
    }

    public function currency(): BelongsTo
    {
        return $this->belongsTo(Currency::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(ChartOfAccount::class, 'vendor_id');
    }

    public function requestingLocation(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'location_id');
    }

    public function purchaseOrders(): HasMany
    {
        return $this->hasMany(PurchaseOrder::class);
    }
}

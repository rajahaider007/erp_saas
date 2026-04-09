<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PurchaseOrder extends Model
{
    protected $fillable = [
        'comp_id',
        'location_id',
        'po_number',
        'purchase_requisition_id',
        'vendor_id',
        'po_type',
        'is_blanket',
        'vendor_reference',
        'po_date',
        'expected_delivery_date',
        'ship_to_location_id',
        'delivery_address',
        'currency_id',
        'fx_rate',
        'incoterms',
        'incoterms_location',
        'payment_terms',
        'advance_payment_percent',
        'tax_inclusive',
        'header_discount_percent',
        'notes',
        'status',
        'approved_at',
        'approved_by',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'po_date' => 'date',
        'expected_delivery_date' => 'date',
        'fx_rate' => 'decimal:6',
        'is_blanket' => 'boolean',
        'tax_inclusive' => 'boolean',
        'advance_payment_percent' => 'decimal:4',
        'header_discount_percent' => 'decimal:4',
        'approved_at' => 'datetime',
    ];

    public function lines(): HasMany
    {
        return $this->hasMany(PurchaseOrderLine::class)->orderBy('line_no');
    }

    public function purchaseRequisition(): BelongsTo
    {
        return $this->belongsTo(PurchaseRequisition::class);
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(ChartOfAccount::class, 'vendor_id');
    }

    public function shipToLocation(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'ship_to_location_id');
    }

    public function currency(): BelongsTo
    {
        return $this->belongsTo(Currency::class);
    }

    public function orderingLocation(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'location_id');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GoodsReceiptNote extends Model
{
    protected $fillable = [
        'comp_id',
        'location_id',
        'grn_number',
        'purchase_order_id',
        'vendor_id',
        'grn_type',
        'receipt_date',
        'posting_date',
        'receive_location_id',
        'vehicle_number',
        'transporter_name',
        'driver_contact',
        'seal_number',
        'container_number',
        'bol_awb',
        'packing_list_ref',
        'vendor_delivery_note_no',
        'currency_id',
        'fx_rate',
        'overall_qc_status',
        'landed_cost_applies',
        'landed_cost_reference',
        'three_way_match_status',
        'notes',
        'status',
        'posted_transaction_id',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'receipt_date' => 'date',
        'posting_date' => 'date',
        'fx_rate' => 'decimal:6',
        'landed_cost_applies' => 'boolean',
    ];

    public function lines(): HasMany
    {
        return $this->hasMany(GoodsReceiptNoteLine::class)->orderBy('line_no');
    }

    public function purchaseOrder(): BelongsTo
    {
        return $this->belongsTo(PurchaseOrder::class);
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(ChartOfAccount::class, 'vendor_id');
    }

    public function receiveLocation(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'receive_location_id');
    }

    public function currency(): BelongsTo
    {
        return $this->belongsTo(Currency::class);
    }
}

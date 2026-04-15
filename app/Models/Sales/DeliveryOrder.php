<?php

namespace App\Models\Sales;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DeliveryOrder extends Model
{
    protected $table = 'sales_delivery_orders';

    protected $fillable = [
        'comp_id',
        'location_id',
        'delivery_no',
        'sales_order_id',
        'customer_id',
        'delivery_date',
        'actual_ship_date',
        'delivery_method',
        'carrier_id',
        'tracking_number',
        'shipping_address_id',
        'warehouse_id',
        'picker_id',
        'packer_id',
        'weight',
        'volume',
        'number_of_packages',
        'special_instructions',
        'proof_of_delivery',
        'status',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'delivery_date' => 'date',
        'actual_ship_date' => 'date',
        'weight' => 'decimal:2',
        'volume' => 'decimal:2',
        'number_of_packages' => 'integer',
    ];

    public function salesOrder(): BelongsTo
    {
        return $this->belongsTo(SalesOrder::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function lines(): HasMany
    {
        return $this->hasMany(DeliveryOrderLine::class)->orderBy('line_no');
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class InventoryItem extends Model
{
    use SoftDeletes;

    protected $table = 'inventory_items';

    protected $fillable = [
        'comp_id',
        'location_id',
        'item_code',
        'item_name_short',
        'item_name_long',
        'item_status',
        'item_type',
        'item_class_id',
        'item_category_id',
        'item_group_id',
        'brand',
        'item_image_path',
        'tracking_mode',
        'stock_uom_id',
        'purchase_uom_id',
        'sales_uom_id',
        'costing_method',
        'standard_cost',
        'last_purchase_price',
        'minimum_order_qty',
        'reorder_point',
        'safety_stock',
        'maximum_stock_level',
        'lead_time_days',
        'default_vendor_id',
        'expiry_tracking',
        'shelf_life_days',
        'expiry_basis',
        'near_expiry_alert_days',
        'storage_temperature_class',
        'hazardous_material',
        'gross_weight_kg',
        'net_weight_kg',
        'volume_cbm',
        'dimensions',
        'tax_category_id',
        'hsn_code',
        'hs_tariff_code',
        'country_of_origin_id',
        'barcode_gtin',
        'inventory_gl_account_id',
        'cogs_gl_account_id',
        'writeoff_gl_account_id',
        'price_variance_gl_account_id',
        'abc_classification',
        'slow_moving_threshold_days',
        'is_active',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'expiry_tracking' => 'boolean',
        'hazardous_material' => 'boolean',
        'standard_cost' => 'decimal:2',
        'last_purchase_price' => 'decimal:2',
        'minimum_order_qty' => 'decimal:4',
        'reorder_point' => 'decimal:4',
        'safety_stock' => 'decimal:4',
        'maximum_stock_level' => 'decimal:4',
        'gross_weight_kg' => 'decimal:3',
        'net_weight_kg' => 'decimal:3',
        'volume_cbm' => 'decimal:3',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Scopes
    public function scopeByCompanyAndLocation($query, $compId, $locationId)
    {
        return $query->where('comp_id', $compId)
                     ->where('location_id', $locationId);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // Relationships
    public function company()
    {
        return $this->belongsTo(Company::class, 'comp_id');
    }

    public function location()
    {
        return $this->belongsTo(Location::class, 'location_id');
    }

    public function itemClass()
    {
        return $this->belongsTo(InventoryItemClass::class, 'item_class_id');
    }

    public function itemCategory()
    {
        return $this->belongsTo(InventoryItemCategory::class, 'item_category_id');
    }

    public function itemGroup()
    {
        return $this->belongsTo(InventoryItemGroup::class, 'item_group_id');
    }

    public function uomStock()
    {
        return $this->belongsTo(UomMaster::class, 'stock_uom_id');
    }

    public function uomPurchase()
    {
        return $this->belongsTo(UomMaster::class, 'purchase_uom_id');
    }

    public function uomSales()
    {
        return $this->belongsTo(UomMaster::class, 'sales_uom_id');
    }

    public function taxCategory()
    {
        return $this->belongsTo(TaxCategory::class, 'tax_category_id');
    }

    public function countryOfOrigin()
    {
        return $this->belongsTo(Country::class, 'country_of_origin_id');
    }

    public function defaultVendor()
    {
        return $this->belongsTo(Vendor::class, 'default_vendor_id');
    }

    public function inventoryGlAccount()
    {
        return $this->belongsTo(ChartOfAccount::class, 'inventory_gl_account_id');
    }

    public function cogsGlAccount()
    {
        return $this->belongsTo(ChartOfAccount::class, 'cogs_gl_account_id');
    }

    public function writeoffGlAccount()
    {
        return $this->belongsTo(ChartOfAccount::class, 'writeoff_gl_account_id');
    }

    public function priceVarianceGlAccount()
    {
        return $this->belongsTo(ChartOfAccount::class, 'price_variance_gl_account_id');
    }

    // Audit trail
    public function createdByUser()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedByUser()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    // Accessors
    public function getStatusLabelAttribute()
    {
        return match ($this->item_status) {
            'active' => 'Active',
            'inactive' => 'Inactive',
            'discontinued' => 'Discontinued',
            'blocked' => 'Blocked',
            default => 'Unknown',
        };
    }

    public function getTypeLabelAttribute()
    {
        return match ($this->item_type) {
            'raw_material' => 'Raw Material',
            'finished_good' => 'Finished Good',
            'trading' => 'Trading',
            'consumable' => 'Consumable',
            'service' => 'Service (Non-Stock)',
            default => 'Unknown',
        };
    }

    public function getCostingMethodLabelAttribute()
    {
        return match ($this->costing_method) {
            'fifo' => 'FIFO',
            'weighted_avg' => 'Weighted Average',
            'standard_cost' => 'Standard Cost',
            'lifo' => 'LIFO',
            default => 'Unknown',
        };
    }

    public function getTrackingModeLabelAttribute()
    {
        return match ($this->tracking_mode) {
            'none' => 'None',
            'lot' => 'Lot / Batch',
            'serial' => 'Serial Number',
            default => 'Unknown',
        };
    }

    public function getAbcClassificationLabelAttribute()
    {
        return match ($this->abc_classification) {
            'a' => 'A (High Value)',
            'b' => 'B (Medium Value)',
            'c' => 'C (Low Value)',
            default => 'Not Classified',
        };
    }
}

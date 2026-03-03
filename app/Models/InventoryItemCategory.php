<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class InventoryItemCategory extends Model
{
    use SoftDeletes;

    protected $table = 'inventory_item_categories';

    protected $fillable = [
        'comp_id',
        'location_id',
        'category_code',
        'category_name',
        'inventory_type',
        'valuation_method',
        'description',
        'is_active',
    ];

    protected $casts = [
        'comp_id' => 'integer',
        'location_id' => 'integer',
        'is_active' => 'boolean',
    ];

    public static function inventoryTypeOptions(): array
    {
        return [
            ['value' => 'raw_material', 'label' => 'Raw Material'],
            ['value' => 'work_in_progress', 'label' => 'Work in Progress'],
            ['value' => 'finished_goods', 'label' => 'Finished Goods'],
            ['value' => 'trading_goods', 'label' => 'Trading Goods'],
            ['value' => 'consumables', 'label' => 'Consumables'],
            ['value' => 'spare_parts', 'label' => 'Spare Parts'],
        ];
    }

    public static function valuationMethodOptions(): array
    {
        return [
            ['value' => 'fifo', 'label' => 'FIFO'],
            ['value' => 'weighted_average', 'label' => 'Weighted Average'],
            ['value' => 'standard_cost', 'label' => 'Standard Cost'],
        ];
    }

    public function classes()
    {
        return $this->belongsToMany(
            InventoryItemClass::class,
            'inventory_category_class',
            'category_id',
            'class_id'
        )->withTimestamps();
    }

    public function scopeByCompanyAndLocation($query, $compId, $locationId)
    {
        return $query->where('comp_id', $compId)->where('location_id', $locationId);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class InventoryItemClass extends Model
{
    use SoftDeletes;

    protected $table = 'inventory_item_classes';

    protected $fillable = [
        'comp_id',
        'location_id',
        'class_code',
        'class_name',
        'tracking_type',
        'abc_classification',
        'description',
        'is_active',
    ];

    protected $casts = [
        'comp_id' => 'integer',
        'location_id' => 'integer',
        'is_active' => 'boolean',
    ];

    public static function trackingTypeOptions(): array
    {
        return [
            ['value' => 'none', 'label' => 'No Tracking'],
            ['value' => 'batch', 'label' => 'Batch / Lot Tracking'],
            ['value' => 'serial', 'label' => 'Serial Tracking'],
        ];
    }

    public static function abcClassificationOptions(): array
    {
        return [
            ['value' => 'A', 'label' => 'A - High Value / Tight Control'],
            ['value' => 'B', 'label' => 'B - Medium Value'],
            ['value' => 'C', 'label' => 'C - Standard Control'],
        ];
    }

    public function categories()
    {
        return $this->belongsToMany(
            InventoryItemCategory::class,
            'inventory_category_class',
            'class_id',
            'category_id'
        )->withTimestamps();
    }

    public function scopeByCompanyAndLocation($query, $compId, $locationId)
    {
        return $query->where('comp_id', $compId)->where('location_id', $locationId);
    }
}

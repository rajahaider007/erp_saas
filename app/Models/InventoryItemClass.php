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
        'description',
        'is_active',
    ];

    protected $casts = [
        'comp_id' => 'integer',
        'location_id' => 'integer',
        'is_active' => 'boolean',
    ];

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

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}

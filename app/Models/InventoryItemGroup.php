<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class InventoryItemGroup extends Model
{
    use SoftDeletes;

    protected $table = 'inventory_item_groups';

    protected $fillable = [
        'comp_id',
        'location_id',
        'group_code',
        'group_name',
        'description',
        'is_active',
    ];

    protected $casts = [
        'comp_id' => 'integer',
        'location_id' => 'integer',
        'is_active' => 'boolean',
    ];

    public function scopeByCompanyAndLocation($query, $compId, $locationId)
    {
        return $query->where('comp_id', $compId)->where('location_id', $locationId);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}

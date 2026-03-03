<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class InventoryZoneBin extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'inventory_zone_bins';

    protected $fillable = [
        'company_id',
        'warehouse_id',
        'zone_code',
        'zone_name',
        'aisle',
        'bin_code',
        'bin_capacity',
        'temperature_class',
        'is_active',
    ];

    protected $casts = [
        'bin_capacity' => 'decimal:3',
        'is_active' => 'boolean',
    ];

    public function scopeByCompany($query, $companyId)
    {
        return $query->where('company_id', $companyId);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}

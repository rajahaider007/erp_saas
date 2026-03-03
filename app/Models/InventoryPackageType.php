<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class InventoryPackageType extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'inventory_package_types';

    protected $fillable = [
        'company_id',
        'package_code',
        'package_name',
        'dimensions',
        'weight_capacity',
        'volume_capacity',
        'nesting_rule',
        'is_active',
    ];

    protected $casts = [
        'weight_capacity' => 'decimal:3',
        'volume_capacity' => 'decimal:3',
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

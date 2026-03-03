<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class InventoryTemperatureClass extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'inventory_temperature_classes';

    protected $fillable = [
        'company_id',
        'class_code',
        'class_name',
        'temperature_range',
        'storage_requirements',
        'monitoring_frequency',
        'is_active',
    ];

    protected $casts = [
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

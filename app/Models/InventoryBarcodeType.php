<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class InventoryBarcodeType extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'inventory_barcode_types';

    protected $fillable = [
        'company_id',
        'barcode_type',
        'format_pattern',
        'length',
        'validation_rule',
        'is_active',
    ];

    protected $casts = [
        'length' => 'integer',
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

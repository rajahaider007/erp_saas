<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class InventoryTransporter extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'inventory_transporters';

    protected $fillable = [
        'company_id',
        'transporter_code',
        'transporter_name',
        'contact_details',
        'vehicle_types',
        'service_area',
        'rating',
        'is_active',
    ];

    protected $casts = [
        'rating' => 'decimal:2',
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

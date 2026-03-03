<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class InventoryCustomer extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'inventory_customers';

    protected $fillable = [
        'company_id',
        'customer_code',
        'customer_name',
        'contact_details',
        'credit_limit',
        'payment_terms',
        'tax_registration',
        'country_id',
        'currency_id',
        'is_active',
    ];

    protected $casts = [
        'credit_limit' => 'decimal:2',
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

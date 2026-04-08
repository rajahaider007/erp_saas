<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class InventoryCustomer extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'inventory_customers';

    protected $appends = [
        'gl_account_code',
    ];

    protected $fillable = [
        'company_id',
        'chart_of_account_id',
        'customer_code',
        'customer_name',
        'short_code',
        'contact_details',
        'credit_limit',
        'payment_terms',
        'tax_registration',
        'country_id',
        'country_label',
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

    public function chartOfAccount(): BelongsTo
    {
        return $this->belongsTo(ChartOfAccount::class, 'chart_of_account_id');
    }

    public function currency(): BelongsTo
    {
        return $this->belongsTo(Currency::class, 'currency_id');
    }

    public function getGlAccountCodeAttribute(): ?string
    {
        return $this->chartOfAccount?->account_code;
    }
}

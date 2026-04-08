<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Vendor extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'vendors';

    protected $fillable = [
        'company_id',
        'chart_of_account_id',
        'vendor_code',
        'vendor_name',
        'short_code',
        'contact_person',
        'email',
        'phone',
        'address',
        'payment_terms',
        'city',
        'state',
        'postal_code',
        'country_id',
        'country_label',
        'currency_id',
        'tax_id',
        'tax_registration_number',
        'bank_details',
        'credit_limit',
        'vendor_type',
        'notes',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'credit_limit' => 'decimal:2',
    ];

    protected $appends = [
        'gl_account_code',
    ];

    // Relationships
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function chartOfAccount(): BelongsTo
    {
        return $this->belongsTo(ChartOfAccount::class, 'chart_of_account_id');
    }

    public function getGlAccountCodeAttribute(): ?string
    {
        return $this->chartOfAccount?->account_code;
    }

    public function country(): BelongsTo
    {
        return $this->belongsTo(Country::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByCompany($query, $companyId)
    {
        return $query->where('company_id', $companyId);
    }
}

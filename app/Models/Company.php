<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Company extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'company_name',
        'company_code',
        'legal_name',
        'trading_name',
        'registration_number',
        'tax_id',
        'vat_number',
        'incorporation_date',
        'company_type',
        'email',
        'phone',
        'fax',
        'website',
        'address_line_1',
        'address_line_2',
        'city',
        'state_province',
        'postal_code',
        'country',
        'timezone',
        'industry',
        'business_description',
        'employee_count',
        'annual_revenue',
        'currency',
        'fiscal_year_start',
        'license_number',
        'license_expiry',
        'compliance_certifications',
        'legal_notes',
        'bank_name',
        'bank_account_number',
        'bank_routing_number',
        'swift_code',
        'iban',
        'logo',
        'brand_color_primary',
        'brand_color_secondary',
        'status',
        'subscription_status',
        'subscription_expiry',
        'settings',
        'features',
        'created_by',
        'updated_by'
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'incorporation_date' => 'date',
        'license_expiry' => 'date',
        'subscription_expiry' => 'date',
        'compliance_certifications' => 'array',
        'settings' => 'array',
        'features' => 'array',
        'annual_revenue' => 'decimal:2',
        'status' => 'boolean',
        'employee_count' => 'integer'
    ];

    /**
     * The attributes that should be hidden for serialization.
     */
    protected $hidden = [
        'bank_account_number',
        'bank_routing_number',
        'swift_code',
        'iban'
    ];

    /**
     * Get the user who created this company.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who last updated this company.
     */
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Scope a query to only include active companies.
     */
    public function scopeActive($query)
    {
        return $query->where('status', true);
    }

    /**
     * Scope a query to only include companies with active subscriptions.
     */
    public function scopeActiveSubscription($query)
    {
        return $query->whereIn('subscription_status', ['active', 'trial']);
    }

    /**
     * Get the company's full address.
     */
    public function getFullAddressAttribute(): string
    {
        $address = $this->address_line_1;
        
        if ($this->address_line_2) {
            $address .= ', ' . $this->address_line_2;
        }
        
        $address .= ', ' . $this->city;
        
        if ($this->state_province) {
            $address .= ', ' . $this->state_province;
        }
        
        if ($this->postal_code) {
            $address .= ' ' . $this->postal_code;
        }
        
        $address .= ', ' . $this->country;
        
        return $address;
    }

    /**
     * Get the company's display name.
     */
    public function getDisplayNameAttribute(): string
    {
        return $this->trading_name ?: $this->legal_name ?: $this->company_name;
    }

    /**
     * Check if company has active subscription.
     */
    public function hasActiveSubscription(): bool
    {
        if ($this->subscription_status === 'active') {
            return true;
        }
        
        if ($this->subscription_status === 'trial' && $this->subscription_expiry) {
            return $this->subscription_expiry->isFuture();
        }
        
        return false;
    }
}

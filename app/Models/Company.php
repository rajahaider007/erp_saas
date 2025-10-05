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
        'license_start_date',
        'license_end_date',
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
        'package_id',
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
        'license_start_date' => 'date',
        'license_end_date' => 'date',
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
        return $query->where('status', true);
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
     * Get the package associated with the company.
     */
    public function package()
    {
        return $this->belongsTo(Package::class);
    }


    /**
     * Check if company has valid license.
     */
    public function hasValidLicense(): bool
    {
        if (!$this->license_start_date || !$this->license_end_date) {
            return false;
        }
        
        $now = now();
        return $now->between($this->license_start_date, $this->license_end_date);
    }

    /**
     * Check if company license is expired.
     */
    public function isLicenseExpired(): bool
    {
        return $this->license_end_date && $this->license_end_date->isPast();
    }

    /**
     * Get license status.
     */
    public function getLicenseStatus(): string
    {
        if (!$this->license_start_date || !$this->license_end_date) {
            return 'not_configured';
        }
        
        if ($this->isLicenseExpired()) {
            return 'expired';
        }
        
        if ($this->hasValidLicense()) {
            return 'active';
        }
        
        return 'not_started';
    }

    /**
     * Check if a user has access to a specific menu/feature.
     * This considers both the user's rights and the company's package features.
     */
    public function userHasAccessToFeature($userId, $menuId, $permission = 'can_view'): bool
    {
        // First check if the company has a valid license
        if (!$this->hasValidLicense()) {
            return false;
        }

        // Get user
        $user = \App\Models\User::with(['company', 'rights'])->find($userId);
        if (!$user || $user->comp_id !== $this->id) {
            return false;
        }

        // Check if the menu is enabled in the company's package
        $packageHasMenu = false;
        if ($this->package) {
            $packageHasMenu = $this->package->features()
                ->where('menu_id', $menuId)
                ->where('is_enabled', true)
                ->exists();
        }

        if (!$packageHasMenu) {
            return false;
        }

        // Check if the user has the specific permission for this menu
        return $user->hasPermission($menuId, $permission);
    }

    /**
     * Get all accessible menus for a user based on their rights and company package.
     */
    public function getAccessibleMenusForUser($userId): \Illuminate\Database\Eloquent\Collection
    {
        $user = \App\Models\User::with('rights')->find($userId);
        if (!$user || $user->comp_id !== $this->id || !$this->hasValidLicense()) {
            return collect();
        }

        // Get package features
        $packageMenuIds = [];
        if ($this->package) {
            $packageMenuIds = $this->package->features()
                ->where('is_enabled', true)
                ->pluck('menu_id')
                ->toArray();
        }

        // Get user's accessible menus (where they have view permission)
        $userMenuIds = $user->rights()
            ->where('can_view', true)
            ->pluck('menu_id')
            ->toArray();

        // Get intersection of package and user features
        $accessibleMenuIds = array_intersect($packageMenuIds, $userMenuIds);

        return \App\Models\Menu::whereIn('id', $accessibleMenuIds)
            ->where('status', true)
            ->with(['section.module'])
            ->get();
    }

    /**
     * Get available menus for user rights configuration based on company package
     */
    public function getAvailableMenusForRights(): \Illuminate\Database\Eloquent\Collection
    {
        if (!$this->package) {
            return collect();
        }

        $packageMenuIds = $this->package->features()
            ->where('is_enabled', true)
            ->pluck('menu_id')
            ->toArray();

        return \App\Models\Menu::whereIn('id', $packageMenuIds)
            ->where('status', true)
            ->with(['section.module'])
            ->orderBy('menu_name')
            ->get();
    }
}

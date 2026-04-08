<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class InventoryTransporter extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'inventory_transporters';

    protected $appends = [
        'gl_account_code',
    ];

    protected $fillable = [
        'company_id',
        'chart_of_account_id',
        'transporter_code',
        'transporter_name',
        'short_code',
        'contact_details',
        'vehicle_types',
        'service_area',
        'country_label',
        'currency_id',
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

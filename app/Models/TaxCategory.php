<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class TaxCategory extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'tax_categories';
    protected $fillable = [
        'company_id',
        'tax_code',
        'tax_name',
        'tax_type',
        'tax_rate',
        'gl_account_id',
        'description',
        'applicable_for',
        'country_region',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'tax_rate' => 'decimal:2',
    ];

    // Relationships
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function glAccount(): BelongsTo
    {
        return $this->belongsTo(ChartOfAccount::class, 'gl_account_id');
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

    public function scopeByType($query, $taxType)
    {
        return $query->where('tax_type', $taxType);
    }
}

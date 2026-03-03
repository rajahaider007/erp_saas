<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class UomMaster extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'uom_masters';
    protected $fillable = [
        'company_id',
        'uom_code',
        'uom_name',
        'uom_type',
        'symbol',
        'is_base_uom',
        'decimal_precision',
        'conversion_factor',
        'base_uom_id',
        'is_active',
        'display_order'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_base_uom' => 'boolean',
        'decimal_precision' => 'integer',
        'conversion_factor' => 'decimal:6',
    ];

    // Relationships
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function baseUom(): BelongsTo
    {
        return $this->belongsTo(UomMaster::class, 'base_uom_id');
    }

    public function derivedUoms(): HasMany
    {
        return $this->hasMany(UomMaster::class, 'base_uom_id');
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

    public function scopeByType($query, $uomType)
    {
        return $query->where('uom_type', $uomType);
    }
}

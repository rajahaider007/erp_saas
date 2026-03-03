<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class UomConversion extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'uom_conversions';

    protected $fillable = [
        'company_id',
        'from_uom_id',
        'to_uom_id',
        'conversion_factor',
        'conversion_direction',
        'effective_date',
        'is_item_specific',
        'is_active',
    ];

    protected $casts = [
        'conversion_factor' => 'decimal:6',
        'effective_date' => 'date',
        'is_item_specific' => 'boolean',
        'is_active' => 'boolean',
    ];

    // Relationships
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function fromUom(): BelongsTo
    {
        return $this->belongsTo(UomMaster::class, 'from_uom_id');
    }

    public function toUom(): BelongsTo
    {
        return $this->belongsTo(UomMaster::class, 'to_uom_id');
    }

    // Scopes
    public function scopeByCompany($query, $companyId)
    {
        return $query->where('company_id', $companyId);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}

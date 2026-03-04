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
        'item_id',
        'conversion_factor',
        'conversion_direction',
        'rounding_rule',
        'effective_from',
        'effective_to',
        'conversion_type',
        'notes',
        'is_item_specific',
        'is_active',
        'created_by',
        'updated_by'
    ];

    protected $casts = [
        'conversion_factor' => 'decimal:6',
        'effective_from' => 'date',
        'effective_to' => 'date',
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

    public function item(): BelongsTo
    {
        return $this->belongsTo(InventoryItem::class, 'item_id');
    }

    public function createdByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
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

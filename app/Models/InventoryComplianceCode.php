<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class InventoryComplianceCode extends Model
{
    use SoftDeletes;

    protected $table = 'inventory_compliance_codes';

    public const KIND_HSN_SAC = 'hsn_sac';

    public const KIND_HS_TARIFF = 'hs_tariff';

    protected $fillable = [
        'company_id',
        'code_kind',
        'code',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function scopeByCompany($query, int $companyId)
    {
        return $query->where('company_id', $companyId);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOfKind($query, string $kind)
    {
        return $query->where('code_kind', $kind);
    }
}

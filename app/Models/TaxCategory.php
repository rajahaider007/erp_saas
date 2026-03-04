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
        'tax_calculation_method',
        'is_compound_tax',
        'compound_base_tax_category_id',
        'tax_category_group',
        'description',
        'applicable_for',
        'input_tax_gl_account_id',
        'output_tax_gl_account_id',
        'tax_payable_gl_account_id',
        'country_id',
        'hsn_sac_required',
        'e_invoice_required',
        'reverse_charge_applicable',
        'reverse_charge_gl_account_id',
        'input_tax_claimable',
        'exemption_certificate_required',
        'effective_from_date',
        'effective_to_date',
        'is_active',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_compound_tax' => 'boolean',
        'hsn_sac_required' => 'boolean',
        'e_invoice_required' => 'boolean',
        'reverse_charge_applicable' => 'boolean',
        'input_tax_claimable' => 'boolean',
        'exemption_certificate_required' => 'boolean',
        'effective_from_date' => 'date',
        'effective_to_date' => 'date',
        'tax_rate' => 'decimal:4',
    ];

    // Relationships
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function compoundBaseTaxCategory(): BelongsTo
    {
        return $this->belongsTo(TaxCategory::class, 'compound_base_tax_category_id');
    }

    public function inputTaxGlAccount(): BelongsTo
    {
        return $this->belongsTo(ChartOfAccount::class, 'input_tax_gl_account_id');
    }

    public function outputTaxGlAccount(): BelongsTo
    {
        return $this->belongsTo(ChartOfAccount::class, 'output_tax_gl_account_id');
    }

    public function taxPayableGlAccount(): BelongsTo
    {
        return $this->belongsTo(ChartOfAccount::class, 'tax_payable_gl_account_id');
    }

    public function reverseChargeGlAccount(): BelongsTo
    {
        return $this->belongsTo(ChartOfAccount::class, 'reverse_charge_gl_account_id');
    }

    public function country(): BelongsTo
    {
        return $this->belongsTo(Country::class, 'country_id');
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

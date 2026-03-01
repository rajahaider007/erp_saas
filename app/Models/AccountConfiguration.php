<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AccountConfiguration extends Model
{
    use SoftDeletes;

    protected $table = 'account_configurations';

    protected $fillable = [
        'comp_id',
        'location_id',
        'account_id',
        'account_code',
        'account_name',
        'account_level',
        'config_type',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'account_level' => 'integer',
        'comp_id' => 'integer',
        'location_id' => 'integer',
        'account_id' => 'integer',
    ];

    // Relationships
    public function company()
    {
        return $this->belongsTo(Company::class, 'comp_id');
    }

    public function location()
    {
        return $this->belongsTo(Location::class, 'location_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByCompanyAndLocation($query, $compId, $locationId)
    {
        return $query->where('comp_id', $compId)->where('location_id', $locationId);
    }

    public function scopeByConfigType($query, $configType)
    {
        return $query->where('config_type', $configType);
    }

    public function scopeByLevel($query, $level)
    {
        return $query->where('account_level', $level);
    }

    // Config types available
    public static function getConfigTypes()
    {
        return [
            // Assets
            'cash' => 'Cash',
            'bank' => 'Bank Account',
            'petty_cash' => 'Petty Cash',
            'accounts_receivable' => 'Accounts Receivable',
            'inventory' => 'Inventory',
            'fixed_asset' => 'Fixed Asset',
            'intangible_asset' => 'Intangible Asset',
            'investment' => 'Investment',
            'prepaid_expense' => 'Prepaid Expense',
            'input_tax' => 'Input Tax (VAT/GST Receivable)',
            
            // Liabilities
            'accounts_payable' => 'Accounts Payable',
            'accrued_expense' => 'Accrued Expense',
            'short_term_loan' => 'Short Term Loan',
            'long_term_loan' => 'Long Term Loan',
            'tax_payable' => 'Tax Payable',
            'output_tax' => 'Output Tax (VAT/GST Payable)',
            
            // Equity
            'capital' => 'Capital/Equity',
            'drawings' => 'Drawings',
            'retained_earnings' => 'Retained Earnings',
            
            // Income
            'sales' => 'Sales Revenue',
            'service_income' => 'Service Income',
            'other_income' => 'Other Income',
            
            // Expense
            'purchase' => 'Purchase',
            'cost_of_goods_sold' => 'Cost of Goods Sold (COGS)',
            'salary_expense' => 'Salary/Wage Expense',
            'rent_expense' => 'Rent Expense',
            'utility_expense' => 'Utility Expense',
            'depreciation_expense' => 'Depreciation Expense',
            'interest_expense' => 'Interest Expense',
            
            // Other
            'other' => 'Other'
        ];
    }
}

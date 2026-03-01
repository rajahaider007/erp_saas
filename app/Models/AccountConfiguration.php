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
            'short_term_investment' => 'Short Term Investment',
            'long_term_investment' => 'Long Term Investment',
            'prepaid_expense' => 'Prepaid Expense',
            'input_tax' => 'Input Tax (VAT/GST Receivable)',
            'security_deposit' => 'Security Deposit',
            'employee_advance' => 'Employee Advance',
            'deferred_tax_asset' => 'Deferred Tax Asset',
            'other_asset' => 'Other Asset',
            
            // Liabilities
            'accounts_payable' => 'Accounts Payable',
            'accrued_expense' => 'Accrued Expense',
            'short_term_loan' => 'Short Term Loan',
            'long_term_loan' => 'Long Term Loan',
            'tax_payable' => 'Tax Payable',
            'unearned_revenue' => 'Unearned Revenue',
            'other_liability' => 'Other Liability',
            
            // Equity
            'capital' => 'Capital/Equity',
            'drawings' => 'Drawings',
            'retained_earnings' => 'Retained Earnings',
            
            // Income
            'sales' => 'Sales Revenue',
            'service_income' => 'Service Income',
            'interest_income' => 'Interest Income',
            'other_income' => 'Other Income',
            
            // Expense
            'purchase' => 'Purchase',
            'cost_of_goods_sold' => 'Cost of Goods Sold (COGS)',
            'salary_expense' => 'Salary/Wage Expense',
            'rent_expense' => 'Rent Expense',
            'utility_expense' => 'Utility Expense',
            'depreciation_expense' => 'Depreciation Expense',
            'amortization_expense' => 'Amortization Expense',
            'interest_expense' => 'Interest Expense',
            'insurance_expense' => 'Insurance Expense',
            'maintenance_expense' => 'Maintenance & Repair Expense',
            'marketing_expense' => 'Marketing & Advertising Expense',
            'travel_expense' => 'Travel Expense',
            'office_expense' => 'Office Expense',
            'other_expense' => 'Other Expense',

            // Legacy aliases (kept for backward compatibility)
            'output_tax' => 'Output Tax (VAT/GST Payable)',
            'investment' => 'Investment',
            'other' => 'Other'
        ];
    }
}

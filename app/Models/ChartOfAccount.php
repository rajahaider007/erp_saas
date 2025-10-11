<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChartOfAccount extends Model
{
    use HasFactory;

    protected $table = 'chart_of_accounts';

    protected $fillable = [
        'account_code',
        'account_name',
        'account_type',
        'parent_account_id',
        'account_level',
        'currency',
        'status',
        'short_code',
        'comp_id',
        'location_id',
    ];

    protected $casts = [
        'account_level' => 'integer',
        'parent_account_id' => 'integer',
        'comp_id' => 'integer',
        'location_id' => 'integer',
    ];

    /**
     * Get the parent account
     */
    public function parentAccount()
    {
        return $this->belongsTo(ChartOfAccount::class, 'parent_account_id');
    }

    /**
     * Get child accounts
     */
    public function childAccounts()
    {
        return $this->hasMany(ChartOfAccount::class, 'parent_account_id');
    }

    /**
     * Get the company
     */
    public function company()
    {
        return $this->belongsTo(Company::class, 'comp_id');
    }

    /**
     * Get the location
     */
    public function location()
    {
        return $this->belongsTo(Location::class, 'location_id');
    }

    /**
     * Scope for active accounts
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'Active');
    }

    /**
     * Scope for specific account level
     */
    public function scopeLevel($query, $level)
    {
        return $query->where('account_level', $level);
    }

    /**
     * Scope for accounts by type
     */
    public function scopeType($query, $type)
    {
        return $query->where('account_type', $type);
    }

    /**
     * Scope for accounts by company
     */
    public function scopeByCompany($query, $companyId)
    {
        return $query->where('comp_id', $companyId);
    }

    /**
     * Scope for accounts by location
     */
    public function scopeByLocation($query, $locationId)
    {
        return $query->where('location_id', $locationId);
    }

    /**
     * Get accounts for a specific company and location (Level 2 and Level 3 only)
     */
    public static function getAccountsForCompanyLocation($companyId, $locationId)
    {
        return static::where('comp_id', $companyId)
                    ->where('location_id', $locationId)
                    ->whereIn('account_level', [2, 3])
                    ->active()
                    ->orderBy('account_level')
                    ->orderBy('account_name');
    }

    /**
     * Get Level 2 accounts (sub-accounts)
     */
    public static function getLevel2Accounts($companyId, $locationId)
    {
        return static::where('comp_id', $companyId)
                    ->where('location_id', $locationId)
                    ->where('account_level', 2)
                    ->active()
                    ->orderBy('account_name');
    }

    /**
     * Get Level 3 accounts (detail accounts) for a specific Level 2 account
     */
    public static function getLevel3AccountsForParent($parentAccountId, $companyId, $locationId)
    {
        return static::where('parent_account_id', $parentAccountId)
                    ->where('comp_id', $companyId)
                    ->where('location_id', $locationId)
                    ->where('account_level', 3)
                    ->active()
                    ->orderBy('account_name');
    }
}

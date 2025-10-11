<?php

namespace App\Helpers;

use App\Models\Company;
use Illuminate\Support\Facades\DB;

class CompanyHelper
{
    /**
     * Check if the current logged-in user's company is a parent company
     */
    public static function isCurrentCompanyParent(): bool
    {
        $compId = session('user_comp_id');
        
        if (!$compId) {
            return false;
        }

        $company = Company::find($compId);
        
        return $company && $company->isParentCompany();
    }

    /**
     * Check if the current logged-in user's company is a customer company
     */
    public static function isCurrentCompanyCustomer(): bool
    {
        return !self::isCurrentCompanyParent();
    }

    /**
     * Check if a specific company is a parent company
     */
    public static function isParentCompany($companyId): bool
    {
        $company = Company::find($companyId);
        
        return $company && $company->isParentCompany();
    }

    /**
     * Get all companies (for parent company users)
     * Get only current company (for customer company users)
     */
    public static function getAccessibleCompanies()
    {
        if (self::isCurrentCompanyParent()) {
            // Parent company can see all companies
            return Company::active()->orderBy('company_name')->get();
        } else {
            // Customer company can only see their own company
            $compId = session('user_comp_id');
            return Company::where('id', $compId)->get();
        }
    }

    /**
     * Get all locations (for parent company users)
     * Get only current company's locations (for customer company users)
     */
    public static function getAccessibleLocations()
    {
        $compId = session('user_comp_id');

        if (self::isCurrentCompanyParent()) {
            // Parent company can see all locations
            return DB::table('locations')
                ->where('status', 'Active')
                ->orderBy('location_name')
                ->get();
        } else {
            // Customer company can only see their own locations
            return DB::table('locations')
                ->where('comp_id', $compId)
                ->where('status', 'Active')
                ->orderBy('location_name')
                ->get();
        }
    }

    /**
     * Get all users (for parent company users)
     * Get only current company's users (for customer company users)
     */
    public static function getAccessibleUsers()
    {
        $compId = session('user_comp_id');

        if (self::isCurrentCompanyParent()) {
            // Parent company can see all users
            return DB::table('tbl_users')
                ->where('status', 'Active')
                ->orderBy('fname')
                ->get();
        } else {
            // Customer company can only see their own users
            return DB::table('tbl_users')
                ->where('comp_id', $compId)
                ->where('status', 'Active')
                ->orderBy('fname')
                ->get();
        }
    }

    /**
     * Get filter query for companies based on user's company type
     */
    public static function applyCompanyFilter($query)
    {
        if (!self::isCurrentCompanyParent()) {
            $compId = session('user_comp_id');
            $query->where('comp_id', $compId);
        }
        
        return $query;
    }

    /**
     * Check if current user can manage parent company settings
     * (Packages, Locations, Package Features, etc.)
     */
    public static function canManageParentSettings(): bool
    {
        return self::isCurrentCompanyParent();
    }

    /**
     * Get restricted fields for customer companies when editing company
     */
    public static function getRestrictedFieldsForCustomer(): array
    {
        return [
            'parent_comp',
            'package_id',
            'license_number',
            'license_start_date',
            'license_end_date',
        ];
    }

    /**
     * Check if a field is restricted for customer companies
     */
    public static function isRestrictedField(string $field): bool
    {
        if (self::isCurrentCompanyParent()) {
            return false;
        }

        return in_array($field, self::getRestrictedFieldsForCustomer());
    }

    /**
     * Get company display info
     */
    public static function getCurrentCompanyInfo()
    {
        $compId = session('user_comp_id');
        
        if (!$compId) {
            return null;
        }

        $company = Company::find($compId);
        
        if (!$company) {
            return null;
        }

        return [
            'id' => $company->id,
            'name' => $company->company_name,
            'is_parent' => $company->isParentCompany(),
            'logo' => $company->logo,
            'currency' => $company->default_currency_code ?? 'PKR',
        ];
    }
}


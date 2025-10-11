<?php

namespace App\Http\Controllers\system;

use App\Http\Controllers\Controller;
use App\Models\ChartOfAccount;
use App\Models\Company;
use App\Models\Location;
use App\Helpers\CompanyHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ChartOfAccountController extends Controller
{
    /**
     * Get Level 2 accounts for a specific company and location
     */
    public function getLevel2Accounts(Request $request)
    {
        // Allow access for all authenticated users

        $request->validate([
            'company_id' => 'required|exists:companies,id',
            'location_id' => 'required|exists:locations,id',
        ]);

        $accounts = ChartOfAccount::getLevel2Accounts($request->company_id, $request->location_id)
            ->get(['id', 'account_code', 'account_name', 'account_type']);

        return response()->json(['data' => $accounts]);
    }

    /**
     * Get Level 3 accounts for a specific Level 2 account
     */
    public function getLevel3Accounts(Request $request)
    {
        // Allow access for all authenticated users

        $request->validate([
            'parent_account_id' => 'required|exists:chart_of_accounts,id',
            'company_id' => 'required|exists:companies,id',
            'location_id' => 'required|exists:locations,id',
        ]);

        $accounts = ChartOfAccount::getLevel3AccountsForParent(
            $request->parent_account_id,
            $request->company_id,
            $request->location_id
        )->get(['id', 'account_code', 'account_name', 'account_type']);

        return response()->json(['data' => $accounts]);
    }

    /**
     * Get all accounts for a specific company and location (for initial load)
     */
    public function getAccountsForCompanyLocation(Request $request)
    {
        // Allow access for all authenticated users
        
        $request->validate([
            'company_id' => 'required|exists:companies,id',
            'location_id' => 'required|exists:locations,id',
        ]);

        $accounts = ChartOfAccount::getAccountsForCompanyLocation($request->company_id, $request->location_id)
            ->get(['id', 'account_code', 'account_name', 'account_type', 'account_level', 'parent_account_id']);

        return response()->json(['data' => $accounts]);
    }
}

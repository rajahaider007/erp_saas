<?php

namespace App\Http\Controllers\Accounts;

use App\Http\Controllers\Controller;
use App\Http\Traits\CheckUserPermissions;
use App\Models\ChartOfAccount;
use App\Models\Company;
use App\Models\Location;
use App\Helpers\CompanyHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

/**
 * Chart of Account Code Configuration Controller
 * 
 * Handles creation of Level 4 Chart of Account codes from Level 3 accounts
 * Includes specialized forms for Bank Accounts, Cash Accounts, and other financial codes
 * 
 * International Standards Compliance (IAS 1, IFRS):
 * - Proper account hierarchies for financial statement presentation
 * - Clear distinction between asset, liability, equity, revenue, and expense accounts
 * - Support for detailed account coding for multi-level financial reporting
 */
class ChartOfAccountCodeConfigurationController extends Controller
{
    use CheckUserPermissions;

    /**
     * Get all Level 3 accounts for a specific company/location
     */
    public function getLevel3Accounts(Request $request)
    {
        $compId = $request->input('comp_id') ?? $request->session()->get('user_comp_id');
        $locationId = $request->input('location_id') ?? $request->session()->get('user_location_id');

        if (!$compId || !$locationId) {
            return response()->json(['error' => 'Company and Location required'], 400);
        }

        $accounts = ChartOfAccount::where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->where('account_level', 3)
            ->where('status', 'Active')
            ->orderBy('account_code')
            ->get(['id', 'account_code', 'account_name', 'account_type', 'parent_account_id']);

        return response()->json($accounts);
    }

    /**
     * Get existing Level 4 codes for a Level 3 account
     */
    public function getLevel4Codes(Request $request, $level3AccountId)
    {
        $level3Account = ChartOfAccount::findOrFail($level3AccountId);
        
        $codes = ChartOfAccount::where('parent_account_id', $level3AccountId)
            ->where('account_level', 4)
            ->orderBy('account_code')
            ->get(['id', 'account_code', 'account_name', 'account_type', 'is_transactional', 'status']);

        return response()->json([
            'level3_account' => $level3Account,
            'level4_codes' => $codes
        ]);
    }

    /**
     * Display the generalized code configuration form
     */
    public function index(Request $request)
    {
        $this->requirePermission($request, null, 'can_view');
        
        $compId = $request->session()->get('user_comp_id');
        $locationId = $request->session()->get('user_location_id');

        if (!$compId || !$locationId) {
            return Inertia::render('Accounts/ChartOfAccountCodeConfiguration/Index', [
                'level3Accounts' => [],
                'error' => 'Company and Location information is required.'
            ]);
        }

        $level3Accounts = ChartOfAccount::where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->where('account_level', 3)
            ->where('status', 'Active')
            ->with('childAccounts')
            ->orderBy('account_code')
            ->get();

        return Inertia::render('Accounts/ChartOfAccountCodeConfiguration/Index', [
            'level3Accounts' => $level3Accounts,
            'compId' => $compId,
            'locationId' => $locationId
        ]);
    }

    /**
     * Create Level 4 code for a Level 3 account
     */
    public function store(Request $request)
    {
        $this->requirePermission($request, null, 'can_add');

        $validated = $request->validate([
            'level3_account_id' => 'required|integer|exists:chart_of_accounts,id',
            'account_code' => 'required|string|max:20|unique:chart_of_accounts,account_code',
            'account_name' => 'required|string|max:100',
            'account_type' => 'required|in:Asset,Liability,Equity,Revenue,Expense,Contra-Asset,Contra-Revenue',
            'is_transactional' => 'boolean',
        ]);

        $compId = $request->session()->get('user_comp_id');
        $locationId = $request->session()->get('user_location_id');

        // Verify Level 3 account belongs to the company
        $level3Account = ChartOfAccount::where('id', $validated['level3_account_id'])
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->where('account_level', 3)
            ->firstOrFail();

        // Check if account code already exists for this company/location
        $existingCode = ChartOfAccount::where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->where('account_code', $validated['account_code'])
            ->exists();

        if ($existingCode) {
            return redirect()->back()->withErrors([
                'account_code' => "Account code '{$validated['account_code']}' already exists for this company/location."
            ]);
        }

        DB::beginTransaction();
        try {
            $newCode = ChartOfAccount::create([
                'account_code' => $validated['account_code'],
                'account_name' => $validated['account_name'],
                'account_type' => $validated['account_type'],
                'parent_account_id' => $validated['level3_account_id'],
                'account_level' => 4,
                'is_transactional' => $validated['is_transactional'] ?? true,
                'currency' => 'PKR', // Default currency
                'status' => 'Active',
                'comp_id' => $compId,
                'location_id' => $locationId
            ]);

            DB::commit();

            return redirect()->back()
                ->with('success', "Level 4 code '{$validated['account_code']}' created successfully under {$level3Account->account_code}");

        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Error creating Level 4 account code', [
                'error' => $e->getMessage(),
                'comp_id' => $compId,
                'location_id' => $locationId
            ]);

            return redirect()->back()
                ->with('error', 'Failed to create account code. Please try again.');
        }
    }

    /**
     * Update Level 4 code
     */
    public function update(Request $request, $id)
    {
        $this->requirePermission($request, null, 'can_edit');

        $validated = $request->validate([
            'account_name' => 'required|string|max:100',
            'account_type' => 'required|in:Asset,Liability,Equity,Revenue,Expense,Contra-Asset,Contra-Revenue',
            'is_transactional' => 'boolean',
            'status' => 'required|in:Active,Inactive'
        ]);

        $compId = $request->session()->get('user_comp_id');
        $locationId = $request->session()->get('user_location_id');

        $code = ChartOfAccount::where('id', $id)
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->where('account_level', 4)
            ->firstOrFail();

        $code->update($validated);

        return redirect()->back()
            ->with('success', "Account code '{$code->account_code}' updated successfully");
    }

    /**
     * Delete Level 4 code
     */
    public function destroy(Request $request, $id)
    {
        $this->requirePermission($request, null, 'can_delete');

        $compId = $request->session()->get('user_comp_id');
        $locationId = $request->session()->get('user_location_id');

        $code = ChartOfAccount::where('id', $id)
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->where('account_level', 4)
            ->firstOrFail();

        // Check if this code has any transactions
        $transactionCount = DB::table('transaction_entries')
            ->where('account_id', $id)
            ->count();

        if ($transactionCount > 0) {
            return redirect()->back()
                ->with('error', "Cannot delete account code '{$code->account_code}' because it has {$transactionCount} transaction(s).");
        }

        $code->delete();

        return redirect()->back()
            ->with('success', "Account code '{$code->account_code}' deleted successfully");
    }

    /**
     * Bank Account Code Configuration
     */
    public function bankConfiguration(Request $request)
    {
        $this->requirePermission($request, null, 'can_view');

        $compId = $request->session()->get('user_comp_id');
        $locationId = $request->session()->get('user_location_id');

        // Get the Bank Account head account (Level 3)
        $bankHead = ChartOfAccount::where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->where('account_type', 'Asset')
            ->where('account_level', 3)
            ->where('account_code', 'like', '%Bank%')
            ->first();

        if (!$bankHead) {
            // Try alternative search
            $bankHead = ChartOfAccount::where('comp_id', $compId)
                ->where('location_id', $locationId)
                ->where('account_level', 3)
                ->where('account_name', 'like', '%Bank%')
                ->first();
        }

        $bankCodes = [];
        if ($bankHead) {
            $bankCodes = ChartOfAccount::where('parent_account_id', $bankHead->id)
                ->where('account_level', 4)
                ->orderBy('account_code')
                ->get();
        }

        return Inertia::render('Accounts/ChartOfAccountCodeConfiguration/BankConfiguration', [
            'bankHead' => $bankHead,
            'bankCodes' => $bankCodes,
            'compId' => $compId,
            'locationId' => $locationId
        ]);
    }

    /**
     * Cash Account Code Configuration
     */
    public function cashConfiguration(Request $request)
    {
        $this->requirePermission($request, null, 'can_view');

        $compId = $request->session()->get('user_comp_id');
        $locationId = $request->session()->get('user_location_id');

        // Get the Cash Account head account (Level 3)
        $cashHead = ChartOfAccount::where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->where('account_type', 'Asset')
            ->where('account_level', 3)
            ->where('account_code', 'like', '%Cash%')
            ->first();

        if (!$cashHead) {
            // Try alternative search
            $cashHead = ChartOfAccount::where('comp_id', $compId)
                ->where('location_id', $locationId)
                ->where('account_level', 3)
                ->where('account_name', 'like', '%Cash%')
                ->first();
        }

        $cashCodes = [];
        if ($cashHead) {
            $cashCodes = ChartOfAccount::where('parent_account_id', $cashHead->id)
                ->where('account_level', 4)
                ->orderBy('account_code')
                ->get();
        }

        return Inertia::render('Accounts/ChartOfAccountCodeConfiguration/CashConfiguration', [
            'cashHead' => $cashHead,
            'cashCodes' => $cashCodes,
            'compId' => $compId,
            'locationId' => $locationId
        ]);
    }

    /**
     * Create Bank Account Code
     */
    public function storeBankCode(Request $request)
    {
        $this->requirePermission($request, null, 'can_add');

        $validated = $request->validate([
            'bank_name' => 'required|string|max:100',
            'account_code' => 'required|string|max:20|unique:chart_of_accounts,account_code',
            'account_number' => 'nullable|string|max:30',
            'branch' => 'nullable|string|max:100',
            'currency' => 'required|string|max:3',
            'is_transactional' => 'boolean'
        ]);

        $compId = $request->session()->get('user_comp_id');
        $locationId = $request->session()->get('user_location_id');

        // Get or create Bank Account head
        $bankHead = ChartOfAccount::where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->where('account_type', 'Asset')
            ->where('account_level', 3)
            ->where('account_name', 'like', '%Bank%')
            ->first();

        if (!$bankHead) {
            return redirect()->back()
                ->with('error', 'Bank Account head (Level 3) not found. Please create it first in Chart of Accounts.');
        }

        DB::beginTransaction();
        try {
            $bankCode = ChartOfAccount::create([
                'account_code' => $validated['account_code'],
                'account_name' => $validated['bank_name'],
                'account_type' => 'Asset',
                'parent_account_id' => $bankHead->id,
                'account_level' => 4,
                'is_transactional' => $validated['is_transactional'] ?? true,
                'currency' => $validated['currency'],
                'status' => 'Active',
                'short_code' => substr($validated['account_code'], 0, 10),
                'comp_id' => $compId,
                'location_id' => $locationId
            ]);

            DB::commit();

            return redirect()->back()
                ->with('success', "Bank account code '{$validated['account_code']}' created successfully. Account: {$validated['bank_name']}");

        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Error creating bank account code', [
                'error' => $e->getMessage(),
                'comp_id' => $compId
            ]);

            return redirect()->back()
                ->with('error', 'Failed to create bank account code. Please try again.');
        }
    }

    /**
     * Create Cash Account Code
     */
    public function storeCashCode(Request $request)
    {
        $this->requirePermission($request, null, 'can_add');

        $validated = $request->validate([
            'cash_location' => 'required|string|max:100',
            'account_code' => 'required|string|max:20|unique:chart_of_accounts,account_code',
            'custodian' => 'nullable|string|max:100',
            'currency' => 'required|string|max:3',
            'is_transactional' => 'boolean'
        ]);

        $compId = $request->session()->get('user_comp_id');
        $locationId = $request->session()->get('user_location_id');

        // Get or create Cash Account head
        $cashHead = ChartOfAccount::where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->where('account_type', 'Asset')
            ->where('account_level', 3)
            ->where('account_name', 'like', '%Cash%')
            ->first();

        if (!$cashHead) {
            return redirect()->back()
                ->with('error', 'Cash Account head (Level 3) not found. Please create it first in Chart of Accounts.');
        }

        DB::beginTransaction();
        try {
            $cashCode = ChartOfAccount::create([
                'account_code' => $validated['account_code'],
                'account_name' => $validated['cash_location'],
                'account_type' => 'Asset',
                'parent_account_id' => $cashHead->id,
                'account_level' => 4,
                'is_transactional' => $validated['is_transactional'] ?? true,
                'currency' => $validated['currency'],
                'status' => 'Active',
                'short_code' => substr($validated['account_code'], 0, 10),
                'comp_id' => $compId,
                'location_id' => $locationId
            ]);

            DB::commit();

            return redirect()->back()
                ->with('success', "Cash account code '{$validated['account_code']}' created successfully. Location: {$validated['cash_location']}");

        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Error creating cash account code', [
                'error' => $e->getMessage(),
                'comp_id' => $compId
            ]);

            return redirect()->back()
                ->with('error', 'Failed to create cash account code. Please try again.');
        }
    }

    /**
     * Get required accounting configuration per international standards
     * Returns information about IAS/IFRS compliance requirements
     */
    public function getConfigurationRequirements(Request $request)
    {
        return response()->json([
            'international_standards' => [
                'ias1' => [
                    'name' => 'IAS 1 - Presentation of Financial Statements',
                    'requirements' => [
                        'Proper separation of current/non-current assets',
                        'Clear distinction between operating and financing activities',
                        'Segregation of ordinary vs. unusual/irregular items',
                        'Classification of comprehensive income items'
                    ]
                ],
                'ifrs' => [
                    'name' => 'IFRS - International Financial Reporting Standards',
                    'requirements' => [
                        'Fair value hierarchy for financial instruments',
                        'Entity-wide disclosures for segments',
                        'Related party transactions disclosure',
                        'Subsequent events disclosure'
                    ]
                ]
            ],
            'required_configurations' => [
                [
                    'name' => 'Chart of Accounts Configuration',
                    'status' => 'Required',
                    'route' => '/accounts/chart-of-accounts',
                    'description' => 'Set up hierarchical account structure'
                ],
                [
                    'name' => 'Bank Accounts',
                    'status' => 'Required',
                    'route' => '/accounts/code-configuration/bank',
                    'description' => 'Configure bank account codes for cash management'
                ],
                [
                    'name' => 'Cash Accounts',
                    'status' => 'Required',
                    'route' => '/accounts/code-configuration/cash',
                    'description' => 'Configure cash account codes and custodians'
                ],
                [
                    'name' => 'Fiscal Year Configuration',
                    'status' => 'Required',
                    'route' => '/accounts/fiscal-year-configuration',
                    'description' => 'Define fiscal years and accounting periods'
                ],
                [
                    'name' => 'Currency Configuration',
                    'status' => 'Required',
                    'route' => '/accounts/currencies',
                    'description' => 'Define multi-currency support'
                ],
                [
                    'name' => 'Segment Configuration',
                    'status' => 'Optional',
                    'route' => '/accounts/segments',
                    'description' => 'For IFRS 8 segment reporting'
                ],
                [
                    'name' => 'Cost Center Configuration',
                    'status' => 'Recommended',
                    'route' => '/accounts/cost-centers',
                    'description' => 'For management accounting and cost analysis'
                ],
                [
                    'name' => 'Budget Configuration',
                    'status' => 'Recommended',
                    'route' => '/accounts/budgets',
                    'description' => 'For budget vs. actual analysis'
                ]
            ]
        ]);
    }
}

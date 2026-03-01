<?php

namespace App\Http\Controllers\Accounts;

use App\Http\Controllers\Controller;
use App\Http\Traits\CheckUserPermissions;
use App\Models\AccountConfiguration;
use App\Models\Company;
use App\Helpers\CompanyHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AccountConfigurationController extends Controller
{
    use CheckUserPermissions;

    /**
     * Display a listing of account configurations
     */
    public function index(Request $request)
    {
        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');
        $locationId = $request->input('user_location_id') ?? $request->session()->get('user_location_id');

        if (!$compId || !$locationId) {
            return Inertia::render('Accounts/AccountConfiguration/List', [
                'configurations' => [],
                'filters' => [],
                'error' => 'Company and Location information is required.'
            ]);
        }

        // Get filters
        $search = $request->input('search');
        $status = $request->input('status');
        $configType = $request->input('config_type');
        $accountLevel = $request->input('account_level');
        $sortBy = $request->input('sort_by', 'id');
        $sortDirection = $request->input('sort_direction', 'desc');
        $perPage = $request->input('per_page', 25);

        // Get companies and locations for parent companies
        $isParentCompany = false;
        $company = Company::find($compId);
        if ($company && method_exists($company, 'isParentCompany')) {
            $isParentCompany = $company->isParentCompany();
        }

        $companies = [];
        $locations = [];
        
        if ($isParentCompany) {
            $companies = DB::table('companies')
                ->where('status', true)
                ->orderBy('company_name')
                ->get(['id', 'company_name']);
            
            if ($compId) {
                $locations = DB::table('locations')
                    ->where('company_id', $compId)
                    ->where('status', 'Active')
                    ->orderBy('location_name')
                    ->get(['id', 'location_name']);
            }
        }

        // Build query
        $query = AccountConfiguration::query()
            ->where('comp_id', $compId)
            ->where('location_id', $locationId);

        // Apply filters
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('account_code', 'like', "%{$search}%")
                  ->orWhere('account_name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($status !== null && $status !== 'all') {
            $query->where('is_active', $status == '1' ? true : false);
        }

        if ($configType && $configType !== 'all') {
            $query->where('config_type', $configType);
        }

        if ($accountLevel) {
            $query->where('account_level', $accountLevel);
        }

        // Sort and paginate
        $configurations = $query->orderBy($sortBy, $sortDirection)
            ->paginate($perPage)
            ->appends($request->query());

        return Inertia::render('Accounts/AccountConfiguration/List', [
            'configurations' => $configurations,
            'companies' => $companies,
            'locations' => $locations,
            'isParentCompany' => $isParentCompany,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'config_type' => $configType,
                'account_level' => $accountLevel,
                'sort_by' => $sortBy,
                'sort_direction' => $sortDirection,
                'per_page' => $perPage
            ],
            'configTypes' => AccountConfiguration::getConfigTypes(),
            'pageTitle' => 'Account Configuration'
        ]);
    }

    /**
     * Show the form for creating a new account configuration
     */
    public function create(Request $request)
    {
        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');
        $locationId = $request->input('user_location_id') ?? $request->session()->get('user_location_id');

        if (!$compId || !$locationId) {
            return Inertia::render('Accounts/AccountConfiguration/Create', [
                'error' => 'Company and Location information is required.'
            ]);
        }

        // Get level 3 accounts only
        $accounts = DB::table('chart_of_accounts')
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->where('account_level', 3)
            ->orderBy('account_code')
            ->get(['id', 'account_code', 'account_name', 'account_level', 'account_type'])
            ->map(function ($account) {
                return [
                    'value' => $account->id,
                    'label' => "{$account->account_code} - {$account->account_name}"
                ];
            })
            ->values();

        return Inertia::render('Accounts/AccountConfiguration/Create', [
            'accounts' => $accounts,
            'configTypes' => AccountConfiguration::getConfigTypes(),
            'edit_mode' => false,
            'configuration' => null
        ]);
    }

    /**
     * Store a newly created account configuration in storage
     */
    public function store(Request $request)
    {
        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');
        $locationId = $request->input('user_location_id') ?? $request->session()->get('user_location_id');

        $validated = $request->validate([
            'account_id' => 'required|integer|exists:chart_of_accounts,id',
            'config_type' => 'required|in:' . implode(',', array_keys(AccountConfiguration::getConfigTypes())),
            'description' => 'nullable|string|max:500'
        ]);

        try {
            // Get account details
            $account = DB::table('chart_of_accounts')
                ->where('id', $validated['account_id'])
                ->where('comp_id', $compId)
                ->where('location_id', $locationId)
                ->first();

            if (!$account) {
                return back()->withErrors(['account_id' => 'Selected account not found.']);
            }

            // Check if configuration already exists
            $existing = AccountConfiguration::where('comp_id', $compId)
                ->where('location_id', $locationId)
                ->where('account_id', $validated['account_id'])
                ->where('config_type', $validated['config_type'])
                ->first();

            if ($existing) {
                return back()->withErrors(['account_id' => 'This account is already configured for this type.']);
            }

            // Create configuration
            AccountConfiguration::create([
                'comp_id' => $compId,
                'location_id' => $locationId,
                'account_id' => $validated['account_id'],
                'account_code' => $account->account_code,
                'account_name' => $account->account_name,
                'account_level' => $account->account_level,
                'config_type' => $validated['config_type'],
                'description' => $validated['description'] ?? null,
                'is_active' => true
            ]);

            return redirect("/accounts/account-configuration")
                ->with('success', "Configuration for {$account->account_name} created successfully.");

        } catch (\Exception $e) {
            Log::error('Error creating account configuration', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return back()->withErrors(['error' => 'An error occurred while creating the configuration.']);
        }
    }

    /**
     * Show the form for editing the specified account configuration
     */
    public function edit(Request $request, $id)
    {
        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');
        $locationId = $request->input('user_location_id') ?? $request->session()->get('user_location_id');

        $configuration = AccountConfiguration::where('id', $id)
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->first();

        if (!$configuration) {
            return Inertia::render('Accounts/AccountConfiguration/Create', [
                'error' => 'Configuration not found.'
            ]);
        }

        // Get level 3 accounts only
        $accounts = DB::table('chart_of_accounts')
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->where('account_level', 3)
            ->orderBy('account_code')
            ->get(['id', 'account_code', 'account_name', 'account_level', 'account_type'])
            ->map(function ($account) {
                return [
                    'value' => $account->id,
                    'label' => "{$account->account_code} - {$account->account_name}"
                ];
            })
            ->values();

        return Inertia::render('Accounts/AccountConfiguration/Create', [
            'accounts' => $accounts,
            'configTypes' => AccountConfiguration::getConfigTypes(),
            'configuration' => $configuration,
            'edit_mode' => true,
            'id' => $id
        ]);
    }

    /**
     * Update the specified account configuration in storage
     */
    public function update(Request $request, $id)
    {
        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');
        $locationId = $request->input('user_location_id') ?? $request->session()->get('user_location_id');

        $configuration = AccountConfiguration::where('id', $id)
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->first();

        if (!$configuration) {
            return back()->withErrors(['error' => 'Configuration not found.']);
        }

        $validated = $request->validate([
            'account_id' => 'required|integer|exists:chart_of_accounts,id',
            'config_type' => 'required|in:' . implode(',', array_keys(AccountConfiguration::getConfigTypes())),
            'description' => 'nullable|string|max:500',
            'is_active' => 'nullable|boolean'
        ]);

        try {
            // Get account details
            $account = DB::table('chart_of_accounts')
                ->where('id', $validated['account_id'])
                ->where('comp_id', $compId)
                ->where('location_id', $locationId)
                ->first();

            if (!$account) {
                return back()->withErrors(['account_id' => 'Selected account not found.']);
            }

            // Check if configuration already exists for different account
            $existing = AccountConfiguration::where('comp_id', $compId)
                ->where('location_id', $locationId)
                ->where('account_id', $validated['account_id'])
                ->where('config_type', $validated['config_type'])
                ->where('id', '!=', $id)
                ->first();

            if ($existing) {
                return back()->withErrors(['account_id' => 'This account is already configured for this type.']);
            }

            // Update configuration
            $configuration->update([
                'account_id' => $validated['account_id'],
                'account_code' => $account->account_code,
                'account_name' => $account->account_name,
                'account_level' => $account->account_level,
                'config_type' => $validated['config_type'],
                'description' => $validated['description'] ?? null,
                'is_active' => $validated['is_active'] ?? true
            ]);

            return redirect("/accounts/account-configuration")
                ->with('success', "Configuration updated successfully.");

        } catch (\Exception $e) {
            Log::error('Error updating account configuration', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return back()->withErrors(['error' => 'An error occurred while updating the configuration.']);
        }
    }

    /**
     * Remove the specified account configuration from storage
     */
    public function destroy($id, Request $request)
    {
        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');
        $locationId = $request->input('user_location_id') ?? $request->session()->get('user_location_id');

        $configuration = AccountConfiguration::where('id', $id)
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->first();

        if (!$configuration) {
            return response()->json(['error' => 'Configuration not found.'], 404);
        }

        try {
            $accountName = $configuration->account_name;
            $configuration->delete();

            return response()->json([
                'success' => true,
                'message' => "Configuration for {$accountName} deleted successfully."
            ]);

        } catch (\Exception $e) {
            Log::error('Error deleting account configuration', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json(['error' => 'An error occurred while deleting the configuration.'], 500);
        }
    }

    /**
     * Bulk delete configurations
     */
    public function bulkDestroy(Request $request)
    {
        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');
        $locationId = $request->input('user_location_id') ?? $request->session()->get('user_location_id');

        $ids = $request->input('ids', []);

        if (empty($ids)) {
            return response()->json(['error' => 'No configurations selected.'], 400);
        }

        try {
            AccountConfiguration::whereIn('id', $ids)
                ->where('comp_id', $compId)
                ->where('location_id', $locationId)
                ->delete();

            return response()->json([
                'success' => true,
                'message' => count($ids) . ' configuration(s) deleted successfully.'
            ]);

        } catch (\Exception $e) {
            Log::error('Error bulk deleting account configurations', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json(['error' => 'An error occurred while deleting configurations.'], 500);
        }
    }

    /**
     * Bulk update status
     */
    public function bulkStatus(Request $request)
    {
        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');
        $locationId = $request->input('user_location_id') ?? $request->session()->get('user_location_id');

        $ids = $request->input('ids', []);
        $status = $request->input('status', false);

        if (empty($ids)) {
            return response()->json(['error' => 'No configurations selected.'], 400);
        }

        try {
            AccountConfiguration::whereIn('id', $ids)
                ->where('comp_id', $compId)
                ->where('location_id', $locationId)
                ->update(['is_active' => (bool) $status]);

            return response()->json([
                'success' => true,
                'message' => count($ids) . ' configuration(s) updated successfully.'
            ]);

        } catch (\Exception $e) {
            Log::error('Error updating account configuration status', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json(['error' => 'An error occurred while updating configurations.'], 500);
        }
    }
}

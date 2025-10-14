<?php

namespace App\Http\Controllers\Accounts;

use App\Http\Controllers\Controller;
use App\Models\ChartOfAccount;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class ChartOfAccountsController extends Controller
{
    public function index(Request $request)
    {
        $userId = auth()->id();
        
        // Debug: Log the user ID
        Log::info('Chart of Accounts - User ID: ' . $userId);

        $user = DB::table('tbl_users')->where('id', $userId)->first();

        // Debug: Log if user is found
        Log::info('Chart of Accounts - User found: ' . ($user ? 'Yes' : 'No'));

        // Fallback: If user not found, try to get from session directly
        if (!$user) {
            $userId = $request->session()->get('user_id');
            $user = DB::table('tbl_users')->where('id', $userId)->where('status', 'active')->first();
            Log::info('Chart of Accounts - Fallback user found: ' . ($user ? 'Yes' : 'No'));
        }

        $currencies = DB::table('currencies')
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        // Debug: Log user data
        Log::info('Chart of Accounts - User data:', [
            'user_comp_id' => $user->comp_id ?? 'null',
            'user_location_id' => $user->location_id ?? 'null',
            'session_comp_id' => $request->session()->get('user_comp_id') ?? 'null',
            'session_location_id' => $request->session()->get('user_location_id') ?? 'null',
            'final_comp_id' => $compId ?? 'null',
            'final_location_id' => $locationId ?? 'null'
        ]);

        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id') ?? $user->comp_id;
        $locationId = $request->input('user_location_id') ?? $request->session()->get('user_location_id') ?? $user->location_id;

        // Validate required company and location IDs
        if (!$compId || !$locationId) {
            return Inertia::render('Accounts/ChartOfAccounts', [
                'currencies' => $currencies,
                'accounts' => [],
                'error' => 'Company and Location information is required. Please contact administrator.'
            ]);
        }

        $accounts = DB::table('chart_of_accounts')
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->orderBy('account_code')
            ->get();

        return Inertia::render('Accounts/ChartOfAccounts', [
            'currencies' => $currencies,
            'accounts' => $accounts
        ]);
    }

    /**
     * Store a newly created account
     */
    public function store(Request $request)
    {
        try {
            // Get user information
            $userId = auth()->id();
            $user = DB::table('tbl_users')->where('id', $userId)->first();
            
            if (!$user) {
                $userId = $request->session()->get('user_id');
                $user = DB::table('tbl_users')->where('id', $userId)->where('status', 'active')->first();
            }

            $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id') ?? $user->comp_id;
            $locationId = $request->input('user_location_id') ?? $request->session()->get('user_location_id') ?? $user->location_id;

            // Validate required company and location IDs
            if (!$compId || !$locationId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Company and Location information is required.'
                ], 400);
            }

            // Validate the request
            $validator = Validator::make($request->all(), [
                'account_code' => 'required|string|max:255|unique:chart_of_accounts,account_code',
                'account_name' => 'required|string|max:255',
                'account_type' => 'required|in:Assets,Liabilities,Equity,Revenue,Expenses',
                'parent_account_id' => 'nullable|exists:chart_of_accounts,id',
                'account_level' => 'required|integer|min:1|max:4',
                'currency' => 'nullable|string|max:10',
                'short_code' => 'nullable|string|max:50',
                'status' => 'required|in:Active,Inactive'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed.',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Create the account
            $account = ChartOfAccount::create([
                'account_code' => $request->account_code,
                'account_name' => $request->account_name,
                'account_type' => $request->account_type,
                'parent_account_id' => $request->parent_account_id,
                'account_level' => $request->account_level,
                'currency' => $request->currency,
                'short_code' => $request->short_code,
                'status' => $request->status,
                'comp_id' => $compId,
                'location_id' => $locationId,
            ]);

            Log::info('Chart of Account created successfully', [
                'account_id' => $account->id,
                'account_code' => $account->account_code,
                'account_name' => $account->account_name,
                'user_id' => $userId,
                'comp_id' => $compId,
                'location_id' => $locationId
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Account created successfully.',
                'account' => $account
            ]);

        } catch (\Exception $e) {
            Log::error('Error creating chart of account', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while creating the account.'
            ], 500);
        }
    }

    /**
     * Update the specified account
     */
    public function update(Request $request, $id)
    {
        try {
            // Get user information
            $userId = auth()->id();
            $user = DB::table('tbl_users')->where('id', $userId)->first();
            
            if (!$user) {
                $userId = $request->session()->get('user_id');
                $user = DB::table('tbl_users')->where('id', $userId)->where('status', 'active')->first();
            }

            $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id') ?? $user->comp_id;
            $locationId = $request->input('user_location_id') ?? $request->session()->get('user_location_id') ?? $user->location_id;

            // Find the account
            $account = ChartOfAccount::where('id', $id)
                ->where('comp_id', $compId)
                ->where('location_id', $locationId)
                ->first();

            if (!$account) {
                return response()->json([
                    'success' => false,
                    'message' => 'Account not found.'
                ], 404);
            }

            // Validate the request
            $validator = Validator::make($request->all(), [
                'account_code' => 'required|string|max:255|unique:chart_of_accounts,account_code,' . $id,
                'account_name' => 'required|string|max:255',
                'account_type' => 'required|in:Assets,Liabilities,Equity,Revenue,Expenses',
                'parent_account_id' => 'nullable|exists:chart_of_accounts,id',
                'account_level' => 'required|integer|min:1|max:4',
                'currency' => 'nullable|string|max:10',
                'short_code' => 'nullable|string|max:50',
                'status' => 'required|in:Active,Inactive'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed.',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Update the account
            $account->update([
                'account_code' => $request->account_code,
                'account_name' => $request->account_name,
                'account_type' => $request->account_type,
                'parent_account_id' => $request->parent_account_id,
                'account_level' => $request->account_level,
                'currency' => $request->currency,
                'short_code' => $request->short_code,
                'status' => $request->status,
            ]);

            Log::info('Chart of Account updated successfully', [
                'account_id' => $account->id,
                'account_code' => $account->account_code,
                'account_name' => $account->account_name,
                'user_id' => $userId,
                'comp_id' => $compId,
                'location_id' => $locationId
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Account updated successfully.',
                'account' => $account
            ]);

        } catch (\Exception $e) {
            Log::error('Error updating chart of account', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'account_id' => $id,
                'request_data' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while updating the account.'
            ], 500);
        }
    }

    /**
     * Remove the specified account
     */
    public function destroy(Request $request, $id)
    {
        try {
            // Get user information
            $userId = auth()->id();
            $user = DB::table('tbl_users')->where('id', $userId)->first();
            
            if (!$user) {
                $userId = $request->session()->get('user_id');
                $user = DB::table('tbl_users')->where('id', $userId)->where('status', 'active')->first();
            }

            $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id') ?? $user->comp_id;
            $locationId = $request->input('user_location_id') ?? $request->session()->get('user_location_id') ?? $user->location_id;

            // Find the account
            $account = ChartOfAccount::where('id', $id)
                ->where('comp_id', $compId)
                ->where('location_id', $locationId)
                ->first();

            if (!$account) {
                return response()->json([
                    'success' => false,
                    'message' => 'Account not found.'
                ], 404);
            }

            // Check if account has child accounts
            $childAccountsCount = ChartOfAccount::where('parent_account_id', $id)
                ->where('comp_id', $compId)
                ->where('location_id', $locationId)
                ->count();

            if ($childAccountsCount > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete account that has child accounts.'
                ], 400);
            }

            // Delete the account
            $account->delete();

            Log::info('Chart of Account deleted successfully', [
                'account_id' => $id,
                'account_code' => $account->account_code,
                'account_name' => $account->account_name,
                'user_id' => $userId,
                'comp_id' => $compId,
                'location_id' => $locationId
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Account deleted successfully.'
            ]);

        } catch (\Exception $e) {
            Log::error('Error deleting chart of account', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'account_id' => $id
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while deleting the account.'
            ], 500);
        }
    }
}
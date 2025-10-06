<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class ChartOfAccountsController extends Controller
{
    // Get all accounts
    public function index(Request $request)
    {
        try {
            // Get authenticated user
            $user = $request->user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }
            
            $accounts = DB::table('chart_of_accounts')
                ->where('comp_id', $user->comp_id)
                ->where('location_id', $user->location_id)
                ->orderBy('account_code')
                ->get();
                
            return response()->json([
                'success' => true,
                'data' => $accounts
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching accounts: ' . $e->getMessage()
            ], 500);
        }
    }
    
    // Store new account
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'account_name' => 'required|string|max:255',
            'short_code' => 'nullable|string|max:20',
            'account_type' => 'required|string|in:Assets,Liabilities,Equity,Revenue,Expenses',
            'currency' => 'required|string|max:3',
            'status' => 'required|string|in:Active,Inactive',
            'parent_account_id' => 'nullable|integer|exists:chart_of_accounts,id',
            'account_code' => 'required|string|unique:chart_of_accounts,account_code',
            'account_level' => 'required|integer|min:1|max:3'
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        try {
            // Get authenticated user
            $user = $request->user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }
            
            $accountId = DB::table('chart_of_accounts')->insertGetId([
                'account_code' => $request->account_code,
                'account_name' => $request->account_name,
                'short_code' => $request->short_code,
                'account_type' => $request->account_type,
                'account_level' => $request->account_level,
                'parent_account_id' => $request->parent_account_id,
                'currency' => $request->currency,
                'status' => $request->status,
                'comp_id' => $user->comp_id, // Get from logged-in user
                'location_id' => $user->location_id, // Get from logged-in user
                'created_at' => now(),
                'updated_at' => now()
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Account created successfully',
                'account_id' => $accountId
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error creating account: ' . $e->getMessage()
            ], 500);
        }
    }
    
    // Update account
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'account_name' => 'required|string|max:255',
            'short_code' => 'nullable|string|max:20',
            'account_type' => 'required|string|in:Assets,Liabilities,Equity,Revenue,Expenses',
            'currency' => 'required|string|max:3',
            'status' => 'required|string|in:Active,Inactive'
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        try {
            // Get authenticated user
            $user = $request->user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }
            
            $updated = DB::table('chart_of_accounts')
                ->where('id', $id)
                ->where('comp_id', $user->comp_id)
                ->where('location_id', $user->location_id)
                ->update([
                    'account_name' => $request->account_name,
                    'short_code' => $request->short_code,
                    'account_type' => $request->account_type,
                    'currency' => $request->currency,
                    'status' => $request->status,
                    'updated_at' => now()
                ]);
                
            if ($updated) {
                return response()->json([
                    'success' => true,
                    'message' => 'Account updated successfully'
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Account not found or update failed'
                ], 404);
            }
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating account: ' . $e->getMessage()
            ], 500);
        }
    }
    
    // Delete account
    public function destroy(Request $request, $id)
    {
        try {
            // Get authenticated user
            $user = $request->user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }
            
            // Get the account first
            $account = DB::table('chart_of_accounts')
                ->where('id', $id)
                ->where('comp_id', $user->comp_id)
                ->where('location_id', $user->location_id)
                ->first();
                
            if (!$account) {
                return response()->json([
                    'success' => false,
                    'message' => 'Account not found'
                ], 404);
            }
            
            // Check if it's a Level 1 account (main categories)
            if ($account->account_level == 1) {
                return response()->json([
                    'success' => false,
                    'message' => 'Main account categories (Level 1) cannot be deleted. These are fundamental accounting categories.'
                ], 422);
            }
            
            // Check if account has children
            $hasChildren = DB::table('chart_of_accounts')
                ->where('parent_account_id', $id)
                ->where('comp_id', $user->comp_id)
                ->where('location_id', $user->location_id)
                ->exists();
                
            if ($hasChildren) {
                $childAccounts = DB::table('chart_of_accounts')
                    ->where('parent_account_id', $id)
                    ->where('comp_id', $user->comp_id)
                    ->where('location_id', $user->location_id)
                    ->pluck('account_name')
                    ->toArray();
                    
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete parent account. Please delete child accounts first: ' . implode(', ', $childAccounts)
                ], 422);
            }
            
            // Proceed with deletion
            $deleted = DB::table('chart_of_accounts')
                ->where('id', $id)
                ->where('comp_id', $user->comp_id)
                ->where('location_id', $user->location_id)
                ->delete();
                
            if ($deleted) {
                return response()->json([
                    'success' => true,
                    'message' => 'Account deleted successfully'
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Delete failed'
                ], 500);
            }
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting account: ' . $e->getMessage()
            ], 500);
        }
    }
}

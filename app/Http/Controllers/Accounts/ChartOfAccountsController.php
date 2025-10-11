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
}
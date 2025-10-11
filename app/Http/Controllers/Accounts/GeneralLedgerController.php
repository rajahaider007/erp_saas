<?php

namespace App\Http\Controllers\Accounts;

use App\Http\Controllers\Controller;
use App\Helpers\CompanyHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class GeneralLedgerController extends Controller
{
    /**
     * Display general ledger report
     */
    public function index(Request $request): Response
    {
        // For parent companies, allow company/location selection
        // For customer companies, use their session company/location
        $isParentCompany = CompanyHelper::isCurrentCompanyParent();
        
        $compId = $request->input('comp_id') ?? ($request->input('user_comp_id') ?? $request->session()->get('user_comp_id'));
        $locationId = $request->input('location_id') ?? ($request->input('user_location_id') ?? $request->session()->get('user_location_id'));
        
        if (!$compId || !$locationId) {
            return Inertia::render('Accounts/GeneralLedger/Report', [
                'ledgerData' => [],
                'accounts' => [],
                'filters' => [],
                'error' => 'Company and Location information is required.'
            ]);
        }

        // Get filters
        $accountId = $request->input('account_id');
        $fromDate = $request->input('from_date');
        $toDate = $request->input('to_date');
        $search = $request->input('search');
        $voucherType = $request->input('voucher_type');
        $status = $request->input('status', 'Posted');
        $minAmount = $request->input('min_amount');
        $maxAmount = $request->input('max_amount');

        // Get companies and locations for parent companies only
        $companies = [];
        $locations = [];
        
        if ($isParentCompany) {
            $companies = DB::table('companies')
                ->where('status', true)
                ->orderBy('company_name')
                ->get(['id', 'company_name']);
            
            // If company is selected, get its locations
            if ($compId) {
                $locations = DB::table('locations')
                    ->where('company_id', $compId)
                    ->where('status', 'Active')
                    ->orderBy('location_name')
                    ->get(['id', 'location_name']);
            }
        }

        // Get only level 3 child accounts (transaction accounts) for dropdown
        $accounts = DB::table('chart_of_accounts')
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->where('account_level', 3)
            ->orderBy('account_code')
            ->get();

        // Build query for ledger data
        $query = DB::table('transaction_entries')
            ->join('transactions', 'transaction_entries.transaction_id', '=', 'transactions.id')
            ->join('chart_of_accounts', 'transaction_entries.account_id', '=', 'chart_of_accounts.id')
            ->where('transactions.comp_id', $compId)
            ->where('transactions.location_id', $locationId)
            ->where('transactions.status', 'Posted') // Only posted transactions
            ->select(
                'transaction_entries.account_id',
                'transaction_entries.base_debit_amount',
                'transaction_entries.base_credit_amount',
                'transactions.voucher_number',
                'transactions.voucher_date',
                'transactions.voucher_type',
                'transactions.description',
                'transactions.reference_number',
                'transactions.status',
                'chart_of_accounts.account_code',
                'chart_of_accounts.account_name',
                'chart_of_accounts.account_type'
            );

        // Apply filters
        if ($accountId) {
            $query->where('transaction_entries.account_id', $accountId);
        }

        if ($fromDate) {
            $query->where('transactions.voucher_date', '>=', $fromDate);
        }

        if ($toDate) {
            $query->where('transactions.voucher_date', '<=', $toDate);
        }

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('transactions.voucher_number', 'like', "%{$search}%")
                  ->orWhere('transactions.description', 'like', "%{$search}%")
                  ->orWhere('chart_of_accounts.account_name', 'like', "%{$search}%")
                  ->orWhere('chart_of_accounts.account_code', 'like', "%{$search}%");
            });
        }

        if ($voucherType) {
            $query->where('transactions.voucher_type', $voucherType);
        }

        if ($status) {
            $query->where('transactions.status', $status);
        }

        if ($minAmount) {
            $query->where(function($q) use ($minAmount) {
                $q->where('transaction_entries.base_debit_amount', '>=', $minAmount)
                  ->orWhere('transaction_entries.base_credit_amount', '>=', $minAmount);
            });
        }

        if ($maxAmount) {
            $query->where(function($q) use ($maxAmount) {
                $q->where('transaction_entries.base_debit_amount', '<=', $maxAmount)
                  ->orWhere('transaction_entries.base_credit_amount', '<=', $maxAmount);
            });
        }

        $ledgerData = $query->orderBy('chart_of_accounts.account_code', 'asc')
            ->orderBy('transactions.voucher_date', 'asc')
            ->orderBy('transactions.id', 'asc')
            ->get();

        // Group data by account
        $groupedData = [];
        $accounts = [];
        
        if ($accountId) {
            // Single account view
            $selectedAccount = DB::table('chart_of_accounts')
                ->where('id', $accountId)
                ->where('comp_id', $compId)
                ->where('location_id', $locationId)
                ->first();
            
            if ($selectedAccount) {
                $accounts = [$selectedAccount];
                $groupedData[$accountId] = $ledgerData->toArray();
            }
        } else {
            // All accounts view - group by account
            $accountIds = $ledgerData->pluck('account_id')->unique();
            $accounts = DB::table('chart_of_accounts')
                ->whereIn('id', $accountIds)
                ->where('comp_id', $compId)
                ->where('location_id', $locationId)
                ->orderBy('account_code')
                ->get();
            
            foreach ($accounts as $account) {
                $accountTransactions = $ledgerData->where('account_id', $account->id)->values();
                $groupedData[$account->id] = $accountTransactions->toArray();
            }
        }

        // Calculate totals for each account
        $accountTotals = [];
        $grandTotalDebit = 0;
        $grandTotalCredit = 0;
        
        foreach ($accounts as $account) {
            $accountTransactions = $groupedData[$account->id] ?? [];
            $accountDebit = (float) collect($accountTransactions)->sum('base_debit_amount');
            $accountCredit = (float) collect($accountTransactions)->sum('base_credit_amount');
            $openingBalance = (float) ($account->opening_balance ?? 0);
            $closingBalance = (float) ($openingBalance + $accountDebit - $accountCredit);
            
            $accountTotals[$account->id] = [
                'opening_balance' => $openingBalance,
                'total_debit' => (float) $accountDebit,
                'total_credit' => (float) $accountCredit,
                'closing_balance' => $closingBalance
            ];
            
            $grandTotalDebit += $accountDebit;
            $grandTotalCredit += $accountCredit;
        }

        $selectedAccount = $accountId ? $accounts->first() : null;

        // Get company details
        $company = DB::table('companies')->where('id', $compId)->first();

        return Inertia::render('Accounts/GeneralLedger/Report', [
            'groupedData' => $groupedData,
            'accounts' => $accounts,
            'accountTotals' => $accountTotals,
            'account' => $selectedAccount,
            'company' => $company,
            'totalDebit' => $grandTotalDebit,
            'totalCredit' => $grandTotalCredit,
            'companies' => $companies,
            'locations' => $locations,
            'isParentCompany' => $isParentCompany,
            'filters' => [
                'account_id' => $accountId,
                'from_date' => $fromDate,
                'to_date' => $toDate,
                'search' => $search,
                'voucher_type' => $voucherType,
                'status' => $status,
                'min_amount' => $minAmount,
                'max_amount' => $maxAmount,
                'comp_id' => $compId,
                'location_id' => $locationId
            ]
        ]);
    }

    /**
     * Show search/filter page for general ledger
     */
    public function search(Request $request): Response
    {
        $isParentCompany = CompanyHelper::isCurrentCompanyParent();
        
        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');
        $locationId = $request->input('user_location_id') ?? $request->session()->get('user_location_id');
        
        if (!$compId || !$locationId) {
            return Inertia::render('Accounts/GeneralLedger/Search', [
                'accounts' => [],
                'companies' => [],
                'locations' => [],
                'isParentCompany' => $isParentCompany,
                'error' => 'Company and Location information is required.'
            ]);
        }

        // Get companies and locations for parent companies only
        $companies = [];
        $locations = [];
        
        if ($isParentCompany) {
            $companies = DB::table('companies')
                ->where('status', true)
                ->orderBy('company_name')
                ->get(['id', 'company_name']);
            
            $locations = DB::table('locations')
                ->where('company_id', $compId)
                ->where('status', 'Active')
                ->orderBy('location_name')
                ->get(['id', 'location_name']);
        }

        // Get only level 3 child accounts (transaction accounts) for dropdown
        $accounts = DB::table('chart_of_accounts')
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->where('account_level', 3)
            ->orderBy('account_code')
            ->get();

        return Inertia::render('Accounts/GeneralLedger/Search', [
            'accounts' => $accounts,
            'companies' => $companies,
            'locations' => $locations,
            'isParentCompany' => $isParentCompany
        ]);
    }

    /**
     * Print general ledger report
     */
    public function print(Request $request): Response
    {
        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');
        $locationId = $request->input('user_location_id') ?? $request->session()->get('user_location_id');
        
        if (!$compId || !$locationId) {
            abort(403, 'Company and Location information is required.');
        }

        // Get filters
        $accountId = $request->input('account_id');
        $fromDate = $request->input('from_date');
        $toDate = $request->input('to_date');

        // Get account details if specific account selected
        $account = null;
        if ($accountId) {
            $account = DB::table('chart_of_accounts')
                ->where('id', $accountId)
                ->where('comp_id', $compId)
                ->where('location_id', $locationId)
                ->first();
        }

        // Build query for ledger data
        $query = DB::table('transaction_entries')
            ->join('transactions', 'transaction_entries.transaction_id', '=', 'transactions.id')
            ->join('chart_of_accounts', 'transaction_entries.account_id', '=', 'chart_of_accounts.id')
            ->where('transactions.comp_id', $compId)
            ->where('transactions.location_id', $locationId)
            ->where('transactions.status', 'Posted')
            ->select(
                'transaction_entries.account_id',
                'transaction_entries.base_debit_amount',
                'transaction_entries.base_credit_amount',
                'transactions.voucher_number',
                'transactions.voucher_date',
                'transactions.voucher_type',
                'transactions.description',
                'chart_of_accounts.account_code',
                'chart_of_accounts.account_name'
            );

        if ($accountId) {
            $query->where('transaction_entries.account_id', $accountId);
        }

        if ($fromDate) {
            $query->where('transactions.voucher_date', '>=', $fromDate);
        }

        if ($toDate) {
            $query->where('transactions.voucher_date', '<=', $toDate);
        }

        $ledgerData = $query->orderBy('chart_of_accounts.account_code', 'asc')
            ->orderBy('transactions.voucher_date', 'asc')
            ->orderBy('transactions.id', 'asc')
            ->get();

        // Group data by account (same logic as index method)
        $groupedData = [];
        $accounts = [];
        
        if ($accountId) {
            // Single account view
            if ($account) {
                $accounts = [$account];
                $groupedData[$accountId] = $ledgerData->toArray();
            }
        } else {
            // All accounts view - group by account
            $accountIds = $ledgerData->pluck('account_id')->unique();
            $accounts = DB::table('chart_of_accounts')
                ->whereIn('id', $accountIds)
                ->where('comp_id', $compId)
                ->where('location_id', $locationId)
                ->orderBy('account_code')
                ->get();
            
            foreach ($accounts as $accountData) {
                $accountTransactions = $ledgerData->where('account_id', $accountData->id)->values();
                $groupedData[$accountData->id] = $accountTransactions->toArray();
            }
        }

        // Calculate totals for each account
        $accountTotals = [];
        $grandTotalDebit = 0;
        $grandTotalCredit = 0;
        
        foreach ($accounts as $accountData) {
            $accountTransactions = $groupedData[$accountData->id] ?? [];
            $accountDebit = (float) collect($accountTransactions)->sum('base_debit_amount');
            $accountCredit = (float) collect($accountTransactions)->sum('base_credit_amount');
            $openingBalance = (float) ($accountData->opening_balance ?? 0);
            $closingBalance = (float) ($openingBalance + $accountDebit - $accountCredit);
            
            $accountTotals[$accountData->id] = [
                'opening_balance' => $openingBalance,
                'total_debit' => (float) $accountDebit,
                'total_credit' => (float) $accountCredit,
                'closing_balance' => $closingBalance
            ];
            
            $grandTotalDebit += $accountDebit;
            $grandTotalCredit += $accountCredit;
        }

        $company = DB::table('companies')->where('id', $compId)->first();

        return Inertia::render('Accounts/GeneralLedger/Print', [
            'groupedData' => $groupedData,
            'accounts' => $accounts,
            'accountTotals' => $accountTotals,
            'account' => $account,
            'company' => $company,
            'totalDebit' => $grandTotalDebit,
            'totalCredit' => $grandTotalCredit,
            'filters' => [
                'account_id' => $accountId,
                'from_date' => $fromDate,
                'to_date' => $toDate
            ]
        ]);
    }

    /**
     * Export general ledger to Excel
     */
    public function exportExcel(Request $request)
    {
        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');
        $locationId = $request->input('user_location_id') ?? $request->session()->get('user_location_id');
        
        if (!$compId || !$locationId) {
            return response()->json(['error' => 'Company and Location information is required.'], 400);
        }

        // Get filter parameters
        $accountId = $request->input('account_id');
        $fromDate = $request->input('from_date');
        $toDate = $request->input('to_date');
        $search = $request->input('search');
        $currencyCode = $request->input('currency_code');
        $voucherType = $request->input('voucher_type');
        $status = $request->input('status', 'Posted');
        $minAmount = $request->input('min_amount');
        $maxAmount = $request->input('max_amount');

        // Get account details
        $account = null;
        if ($accountId) {
            $account = DB::table('chart_of_accounts')
                ->where('id', $accountId)
                ->where('comp_id', $compId)
                ->where('location_id', $locationId)
                ->first();
        }

        // Build query for ledger data
        $query = DB::table('transaction_entries')
            ->join('transactions', 'transaction_entries.transaction_id', '=', 'transactions.id')
            ->join('chart_of_accounts', 'transaction_entries.account_id', '=', 'chart_of_accounts.id')
            ->where('transactions.comp_id', $compId)
            ->where('transactions.location_id', $locationId);

        if ($accountId) {
            $query->where('transaction_entries.account_id', $accountId);
        }

        if ($fromDate) {
            $query->whereDate('transactions.voucher_date', '>=', $fromDate);
        }

        if ($toDate) {
            $query->whereDate('transactions.voucher_date', '<=', $toDate);
        }

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('transactions.description', 'like', "%{$search}%")
                  ->orWhere('transactions.voucher_number', 'like', "%{$search}%")
                  ->orWhere('chart_of_accounts.account_name', 'like', "%{$search}%");
            });
        }

        if ($currencyCode) {
            $query->where('transactions.currency_code', $currencyCode);
        }

        if ($voucherType) {
            $query->where('transactions.voucher_type', $voucherType);
        }

        if ($status && $status !== 'All') {
            $query->where('transactions.status', $status);
        }

        if ($minAmount) {
            $query->where('transaction_entries.amount', '>=', $minAmount);
        }

        if ($maxAmount) {
            $query->where('transaction_entries.amount', '<=', $maxAmount);
        }

        $ledgerData = $query->orderBy('chart_of_accounts.account_code', 'asc')
            ->orderBy('transactions.voucher_date', 'asc')
            ->orderBy('transactions.id', 'asc')
            ->get();

        // Group data by account (same logic as index method)
        $groupedData = [];
        $accounts = [];
        
        if ($accountId) {
            // Single account view
            if ($account) {
                $accounts = [$account];
                $groupedData[$accountId] = $ledgerData->toArray();
            }
        } else {
            // All accounts view - group by account
            $accountIds = $ledgerData->pluck('account_id')->unique();
            $accounts = DB::table('chart_of_accounts')
                ->whereIn('id', $accountIds)
                ->where('comp_id', $compId)
                ->where('location_id', $locationId)
                ->orderBy('account_code')
                ->get();
            
            foreach ($accounts as $accountData) {
                $accountTransactions = $ledgerData->where('account_id', $accountData->id)->values();
                $groupedData[$accountData->id] = $accountTransactions->toArray();
            }
        }

        // Calculate totals for each account
        $accountTotals = [];
        $grandTotalDebit = 0;
        $grandTotalCredit = 0;
        
        foreach ($accounts as $accountData) {
            $accountTransactions = $groupedData[$accountData->id] ?? [];
            $accountDebit = (float) collect($accountTransactions)->sum('base_debit_amount');
            $accountCredit = (float) collect($accountTransactions)->sum('base_credit_amount');
            $openingBalance = (float) ($accountData->opening_balance ?? 0);
            $closingBalance = (float) ($openingBalance + $accountDebit - $accountCredit);
            
            $accountTotals[$accountData->id] = [
                'opening_balance' => $openingBalance,
                'total_debit' => $accountDebit,
                'total_credit' => $accountCredit,
                'closing_balance' => $closingBalance
            ];
            
            $grandTotalDebit += $accountDebit;
            $grandTotalCredit += $accountCredit;
        }

        // Create CSV content with grouped structure
        $csvContent = "General Ledger Report\n";
        $csvContent .= "Date Range: " . ($fromDate ?: 'All') . " to " . ($toDate ?: 'All') . "\n";
        $csvContent .= "Generated: " . now()->format('Y-m-d H:i:s') . "\n\n";

        foreach ($accounts as $accountData) {
            $accountTransactions = $groupedData[$accountData->id] ?? [];
            $totals = $accountTotals[$accountData->id] ?? [];
            
            // Account header
            $csvContent .= "Account: " . $accountData->account_code . " - " . $accountData->account_name . "\n";
            $csvContent .= "Account Type: " . $accountData->account_type . "\n";
            $csvContent .= "Opening Balance: " . $totals['opening_balance'] . "\n\n";
            
            // Table headers
            $csvContent .= "Date,Voucher No,Voucher Type,Description,Debit,Credit,Balance\n";
            
            // Opening balance row
            if ($totals['opening_balance'] != 0) {
                $csvContent .= "Opening,-,Balance,Balance brought forward,0,0," . $totals['opening_balance'] . "\n";
            }
            
            // Transaction entries
            $runningBalance = $totals['opening_balance'];
            foreach ($accountTransactions as $entry) {
                $debit = (float) ($entry['base_debit_amount'] ?? 0);
                $credit = (float) ($entry['base_credit_amount'] ?? 0);
                $runningBalance = $runningBalance + $debit - $credit;
                
                $csvContent .= implode(',', [
                    $entry['voucher_date'],
                    $entry['voucher_number'],
                    $entry['voucher_type'] ?? 'JV',
                    '"' . str_replace('"', '""', $entry['description'] ?? '') . '"',
                    $debit,
                    $credit,
                    $runningBalance
                ]) . "\n";
            }
            
            // Account totals
            $csvContent .= ",,,Account Total," . $totals['total_debit'] . "," . $totals['total_credit'] . ",\n";
            $csvContent .= ",,,Closing Balance,,," . $totals['closing_balance'] . "\n\n";
        }

        // Grand totals
        if (count($accounts) > 1) {
            $csvContent .= "GRAND TOTALS - ALL ACCOUNTS\n";
            $csvContent .= "Total Debit:," . $grandTotalDebit . "\n";
            $csvContent .= "Total Credit:," . $grandTotalCredit . "\n";
            $csvContent .= "Net Balance:," . ($grandTotalDebit - $grandTotalCredit) . "\n";
        }

        $filename = 'general_ledger_' . ($account ? $account->account_code : 'all') . '_' . now()->format('Y_m_d_H_i_s') . '.csv';

        return response($csvContent)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
    }

    /**
     * Export general ledger to PDF
     */
    public function exportPDF(Request $request)
    {
        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');
        $locationId = $request->input('user_location_id') ?? $request->session()->get('user_location_id');
        
        if (!$compId || !$locationId) {
            return response()->json(['error' => 'Company and Location information is required.'], 400);
        }

        // Get filter parameters
        $accountId = $request->input('account_id');
        $fromDate = $request->input('from_date');
        $toDate = $request->input('to_date');
        $search = $request->input('search');
        $currencyCode = $request->input('currency_code');
        $voucherType = $request->input('voucher_type');
        $status = $request->input('status', 'Posted');
        $minAmount = $request->input('min_amount');
        $maxAmount = $request->input('max_amount');

        // Get account details
        $account = null;
        if ($accountId) {
            $account = DB::table('chart_of_accounts')
                ->where('id', $accountId)
                ->where('comp_id', $compId)
                ->where('location_id', $locationId)
                ->first();
        }

        // Get company details
        $company = DB::table('companies')
            ->where('id', $compId)
            ->first();

        // Build query for ledger data (same as index method)
        $query = DB::table('transaction_entries')
            ->join('transactions', 'transaction_entries.transaction_id', '=', 'transactions.id')
            ->join('chart_of_accounts', 'transaction_entries.account_id', '=', 'chart_of_accounts.id')
            ->where('transactions.comp_id', $compId)
            ->where('transactions.location_id', $locationId);

        if ($accountId) {
            $query->where('transaction_entries.account_id', $accountId);
        }

        if ($fromDate) {
            $query->whereDate('transactions.voucher_date', '>=', $fromDate);
        }

        if ($toDate) {
            $query->whereDate('transactions.voucher_date', '<=', $toDate);
        }

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('transactions.description', 'like', "%{$search}%")
                  ->orWhere('transactions.voucher_number', 'like', "%{$search}%")
                  ->orWhere('chart_of_accounts.account_name', 'like', "%{$search}%");
            });
        }

        if ($currencyCode) {
            $query->where('transactions.currency_code', $currencyCode);
        }

        if ($voucherType) {
            $query->where('transactions.voucher_type', $voucherType);
        }

        if ($status && $status !== 'All') {
            $query->where('transactions.status', $status);
        }

        if ($minAmount) {
            $query->where('transaction_entries.amount', '>=', $minAmount);
        }

        if ($maxAmount) {
            $query->where('transaction_entries.amount', '<=', $maxAmount);
        }

        $ledgerData = $query->select([
            'transaction_entries.account_id',
            'transaction_entries.base_debit_amount',
            'transaction_entries.base_credit_amount',
            'transactions.voucher_date',
            'transactions.voucher_number',
            'transactions.voucher_type',
            'transactions.description',
            'chart_of_accounts.account_name',
            'chart_of_accounts.account_code'
        ])
        ->orderBy('chart_of_accounts.account_code', 'asc')
        ->orderBy('transactions.voucher_date', 'asc')
        ->orderBy('transactions.id', 'asc')
        ->get();

        // Group data by account (same logic as index method)
        $groupedData = [];
        $accounts = [];
        
        if ($accountId) {
            // Single account view
            if ($account) {
                $accounts = [$account];
                $groupedData[$accountId] = $ledgerData->toArray();
            }
        } else {
            // All accounts view - group by account
            $accountIds = $ledgerData->pluck('account_id')->unique();
            $accounts = DB::table('chart_of_accounts')
                ->whereIn('id', $accountIds)
                ->where('comp_id', $compId)
                ->where('location_id', $locationId)
                ->orderBy('account_code')
                ->get();
            
            foreach ($accounts as $accountData) {
                $accountTransactions = $ledgerData->where('account_id', $accountData->id)->values();
                $groupedData[$accountData->id] = $accountTransactions->toArray();
            }
        }

        // Calculate totals for each account
        $accountTotals = [];
        $grandTotalDebit = 0;
        $grandTotalCredit = 0;
        
        foreach ($accounts as $accountData) {
            $accountTransactions = $groupedData[$accountData->id] ?? [];
            $accountDebit = (float) collect($accountTransactions)->sum('base_debit_amount');
            $accountCredit = (float) collect($accountTransactions)->sum('base_credit_amount');
            $openingBalance = (float) ($accountData->opening_balance ?? 0);
            $closingBalance = (float) ($openingBalance + $accountDebit - $accountCredit);
            
            $accountTotals[$accountData->id] = [
                'opening_balance' => $openingBalance,
                'total_debit' => $accountDebit,
                'total_credit' => $accountCredit,
                'closing_balance' => $closingBalance
            ];
            
            $grandTotalDebit += $accountDebit;
            $grandTotalCredit += $accountCredit;
        }

        return Inertia::render('Accounts/GeneralLedger/Print', [
            'groupedData' => $groupedData,
            'accounts' => $accounts,
            'accountTotals' => $accountTotals,
            'account' => $account,
            'company' => $company,
            'totalDebit' => $grandTotalDebit,
            'totalCredit' => $grandTotalCredit,
            'filters' => $request->all()
        ]);
    }
}


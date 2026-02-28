<?php

namespace App\Http\Controllers\Accounts;

use App\Http\Controllers\Controller;
use App\Http\Traits\CheckUserPermissions;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

/**
 * Accounts Module Dashboard Controller
 * 
 * Provides real-time financial data and analytics for the accounts dashboard
 */
class AccountsDashboardController extends Controller
{
    use CheckUserPermissions;

    /**
     * Display the accounts dashboard with real-time statistics
     */
    public function index(Request $request)
    {
        try {
            $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');
            $locationId = $request->input('user_location_id') ?? $request->session()->get('user_location_id');
            
            if (!$compId || !$locationId) {
                return Inertia::render('Modules/Accounts/index', [
                    'dashboardStats' => null,
                    'recentTransactions' => [],
                    'error' => 'Company and Location information is required. Please contact administrator.'
                ]);
            }

            // Get company information for currency
            $company = DB::table('companies')->where('id', $compId)->first();
            
            // Get currency symbol from currencies table
            $currencySymbol = '$'; // Default
            if ($company && $company->default_currency_code) {
                $currency = DB::table('currencies')
                    ->where('code', $company->default_currency_code)
                    ->first();
                if ($currency) {
                    $currencySymbol = $currency->symbol;
                }
            }

            // Calculate dashboard statistics
            $dashboardStats = $this->getDashboardStatistics($compId, $locationId, $currencySymbol);
            
            // Get recent transactions (last 10)
            $recentTransactions = $this->getRecentTransactions($compId, $locationId, $currencySymbol);

            // Get chart of accounts summary
            $accountsSummary = $this->getAccountsSummary($compId, $locationId);

            return Inertia::render('Modules/Accounts/index', [
                'dashboardStats' => $dashboardStats,
                'recentTransactions' => $recentTransactions,
                'accountsSummary' => $accountsSummary,
                'currencySymbol' => $currencySymbol
            ]);

        } catch (\Exception $e) {
            Log::error('Error loading accounts dashboard', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return Inertia::render('Modules/Accounts/index', [
                'dashboardStats' => null,
                'recentTransactions' => [],
                'error' => 'Unable to load dashboard data. Please try again.'
            ]);
        }
    }

    /**
     * Get dashboard statistics
     */
    private function getDashboardStatistics($compId, $locationId, $currencySymbol)
    {
        // Get current fiscal year dates (current year)
        $currentYear = date('Y');
        $yearStart = "{$currentYear}-01-01";
        $yearEnd = "{$currentYear}-12-31";

        // Total Revenue (Credit entries in Revenue accounts - typically Level 1 account_code = 4)
        // Revenue accounts have normal credit balance
        $totalRevenue = DB::table('transaction_entries as te')
            ->join('transactions as t', 'te.transaction_id', '=', 't.id')
            ->join('chart_of_accounts as coa', 'te.account_id', '=', 'coa.id')
            ->where('t.comp_id', $compId)
            ->where('t.location_id', $locationId)
            ->where('t.status', 'Posted')
            ->whereBetween('t.voucher_date', [$yearStart, $yearEnd])
            ->where('coa.account_code', 'LIKE', '4%') // Revenue accounts
            ->sum(DB::raw('te.credit_amount - te.debit_amount'));

        // Outstanding Invoices (Draft/Pending transactions)
        $outstandingInvoices = DB::table('transactions')
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->whereIn('status', ['Draft', 'Pending', 'Approved'])
            ->whereIn('voucher_type', ['Sales Invoice', 'Invoice'])
            ->sum('total_credit');

        // Pending Payments (Draft/Pending payment vouchers)
        $pendingPayments = DB::table('transactions')
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->whereIn('status', ['Draft', 'Pending', 'Approved'])
            ->whereIn('voucher_type', ['Payment', 'Cash Payment', 'Bank Payment'])
            ->sum('total_debit');

        // Calculate Profit Margin
        // Total Expenses (Debit entries in Expense accounts - typically Level 1 account_code = 5)
        $totalExpenses = DB::table('transaction_entries as te')
            ->join('transactions as t', 'te.transaction_id', '=', 't.id')
            ->join('chart_of_accounts as coa', 'te.account_id', '=', 'coa.id')
            ->where('t.comp_id', $compId)
            ->where('t.location_id', $locationId)
            ->where('t.status', 'Posted')
            ->whereBetween('t.voucher_date', [$yearStart, $yearEnd])
            ->where('coa.account_code', 'LIKE', '5%') // Expense accounts
            ->sum(DB::raw('te.debit_amount - te.credit_amount'));

        // Calculate profit and margin
        $profit = $totalRevenue - $totalExpenses;
        $profitMargin = $totalRevenue > 0 ? ($profit / $totalRevenue) * 100 : 0;

        // Get total number of posted transactions
        $totalTransactions = DB::table('transactions')
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->where('status', 'Posted')
            ->count();

        // Get total accounts
        $totalAccounts = DB::table('chart_of_accounts')
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->where('is_transactional', true)
            ->count();

        return [
            'totalRevenue' => [
                'value' => number_format(abs($totalRevenue), 2),
                'raw' => abs($totalRevenue),
                'currency' => $currencySymbol
            ],
            'outstandingInvoices' => [
                'value' => number_format($outstandingInvoices, 2),
                'raw' => $outstandingInvoices,
                'currency' => $currencySymbol,
                'count' => DB::table('transactions')
                    ->where('comp_id', $compId)
                    ->where('location_id', $locationId)
                    ->whereIn('status', ['Draft', 'Pending', 'Approved'])
                    ->whereIn('voucher_type', ['Sales Invoice', 'Invoice'])
                    ->count()
            ],
            'pendingPayments' => [
                'value' => number_format($pendingPayments, 2),
                'raw' => $pendingPayments,
                'currency' => $currencySymbol,
                'count' => DB::table('transactions')
                    ->where('comp_id', $compId)
                    ->where('location_id', $locationId)
                    ->whereIn('status', ['Draft', 'Pending', 'Approved'])
                    ->whereIn('voucher_type', ['Payment', 'Cash Payment', 'Bank Payment'])
                    ->count()
            ],
            'profitMargin' => [
                'value' => number_format($profitMargin, 1),
                'raw' => $profitMargin,
                'profit' => number_format($profit, 2),
                'profitRaw' => $profit
            ],
            'totalTransactions' => $totalTransactions,
            'totalAccounts' => $totalAccounts
        ];
    }

    /**
     * Get recent transactions for the dashboard
     */
    private function getRecentTransactions($compId, $locationId, $currencySymbol, $limit = 10)
    {
        $transactions = DB::table('transactions')
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->where('status', 'Posted')
            ->orderBy('posted_at', 'desc')
            ->limit($limit)
            ->get();

        return $transactions->map(function ($transaction) use ($currencySymbol) {
            // Determine transaction type and amount
            $isCredit = $transaction->total_credit > $transaction->total_debit;
            $amount = $isCredit ? $transaction->total_credit : $transaction->total_debit;
            
            // Determine icon and color based on voucher type
            $type = $this->getTransactionType($transaction->voucher_type);
            
            // Calculate time ago
            $timeAgo = $this->getTimeAgo($transaction->posted_at ?? $transaction->created_at);

            return [
                'id' => $transaction->id,
                'type' => $type['label'],
                'description' => $transaction->description,
                'reference' => $transaction->reference_number ?? $transaction->voucher_number,
                'amount' => number_format($amount, 2),
                'amountRaw' => $amount,
                'isCredit' => $isCredit,
                'currency' => $currencySymbol,
                'date' => $transaction->voucher_date,
                'timeAgo' => $timeAgo,
                'icon' => $type['icon'],
                'color' => $type['color']
            ];
        })->toArray();
    }

    /**
     * Get chart of accounts summary by level
     */
    private function getAccountsSummary($compId, $locationId)
    {
        return [
            'totalAccounts' => DB::table('chart_of_accounts')
                ->where('comp_id', $compId)
                ->where('location_id', $locationId)
                ->count(),
            'transactionalAccounts' => DB::table('chart_of_accounts')
                ->where('comp_id', $compId)
                ->where('location_id', $locationId)
                ->where('is_transactional', true)
                ->count(),
            'byLevel' => DB::table('chart_of_accounts')
                ->where('comp_id', $compId)
                ->where('location_id', $locationId)
                ->select('account_level', DB::raw('COUNT(*) as count'))
                ->groupBy('account_level')
                ->orderBy('account_level')
                ->get()
                ->toArray()
        ];
    }

    /**
     * Get transaction type information
     */
    private function getTransactionType($voucherType)
    {
        $types = [
            'Journal' => ['label' => 'Journal Entry', 'icon' => 'FileText', 'color' => 'blue'],
            'Payment' => ['label' => 'Payment', 'icon' => 'CreditCard', 'color' => 'red'],
            'Receipt' => ['label' => 'Receipt', 'icon' => 'DollarSign', 'color' => 'green'],
            'Sales Invoice' => ['label' => 'Sales Invoice', 'icon' => 'FileText', 'color' => 'green'],
            'Invoice' => ['label' => 'Invoice', 'icon' => 'FileText', 'color' => 'green'],
            'Purchase Invoice' => ['label' => 'Purchase Invoice', 'icon' => 'Receipt', 'color' => 'red'],
            'Cash Payment' => ['label' => 'Cash Payment', 'icon' => 'Banknote', 'color' => 'red'],
            'Bank Payment' => ['label' => 'Bank Payment', 'icon' => 'CreditCard', 'color' => 'red'],
            'Opening' => ['label' => 'Opening Balance', 'icon' => 'Star', 'color' => 'purple'],
        ];

        return $types[$voucherType] ?? ['label' => $voucherType, 'icon' => 'FileText', 'color' => 'gray'];
    }

    /**
     * Calculate time ago from timestamp
     */
    private function getTimeAgo($datetime)
    {
        if (!$datetime) return 'Unknown';
        
        $timestamp = strtotime($datetime);
        $diff = time() - $timestamp;
        
        if ($diff < 60) {
            return 'Just now';
        } elseif ($diff < 3600) {
            $minutes = floor($diff / 60);
            return $minutes . ' minute' . ($minutes > 1 ? 's' : '') . ' ago';
        } elseif ($diff < 86400) {
            $hours = floor($diff / 3600);
            return $hours . ' hour' . ($hours > 1 ? 's' : '') . ' ago';
        } elseif ($diff < 604800) {
            $days = floor($diff / 86400);
            return $days . ' day' . ($days > 1 ? 's' : '') . ' ago';
        } elseif ($diff < 2592000) {
            $weeks = floor($diff / 604800);
            return $weeks . ' week' . ($weeks > 1 ? 's' : '') . ' ago';
        } else {
            return date('M d, Y', $timestamp);
        }
    }
}

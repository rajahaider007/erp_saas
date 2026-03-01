<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Http\Traits\CheckUserPermissions;
use App\Helpers\CompanyHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Cash Book Report Controller
 * 
 * Generates comprehensive Cash Book reports following IFRS standards
 * - IAS 7: Statement of Cash Flows (cash tracking)
 * - Track cash and bank account transactions
 * - Bank/Cash account reconciliation
 * - Opening balance, receipts, payments, closing balance
 * - Support for multiple bank and cash accounts
 */
class CashBookReportController extends Controller
{
    use CheckUserPermissions;

    /**
     * Display Cash Book report search/filter page
     * 
     * @return Response
     */
    public function search(Request $request): Response
    {
        $isParentCompany = CompanyHelper::isCurrentCompanyParent();

        $compId = $isParentCompany
            ? ($request->input('comp_id') ?? $request->session()->get('user_comp_id'))
            : $request->session()->get('user_comp_id');

        $locationId = $isParentCompany
            ? ($request->input('location_id') ?? $request->session()->get('user_location_id'))
            : $request->session()->get('user_location_id');

        // Get companies (only for parent company)
        $companies = [];
        if ($isParentCompany) {
            $companies = DB::table('companies')
                ->where('status', 1)
                ->select('id', 'company_name')
                ->orderBy('company_name')
                ->get();
        }

        // Get locations
        $locations = [];
        if ($compId) {
            $locations = DB::table('locations')
                ->where('company_id', $compId)
                ->where('status', 1)
                ->select('id', 'location_name')
                ->orderBy('location_name')
                ->get();
        }

        // Get Bank/Cash accounts for dropdown using account_configurations table
        $cashAccounts = [];
        if ($compId && $locationId) {
            $cashAccounts = DB::table('chart_of_accounts as coa')
                ->join('account_configurations as ac', 'coa.id', '=', 'ac.account_id')
                ->where('coa.comp_id', $compId)
                ->where('coa.location_id', $locationId)
                ->where('coa.status', 'Active')
                ->where('coa.is_transactional', true)
                ->where('ac.comp_id', $compId)
                ->where('ac.location_id', $locationId)
                ->where('ac.is_active', true)
                ->whereIn('ac.config_type', ['cash', 'bank', 'petty_cash'])
                ->select('coa.id', 'coa.account_code', 'coa.account_name')
                ->distinct()
                ->orderBy('coa.account_code')
                ->get();
        }

        return Inertia::render('Reports/CashBook/Search', [
            'companies' => $companies,
            'locations' => $locations,
            'cashAccounts' => $cashAccounts,
            'isParentCompany' => $isParentCompany,
        ]);
    }

    /**
     * Display Cash Book report
     * 
     * Features:
     * - View cash transactions for specific account or all cash/bank accounts
     * - Date-wise transaction listing
     * - Opening balance, receipts, payments, closing balance
     * - Multi-currency support
     * - Bank reconciliation support
     * 
     * @return Response
     */
    public function index(Request $request): Response
    {
        $isParentCompany = CompanyHelper::isCurrentCompanyParent();

        $compId = $isParentCompany
            ? ($request->input('comp_id') ?? $request->session()->get('user_comp_id'))
            : $request->session()->get('user_comp_id');

        $locationId = $isParentCompany
            ? ($request->input('location_id') ?? $request->session()->get('user_location_id'))
            : $request->session()->get('user_location_id');

        if (!$compId || !$locationId) {
            return Inertia::render('Reports/CashBook/Report', [
                'cashBookData' => [],
                'accounts' => [],
                'filters' => [],
                'error' => 'Company and Location information is required.'
            ]);
        }

        // Get filters
        $accountId = $request->input('account_id');
        $fromDate = $request->input('from_date');
        $toDate = $request->input('to_date');
        $viewType = $request->input('view_type', 'summary'); // summary or detailed
        $search = $request->input('search');

        // Get company info
        $company = DB::table('companies')->where('id', $compId)->first();

        // Get cash/bank accounts using account_configurations table
        $cashAccountsQuery = DB::table('chart_of_accounts as coa')
            ->join('account_configurations as ac', 'coa.id', '=', 'ac.account_id')
            ->where('coa.comp_id', $compId)
            ->where('coa.location_id', $locationId)
            ->where('coa.status', 'Active')
            ->where('coa.is_transactional', true)
            ->where('ac.comp_id', $compId)
            ->where('ac.location_id', $locationId)
            ->where('ac.is_active', true)
            ->whereIn('ac.config_type', ['cash', 'bank', 'petty_cash']);

        // Filter by account if specified
        if ($accountId) {
            $cashAccountsQuery->where('coa.id', $accountId);
        }

        $cashAccounts = $cashAccountsQuery
            ->select('coa.id', 'coa.account_code', 'coa.account_name', 'coa.currency')
            ->distinct()
            ->orderBy('coa.account_code')
            ->get();

        if ($cashAccounts->isEmpty()) {
            return Inertia::render('Reports/CashBook/Report', [
                'cashBookData' => [],
                'accounts' => [],
                'filters' => [
                    'account_id' => $accountId,
                    'from_date' => $fromDate,
                    'to_date' => $toDate,
                    'view_type' => $viewType,
                    'search' => $search,
                ],
                'error' => 'No cash or bank accounts found.'
            ]);
        }

        // Build cash book data
        $cashBookData = [];
        $totalReceipts = 0;
        $totalPayments = 0;
        $totalClosingBalance = 0;

        foreach ($cashAccounts as $account) {
            $accountData = $this->getCashBookForAccount(
                $account->id,
                $compId,
                $locationId,
                $fromDate,
                $toDate,
                $search,
                $viewType
            );

            $cashBookData[] = [
                'account_id' => $account->id,
                'account_code' => $account->account_code,
                'account_name' => $account->account_name,
                'currency' => $account->currency,
                'transactions' => $accountData['transactions'],
                'summary' => $accountData['summary'],
            ];

            $totalReceipts += $accountData['summary']['total_receipts'];
            $totalPayments += $accountData['summary']['total_payments'];
            $totalClosingBalance += $accountData['summary']['closing_balance'];
        }

        // Get all available cash accounts for filter dropdown using account_configurations
        $availableCashAccounts = DB::table('chart_of_accounts as coa')
            ->join('account_configurations as ac', 'coa.id', '=', 'ac.account_id')
            ->where('coa.comp_id', $compId)
            ->where('coa.location_id', $locationId)
            ->where('coa.status', 'Active')
            ->where('coa.is_transactional', true)
            ->where('ac.comp_id', $compId)
            ->where('ac.location_id', $locationId)
            ->where('ac.is_active', true)
            ->whereIn('ac.config_type', ['cash', 'bank', 'petty_cash'])
            ->select('coa.id', 'coa.account_code', 'coa.account_name')
            ->distinct()
            ->orderBy('coa.account_code')
            ->get();

        return Inertia::render('Reports/CashBook/Report', [
            'cashBookData' => $cashBookData,
            'accounts' => $availableCashAccounts,
            'filters' => [
                'account_id' => $accountId,
                'from_date' => $fromDate,
                'to_date' => $toDate,
                'view_type' => $viewType,
                'search' => $search,
            ],
            'totals' => [
                'total_receipts' => (float) $totalReceipts,
                'total_payments' => (float) $totalPayments,
                'total_closing_balance' => (float) $totalClosingBalance,
            ],
            'company' => $company,
        ]);
    }

    /**
     * Get cash book for a specific account
     * 
     * @param int $accountId
     * @param int $compId
     * @param int $locationId
     * @param string|null $fromDate
     * @param string|null $toDate
     * @param string|null $search
     * @param string $viewType
     * @return array
     */
    private function getCashBookForAccount($accountId, $compId, $locationId, $fromDate = null, $toDate = null, $search = null, $viewType = 'summary'): array
    {
        // Get account info
        $account = DB::table('chart_of_accounts')
            ->where('id', $accountId)
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->first();

        // Calculate opening balance from transactions before the from_date
        $openingBalance = 0;
        if ($fromDate) {
            $beforeFromDate = DB::table('transaction_entries as te')
                ->join('transactions as t', 'te.transaction_id', '=', 't.id')
                ->where('te.account_id', $accountId)
                ->where('t.comp_id', $compId)
                ->where('t.location_id', $locationId)
                ->where('t.status', 'Posted')
                ->where('t.voucher_date', '<', $fromDate)
                ->select(
                    DB::raw('COALESCE(SUM(te.base_debit_amount), 0) as total_debit'),
                    DB::raw('COALESCE(SUM(te.base_credit_amount), 0) as total_credit')
                )
                ->first();
            
            if ($beforeFromDate) {
                $openingBalance = (float)($beforeFromDate->total_debit - $beforeFromDate->total_credit);
            }
        }

        // Build query for transactions
        $query = DB::table('transaction_entries as te')
            ->join('transactions as t', 'te.transaction_id', '=', 't.id')
            ->where('te.account_id', $accountId)
            ->where('t.comp_id', $compId)
            ->where('t.location_id', $locationId)
            ->where('t.status', 'Posted')
            ->select(
                'te.id',
                'te.base_debit_amount as debit',
                'te.base_credit_amount as credit',
                'te.description as entry_description',
                't.voucher_number',
                't.voucher_date',
                't.voucher_type',
                't.reference_number',
                't.description as voucher_description',
                'te.currency_code',
                'te.exchange_rate'
            );

        // Apply date filters
        if ($fromDate) {
            $query->where('t.voucher_date', '>=', $fromDate);
        }
        if ($toDate) {
            $query->where('t.voucher_date', '<=', $toDate);
        }

        // Apply search filter
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('t.voucher_number', 'like', "%{$search}%")
                  ->orWhere('t.description', 'like', "%{$search}%")
                  ->orWhere('t.reference_number', 'like', "%{$search}%")
                  ->orWhere('te.description', 'like', "%{$search}%");
            });
        }

        $transactions = $query->orderBy('t.voucher_date', 'asc')
            ->orderBy('t.id', 'asc')
            ->get();

        // Build transaction list with running balance
        $cashBookTransactions = [];
        $runningBalance = $openingBalance;
        $totalReceipts = 0;
        $totalPayments = 0;

        foreach ($transactions as $transaction) {
            $receipt = (float) $transaction->debit; // Cash in (debit to asset)
            $payment = (float) $transaction->credit; // Cash out (credit to asset)

            $runningBalance += $receipt - $payment;
            $totalReceipts += $receipt;
            $totalPayments += $payment;

            // For detailed view, show all transaction details
            $cashBookTransactions[] = [
                'voucher_number' => $transaction->voucher_number,
                'voucher_date' => $transaction->voucher_date,
                'voucher_type' => $transaction->voucher_type,
                'reference_number' => $transaction->reference_number,
                'description' => $transaction->entry_description ?? $transaction->voucher_description,
                'receipt' => (float) $receipt,
                'payment' => (float) $payment,
                'balance' => (float) $runningBalance,
                'currency' => $transaction->currency_code,
            ];
        }

        $closingBalance = $openingBalance + $totalReceipts - $totalPayments;

        return [
            'transactions' => $cashBookTransactions,
            'summary' => [
                'opening_balance' => (float) $openingBalance,
                'total_receipts' => (float) $totalReceipts,
                'total_payments' => (float) $totalPayments,
                'closing_balance' => (float) $closingBalance,
                'transaction_count' => count($cashBookTransactions),
            ]
        ];
    }
}

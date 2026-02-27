<?php

namespace App\Http\Controllers\Accounts;

use App\Http\Controllers\Controller;
use App\Http\Traits\CheckUserPermissions;
use App\Helpers\CompanyHelper;
use App\Helpers\FiscalYearHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class BalanceSheetController extends Controller
{
    use CheckUserPermissions;

    /**
     * Display Balance Sheet (Statement of Financial Position - IAS 1)
     */
    public function index(Request $request): Response
    {
        $compId = $request->input('comp_id') ?? $request->session()->get('user_comp_id');
        $locationId = $request->input('location_id') ?? $request->session()->get('user_location_id');
        $asAtDate = $request->input('as_at_date', now()->toDateString());
        $comparativeDate = $request->input('comparative_date'); // For comparative balance sheet

        if (!$compId || !$locationId) {
            return Inertia::render('Accounts/BalanceSheet/Report', [
                'balanceSheetData' => [],
                'error' => 'Company and Location information is required.'
            ]);
        }

        // Get company and currency info
        $company = DB::table('companies')->where('id', $compId)->first();
        
        // Get fiscal year for as at date
        $fiscalYear = FiscalYearHelper::getFiscalYear($asAtDate, $compId);

        // Build balance sheet data
        $balanceSheetData = $this->buildBalanceSheet($compId, $locationId, $asAtDate, $fiscalYear, $company);

        // Get comparative data if requested
        $comparativeData = null;
        if ($comparativeDate) {
            $comparativeFiscalYear = FiscalYearHelper::getFiscalYear($comparativeDate, $compId);
            $comparativeData = $this->buildBalanceSheet($compId, $locationId, $comparativeDate, $comparativeFiscalYear, $company);
        }

        return Inertia::render('Accounts/BalanceSheet/Report', [
            'company' => $company,
            'balanceSheetData' => $balanceSheetData,
            'comparativeData' => $comparativeData,
            'asAtDate' => $asAtDate,
            'comparativeDate' => $comparativeDate,
            'fiscalYear' => $fiscalYear,
            'currencyCode' => $company->default_currency_code ?? 'PKR'
        ]);
    }

    /**
     * Build balance sheet structure according to IAS 1
     * Structure:
     * - ASSETS
     *   - Current Assets
     *     - Account 1
     *     - Account 2
     *   - Non-Current Assets
     *     - Account 3
     * - LIABILITIES
     *   - Current Liabilities
     *   - Non-Current Liabilities
     * - EQUITY
     *   - Share Capital
     *   - Retained Earnings
     *   - Reserves
     */
    private function buildBalanceSheet($compId, $locationId, $asAtDate, $fiscalYear, $company)
    {
        $balanceSheet = [
            'assets' => [
                'current' => [
                    'label' => 'Current Assets',
                    'accounts' => [],
                    'total' => 0,
                    'code_range' => ['100010000000000', '100999999999999'] // Assets - Current
                ],
                'non_current' => [
                    'label' => 'Non-Current Assets',
                    'accounts' => [],
                    'total' => 0,
                    'code_range' => ['101010000000000', '199999999999999'] // Assets - Non-Current
                ]
            ],
            'liabilities' => [
                'current' => [
                    'label' => 'Current Liabilities',
                    'accounts' => [],
                    'total' => 0,
                    'code_range' => ['200010000000000', '200999999999999']
                ],
                'non_current' => [
                    'label' => 'Non-Current Liabilities',
                    'accounts' => [],
                    'total' => 0,
                    'code_range' => ['201010000000000', '299999999999999']
                ]
            ],
            'equity' => [
                'share_capital' => [
                    'label' => 'Share Capital',
                    'accounts' => [],
                    'total' => 0,
                    'code_range' => ['300010000000000', '300099999999999']
                ],
                'reserves' => [
                    'label' => 'Reserves',
                    'accounts' => [],
                    'total' => 0,
                    'code_range' => ['300100000000000', '300199999999999']
                ],
                'retained_earnings' => [
                    'label' => 'Retained Earnings / Accumulated Results',
                    'accounts' => [],
                    'total' => 0,
                    'code_range' => ['300200000000000', '300999999999999']
                ]
            ]
        ];

        // Get all transactional accounts
        $accounts = DB::table('chart_of_accounts as coa')
            ->leftJoin('transaction_entries as te', 'coa.id', '=', 'te.account_id')
            ->leftJoin('transactions as t', 'te.transaction_id', '=', 't.id')
            ->where('coa.comp_id', $compId)
            ->where('coa.location_id', $locationId)
            ->where('coa.account_level', 4)
            ->where('coa.is_transactional', true)
            ->select(
                'coa.id',
                'coa.account_code',
                'coa.account_name',
                'coa.account_type',
                DB::raw('COALESCE(SUM(te.base_debit_amount), 0) as debit_total'),
                DB::raw('COALESCE(SUM(te.base_credit_amount), 0) as credit_total')
            )
            ->where(function($q) use ($asAtDate, $fiscalYear) {
                $q->whereNull('t.id')
                  ->orWhere(function($subq) use ($asAtDate, $fiscalYear) {
                      $subq->where('t.fiscal_year', '<=', $fiscalYear)
                           ->where('t.voucher_date', '<=', $asAtDate)
                           ->where('t.status', 'Posted');
                  });
            })
            ->groupBy('coa.id', 'coa.account_code', 'coa.account_name', 'coa.account_type')
            ->orderBy('coa.account_code')
            ->get();

        // Distribute accounts to balance sheet sections
        foreach ($accounts as $account) {
            $balance = $this->calculateAccountBalance($account);

            if ($balance == 0) {
                continue; // Skip zero-balance accounts
            }

            $accountData = [
                'code' => $account->account_code,
                'name' => $account->account_name,
                'type' => $account->account_type,
                'balance' => $balance
            ];

            // Determine account section based on code ranges and type
            if (in_array($account->account_type, ['Asset', 'Current Asset', 'Fixed Asset', 'Investment', 'Tangible Asset', 'Intangible Asset'])) {
                if (in_array($account->account_type, ['Current Asset'])) {
                    $balanceSheet['assets']['current']['accounts'][] = $accountData;
                    $balanceSheet['assets']['current']['total'] += $balance;
                } else {
                    $balanceSheet['assets']['non_current']['accounts'][] = $accountData;
                    $balanceSheet['assets']['non_current']['total'] += $balance;
                }
            } elseif (in_array($account->account_type, ['Liability', 'Current Liability', 'Long Term Liability', 'Payable'])) {
                if (in_array($account->account_type, ['Current Liability'])) {
                    $balanceSheet['liabilities']['current']['accounts'][] = $accountData;
                    $balanceSheet['liabilities']['current']['total'] += $balance;
                } else {
                    $balanceSheet['liabilities']['non_current']['accounts'][] = $accountData;
                    $balanceSheet['liabilities']['non_current']['total'] += $balance;
                }
            } elseif (in_array($account->account_type, ['Equity', 'Share Capital', 'Reserve', 'Retained Earnings'])) {
                if ($account->account_type === 'Share Capital') {
                    $balanceSheet['equity']['share_capital']['accounts'][] = $accountData;
                    $balanceSheet['equity']['share_capital']['total'] += $balance;
                } elseif ($account->account_type === 'Reserve') {
                    $balanceSheet['equity']['reserves']['accounts'][] = $accountData;
                    $balanceSheet['equity']['reserves']['total'] += $balance;
                } else {
                    $balanceSheet['equity']['retained_earnings']['accounts'][] = $accountData;
                    $balanceSheet['equity']['retained_earnings']['total'] += $balance;
                }
            }
        }

        // Calculate totals
        $totalAssets = $balanceSheet['assets']['current']['total'] + $balanceSheet['assets']['non_current']['total'];
        $totalLiabilities = $balanceSheet['liabilities']['current']['total'] + $balanceSheet['liabilities']['non_current']['total'];
        $totalEquity = $balanceSheet['equity']['share_capital']['total'] + 
                       $balanceSheet['equity']['reserves']['total'] + 
                       $balanceSheet['equity']['retained_earnings']['total'];

        return [
            'assets' => $balanceSheet['assets'],
            'liabilities' => $balanceSheet['liabilities'],
            'equity' => $balanceSheet['equity'],
            'totalAssets' => $totalAssets,
            'totalLiabilities' => $totalLiabilities,
            'totalEquity' => $totalEquity,
            'totalLiabilitiesAndEquity' => $totalLiabilities + $totalEquity,
            'balancingCheck' => $totalAssets - ($totalLiabilities + $totalEquity) // Should be 0
        ];
    }

    /**
     * Calculate account balance based on debit/credit
     * Assets and Expenses: Debit - Credit
     * Liabilities, Equity, Revenue: Credit - Debit
     */
    private function calculateAccountBalance($account)
    {
        $debit = $account->debit_total ?? 0;
        $credit = $account->credit_total ?? 0;

        // Balance sheet accounts
        if (in_array($account->account_type, ['Asset', 'Current Asset', 'Fixed Asset', 'Investment', 'Tangible Asset', 'Intangible Asset'])) {
            return $debit - $credit;
        } elseif (in_array($account->account_type, ['Liability', 'Current Liability', 'Long Term Liability', 'Payable', 'Equity', 'Share Capital', 'Reserve', 'Retained Earnings'])) {
            return $credit - $debit;
        }

        return $debit - $credit;
    }
}

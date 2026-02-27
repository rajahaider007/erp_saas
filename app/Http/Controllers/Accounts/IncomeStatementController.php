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

class IncomeStatementController extends Controller
{
    use CheckUserPermissions;

    /**
     * Display Income Statement (Statement of Comprehensive Income - IAS 1)
     */
    public function index(Request $request): Response
    {
        $compId = $request->input('comp_id') ?? $request->session()->get('user_comp_id');
        $locationId = $request->input('location_id') ?? $request->session()->get('user_location_id');
        $fromDate = $request->input('from_date');
        $toDate = $request->input('to_date');

        if (!$compId || !$locationId) {
            return Inertia::render('Accounts/IncomeStatement/Report', [
                'incomeStatementData' => [],
                'error' => 'Company and Location information is required.'
            ]);
        }

        // Default to current fiscal year if not provided
        if (!$fromDate || !$toDate) {
            $currentFiscalYear = FiscalYearHelper::getCurrentFiscalYear($compId);
            $fiscalYearDates = FiscalYearHelper::getFiscalYearDates($currentFiscalYear, $compId);
            $toDate = $toDate ?? now()->toDateString();
            $fromDate = $fromDate ?? $fiscalYearDates['start_date']->toDateString();
        }

        // Get company info
        $company = DB::table('companies')->where('id', $compId)->first();
        
        // Get fiscal year for periods
        $fromFiscalYear = FiscalYearHelper::getFiscalYear($fromDate, $compId);
        $toFiscalYear = FiscalYearHelper::getFiscalYear($toDate, $compId);

        // Build income statement data
        $incomeStatementData = $this->buildIncomeStatement($compId, $locationId, $fromDate, $toDate, $fromFiscalYear, $toFiscalYear, $company);

        return Inertia::render('Accounts/IncomeStatement/Report', [
            'company' => $company,
            'incomeStatementData' => $incomeStatementData,
            'fromDate' => $fromDate,
            'toDate' => $toDate,
            'fromFiscalYear' => $fromFiscalYear,
            'toFiscalYear' => $toFiscalYear,
            'fiscalYear' => $toFiscalYear,
            'currencyCode' => $company->default_currency_code ?? 'PKR'
        ]);
    }

    /**
     * Build income statement structure according to IAS 1
     * 
     * Structure (Multi-Step Format):
     * 1. OPERATING REVENUE
     *    - Sales Revenue
     *    - Service Revenue
     *    - Other Operating Revenue
     * 2. COST OF GOODS SOLD
     *    - Opening Inventory
     *    - Purchases
     *    - Cost of Materials
     *    - Less: Closing Inventory
     * 3. GROSS PROFIT (Revenue - COGS)
     * 4. OPERATING EXPENSES
     *    - Selling Expenses
     *    - Distribution Expenses
     *    - Administrative Expenses
     * 5. OPERATING PROFIT
     * 6. NON-OPERATING ITEMS
     *    - Interest Revenue
     *    - Interest Expense
     *    - Other Income
     *    - Other Expenses
     * 7. PROFIT BEFORE TAX
     * 8. INCOME TAX EXPENSE
     * 9. PROFIT FOR THE PERIOD
     * 10. OTHER COMPREHENSIVE INCOME
     * 11. TOTAL COMPREHENSIVE INCOME
     */
    private function buildIncomeStatement($compId, $locationId, $fromDate, $toDate, $fromFiscalYear, $toFiscalYear, $company)
    {
        $incomeStatement = [
            'revenue' => [
                'sales' => [
                    'label' => 'Sales Revenue',
                    'accounts' => [],
                    'total' => 0
                ],
                'services' => [
                    'label' => 'Service Revenue',
                    'accounts' => [],
                    'total' => 0
                ],
                'other_operating' => [
                    'label' => 'Other Operating Revenue',
                    'accounts' => [],
                    'total' => 0
                ]
            ],
            'cost_of_goods_sold' => [
                'opening_inventory' => [
                    'label' => 'Opening Inventory',
                    'amount' => 0
                ],
                'purchases' => [
                    'label' => 'Purchases & Cost of Materials',
                    'accounts' => [],
                    'total' => 0
                ],
                'direct_expenses' => [
                    'label' => 'Direct Expenses',
                    'accounts' => [],
                    'total' => 0
                ],
                'closing_inventory' => [
                    'label' => 'Closing Inventory',
                    'amount' => 0
                ]
            ],
            'operating_expenses' => [
                'selling' => [
                    'label' => 'Selling Expenses',
                    'accounts' => [],
                    'total' => 0
                ],
                'distribution' => [
                    'label' => 'Distribution Expenses',
                    'accounts' => [],
                    'total' => 0
                ],
                'administrative' => [
                    'label' => 'Administrative Expenses',
                    'accounts' => [],
                    'total' => 0
                ],
                'depreciation' => [
                    'label' => 'Depreciation & Amortization',
                    'accounts' => [],
                    'total' => 0
                ]
            ],
            'finance_items' => [
                'interest_revenue' => [
                    'label' => 'Interest Revenue',
                    'accounts' => [],
                    'total' => 0
                ],
                'interest_expense' => [
                    'label' => 'Interest Expense',
                    'accounts' => [],
                    'total' => 0
                ],
                'other_income' => [
                    'label' => 'Other Income',
                    'accounts' => [],
                    'total' => 0
                ],
                'other_expenses' => [
                    'label' => 'Other Expenses',
                    'accounts' => [],
                    'total' => 0
                ]
            ],
            'tax_and_profit' => [
                'tax_expense' => [
                    'label' => 'Income Tax Expense',
                    'accounts' => [],
                    'total' => 0
                ]
            ]
        ];

        // Get all revenue and expense accounts
        $accounts = DB::table('chart_of_accounts as coa')
            ->leftJoin('transactions as t', 'coa.id', '=', 't.account_id')
            ->where('coa.comp_id', $compId)
            ->where('coa.location_id', $locationId)
            ->where('coa.account_level', 4)
            ->where('coa.is_transactional', true)
            ->select(
                'coa.id',
                'coa.account_code',
                'coa.account_name',
                'coa.account_type',
                DB::raw('COALESCE(SUM(t.base_debit_amount), 0) as debit_total'),
                DB::raw('COALESCE(SUM(t.base_credit_amount), 0) as credit_total')
            )
            ->where(function($q) use ($fromDate, $toDate, $fromFiscalYear, $toFiscalYear) {
                $q->whereNull('t.id')
                  ->orWhere(function($subq) use ($fromDate, $toDate, $fromFiscalYear, $toFiscalYear) {
                      $subq->whereBetween('t.fiscal_year', [(string)$fromFiscalYear, (string)$toFiscalYear])
                           ->whereBetween('t.voucher_date', [$fromDate, $toDate])
                           ->where('t.status', 'Posted');
                  });
            })
            ->groupBy('coa.id', 'coa.account_code', 'coa.account_name', 'coa.account_type')
            ->orderBy('coa.account_code')
            ->get();

        // Distribute accounts to income statement sections
        foreach ($accounts as $account) {
            // For income statement: Revenue is credit balance, Expenses are debit balance
            $balance = $this->calculateIncomeStatementBalance($account);

            if ($balance == 0) {
                continue; // Skip zero-balance accounts
            }

            $accountData = [
                'code' => $account->account_code,
                'name' => $account->account_name,
                'type' => $account->account_type,
                'amount' => $balance
            ];

            // Classify account based on type
            if (in_array($account->account_type, ['Revenue', 'Sales Revenue', 'Service Revenue', 'Investment Revenue', 'Dividend Revenue'])) {
                if ($account->account_type === 'Sales Revenue') {
                    $incomeStatement['revenue']['sales']['accounts'][] = $accountData;
                    $incomeStatement['revenue']['sales']['total'] += $balance;
                } elseif ($account->account_type === 'Service Revenue') {
                    $incomeStatement['revenue']['services']['accounts'][] = $accountData;
                    $incomeStatement['revenue']['services']['total'] += $balance;
                } else {
                    $incomeStatement['revenue']['other_operating']['accounts'][] = $accountData;
                    $incomeStatement['revenue']['other_operating']['total'] += $balance;
                }
            } elseif (in_array($account->account_type, ['Cost of Goods Sold', 'Cost of Sales', 'Material Cost', 'Labor Cost', 'Manufacturing'])) {
                $incomeStatement['cost_of_goods_sold']['purchases']['accounts'][] = $accountData;
                $incomeStatement['cost_of_goods_sold']['purchases']['total'] += $balance;
            } elseif (in_array($account->account_type, ['Operating Expense', 'Selling Expense', 'Consulting Expense', 'Marketing Expense', 'Advertising Expense'])) {
                $incomeStatement['operating_expenses']['selling']['accounts'][] = $accountData;
                $incomeStatement['operating_expenses']['selling']['total'] += $balance;
            } elseif (in_array($account->account_type, ['Distribution Expense', 'Freight Expense', 'Logistics Expense', 'Delivery Expense'])) {
                $incomeStatement['operating_expenses']['distribution']['accounts'][] = $accountData;
                $incomeStatement['operating_expenses']['distribution']['total'] += $balance;
            } elseif (in_array($account->account_type, ['Administrative Expense', 'Salaries & Wages', 'Office Expense', 'Utility Expense', 'Rent Expense', 'Insurance Expense'])) {
                $incomeStatement['operating_expenses']['administrative']['accounts'][] = $accountData;
                $incomeStatement['operating_expenses']['administrative']['total'] += $balance;
            } elseif (in_array($account->account_type, ['Depreciation', 'Amortization', 'Depreciation Expense', 'Amortization Expense'])) {
                $incomeStatement['operating_expenses']['depreciation']['accounts'][] = $accountData;
                $incomeStatement['operating_expenses']['depreciation']['total'] += $balance;
            } elseif ($account->account_type === 'Interest Revenue') {
                $incomeStatement['finance_items']['interest_revenue']['accounts'][] = $accountData;
                $incomeStatement['finance_items']['interest_revenue']['total'] += $balance;
            } elseif ($account->account_type === 'Interest Expense') {
                $incomeStatement['finance_items']['interest_expense']['accounts'][] = $accountData;
                $incomeStatement['finance_items']['interest_expense']['total'] += $balance;
            } elseif ($account->account_type === 'Other Income') {
                $incomeStatement['finance_items']['other_income']['accounts'][] = $accountData;
                $incomeStatement['finance_items']['other_income']['total'] += $balance;
            } elseif ($account->account_type === 'Other Expense') {
                $incomeStatement['finance_items']['other_expenses']['accounts'][] = $accountData;
                $incomeStatement['finance_items']['other_expenses']['total'] += $balance;
            } elseif (in_array($account->account_type, ['Tax Expense', 'Income Tax Expense', 'Corporate Tax'])) {
                $incomeStatement['tax_and_profit']['tax_expense']['accounts'][] = $accountData;
                $incomeStatement['tax_and_profit']['tax_expense']['total'] += $balance;
            }
        }

        // Calculate totals and intermediate figures
        $totalRevenue = $incomeStatement['revenue']['sales']['total'] +
                       $incomeStatement['revenue']['services']['total'] +
                       $incomeStatement['revenue']['other_operating']['total'];

        $totalCOGS = $incomeStatement['cost_of_goods_sold']['purchases']['total'] +
                    $incomeStatement['cost_of_goods_sold']['direct_expenses']['total'];

        $grossProfit = $totalRevenue - $totalCOGS;

        $totalOperatingExpenses = $incomeStatement['operating_expenses']['selling']['total'] +
                                 $incomeStatement['operating_expenses']['distribution']['total'] +
                                 $incomeStatement['operating_expenses']['administrative']['total'] +
                                 $incomeStatement['operating_expenses']['depreciation']['total'];

        $operatingProfit = $grossProfit - $totalOperatingExpenses;

        $financeIncome = $incomeStatement['finance_items']['interest_revenue']['total'] +
                        $incomeStatement['finance_items']['other_income']['total'];

        $financeExpenses = $incomeStatement['finance_items']['interest_expense']['total'] +
                          $incomeStatement['finance_items']['other_expenses']['total'];

        $profitBeforeTax = $operatingProfit + $financeIncome - $financeExpenses;

        $taxExpense = $incomeStatement['tax_and_profit']['tax_expense']['total'];

        $profitForPeriod = $profitBeforeTax - $taxExpense;

        return [
            'revenue' => $incomeStatement['revenue'],
            'costOfGoodsSold' => $incomeStatement['cost_of_goods_sold'],
            'operatingExpenses' => $incomeStatement['operating_expenses'],
            'financeItems' => $incomeStatement['finance_items'],
            'taxAndProfit' => $incomeStatement['tax_and_profit'],
            // Calculation lines
            'totalRevenue' => $totalRevenue,
            'totalCOGS' => $totalCOGS,
            'grossProfit' => $grossProfit,
            'totalOperatingExpenses' => $totalOperatingExpenses,
            'operatingProfit' => $operatingProfit,
            'financeIncome' => $financeIncome,
            'financeExpenses' => $financeExpenses,
            'profitBeforeTax' => $profitBeforeTax,
            'taxExpense' => $taxExpense,
            'profitForPeriod' => $profitForPeriod
        ];
    }

    /**
     * Calculate account balance for income statement
     * Revenue accounts: Credit balance (show as positive)
     * Expense accounts: Debit balance (show as positive/negative depending on context)
     */
    private function calculateIncomeStatementBalance($account)
    {
        $debit = $account->debit_total ?? 0;
        $credit = $account->credit_total ?? 0;

        if (in_array($account->account_type, ['Revenue', 'Sales Revenue', 'Service Revenue', 'Interest Revenue', 'Other Income', 'Investment Revenue'])) {
            // Revenue: Credit side is positive
            return $credit - $debit;
        } else {
            // Expenses: Debit side is positive
            return $debit - $credit;
        }
    }
}

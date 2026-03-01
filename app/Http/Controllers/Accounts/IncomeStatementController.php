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
     * Display Income Statement search/filter page
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
                ->get();
        }

        // Get locations
        $locations = [];
        if ($compId) {
            $locations = DB::table('locations')
                ->where('company_id', $compId)
                ->where('status', 1)
                ->select('id', 'location_name')
                ->get();
        }

        return Inertia::render('Accounts/IncomeStatement/Search', [
            'companies' => $companies,
            'locations' => $locations,
            'isParentCompany' => $isParentCompany,
        ]);
    }

    /**
     * Display Income Statement (Statement of Comprehensive Income - IAS 1)
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
     *    - Selling & Distribution Expenses
     *    - Administrative Expenses
     *    - Depreciation & Amortization
     * 5. OPERATING PROFIT
     * 6. NON-OPERATING ITEMS
     *    - Interest Revenue / Income
     *    - Other Income
     *    - Interest Expense
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
                'selling_distribution' => [
                    'label' => 'Selling & Distribution Expenses',
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
                    'label' => 'Interest Revenue / Investment Income',
                    'accounts' => [],
                    'total' => 0
                ],
                'other_income' => [
                    'label' => 'Other Income',
                    'accounts' => [],
                    'total' => 0
                ],
                'interest_expense' => [
                    'label' => 'Interest Expense & Bank Charges',
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

        // Distribute accounts to income statement sections based on account name
        foreach ($accounts as $account) {
            // For income statement: Revenue is credit balance, Expenses are debit balance
            $balance = $this->calculateIncomeStatementBalance($account);

            if (abs($balance) < 0.01) {
                continue; // Skip zero-balance accounts
            }

            $accountData = [
                'code' => $account->account_code,
                'name' => $account->account_name,
                'type' => $account->account_type,
                'amount' => $balance
            ];

            $accountNameLower = strtolower($account->account_name);

            // Classify Revenue accounts
            if ($account->account_type === 'Revenue') {
                if (str_contains($accountNameLower, 'sales') || str_contains($accountNameLower, 'product')) {
                    $incomeStatement['revenue']['sales']['accounts'][] = $accountData;
                    $incomeStatement['revenue']['sales']['total'] += $balance;
                } elseif (str_contains($accountNameLower, 'service') || str_contains($accountNameLower, 'consulting') || str_contains($accountNameLower, 'consultancy')) {
                    $incomeStatement['revenue']['services']['accounts'][] = $accountData;
                    $incomeStatement['revenue']['services']['total'] += $balance;
                } else {
                    // Classify as other operating revenue (commission, rental, subscription, etc.)
                    $incomeStatement['revenue']['other_operating']['accounts'][] = $accountData;
                    $incomeStatement['revenue']['other_operating']['total'] += $balance;
                }
            }
            // Classify Expense accounts
            elseif ($account->account_type === 'Expenses') {
                // Cost of Goods Sold
                if (str_contains($accountNameLower, 'raw material') || str_contains($accountNameLower, 'purchase') || 
                    str_contains($accountNameLower, 'freight inward') || str_contains($accountNameLower, 'packing material') ||
                    str_contains($accountNameLower, 'factory wage') || str_contains($accountNameLower, 'factory rent') ||
                    str_contains($accountNameLower, 'direct labor') || str_contains($accountNameLower, 'power and fuel') ||
                    str_contains($accountNameLower, 'depreciation - factory')) {
                    $incomeStatement['cost_of_goods_sold']['purchases']['accounts'][] = $accountData;
                    $incomeStatement['cost_of_goods_sold']['purchases']['total'] += $balance;
                }
                // Selling & Distribution Expenses
                elseif (str_contains($accountNameLower, 'advertis') || str_contains($accountNameLower, 'sales commission') ||
                        str_contains($accountNameLower, 'freight outward') || str_contains($accountNameLower, 'delivery') ||
                        str_contains($accountNameLower, 'discount allowed') || str_contains($accountNameLower, 'promotion') ||
                        str_contains($accountNameLower, 'sales staff') || str_contains($accountNameLower, 'showroom')) {
                    $incomeStatement['operating_expenses']['selling_distribution']['accounts'][] = $accountData;
                    $incomeStatement['operating_expenses']['selling_distribution']['total'] += $balance;
                }
                // Administrative Expenses
                elseif (str_contains($accountNameLower, 'office salary') || str_contains($accountNameLower, 'office rent') ||
                        str_contains($accountNameLower, 'utilities') || str_contains($accountNameLower, 'stationery') ||
                        str_contains($accountNameLower, 'printing') || str_contains($accountNameLower, 'professional fee') ||
                        str_contains($accountNameLower, 'travel') || str_contains($accountNameLower, 'it expense') ||
                        str_contains($accountNameLower, 'repairs') || str_contains($accountNameLower, 'depreciation - office')) {
                    $incomeStatement['operating_expenses']['administrative']['accounts'][] = $accountData;
                    $incomeStatement['operating_expenses']['administrative']['total'] += $balance;
                }
                // Depreciation & Amortization
                elseif (str_contains($accountNameLower, 'depreciation') || str_contains($accountNameLower, 'amortization')) {
                    $incomeStatement['operating_expenses']['depreciation']['accounts'][] = $accountData;
                    $incomeStatement['operating_expenses']['depreciation']['total'] += $balance;
                }
                // Interest & Bank Charges (Financial Expenses)
                elseif (str_contains($accountNameLower, 'interest expense') || str_contains($accountNameLower, 'bank charge') ||
                        str_contains($accountNameLower, 'loan')) {
                    $incomeStatement['finance_items']['interest_expense']['accounts'][] = $accountData;
                    $incomeStatement['finance_items']['interest_expense']['total'] += $balance;
                }
                // Tax Expense
                elseif (str_contains($accountNameLower, 'tax') || str_contains($accountNameLower, 'provision')) {
                    $incomeStatement['tax_and_profit']['tax_expense']['accounts'][] = $accountData;
                    $incomeStatement['tax_and_profit']['tax_expense']['total'] += $balance;
                }
                // Other Expenses
                else {
                    $incomeStatement['finance_items']['other_expenses']['accounts'][] = $accountData;
                    $incomeStatement['finance_items']['other_expenses']['total'] += $balance;
                }
            }
        }

        // Also get non-transactional revenue accounts that might include interest, dividends, etc.
        $nonTransactionalRevenue = DB::table('chart_of_accounts as coa')
            ->leftJoin('transaction_entries as te', 'coa.id', '=', 'te.account_id')
            ->leftJoin('transactions as t', 'te.transaction_id', '=', 't.id')
            ->where('coa.comp_id', $compId)
            ->where('coa.location_id', $locationId)
            ->where('coa.account_type', 'Revenue')
            ->where('coa.account_name', 'like', '%Interest%')
            ->select(
                'coa.id',
                'coa.account_code',
                'coa.account_name',
                'coa.account_type',
                DB::raw('COALESCE(SUM(te.base_debit_amount), 0) as debit_total'),
                DB::raw('COALESCE(SUM(te.base_credit_amount), 0) as credit_total')
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
            ->get();

        foreach ($nonTransactionalRevenue as $account) {
            $balance = $this->calculateIncomeStatementBalance($account);
            if (abs($balance) > 0.01) {
                $accountData = [
                    'code' => $account->account_code,
                    'name' => $account->account_name,
                    'type' => $account->account_type,
                    'amount' => $balance
                ];
                $incomeStatement['finance_items']['interest_revenue']['accounts'][] = $accountData;
                $incomeStatement['finance_items']['interest_revenue']['total'] += $balance;
            }
        }

        // Calculate totals and intermediate figures
        $totalRevenue = $incomeStatement['revenue']['sales']['total'] +
                       $incomeStatement['revenue']['services']['total'] +
                       $incomeStatement['revenue']['other_operating']['total'];

        $totalCOGS = $incomeStatement['cost_of_goods_sold']['purchases']['total'] +
                    $incomeStatement['cost_of_goods_sold']['direct_expenses']['total'];

        $grossProfit = $totalRevenue - $totalCOGS;

        $totalOperatingExpenses = $incomeStatement['operating_expenses']['selling_distribution']['total'] +
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
     * Expense accounts: Debit balance (show as positive)
     */
    private function calculateIncomeStatementBalance($account)
    {
        $debit = (float)($account->debit_total ?? 0);
        $credit = (float)($account->credit_total ?? 0);

        if ($account->account_type === 'Revenue') {
            // Revenue: Credit side is positive
            return $credit - $debit;
        } else {
            // Expenses: Debit side is positive
            return $debit - $credit;
        }
    }
}

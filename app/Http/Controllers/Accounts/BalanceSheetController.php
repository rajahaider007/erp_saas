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
     * Display Balance Sheet search/filter page
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

        return Inertia::render('Accounts/BalanceSheet/Search', [
            'companies' => $companies,
            'locations' => $locations,
            'isParentCompany' => $isParentCompany,
        ]);
    }

    /**
     * Display Balance Sheet (Statement of Financial Position - IAS 1)
     * International Standard Format - Horizontal Layout
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

        // Build balance sheet data with hierarchical structure
        $balanceSheetData = $this->buildHierarchicalBalanceSheet($compId, $locationId, $asAtDate, $fiscalYear);

        // Get comparative data if requested
        $comparativeData = null;
        if ($comparativeDate) {
            $comparativeFiscalYear = FiscalYearHelper::getFiscalYear($comparativeDate, $compId);
            $comparativeData = $this->buildHierarchicalBalanceSheet($compId, $locationId, $comparativeDate, $comparativeFiscalYear);
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
     * Get Level 4 account details for a specific Level 3 account (drill-down)
     */
    public function getLevel4Details(Request $request)
    {
        $level3AccountId = $request->input('level3_account_id');
        $compId = $request->input('comp_id') ?? $request->session()->get('user_comp_id');
        $locationId = $request->input('location_id') ?? $request->session()->get('user_location_id');
        $asAtDate = $request->input('as_at_date', now()->toDateString());
        
        $fiscalYear = FiscalYearHelper::getFiscalYear($asAtDate, $compId);
        
        // Get Level 4 accounts under this Level 3
        $level4Accounts = DB::table('chart_of_accounts as coa')
            ->leftJoin('transaction_entries as te', function($join) use ($asAtDate, $fiscalYear) {
                $join->on('coa.id', '=', 'te.account_id')
                    ->whereExists(function($query) use ($asAtDate, $fiscalYear) {
                        $query->select(DB::raw(1))
                            ->from('transactions as t')
                            ->whereColumn('t.id', 'te.transaction_id')
                            ->where('t.fiscal_year', '<=', $fiscalYear)
                            ->where('t.voucher_date', '<=', $asAtDate)
                            ->where('t.status', 'Posted');
                    });
            })
            ->where('coa.parent_account_id', $level3AccountId)
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
            ->groupBy('coa.id', 'coa.account_code', 'coa.account_name', 'coa.account_type')
            ->orderBy('coa.account_code')
            ->get();
            
        $accounts = $level4Accounts->map(function($account) {
            $balance = $this->calculateAccountBalance($account);
            return [
                'id' => $account->id,
                'code' => $account->account_code,
                'name' => $account->account_name,
                'type' => $account->account_type,
                'debit' => (float) $account->debit_total,
                'credit' => (float) $account->credit_total,
                'balance' => $balance
            ];
        })->filter(function($account) {
            // Show accounts with non-zero balances or transactions
            return abs($account['balance']) > 0.01 || $account['debit'] > 0 || $account['credit'] > 0;
        })->values();
        
        return response()->json(['accounts' => $accounts]);
    }

    /**
     * Build hierarchical balance sheet structure according to International Standards
     * Shows Level 1 (Categories), Level 2 (Groups), Level 3 (Sub-groups)
     * Level 4 accounts are aggregated into Level 3
     * Includes Net Income (Profit/Loss) as Retained Earnings on the Equity side
     */
    private function buildHierarchicalBalanceSheet($compId, $locationId, $asAtDate, $fiscalYear)
    {
        // Calculate Net Income from Revenue and Expenses (for Retained Earnings)
        $netIncome = $this->calculateNetIncome($compId, $locationId, $asAtDate, $fiscalYear);
        
        // Get Level 1 accounts (Assets, Liabilities, Equity)
        $level1Accounts = DB::table('chart_of_accounts')
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->where('account_level', 1)
            ->whereIn('account_type', ['Assets', 'Liabilities', 'Equity'])
            ->orderBy('account_code')
            ->get();
            
        $structure = [
            'assets' => null,
            'liabilities' => null,
            'equity' => null,
            'totalAssets' => 0,
            'totalLiabilities' => 0,
            'totalEquity' => 0,
            'netIncome' => $netIncome,
        ];
        
        foreach ($level1Accounts as $level1) {
            $level1Data = [
                'id' => $level1->id,
                'code' => $level1->account_code,
                'name' => $level1->account_name,
                'type' => $level1->account_type,
                'level' => 1,
                'children' => [],
                'total' => 0
            ];
            
            // Get Level 2 accounts
            $level2Accounts = DB::table('chart_of_accounts')
                ->where('parent_account_id', $level1->id)
                ->where('comp_id', $compId)
                ->where('location_id', $locationId)
                ->where('account_level', 2)
                ->orderBy('account_code')
                ->get();
                
            foreach ($level2Accounts as $level2) {
                $level2Data = [
                    'id' => $level2->id,
                    'code' => $level2->account_code,
                    'name' => $level2->account_name,
                    'type' => $level2->account_type,
                    'level' => 2,
                    'children' => [],
                    'total' => 0
                ];
                
                // Get Level 3 accounts
                $level3Accounts = DB::table('chart_of_accounts')
                    ->where('parent_account_id', $level2->id)
                    ->where('comp_id', $compId)
                    ->where('location_id', $locationId)
                    ->where('account_level', 3)
                    ->orderBy('account_code')
                    ->get();
                    
                foreach ($level3Accounts as $level3) {
                    // Calculate total balance for this Level 3 (sum of all Level 4 children)
                    $level3Balance = $this->calculateLevel3Balance($level3->id, $compId, $locationId, $asAtDate, $fiscalYear);
                    
                    if (abs($level3Balance) < 0.01) {
                        continue; // Skip zero-balance Level 3 accounts
                    }
                    
                    $level3Data = [
                        'id' => $level3->id,
                        'code' => $level3->account_code,
                        'name' => $level3->account_name,
                        'type' => $level3->account_type,
                        'level' => 3,
                        'balance' => $level3Balance,
                        'has_children' => true
                    ];
                    
                    $level2Data['children'][] = $level3Data;
                    $level2Data['total'] += $level3Balance;
                }
                
                if (count($level2Data['children']) > 0) {
                    $level1Data['children'][] = $level2Data;
                    $level1Data['total'] += $level2Data['total'];
                }
            }
            
            // Assign to appropriate category
            if ($level1->account_type === 'Assets') {
                $structure['assets'] = $level1Data;
                $structure['totalAssets'] = $level1Data['total'];
            } elseif ($level1->account_type === 'Liabilities') {
                $structure['liabilities'] = $level1Data;
                $structure['totalLiabilities'] = $level1Data['total'];
            } elseif ($level1->account_type === 'Equity') {
                $structure['equity'] = $level1Data;
                $structure['totalEquity'] = $level1Data['total'];
            }
        }
        
        $structure['totalLiabilitiesAndEquity'] = $structure['totalLiabilities'] + $structure['totalEquity'];
        // Add Net Income to the equation (Retained Earnings)
        $structure['totalLiabilitiesAndEquityWithNetIncome'] = $structure['totalLiabilities'] + $structure['totalEquity'] + $netIncome;
        $structure['balancingCheck'] = $structure['totalAssets'] - $structure['totalLiabilitiesAndEquityWithNetIncome'];
        
        return $structure;
    }
    
    /**
     * Calculate total balance for a Level 3 account (sum of all Level 4 children)
     * Uses account_configurations table to filter and include all configured accounts
     */
    private function calculateLevel3Balance($level3Id, $compId, $locationId, $asAtDate, $fiscalYear)
    {
        $level4Accounts = DB::table('chart_of_accounts as coa')
            ->join('account_configurations as ac', function($join) use ($compId, $locationId) {
                $join->on('coa.id', '=', 'ac.account_id')
                    ->where('ac.comp_id', '=', $compId)
                    ->where('ac.location_id', '=', $locationId)
                    ->where('ac.is_active', '=', true);
            })
            ->leftJoin('transaction_entries as te', function($join) use ($asAtDate, $fiscalYear) {
                $join->on('coa.id', '=', 'te.account_id')
                    ->whereExists(function($query) use ($asAtDate, $fiscalYear) {
                        $query->select(DB::raw(1))
                            ->from('transactions as t')
                            ->whereColumn('t.id', 'te.transaction_id')
                            ->where('t.fiscal_year', '<=', $fiscalYear)
                            ->where('t.voucher_date', '<=', $asAtDate)
                            ->where('t.status', 'Posted');
                    });
            })
            ->where('coa.parent_account_id', $level3Id)
            ->where('coa.comp_id', $compId)
            ->where('coa.location_id', $locationId)
            ->where('coa.account_level', 4)
            ->where('coa.is_transactional', true)
            ->select(
                'coa.id',
                'coa.account_type',
                DB::raw('COALESCE(SUM(te.base_debit_amount), 0) as debit_total'),
                DB::raw('COALESCE(SUM(te.base_credit_amount), 0) as credit_total')
            )
            ->groupBy('coa.id', 'coa.account_type')
            ->get();
            
        $totalBalance = 0;
        foreach ($level4Accounts as $account) {
            $totalBalance += $this->calculateAccountBalance($account);
        }
        
        return $totalBalance;
    }

    /**
     * Calculate account balance based on debit/credit
     * Assets: Debit - Credit (positive debit balance)
     * Liabilities & Equity: Credit - Debit (positive credit balance)
     */
    private function calculateAccountBalance($account)
    {
        $debit = (float) ($account->debit_total ?? 0);
        $credit = (float) ($account->credit_total ?? 0);

        // Check account type - database stores as 'Assets', 'Liabilities', 'Equity'
        $accountType = $account->account_type;
        $normalizedType = strtolower(trim((string) $accountType));
        
        // Assets: Normal debit balance (Debit - Credit)
        if ($normalizedType === 'assets' || str_contains($normalizedType, 'asset')) {
            return $debit - $credit;
        }

        // Expenses: Normal debit balance (Debit - Credit)
        if ($normalizedType === 'expenses' || $normalizedType === 'expense' || str_contains($normalizedType, 'expense')) {
            return $debit - $credit;
        }

        // Revenue / Income: Normal credit balance (Credit - Debit)
        if ($normalizedType === 'revenue' || str_contains($normalizedType, 'revenue') || str_contains($normalizedType, 'income')) {
            return $credit - $debit;
        }
        
        // Liabilities & Equity: Normal credit balance (Credit - Debit) 
        if ($normalizedType === 'liabilities' ||
            $normalizedType === 'equity' ||
            str_contains($normalizedType, 'liability') ||
            str_contains($normalizedType, 'equity') ||
            str_contains($normalizedType, 'capital') ||
            str_contains($normalizedType, 'payable')) {
            return $credit - $debit;
        }

        // Default to asset behavior (Debit - Credit)
        return $debit - $credit;
    }

    /**
     * Calculate Net Income (Profit/Loss) from Revenue and Expense accounts
     * Net Income = Total Revenue - Total Expenses
     * This represents Retained Earnings on the Balance Sheet
     * Uses account_configurations for classification
     */
    private function calculateNetIncome($compId, $locationId, $asAtDate, $fiscalYear)
    {
        // Get all Revenue accounts (Level 4) using account_configurations
        $revenueAccounts = DB::table('chart_of_accounts as coa')
            ->join('account_configurations as ac', function($join) use ($compId, $locationId) {
                $join->on('coa.id', '=', 'ac.account_id')
                    ->where('ac.comp_id', '=', $compId)
                    ->where('ac.location_id', '=', $locationId)
                    ->where('ac.is_active', '=', true);
            })
            ->leftJoin('transaction_entries as te', function($join) use ($asAtDate, $fiscalYear) {
                $join->on('coa.id', '=', 'te.account_id')
                    ->whereExists(function($query) use ($asAtDate, $fiscalYear) {
                        $query->select(DB::raw(1))
                            ->from('transactions as t')
                            ->whereColumn('t.id', 'te.transaction_id')
                            ->where('t.fiscal_year', '<=', $fiscalYear)
                            ->where('t.voucher_date', '<=', $asAtDate)
                            ->where('t.status', 'Posted');
                    });
            })
            ->where('coa.comp_id', $compId)
            ->where('coa.location_id', $locationId)
            ->whereIn('ac.config_type', ['sales', 'service_income', 'interest_income', 'other_income'])
            ->where('coa.account_level', 4)
            ->where('coa.is_transactional', true)
            ->select(
                'coa.id',
                'coa.account_type',
                DB::raw('COALESCE(SUM(te.base_debit_amount), 0) as debit_total'),
                DB::raw('COALESCE(SUM(te.base_credit_amount), 0) as credit_total')
            )
            ->groupBy('coa.id', 'coa.account_type')
            ->get();

        // Get all Expense accounts (Level 4) using account_configurations
        $expenseAccounts = DB::table('chart_of_accounts as coa')
            ->join('account_configurations as ac', function($join) use ($compId, $locationId) {
                $join->on('coa.id', '=', 'ac.account_id')
                    ->where('ac.comp_id', '=', $compId)
                    ->where('ac.location_id', '=', $locationId)
                    ->where('ac.is_active', '=', true);
            })
            ->leftJoin('transaction_entries as te', function($join) use ($asAtDate, $fiscalYear) {
                $join->on('coa.id', '=', 'te.account_id')
                    ->whereExists(function($query) use ($asAtDate, $fiscalYear) {
                        $query->select(DB::raw(1))
                            ->from('transactions as t')
                            ->whereColumn('t.id', 'te.transaction_id')
                            ->where('t.fiscal_year', '<=', $fiscalYear)
                            ->where('t.voucher_date', '<=', $asAtDate)
                            ->where('t.status', 'Posted');
                    });
            })
            ->where('coa.comp_id', $compId)
            ->where('coa.location_id', $locationId)
            ->whereIn('ac.config_type', ['purchase', 'cost_of_goods_sold', 'salary_expense', 'rent_expense', 'utility_expense', 'depreciation_expense', 'amortization_expense', 'interest_expense', 'insurance_expense', 'maintenance_expense', 'marketing_expense', 'travel_expense', 'office_expense', 'other_expense'])
            ->where('coa.account_level', 4)
            ->where('coa.is_transactional', true)
            ->select(
                'coa.id',
                'coa.account_type',
                DB::raw('COALESCE(SUM(te.base_debit_amount), 0) as debit_total'),
                DB::raw('COALESCE(SUM(te.base_credit_amount), 0) as credit_total')
            )
            ->groupBy('coa.id', 'coa.account_type')
            ->get();

        // Calculate total revenue (Revenue accounts have credit balance)
        $totalRevenue = 0;
        foreach ($revenueAccounts as $account) {
            $balance = $this->calculateAccountBalance($account);
            $totalRevenue += $balance;
        }

        // Calculate total expenses (Expense accounts have debit balance)
        $totalExpenses = 0;
        foreach ($expenseAccounts as $account) {
            $balance = $this->calculateAccountBalance($account);
            $totalExpenses += $balance;
        }

        // Net Income = Revenue - Expenses
        $netIncome = $totalRevenue - $totalExpenses;

        return $netIncome;
    }
}

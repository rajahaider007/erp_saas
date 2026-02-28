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
 * Chart of Account Report Controller
 * 
 * Generates comprehensive Chart of Account reports following IFRS standards
 * - IAS 1: Presentation of Financial Statements (account disclosure requirements)
 * - Account hierarchy and classification
 * - Account balances and status tracking
 */
class ChartOfAccountReportController extends Controller
{
    use CheckUserPermissions;

    /**
     * Display Chart of Account report search/filter page
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

        return Inertia::render('Reports/ChartOfAccount/Search', [
            'companies' => $companies,
            'locations' => $locations,
            'isParentCompany' => $isParentCompany,
        ]);
    }

    /**
     * Display Chart of Account report
     * 
     * Follows hierarchical structure:
     * Level 1: Asset, Liability, Equity, Revenue, Expense (per IFRS)
     * Level 2: Account Categories
     * Level 3: Account SubCategories
     * Level 4: Transactional Accounts
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
            return Inertia::render('Reports/ChartOfAccount/Report', [
                'chartOfAccountData' => [],
                'filters' => [],
                'error' => 'Company and Location information is required.'
            ]);
        }

        // Get filters
        $accountLevel = $request->input('level', 'all'); // all, 1, 2, 3, 4
        $accountType = $request->input('account_type', ''); // Asset, Liability, Equity, Revenue, Expense
        $status = $request->input('status', ''); // Active, Inactive, or empty for all
        $hideZero = $request->input('hide_zero', '0') === '1';
        $sortBy = $request->input('sort_by', 'code'); // code, name, balance
        $export = $request->input('export', null); // excel, csv

        // Get company info
        $company = DB::table('companies')->where('id', $compId)->first();

        // Handle export requests
        if ($export === 'excel') {
            return $this->exportExcel($compId, $locationId, $accountType, $status, $hideZero, $sortBy, $company);
        } elseif ($export === 'csv') {
            return $this->exportCSV($compId, $locationId, $accountType, $status, $hideZero, $sortBy, $company);
        }

        // Route to appropriate method based on level selection
        if ($accountLevel === 'all') {
            return $this->getAllLevelsReport($compId, $locationId, $accountType, $status, $hideZero, $sortBy, $company);
        } else {
            return $this->getSpecificLevelReport($compId, $locationId, (int)$accountLevel, $accountType, $status, $hideZero, $sortBy, $company);
        }
    }

    /**
     * Get Chart of Account for all levels (hierarchical structure)
     * 
     * @param int $compId
     * @param int $locationId
     * @param string $accountType
     * @param string $status
     * @param bool $hideZero
     * @param string $sortBy
     * @param object $company
     * @return Response
     */
    private function getAllLevelsReport($compId, $locationId, $accountType, $status, $hideZero, $sortBy, $company): Response
    {
        // Get all accounts
        $query = DB::table('chart_of_accounts')
            ->where('comp_id', $compId)
            ->where('location_id', $locationId);

        // Apply filters
        if ($status) {
            $query->where('status', $status);
        }

        if ($accountType) {
            $query->where('account_type', $accountType);
        }

        // Order by account code
        $accounts = $query->orderBy('account_level', 'asc')
            ->orderBy('account_code', 'asc')
            ->get();

        // Calculate current balance for each account
        $accountBalances = $this->getAccountBalances($accounts);

        // Build account data array - now includes ALL accounts
        $chartData = [];

        foreach ($accounts as $account) {
            // Skip if hiding zero balance accounts
            if ($hideZero && $accountBalances[$account->id]['balance'] == 0) {
                continue;
            }

            $balance = $accountBalances[$account->id];

            $accountItem = [
                'id' => $account->id,
                'account_code' => $account->account_code,
                'account_name' => $account->account_name,
                'account_type' => $account->account_type,
                'account_level' => $account->account_level,
                'status' => $account->status,
                'is_transactional' => $account->is_transactional,
                'currency' => $account->currency,
                'parent_account_id' => $account->parent_account_id,
                'opening_balance' => (float) ($account->opening_balance ?? 0),
                'current_balance' => (float) $balance['balance'],
                'total_debit' => (float) $balance['debit'],
                'total_credit' => (float) $balance['credit'],
                'level_indent' => ($account->account_level - 1) * 20, // For visual indentation in UI
            ];

            // Add all accounts directly to the array
            $chartData[] = $accountItem;
        }

        // No need for complex transformation - data is already flat
        $transformedData = $chartData;

        // Apply sorting
        switch ($sortBy) {
            case 'name':
                usort($transformedData, fn($a, $b) => strcmp($a['account_name'], $b['account_name']));
                break;
            case 'balance':
                usort($transformedData, fn($a, $b) => $b['current_balance'] <=> $a['current_balance']);
                break;
            default: // code
                usort($transformedData, fn($a, $b) => strcmp($a['account_code'], $b['account_code']));
        }

        // Calculate totals
        $totals = $this->calculateTotals($accountBalances);

        return Inertia::render('Reports/ChartOfAccount/Report', [
            'chartOfAccountData' => $transformedData,
            'filters' => [
                'level' => $accountLevel ?? 'all',
                'account_type' => $accountType,
                'status' => $status,
                'hide_zero' => $hideZero,
                'sort_by' => $sortBy,
            ],
            'totals' => $totals,
            'company' => $company,
        ]);
    }

    /**
     * Get Chart of Account for specific level
     * 
     * @param int $compId
     * @param int $locationId
     * @param int $level
     * @param string $accountType
     * @param string $status
     * @param bool $hideZero
     * @param string $sortBy
     * @param object $company
     * @return Response
     */
    private function getSpecificLevelReport($compId, $locationId, $level, $accountType, $status, $hideZero, $sortBy, $company): Response
    {
        // Get accounts for specific level
        $query = DB::table('chart_of_accounts')
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->where('account_level', $level);

        // Apply filters
        if ($status) {
            $query->where('status', $status);
        }

        if ($accountType) {
            $query->where('account_type', $accountType);
        }

        // Get accounts
        $accounts = $query->orderBy('account_code', 'asc')
            ->get();

        // Calculate balances
        $accountBalances = $this->getAccountBalances($accounts);

        // Build report data
        $chartData = [];
        foreach ($accounts as $account) {
            $balance = $accountBalances[$account->id];

            // Skip if hiding zero balance accounts
            if ($hideZero && $balance['balance'] == 0) {
                continue;
            }

            $chartData[] = [
                'id' => $account->id,
                'account_code' => $account->account_code,
                'account_name' => $account->account_name,
                'account_type' => $account->account_type,
                'account_level' => $account->account_level,
                'status' => $account->status,
                'is_transactional' => $account->is_transactional,
                'currency' => $account->currency,
                'parent_account_id' => $account->parent_account_id,
                'opening_balance' => (float) ($account->opening_balance ?? 0),
                'current_balance' => (float) $balance['balance'],
                'total_debit' => (float) $balance['debit'],
                'total_credit' => (float) $balance['credit'],
            ];
        }

        // Apply sorting
        switch ($sortBy) {
            case 'name':
                usort($chartData, fn($a, $b) => strcmp($a['account_name'], $b['account_name']));
                break;
            case 'balance':
                usort($chartData, fn($a, $b) => $b['current_balance'] <=> $a['current_balance']);
                break;
            default: // code
                usort($chartData, fn($a, $b) => strcmp($a['account_code'], $b['account_code']));
        }

        // Calculate totals
        $totals = $this->calculateTotals($accountBalances);

        return Inertia::render('Reports/ChartOfAccount/Report', [
            'chartOfAccountData' => $chartData,
            'filters' => [
                'level' => $level,
                'account_type' => $accountType,
                'status' => $status,
                'hide_zero' => $hideZero,
                'sort_by' => $sortBy,
            ],
            'totals' => $totals,
            'company' => $company,
        ]);
    }

    /**
     * Get account balances from transactions
     * 
     * @param $accounts
     * @return array
     */
    private function getAccountBalances($accounts): array
    {
        $balances = [];

        foreach ($accounts as $account) {
            // Get transactions for this account
            $transactionQuery = DB::table('transaction_entries as te')
                ->join('transactions as t', 'te.transaction_id', '=', 't.id')
                ->where('te.account_id', $account->id)
                ->where('t.status', 'Posted');

            $transactions = $transactionQuery->get();

            // Calculate debit and credit totals
            $debitTotal = $transactions->sum('base_debit_amount');
            $creditTotal = $transactions->sum('base_credit_amount');

            // Balance calculation based on account type
            $balance = $this->calculateBalance(
                (float) ($account->opening_balance ?? 0),
                $debitTotal,
                $creditTotal,
                $account->account_type
            );

            $balances[$account->id] = [
                'debit' => (float) $debitTotal,
                'credit' => (float) $creditTotal,
                'balance' => (float) $balance,
            ];
        }

        return $balances;
    }

    /**
     * Calculate balance based on account type
     * IFRS: Asset/Expense accounts normally have debit balance
     *       Liability/Equity/Revenue accounts normally have credit balance
     * 
     * @param float $openingBalance
     * @param float $debitAmount
     * @param float $creditAmount
     * @param string $accountType
     * @return float
     */
    private function calculateBalance($openingBalance, $debitAmount, $creditAmount, $accountType): float
    {
        $debitAccountTypes = ['Asset', 'Expense'];
        
        if (in_array($accountType, $debitAccountTypes)) {
            // Debit balance accounts
            return $openingBalance + $debitAmount - $creditAmount;
        } else {
            // Credit balance accounts (Liability, Equity, Revenue)
            return $openingBalance + $creditAmount - $debitAmount;
        }
    }

    /**
     * Calculate totals by account type
     * 
     * @param array $balances
     * @return array
     */
    private function calculateTotals($balances): array
    {
        $totals = [
            'total_debit' => 0,
            'total_credit' => 0,
            'total_balance' => 0,
            'by_type' => []
        ];

        foreach ($balances as $balance) {
            $totals['total_debit'] += $balance['debit'];
            $totals['total_credit'] += $balance['credit'];
            $totals['total_balance'] += abs($balance['balance']);
        }

        return $totals;
    }

    /**
     * Transform hierarchical data for easier rendering
     * 
     * @param array $data
     * @return array
     */
    private function transformHierarchicalData($data): array
    {
        $transformed = [];
        
        foreach ($data as $item) {
            if (is_array($item) && isset($item['account'])) {
                $transformed[] = $item['account'];
                
                // Add children from level 2
                if (isset($item['children']) && is_array($item['children'])) {
                    foreach ($item['children'] as $level2) {
                        if (is_array($level2) && isset($level2['account'])) {
                            $transformed[] = $level2['account'];
                            
                            // Add children from level 3
                            if (isset($level2['children']) && is_array($level2['children'])) {
                                foreach ($level2['children'] as $level3) {
                                    if (is_array($level3) && isset($level3['account'])) {
                                        $transformed[] = $level3['account'];
                                        
                                        // Add level 4 children
                                        if (isset($level3['children']) && is_array($level3['children'])) {
                                            foreach ($level3['children'] as $level4) {
                                                if (is_array($level4) && isset($level4['account'])) {
                                                    $transformed[] = $level4['account'];
                                                } else {
                                                    $transformed[] = $level4;
                                                }
                                            }
                                        }
                                    } else {
                                        $transformed[] = $level3;
                                    }
                                }
                            }
                        } else {
                            $transformed[] = $level2;
                        }
                    }
                }
            } else {
                $transformed[] = $item;
            }
        }
        
        return $transformed;
    }

    /**
     * Export Chart of Account data to Excel
     */
    private function exportExcel($compId, $locationId, $accountType, $status, $hideZero, $sortBy, $company)
    {
        // Get all accounts
        $query = DB::table('chart_of_accounts')
            ->where('comp_id', $compId)
            ->where('location_id', $locationId);

        if ($status) {
            $query->where('status', $status);
        }

        if ($accountType) {
            $query->where('account_type', $accountType);
        }

        $accounts = $query->orderBy('account_level', 'asc')
            ->orderBy('account_code', 'asc')
            ->get();

        // Create Excel file
        $fileName = 'chart_of_accounts_' . date('YmdHis') . '.csv';
        $handle = fopen('php://memory', 'w');

        // Add header
        fputcsv($handle, ['Code', 'Name', 'Type', 'Status', 'Level']);

        // Add data rows
        foreach ($accounts as $account) {
            fputcsv($handle, [
                $account->account_code,
                $account->account_name,
                $account->account_type,
                $account->status,
                $account->account_level
            ]);
        }

        rewind($handle);
        $csv = stream_get_contents($handle);
        fclose($handle);

        return response($csv)->header('Content-Type', 'application/vnd.ms-excel')
            ->header('Content-Disposition', "attachment; filename=\"$fileName\"");
    }

    /**
     * Export Chart of Account data to CSV
     */
    private function exportCSV($compId, $locationId, $accountType, $status, $hideZero, $sortBy, $company)
    {
        // Get all accounts
        $query = DB::table('chart_of_accounts')
            ->where('comp_id', $compId)
            ->where('location_id', $locationId);

        if ($status) {
            $query->where('status', $status);
        }

        if ($accountType) {
            $query->where('account_type', $accountType);
        }

        $accounts = $query->orderBy('account_level', 'asc')
            ->orderBy('account_code', 'asc')
            ->get();

        // Create CSV file
        $fileName = 'chart_of_accounts_' . date('YmdHis') . '.csv';
        $handle = fopen('php://memory', 'w');

        // Add header
        fputcsv($handle, ['Code', 'Name', 'Type', 'Status', 'Level']);

        // Add data rows
        foreach ($accounts as $account) {
            fputcsv($handle, [
                $account->account_code,
                $account->account_name,
                $account->account_type,
                $account->status,
                $account->account_level
            ]);
        }

        rewind($handle);
        $csv = stream_get_contents($handle);
        fclose($handle);

        return response($csv)->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', "attachment; filename=\"$fileName\"");
    }
}

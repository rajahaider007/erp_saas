<?php

namespace App\Http\Controllers\Accounts;

use App\Http\Controllers\Controller;
use App\Http\Traits\CheckUserPermissions;
use App\Helpers\CompanyHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class TrialBalanceController extends Controller
{
    use CheckUserPermissions;

    /**
     * Display trial balance search/filter page
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

        return Inertia::render('Accounts/TrialBalance/Search', [
            'companies' => $companies,
            'locations' => $locations,
            'isParentCompany' => $isParentCompany,
        ]);
    }

    /**
     * Display trial balance report
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
            return Inertia::render('Accounts/TrialBalance/Report', [
                'trialBalanceData' => [],
                'filters' => [],
                'error' => 'Company and Location information is required.'
            ]);
        }

        // Get filters
        $fromDate = $request->input('from_date');
        $toDate = $request->input('to_date');
        $selectedLevel = $request->input('level', 'all');
        $hideZero = $request->input('hide_zero', '0') === '1';

        // Get company info
        $company = DB::table('companies')->where('id', $compId)->first();

        // Route to appropriate method based on level selection
        if ($selectedLevel === 'all') {
            return $this->getAllLevelsReport($compId, $locationId, $fromDate, $toDate, $hideZero, $company);
        } else {
            return $this->getSpecificLevelReport($compId, $locationId, $fromDate, $toDate, $selectedLevel, $hideZero, $company);
        }
    }

    /**
     * Get trial balance for all levels (hierarchical)
     */
    private function getAllLevelsReport($compId, $locationId, $fromDate, $toDate, $hideZero, $company)
    {
        // Build query for trial balance data - get all accounts
        $accounts = DB::table('chart_of_accounts as coa')
            ->where('coa.comp_id', $compId)
            ->where('coa.location_id', $locationId)
            ->where('coa.status', 'Active')
            ->orderBy('coa.account_code')
            ->get();

        // Calculate balances for each account
        $trialBalanceData = $accounts->map(function ($account) use ($fromDate, $toDate) {
            // Get transactions for this account
            $transactionQuery = DB::table('transaction_entries as te')
                ->join('transactions as t', 'te.transaction_id', '=', 't.id')
                ->where('te.account_id', $account->id)
                ->where('t.status', 'Posted');

            if ($fromDate) {
                $transactionQuery->where('t.voucher_date', '>=', $fromDate);
            }
            if ($toDate) {
                $transactionQuery->where('t.voucher_date', '<=', $toDate);
            }

            $transactions = $transactionQuery->get();

            // Calculate debit and credit totals
            $debitTotal = $transactions->sum('base_debit_amount');
            $creditTotal = $transactions->sum('base_credit_amount');
            $balance = $debitTotal - $creditTotal;

            return [
                'id' => $account->id,
                'account_code' => $account->account_code,
                'account_name' => $account->account_name,
                'account_level' => $account->account_level,
                'account_type' => $account->account_type,
                'parent_account_id' => $account->parent_account_id,
                'is_transactional' => $account->is_transactional,
                'debit_total' => $debitTotal,
                'credit_total' => $creditTotal,
                'balance' => $balance,
            ];
        });

        // Build hierarchical structure
        $hierarchicalData = $this->buildHierarchy($trialBalanceData, $accounts);

        // Filter out zero balances if requested
        if ($hideZero) {
            $hierarchicalData = $this->filterZeroBalances($hierarchicalData);
        }

        // Calculate grand totals
        $grandTotalDebit = $trialBalanceData->sum('debit_total');
        $grandTotalCredit = $trialBalanceData->sum('credit_total');

        return Inertia::render('Accounts/TrialBalance/Report', [
            'trialBalanceData' => $hierarchicalData,
            'company' => $company,
            'filters' => [
                'from_date' => $fromDate,
                'to_date' => $toDate,
                'comp_id' => $compId,
                'location_id' => $locationId,
                'level' => 'all',
            ],
            'grandTotalDebit' => $grandTotalDebit,
            'grandTotalCredit' => $grandTotalCredit,
        ]);
    }

    /**
     * Get trial balance for specific level (flat with parent info)
     */
    private function getSpecificLevelReport($compId, $locationId, $fromDate, $toDate, $selectedLevel, $hideZero, $company)
    {
        $levelFilter = (int)$selectedLevel;

        // Base select columns
        $selectColumns = [
            'coa.id',
            'coa.account_code',
            'coa.account_name',
            'coa.account_level',
            'coa.account_type',
            'coa.parent_account_id',
            'coa.is_transactional',
        ];

        // Get accounts for specific level with parent information using LEFT JOIN
        $accountsQuery = DB::table('chart_of_accounts as coa');

        // Add LEFT JOINs and select columns based on level
        if ($levelFilter == 4) {
            // Level 4: needs parent3, parent2, parent1
            $accountsQuery->leftJoin('chart_of_accounts as parent3', 'coa.parent_account_id', '=', 'parent3.id')
                ->leftJoin('chart_of_accounts as parent2', 'parent3.parent_account_id', '=', 'parent2.id')
                ->leftJoin('chart_of_accounts as parent1', 'parent2.parent_account_id', '=', 'parent1.id');
            $selectColumns[] = 'parent1.account_name as level1_parent_name';
            $selectColumns[] = 'parent2.account_name as level2_parent_name';
            $selectColumns[] = 'parent3.account_name as level3_parent_name';
        } elseif ($levelFilter == 3) {
            // Level 3: needs parent2, parent1
            $accountsQuery->leftJoin('chart_of_accounts as parent2', 'coa.parent_account_id', '=', 'parent2.id')
                ->leftJoin('chart_of_accounts as parent1', 'parent2.parent_account_id', '=', 'parent1.id');
            $selectColumns[] = 'parent1.account_name as level1_parent_name';
            $selectColumns[] = 'parent2.account_name as level2_parent_name';
            $selectColumns[] = DB::raw('NULL as level3_parent_name');
        } elseif ($levelFilter == 2) {
            // Level 2: needs parent1
            $accountsQuery->leftJoin('chart_of_accounts as parent1', 'coa.parent_account_id', '=', 'parent1.id');
            $selectColumns[] = 'parent1.account_name as level1_parent_name';
            $selectColumns[] = DB::raw('NULL as level2_parent_name');
            $selectColumns[] = DB::raw('NULL as level3_parent_name');
        } else {
            // Level 1: no parent joins needed
            $selectColumns[] = DB::raw('NULL as level1_parent_name');
            $selectColumns[] = DB::raw('NULL as level2_parent_name');
            $selectColumns[] = DB::raw('NULL as level3_parent_name');
        }

        $accounts = $accountsQuery
            ->select($selectColumns)
            ->where('coa.comp_id', $compId)
            ->where('coa.location_id', $locationId)
            ->where('coa.status', 'Active')
            ->where('coa.account_level', $levelFilter)
            ->orderBy('coa.account_code')
            ->get();

        // Calculate balances for each account
        $trialBalanceData = $accounts->map(function ($account) use ($fromDate, $toDate, $levelFilter, $compId, $locationId) {
            $debitTotal = 0;
            $creditTotal = 0;

            // Different logic based on account level
            if ($levelFilter == 4) {
                // Level 4: Direct transactions
                $transactionQuery = DB::table('transaction_entries as te')
                    ->join('transactions as t', 'te.transaction_id', '=', 't.id')
                    ->where('te.account_id', $account->id)
                    ->where('t.status', 'Posted');

                if ($fromDate) {
                    $transactionQuery->where('t.voucher_date', '>=', $fromDate);
                }
                if ($toDate) {
                    $transactionQuery->where('t.voucher_date', '<=', $toDate);
                }

                $transactions = $transactionQuery->get();
                $debitTotal = $transactions->sum('base_debit_amount') ?? 0;
                $creditTotal = $transactions->sum('base_credit_amount') ?? 0;
            } elseif ($levelFilter == 3) {
                // Level 3: Aggregate from Level 4 children
                $query = DB::table('chart_of_accounts as coa4')
                    ->join('transaction_entries as te', 'coa4.id', '=', 'te.account_id')
                    ->join('transactions as t', 'te.transaction_id', '=', 't.id')
                    ->where('coa4.parent_account_id', $account->id)
                    ->where('coa4.account_level', 4)
                    ->where('t.status', 'Posted');

                if ($fromDate) {
                    $query->where('t.voucher_date', '>=', $fromDate);
                }
                if ($toDate) {
                    $query->where('t.voucher_date', '<=', $toDate);
                }

                $debitTotal = $query->sum('te.base_debit_amount') ?? 0;
                $creditTotal = $query->sum('te.base_credit_amount') ?? 0;
            } elseif ($levelFilter == 2) {
                // Level 2: Aggregate from Level 4 through Level 3
                $query = DB::table('chart_of_accounts as coa3')
                    ->join('chart_of_accounts as coa4', function ($join) {
                        $join->on('coa4.parent_account_id', '=', 'coa3.id')
                            ->where('coa4.account_level', '=', 4);
                    })
                    ->join('transaction_entries as te', 'coa4.id', '=', 'te.account_id')
                    ->join('transactions as t', 'te.transaction_id', '=', 't.id')
                    ->where('coa3.parent_account_id', $account->id)
                    ->where('coa3.account_level', 3)
                    ->where('t.status', 'Posted');

                if ($fromDate) {
                    $query->where('t.voucher_date', '>=', $fromDate);
                }
                if ($toDate) {
                    $query->where('t.voucher_date', '<=', $toDate);
                }

                $debitTotal = $query->sum('te.base_debit_amount') ?? 0;
                $creditTotal = $query->sum('te.base_credit_amount') ?? 0;
            } else {
                // Level 1: Aggregate from Level 4 through Level 3 & Level 2
                $query = DB::table('chart_of_accounts as coa2')
                    ->join('chart_of_accounts as coa3', function ($join) {
                        $join->on('coa3.parent_account_id', '=', 'coa2.id')
                            ->where('coa3.account_level', '=', 3);
                    })
                    ->join('chart_of_accounts as coa4', function ($join) {
                        $join->on('coa4.parent_account_id', '=', 'coa3.id')
                            ->where('coa4.account_level', '=', 4);
                    })
                    ->join('transaction_entries as te', 'coa4.id', '=', 'te.account_id')
                    ->join('transactions as t', 'te.transaction_id', '=', 't.id')
                    ->where('coa2.parent_account_id', $account->id)
                    ->where('coa2.account_level', 2)
                    ->where('t.status', 'Posted');

                if ($fromDate) {
                    $query->where('t.voucher_date', '>=', $fromDate);
                }
                if ($toDate) {
                    $query->where('t.voucher_date', '<=', $toDate);
                }

                $debitTotal = $query->sum('te.base_debit_amount') ?? 0;
                $creditTotal = $query->sum('te.base_credit_amount') ?? 0;
            }

            $balance = ($debitTotal - $creditTotal);

            return [
                'id' => $account->id,
                'account_code' => $account->account_code,
                'account_name' => $account->account_name,
                'account_level' => $account->account_level,
                'account_type' => $account->account_type,
                'parent_account_id' => $account->parent_account_id,
                'is_transactional' => $account->is_transactional,
                'level1_parent_name' => $account->level1_parent_name ?? null,
                'level2_parent_name' => $account->level2_parent_name ?? null,
                'level3_parent_name' => $account->level3_parent_name ?? null,
                'debit_total' => $debitTotal,
                'credit_total' => $creditTotal,
                'balance' => $balance,
            ];
        });

        // Filter out zero balances if requested
        if ($hideZero) {
            $trialBalanceData = $trialBalanceData->filter(function ($account) {
                return $account['debit_total'] != 0 || $account['credit_total'] != 0 || $account['balance'] != 0;
            });
        }

        // Calculate grand totals
        $grandTotalDebit = $trialBalanceData->sum('debit_total');
        $grandTotalCredit = $trialBalanceData->sum('credit_total');

        // Convert to flat array (no hierarchy for specific level)
        $flatData = $trialBalanceData->values()->toArray();

        return Inertia::render('Accounts/TrialBalance/Report', [
            'trialBalanceData' => $flatData,
            'company' => $company,
            'filters' => [
                'from_date' => $fromDate,
                'to_date' => $toDate,
                'comp_id' => $compId,
                'location_id' => $locationId,
                'level' => $selectedLevel,
            ],
            'grandTotalDebit' => $grandTotalDebit,
            'grandTotalCredit' => $grandTotalCredit,
        ]);
    }

    /**
     * Build hierarchical structure from flat account list
     */
    private function buildHierarchy($balances, $accounts)
    {
        // Convert balances to array indexed by account_id
        $balanceMap = [];
        foreach ($balances as $balance) {
            $balanceMap[$balance['id']] = $balance;
        }

        // Build hierarchy starting from level 1
        $hierarchy = [];
        $level1Accounts = $accounts->where('account_level', 1);

        foreach ($level1Accounts as $level1) {
            $level1Data = [
                'id' => $level1->id,
                'account_code' => $level1->account_code,
                'account_name' => $level1->account_name,
                'account_level' => 1,
                'account_type' => $level1->account_type,
                'is_transactional' => false,
                'debit_total' => 0,
                'credit_total' => 0,
                'balance' => 0,
                'children' => []
            ];

            // Get level 2 children
            $level2Children = $accounts->where('parent_account_id', $level1->id)->where('account_level', 2);

            foreach ($level2Children as $level2) {
                $level2Data = [
                    'id' => $level2->id,
                    'account_code' => $level2->account_code,
                    'account_name' => $level2->account_name,
                    'account_level' => 2,
                    'account_type' => $level2->account_type,
                    'is_transactional' => false,
                    'debit_total' => 0,
                    'credit_total' => 0,
                    'balance' => 0,
                    'children' => []
                ];

                // Get level 3 children
                $level3Children = $accounts->where('parent_account_id', $level2->id)->where('account_level', 3);

                foreach ($level3Children as $level3) {
                    $level3Data = [
                        'id' => $level3->id,
                        'account_code' => $level3->account_code,
                        'account_name' => $level3->account_name,
                        'account_level' => 3,
                        'account_type' => $level3->account_type,
                        'is_transactional' => false,
                        'debit_total' => 0,
                        'credit_total' => 0,
                        'balance' => 0,
                        'children' => []
                    ];

                    // Get level 4 children (transactional)
                    $level4Children = $accounts->where('parent_account_id', $level3->id)->where('account_level', 4);

                    foreach ($level4Children as $level4) {
                        if (isset($balanceMap[$level4->id])) {
                            $balance = $balanceMap[$level4->id];
                            $level3Data['children'][] = $balance;

                            // Accumulate to parent levels
                            $level3Data['debit_total'] += $balance['debit_total'];
                            $level3Data['credit_total'] += $balance['credit_total'];
                            $level3Data['balance'] += $balance['balance'];
                        }
                    }

                    if (!empty($level3Data['children']) || $level3Data['debit_total'] != 0 || $level3Data['credit_total'] != 0) {
                        $level2Data['children'][] = $level3Data;
                        $level2Data['debit_total'] += $level3Data['debit_total'];
                        $level2Data['credit_total'] += $level3Data['credit_total'];
                        $level2Data['balance'] += $level3Data['balance'];
                    }
                }

                if (!empty($level2Data['children']) || $level2Data['debit_total'] != 0 || $level2Data['credit_total'] != 0) {
                    $level1Data['children'][] = $level2Data;
                    $level1Data['debit_total'] += $level2Data['debit_total'];
                    $level1Data['credit_total'] += $level2Data['credit_total'];
                    $level1Data['balance'] += $level2Data['balance'];
                }
            }

            if (!empty($level1Data['children']) || $level1Data['debit_total'] != 0 || $level1Data['credit_total'] != 0) {
                $hierarchy[] = $level1Data;
            }
        }

        return $hierarchy;
    }

    /**
     * Filter out zero balances from hierarchical structure
     */
    private function filterZeroBalances($hierarchy)
    {
        $filtered = [];

        foreach ($hierarchy as $item) {
            // Filter children recursively
            if (!empty($item['children'])) {
                $item['children'] = $this->filterZeroBalances($item['children']);
            }

            // Include if has non-zero balance or has children
            if ($item['debit_total'] != 0 || $item['credit_total'] != 0 || $item['balance'] != 0 || !empty($item['children'])) {
                $filtered[] = $item;
            }
        }

        return $filtered;
    }

    /**
     * Get Level 1 account name based on account type
     */
    private function getLevel1Name($accountType)
    {
        $names = [
            'Asset' => 'Assets',
            'Liability' => 'Liabilities',
            'Equity' => 'Equity',
            'Revenue' => 'Revenue',
            'Expense' => 'Expenses',
        ];

        return $names[$accountType] ?? $accountType;
    }

    /**
     * Print trial balance report
     */
    public function print(Request $request): Response
    {
        $isParentCompany = CompanyHelper::isCurrentCompanyParent();

        $compId = $isParentCompany
            ? ($request->input('comp_id') ?? $request->session()->get('user_comp_id'))
            : $request->session()->get('user_comp_id');

        $locationId = $isParentCompany
            ? ($request->input('location_id') ?? $request->session()->get('user_location_id'))
            : $request->session()->get('user_location_id');

        if (!$compId || !$locationId) {
            abort(403, 'Company and Location information is required.');
        }

        // Get filters
        $fromDate = $request->input('from_date');
        $toDate = $request->input('to_date');
        $selectedLevel = $request->input('level', 'all');
        $hideZero = $request->input('hide_zero', '0') === '1';

        // Get company info
        $company = DB::table('companies')->where('id', $compId)->first();

        // Get data based on level selection
        if ($selectedLevel === 'all') {
            // Use hierarchical logic
            $accounts = DB::table('chart_of_accounts as coa')
                ->where('coa.comp_id', $compId)
                ->where('coa.location_id', $locationId)
                ->where('coa.status', 'Active')
                ->orderBy('coa.account_code')
                ->get();

            $trialBalanceData = $accounts->map(function ($account) use ($fromDate, $toDate) {
                $transactionQuery = DB::table('transaction_entries as te')
                    ->join('transactions as t', 'te.transaction_id', '=', 't.id')
                    ->where('te.account_id', $account->id)
                    ->where('t.status', 'Posted');

                if ($fromDate) {
                    $transactionQuery->where('t.voucher_date', '>=', $fromDate);
                }
                if ($toDate) {
                    $transactionQuery->where('t.voucher_date', '<=', $toDate);
                }

                $transactions = $transactionQuery->get();
                $debitTotal = $transactions->sum('base_debit_amount') ?? 0;
                $creditTotal = $transactions->sum('base_credit_amount') ?? 0;
                $balance = $debitTotal - $creditTotal;

                return [
                    'id' => $account->id,
                    'account_code' => $account->account_code,
                    'account_name' => $account->account_name,
                    'account_level' => $account->account_level,
                    'account_type' => $account->account_type,
                    'parent_account_id' => $account->parent_account_id,
                    'is_transactional' => $account->is_transactional,
                    'debit_total' => $debitTotal,
                    'credit_total' => $creditTotal,
                    'balance' => $balance,
                ];
            });

            $hierarchicalData = $this->buildHierarchy($trialBalanceData, $accounts);

            if ($hideZero) {
                $hierarchicalData = $this->filterZeroBalances($hierarchicalData);
            }

            $grandTotalDebit = $trialBalanceData->sum('debit_total');
            $grandTotalCredit = $trialBalanceData->sum('credit_total');

            $data = $hierarchicalData;
        } else {
            // Use level-specific logic - call the same method
            $levelData = $this->getSpecificLevelData($compId, $locationId, $fromDate, $toDate, $selectedLevel, $hideZero);
            $data = $levelData['trialBalanceData'];
            $grandTotalDebit = $levelData['grandTotalDebit'];
            $grandTotalCredit = $levelData['grandTotalCredit'];
        }

        return Inertia::render('Accounts/TrialBalance/Print', [
            'trialBalanceData' => $data,
            'company' => $company,
            'filters' => [
                'from_date' => $fromDate,
                'to_date' => $toDate,
                'comp_id' => $compId,
                'location_id' => $locationId,
                'level' => $selectedLevel,
            ],
            'grandTotalDebit' => $grandTotalDebit,
            'grandTotalCredit' => $grandTotalCredit,
        ]);
    }

    /**
     * Get level-specific data (extracted for reuse)
     */
    private function getSpecificLevelData($compId, $locationId, $fromDate, $toDate, $selectedLevel, $hideZero)
    {
        $levelFilter = (int)$selectedLevel;

        // Same logic as getSpecificLevelReport but returns data array
        $selectColumns = [
            'coa.id',
            'coa.account_code',
            'coa.account_name',
            'coa.account_level',
            'coa.account_type',
            'coa.parent_account_id',
            'coa.is_transactional',
        ];

        $accountsQuery = DB::table('chart_of_accounts as coa');

        if ($levelFilter == 4) {
            $accountsQuery->leftJoin('chart_of_accounts as parent3', 'coa.parent_account_id', '=', 'parent3.id')
                ->leftJoin('chart_of_accounts as parent2', 'parent3.parent_account_id', '=', 'parent2.id')
                ->leftJoin('chart_of_accounts as parent1', 'parent2.parent_account_id', '=', 'parent1.id');
            $selectColumns[] = 'parent1.account_name as level1_parent_name';
            $selectColumns[] = 'parent2.account_name as level2_parent_name';
            $selectColumns[] = 'parent3.account_name as level3_parent_name';
        } elseif ($levelFilter == 3) {
            $accountsQuery->leftJoin('chart_of_accounts as parent2', 'coa.parent_account_id', '=', 'parent2.id')
                ->leftJoin('chart_of_accounts as parent1', 'parent2.parent_account_id', '=', 'parent1.id');
            $selectColumns[] = 'parent1.account_name as level1_parent_name';
            $selectColumns[] = 'parent2.account_name as level2_parent_name';
            $selectColumns[] = DB::raw('NULL as level3_parent_name');
        } elseif ($levelFilter == 2) {
            $accountsQuery->leftJoin('chart_of_accounts as parent1', 'coa.parent_account_id', '=', 'parent1.id');
            $selectColumns[] = 'parent1.account_name as level1_parent_name';
            $selectColumns[] = DB::raw('NULL as level2_parent_name');
            $selectColumns[] = DB::raw('NULL as level3_parent_name');
        } else {
            $selectColumns[] = DB::raw('NULL as level1_parent_name');
            $selectColumns[] = DB::raw('NULL as level2_parent_name');
            $selectColumns[] = DB::raw('NULL as level3_parent_name');
        }

        $accounts = $accountsQuery
            ->select($selectColumns)
            ->where('coa.comp_id', $compId)
            ->where('coa.location_id', $locationId)
            ->where('coa.status', 'Active')
            ->where('coa.account_level', $levelFilter)
            ->orderBy('coa.account_code')
            ->get();

        $trialBalanceData = $accounts->map(function ($account) use ($fromDate, $toDate, $levelFilter, $compId, $locationId) {
            $debitTotal = 0;
            $creditTotal = 0;

            if ($levelFilter == 4) {
                $transactionQuery = DB::table('transaction_entries as te')
                    ->join('transactions as t', 'te.transaction_id', '=', 't.id')
                    ->where('te.account_id', $account->id)
                    ->where('t.status', 'Posted');

                if ($fromDate) {
                    $transactionQuery->where('t.voucher_date', '>=', $fromDate);
                }
                if ($toDate) {
                    $transactionQuery->where('t.voucher_date', '<=', $toDate);
                }

                $transactions = $transactionQuery->get();
                $debitTotal = $transactions->sum('base_debit_amount') ?? 0;
                $creditTotal = $transactions->sum('base_credit_amount') ?? 0;
            } elseif ($levelFilter == 3) {
                $query = DB::table('chart_of_accounts as coa4')
                    ->join('transaction_entries as te', 'coa4.id', '=', 'te.account_id')
                    ->join('transactions as t', 'te.transaction_id', '=', 't.id')
                    ->where('coa4.parent_account_id', $account->id)
                    ->where('coa4.account_level', 4)
                    ->where('t.status', 'Posted');

                if ($fromDate) {
                    $query->where('t.voucher_date', '>=', $fromDate);
                }
                if ($toDate) {
                    $query->where('t.voucher_date', '<=', $toDate);
                }

                $debitTotal = $query->sum('te.base_debit_amount') ?? 0;
                $creditTotal = $query->sum('te.base_credit_amount') ?? 0;
            } elseif ($levelFilter == 2) {
                $query = DB::table('chart_of_accounts as coa3')
                    ->join('chart_of_accounts as coa4', function ($join) {
                        $join->on('coa4.parent_account_id', '=', 'coa3.id')
                            ->where('coa4.account_level', '=', 4);
                    })
                    ->join('transaction_entries as te', 'coa4.id', '=', 'te.account_id')
                    ->join('transactions as t', 'te.transaction_id', '=', 't.id')
                    ->where('coa3.parent_account_id', $account->id)
                    ->where('coa3.account_level', 3)
                    ->where('t.status', 'Posted');

                if ($fromDate) {
                    $query->where('t.voucher_date', '>=', $fromDate);
                }
                if ($toDate) {
                    $query->where('t.voucher_date', '<=', $toDate);
                }

                $debitTotal = $query->sum('te.base_debit_amount') ?? 0;
                $creditTotal = $query->sum('te.base_credit_amount') ?? 0;
            } else {
                $query = DB::table('chart_of_accounts as coa2')
                    ->join('chart_of_accounts as coa3', function ($join) {
                        $join->on('coa3.parent_account_id', '=', 'coa2.id')
                            ->where('coa3.account_level', '=', 3);
                    })
                    ->join('chart_of_accounts as coa4', function ($join) {
                        $join->on('coa4.parent_account_id', '=', 'coa3.id')
                            ->where('coa4.account_level', '=', 4);
                    })
                    ->join('transaction_entries as te', 'coa4.id', '=', 'te.account_id')
                    ->join('transactions as t', 'te.transaction_id', '=', 't.id')
                    ->where('coa2.parent_account_id', $account->id)
                    ->where('coa2.account_level', 2)
                    ->where('t.status', 'Posted');

                if ($fromDate) {
                    $query->where('t.voucher_date', '>=', $fromDate);
                }
                if ($toDate) {
                    $query->where('t.voucher_date', '<=', $toDate);
                }

                $debitTotal = $query->sum('te.base_debit_amount') ?? 0;
                $creditTotal = $query->sum('te.base_credit_amount') ?? 0;
            }

            $balance = ($debitTotal - $creditTotal);

            return [
                'id' => $account->id,
                'account_code' => $account->account_code,
                'account_name' => $account->account_name,
                'account_level' => $account->account_level,
                'account_type' => $account->account_type,
                'parent_account_id' => $account->parent_account_id,
                'is_transactional' => $account->is_transactional,
                'level1_parent_name' => $account->level1_parent_name ?? null,
                'level2_parent_name' => $account->level2_parent_name ?? null,
                'level3_parent_name' => $account->level3_parent_name ?? null,
                'debit_total' => $debitTotal,
                'credit_total' => $creditTotal,
                'balance' => $balance,
            ];
        });

        if ($hideZero) {
            $trialBalanceData = $trialBalanceData->filter(function ($account) {
                return $account['debit_total'] != 0 || $account['credit_total'] != 0 || $account['balance'] != 0;
            });
        }

        $grandTotalDebit = $trialBalanceData->sum('debit_total');
        $grandTotalCredit = $trialBalanceData->sum('credit_total');
        $flatData = $trialBalanceData->values()->toArray();

        return [
            'trialBalanceData' => $flatData,
            'grandTotalDebit' => $grandTotalDebit,
            'grandTotalCredit' => $grandTotalCredit,
        ];
    }
   


    // Add these methods to your TrialBalanceController class

    /**
     * Export trial balance to Excel - CORRECTED VERSION
     */
    public function exportExcel(Request $request)
    {
        $isParentCompany = CompanyHelper::isCurrentCompanyParent();

        $compId = $isParentCompany
            ? ($request->input('comp_id') ?? $request->session()->get('user_comp_id'))
            : $request->session()->get('user_comp_id');

        $locationId = $isParentCompany
            ? ($request->input('location_id') ?? $request->session()->get('user_location_id'))
            : $request->session()->get('user_location_id');

        if (!$compId || !$locationId) {
            return redirect()->back()->with('error', 'Company and Location information is required.');
        }

        // Get filters
        $fromDate = $request->input('from_date');
        $toDate = $request->input('to_date');
        $selectedLevel = $request->input('level', 'all');
        $format = $request->input('format', 'csv');
        $hideZero = $request->input('hide_zero', '0') === '1';

        // Get company info
        $company = DB::table('companies')->where('id', $compId)->first();

        // Get data based on level selection
        if ($selectedLevel === 'all') {
            // Get all accounts
            $accounts = DB::table('chart_of_accounts as coa')
                ->where('coa.comp_id', $compId)
                ->where('coa.location_id', $locationId)
                ->where('coa.status', 'Active')
                ->orderBy('coa.account_code')
                ->get();

            // Calculate balances - ONLY for Level 4 (transactional accounts)
            $trialBalanceData = $accounts->map(function ($account) use ($fromDate, $toDate) {
                // Only calculate transactions for level 4 accounts
                if ($account->account_level == 4) {
                    $transactionQuery = DB::table('transaction_entries as te')
                        ->join('transactions as t', 'te.transaction_id', '=', 't.id')
                        ->where('te.account_id', $account->id)
                        ->where('t.status', 'Posted');

                    if ($fromDate) {
                        $transactionQuery->where('t.voucher_date', '>=', $fromDate);
                    }
                    if ($toDate) {
                        $transactionQuery->where('t.voucher_date', '<=', $toDate);
                    }

                    $transactions = $transactionQuery->get();
                    $debitTotal = $transactions->sum('base_debit_amount') ?? 0;
                    $creditTotal = $transactions->sum('base_credit_amount') ?? 0;
                } else {
                    // Parent accounts will be calculated in hierarchy
                    $debitTotal = 0;
                    $creditTotal = 0;
                }

                $balance = $debitTotal - $creditTotal;

                return [
                    'id' => $account->id,
                    'account_code' => $account->account_code,
                    'account_name' => $account->account_name,
                    'account_level' => $account->account_level,
                    'account_type' => $account->account_type,
                    'parent_account_id' => $account->parent_account_id,
                    'is_transactional' => $account->is_transactional,
                    'debit_total' => $debitTotal,
                    'credit_total' => $creditTotal,
                    'balance' => $balance,
                ];
            });

            // Build hierarchical structure (this will aggregate parent balances)
            $hierarchicalData = $this->buildHierarchy($trialBalanceData, $accounts);

            if ($hideZero) {
                $hierarchicalData = $this->filterZeroBalances($hierarchicalData);
            }

            // Calculate grand totals from LEVEL 4 accounts only
            $grandTotalDebit = $trialBalanceData->where('account_level', 4)->sum('debit_total');
            $grandTotalCredit = $trialBalanceData->where('account_level', 4)->sum('credit_total');

            $data = $hierarchicalData;
        } else {
            // Use the same logic as getSpecificLevelData for proper aggregation
            $levelData = $this->getSpecificLevelData($compId, $locationId, $fromDate, $toDate, $selectedLevel, $hideZero);
            $data = $levelData['trialBalanceData'];
            $grandTotalDebit = $levelData['grandTotalDebit'];
            $grandTotalCredit = $levelData['grandTotalCredit'];
            $trialBalanceData = collect($data);
        }

        // Determine file extension and content type
        $extension = $format === 'xlsx' ? 'xlsx' : 'csv';
        $contentType = $format === 'xlsx' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'text/csv';
        $filename = 'trial_balance_' . date('Y-m-d_His') . '.' . $extension;

        $headers = [
            'Content-Type' => $contentType,
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
            'Pragma' => 'public',
        ];

        if ($format === 'xlsx') {
            return $this->generateXLSX($data, $company, $fromDate, $toDate, $grandTotalDebit, $grandTotalCredit, $selectedLevel);
        }

        // CSV Export
        $callback = function () use ($data, $company, $fromDate, $toDate, $grandTotalDebit, $grandTotalCredit, $selectedLevel) {
            $file = fopen('php://output', 'w');

            // UTF-8 BOM for Excel compatibility
            fprintf($file, chr(0xEF) . chr(0xBB) . chr(0xBF));

            // Header information
            fputcsv($file, [$company->company_name ?? 'N/A']);
            fputcsv($file, ['TRIAL BALANCE REPORT']);
            fputcsv($file, ['Period: ' . ($fromDate ?? 'N/A') . ' to ' . ($toDate ?? 'N/A')]);
            fputcsv($file, ['Level Filter: ' . ($selectedLevel === 'all' ? 'All Levels' : 'Level ' . $selectedLevel)]);
            fputcsv($file, []);

            // Column headers
            fputcsv($file, ['Account Code', 'Account Name', 'Level', 'Debit', 'Credit', 'Balance']);

            if ($selectedLevel === 'all') {
                // Hierarchical output
                $writeLevel = function ($data, $level = 1) use ($file, &$writeLevel) {
                    foreach ($data as $item) {
                        $indent = str_repeat('  ', $level - 1);
                        fputcsv($file, [
                            $item['account_code'] ?? '',
                            $indent . ($item['account_name'] ?? ''),
                            $item['account_level'] ?? $level,
                            number_format($item['debit_total'] ?? 0, 2),
                            number_format($item['credit_total'] ?? 0, 2),
                            number_format($item['balance'] ?? 0, 2),
                        ]);

                        if (!empty($item['children'])) {
                            $writeLevel($item['children'], $level + 1);
                        }
                    }
                };
                $writeLevel($data);
            } else {
                // Flat output for specific level
                foreach ($data as $item) {
                    fputcsv($file, [
                        $item['account_code'] ?? '',
                        $item['account_name'] ?? '',
                        $item['account_level'] ?? '',
                        number_format($item['debit_total'] ?? 0, 2),
                        number_format($item['credit_total'] ?? 0, 2),
                        number_format($item['balance'] ?? 0, 2),
                    ]);
                }
            }

            // Grand totals
            fputcsv($file, []);
            fputcsv($file, [
                '',
                'GRAND TOTAL',
                '',
                number_format($grandTotalDebit, 2),
                number_format($grandTotalCredit, 2),
                number_format($grandTotalDebit - $grandTotalCredit, 2),
            ]);

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Generate XLSX file with proper structure
     */
    private function generateXLSX($data, $company, $fromDate, $toDate, $grandTotalDebit, $grandTotalCredit, $selectedLevel)
    {
        $tempDir = sys_get_temp_dir() . '/trial_balance_' . uniqid();
        mkdir($tempDir, 0777, true);

        // Create required directories
        mkdir($tempDir . '/_rels', 0777, true);
        mkdir($tempDir . '/xl', 0777, true);
        mkdir($tempDir . '/xl/_rels', 0777, true);
        mkdir($tempDir . '/xl/worksheets', 0777, true);

        // [Content_Types].xml
        $contentTypes = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' . PHP_EOL;
        $contentTypes .= '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' . PHP_EOL;
        $contentTypes .= '  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' . PHP_EOL;
        $contentTypes .= '  <Default Extension="xml" ContentType="application/xml"/>' . PHP_EOL;
        $contentTypes .= '  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' . PHP_EOL;
        $contentTypes .= '  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' . PHP_EOL;
        $contentTypes .= '</Types>';
        file_put_contents($tempDir . '/[Content_Types].xml', $contentTypes);

        // _rels/.rels
        $rels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' . PHP_EOL;
        $rels .= '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' . PHP_EOL;
        $rels .= '  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' . PHP_EOL;
        $rels .= '</Relationships>';
        file_put_contents($tempDir . '/_rels/.rels', $rels);

        // xl/_rels/workbook.xml.rels
        $workbookRels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' . PHP_EOL;
        $workbookRels .= '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' . PHP_EOL;
        $workbookRels .= '  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>' . PHP_EOL;
        $workbookRels .= '</Relationships>';
        file_put_contents($tempDir . '/xl/_rels/workbook.xml.rels', $workbookRels);

        // xl/workbook.xml
        $workbook = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' . PHP_EOL;
        $workbook .= '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' . PHP_EOL;
        $workbook .= '  <sheets>' . PHP_EOL;
        $workbook .= '    <sheet name="Trial Balance" sheetId="1" r:id="rId1"/>' . PHP_EOL;
        $workbook .= '  </sheets>' . PHP_EOL;
        $workbook .= '</workbook>';
        file_put_contents($tempDir . '/xl/workbook.xml', $workbook);

        // Build worksheet XML
        $sheetXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' . PHP_EOL;
        $sheetXml .= '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' . PHP_EOL;
        $sheetXml .= '  <sheetData>' . PHP_EOL;

        $rowNum = 1;

        // Header rows
        $sheetXml .= $this->createExcelRow($rowNum++, [
            ['v' => ($company->company_name ?? 'N/A'), 't' => 'str']
        ]);
        $sheetXml .= $this->createExcelRow($rowNum++, [
            ['v' => 'TRIAL BALANCE REPORT', 't' => 'str']
        ]);
        $sheetXml .= $this->createExcelRow($rowNum++, [
            ['v' => 'Period: ' . ($fromDate ?? 'N/A') . ' to ' . ($toDate ?? 'N/A'), 't' => 'str']
        ]);
        $sheetXml .= $this->createExcelRow($rowNum++, [
            ['v' => 'Level Filter: ' . ($selectedLevel === 'all' ? 'All Levels' : 'Level ' . $selectedLevel), 't' => 'str']
        ]);
        $sheetXml .= $this->createExcelRow($rowNum++, []); // Empty row

        // Column headers
        $sheetXml .= $this->createExcelRow($rowNum++, [
            ['v' => 'Account Code', 't' => 'str'],
            ['v' => 'Account Name', 't' => 'str'],
            ['v' => 'Level', 't' => 'str'],
            ['v' => 'Debit', 't' => 'str'],
            ['v' => 'Credit', 't' => 'str'],
            ['v' => 'Balance', 't' => 'str'],
        ]);

        // Data rows
        if ($selectedLevel === 'all') {
            // Hierarchical output
            $rowNum = $this->writeExcelHierarchicalRows($data, $rowNum, $sheetXml);
        } else {
            // Flat output
            foreach ($data as $item) {
                $sheetXml .= $this->createExcelRow($rowNum++, [
                    ['v' => $item['account_code'] ?? '', 't' => 'str'],
                    ['v' => $item['account_name'] ?? '', 't' => 'str'],
                    ['v' => $item['account_level'] ?? '', 't' => 'num'],
                    ['v' => $item['debit_total'] ?? 0, 't' => 'num'],
                    ['v' => $item['credit_total'] ?? 0, 't' => 'num'],
                    ['v' => $item['balance'] ?? 0, 't' => 'num'],
                ]);
            }
        }

        // Grand totals
        $sheetXml .= $this->createExcelRow($rowNum++, []); // Empty row
        $sheetXml .= $this->createExcelRow($rowNum++, [
            ['v' => '', 't' => 'str'],
            ['v' => 'GRAND TOTAL', 't' => 'str'],
            ['v' => '', 't' => 'str'],
            ['v' => $grandTotalDebit, 't' => 'num'],
            ['v' => $grandTotalCredit, 't' => 'num'],
            ['v' => ($grandTotalDebit - $grandTotalCredit), 't' => 'num'],
        ]);

        $sheetXml .= '  </sheetData>' . PHP_EOL;
        $sheetXml .= '</worksheet>';

        // Save worksheet
        file_put_contents($tempDir . '/xl/worksheets/sheet1.xml', $sheetXml);

        // Create ZIP archive
        $zipFile = sys_get_temp_dir() . '/trial_balance_' . uniqid() . '.xlsx';
        $zip = new \ZipArchive();

        if ($zip->open($zipFile, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) !== true) {
            throw new \Exception('Cannot create ZIP archive');
        }

        // Add files to ZIP
        $zip->addFile($tempDir . '/[Content_Types].xml', '[Content_Types].xml');
        $zip->addFile($tempDir . '/_rels/.rels', '_rels/.rels');
        $zip->addFile($tempDir . '/xl/workbook.xml', 'xl/workbook.xml');
        $zip->addFile($tempDir . '/xl/_rels/workbook.xml.rels', 'xl/_rels/workbook.xml.rels');
        $zip->addFile($tempDir . '/xl/worksheets/sheet1.xml', 'xl/worksheets/sheet1.xml');

        $zip->close();

        // Clean up temp directory
        $this->deleteDirectory($tempDir);

        // Return file download
        $filename = 'trial_balance_' . date('Y-m-d_His') . '.xlsx';
        return response()->download($zipFile, $filename)->deleteFileAfterSend(true);
    }

    /**
     * Create Excel row XML with proper escaping
     */
    private function createExcelRow($rowNum, $cells)
    {
        if (empty($cells)) {
            return '    <row r="' . $rowNum . '"/>' . PHP_EOL;
        }

        $xml = '    <row r="' . $rowNum . '">' . PHP_EOL;
        $colNum = 0;

        foreach ($cells as $cell) {
            $colLetter = $this->getColumnLetter($colNum++);
            $cellRef = $colLetter . $rowNum;

            if ($cell['t'] === 'str') {
                // String cell with proper XML escaping
                $escapedValue = $this->xmlEscape($cell['v']);
                $xml .= '      <c r="' . $cellRef . '" t="inlineStr"><is><t>' . $escapedValue . '</t></is></c>' . PHP_EOL;
            } else {
                // Numeric cell
                $numValue = is_numeric($cell['v']) ? $cell['v'] : 0;
                $xml .= '      <c r="' . $cellRef . '" t="n"><v>' . $numValue . '</v></c>' . PHP_EOL;
            }
        }

        $xml .= '    </row>' . PHP_EOL;
        return $xml;
    }

    /**
     * Write hierarchical rows recursively for Excel
     */
    private function writeExcelHierarchicalRows($data, $rowNum, &$sheetXml, $level = 1)
    {
        foreach ($data as $item) {
            $indent = str_repeat('  ', $level - 1);
            $sheetXml .= $this->createExcelRow($rowNum++, [
                ['v' => $item['account_code'] ?? '', 't' => 'str'],
                ['v' => $indent . ($item['account_name'] ?? ''), 't' => 'str'],
                ['v' => $item['account_level'] ?? $level, 't' => 'num'],
                ['v' => $item['debit_total'] ?? 0, 't' => 'num'],
                ['v' => $item['credit_total'] ?? 0, 't' => 'num'],
                ['v' => $item['balance'] ?? 0, 't' => 'num'],
            ]);

            if (!empty($item['children'])) {
                $rowNum = $this->writeExcelHierarchicalRows($item['children'], $rowNum, $sheetXml, $level + 1);
            }
        }

        return $rowNum;
    }

    /**
     * Properly escape XML special characters
     */
    private function xmlEscape($string)
    {
        $string = (string) $string;
        $string = str_replace('&', '&amp;', $string);
        $string = str_replace('<', '&lt;', $string);
        $string = str_replace('>', '&gt;', $string);
        $string = str_replace('"', '&quot;', $string);
        $string = str_replace("'", '&apos;', $string);
        // Remove control characters that are invalid in XML
        $string = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F]/', '', $string);
        return $string;
    }

    /**
     * Get Excel column letter from index
     */
    private function getColumnLetter($index)
    {
        $letter = '';
        while ($index >= 0) {
            $letter = chr($index % 26 + 65) . $letter;
            $index = floor($index / 26) - 1;
        }
        return $letter;
    }

    /**
     * Delete directory recursively
     */
    private function deleteDirectory($dir)
    {
        if (!file_exists($dir)) {
            return;
        }

        $files = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($dir, \RecursiveDirectoryIterator::SKIP_DOTS),
            \RecursiveIteratorIterator::CHILD_FIRST
        );

        foreach ($files as $fileinfo) {
            $todo = ($fileinfo->isDir() ? 'rmdir' : 'unlink');
            $todo($fileinfo->getRealPath());
        }

        rmdir($dir);
    }
}

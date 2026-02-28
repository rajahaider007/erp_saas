<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

$company = DB::table('companies')->first();
$compId = $company->id;

$entries = DB::table('transaction_entries')->where('comp_id', $compId)->get();

$accountBalances = [];
foreach ($entries as $entry) {
    $account = DB::table('chart_of_accounts')->find($entry->account_id);
    $balance = $entry->debit_amount - $entry->credit_amount;
    
    if (!isset($accountBalances[$account->account_type])) {
        $accountBalances[$account->account_type] = 0;
    }
    $accountBalances[$account->account_type] += $balance;
}

echo "\n=== BALANCE SHEET CHECK ===\n";
echo "Account Type Balances:\n";
foreach ($accountBalances as $type => $balance) {
    echo "  $type: " . number_format($balance, 2) . "\n";
}

$assets = $accountBalances['Assets'] ?? 0;
$liabilities = $accountBalances['Liabilities'] ?? 0;
$equity = $accountBalances['Equity'] ?? 0;

$rightSide = $liabilities + $equity;
// Proper balance sheet equation:
// Assets = Liabilities + Equity + (Revenue - Expenses)
// Or: Assets + Expenses = Liabilities + Equity + Revenue

$revenue = $accountBalances['Revenue'] ?? 0;
$expenses = $accountBalances['Expenses'] ?? 0;

// Convert to normal balance format (Revenue and Liabilities/Equity are negatives in our calc, which is correct)
$liabilitiesBalance = abs($liabilities);  // Convert from -25,000 to 25,000
$equityBalance = abs($equity);             // Convert from -500,000 to 500,000
$revenueBalance = abs($revenue);           // Convert from -100,000 to 100,000

echo "\n=== BALANCE SHEET EQUATION CHECK ===\n";
echo "BALANCE SHEET SIDE:\n";
echo "  Assets:              " . number_format($assets, 2) . "\n";
echo "  = Liabilities:       " . number_format($liabilitiesBalance, 2) . "\n";
echo "    + Equity:          " . number_format($equityBalance, 2) . "\n";
echo "    + Net Income       (Revenue " . number_format($revenueBalance, 2) . " - Expenses " . number_format($expenses, 2) . ")\n";

$netIncome = $revenueBalance - $expenses;
$totalRight = $liabilitiesBalance + $equityBalance + $netIncome;

echo "\nCalculation:\n";
echo "  Assets:                    " . number_format($assets, 2) . "\n";
echo "  Liabilities + Equity:      " . number_format($liabilitiesBalance + $equityBalance, 2) . "\n";
echo "  + Net Income:              " . number_format($netIncome, 2) . "\n";
echo "  = Total Right Side:        " . number_format($totalRight, 2) . "\n";
echo "  Difference:                " . number_format($assets - $totalRight, 2) . "\n";
echo "  Balanced? " . (abs($assets - $totalRight) < 0.01 ? "✓ YES - CORRECT!" : "✗ NO - ERROR") . "\n\n";

// Show detailed entries
echo "\n=== TRANSACTION ENTRIES DETAIL ===\n";
$allEntries = DB::table('transaction_entries')
    ->join('chart_of_accounts', 'transaction_entries.account_id', '=', 'chart_of_accounts.id')
    ->where('transaction_entries.comp_id', $compId)
    ->select('transaction_entries.*', 'chart_of_accounts.account_name', 'chart_of_accounts.account_type')
    ->get();

foreach ($allEntries as $entry) {
    echo "{$entry->account_type} - {$entry->account_name}: ";
    echo "Debit=" . number_format($entry->debit_amount, 2) . " | ";
    echo "Credit=" . number_format($entry->credit_amount, 2) . "\n";
}

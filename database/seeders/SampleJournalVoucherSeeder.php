<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Helpers\FiscalYearHelper;

class SampleJournalVoucherSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * 
     * Creates sample journal voucher entries to test:
     * - Income Statement (Revenue, COGS, Operating Expenses)
     * - Balance Sheet (Assets, Liabilities, Equity)
     * - Other Reports
     * 
     * IMPORTANT: Only creates entries for Level 4 accounts as per accounting standards
     * 
     * Note: Vouchers are created in Posted status by default. You can bulk post them
     * from the Journal Voucher UI to reflect them in financial reports.
     */
    public function run(): void
    {
        // Get default company and location
        $company = DB::table('companies')->first();
        $location = DB::table('locations')->first();
        
        if (!$company || !$location) {
            $this->command->error('No company or location found. Please run CompanySeeder and LocationSeeder first.');
            return;
        }

        $compId = $company->id;
        $locationId = $location->id;
        $userId = DB::table('users')->first()->id ?? 1;

        $this->command->info("Creating sample journal voucher entries for Company: {$company->company_name}, Location: {$location->location_name}");

        // Get current fiscal year and a date in the current period
        $currentFiscalYear = FiscalYearHelper::getCurrentFiscalYear($compId);
        $fiscalYearDates = FiscalYearHelper::getFiscalYearDates($currentFiscalYear, $compId);
        $voucherDate = $fiscalYearDates['start_date']->copy()->addDays(5);
        
        $fiscalPeriod = DB::table('fiscal_periods')
            ->where('fiscal_year', $currentFiscalYear)
            ->where('comp_id', $compId)
            ->where('status', 'Open')
            ->first();

        if (!$fiscalPeriod) {
            $this->command->error("No open fiscal period found for FY: {$currentFiscalYear}");
            return;
        }

        // Get currency
        $baseCurrency = $company->default_currency_code ?? 'PKR';

        // Get all level 4 accounts (transactional accounts)
        $level4Accounts = DB::table('chart_of_accounts')
            ->where('account_level', 4)
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->get()
            ->keyBy('account_type');

        $this->command->info("Found " . count($level4Accounts) . " Level 4 accounts");
        
        // Debug: Print account types
        foreach ($level4Accounts as $type => $account) {
            $this->command->info("  - {$type}: {$account->account_name}");
        }

        // Create sample vouchers with realistic transactions
        $vouchersCreated = 0;

        // 1. SALES REVENUE ENTRY (Asset + Revenue)
        if ($level4Accounts->get('Assets') && $level4Accounts->get('Revenue')) {
            $vouchersCreated += $this->createSalesRevenueVoucher(
                $compId, $locationId, $userId, $voucherDate, 
                $fiscalPeriod->id, $currentFiscalYear, $baseCurrency, $level4Accounts
            );
        }

        // 2. EXPENSE ENTRY (Asset - Expenses)
        if ($level4Accounts->get('Assets') && $level4Accounts->get('Expenses')) {
            $vouchersCreated += $this->createExpenseVoucher(
                $compId, $locationId, $userId, $voucherDate, 
                $fiscalPeriod->id, $currentFiscalYear, $baseCurrency, $level4Accounts
            );
        }

        // 3. DEFERRED REVENUE ENTRY (Liabilities + Revenue)
        if ($level4Accounts->get('Liabilities') && $level4Accounts->get('Revenue')) {
            $vouchersCreated += $this->createDeferredRevenueVoucher(
                $compId, $locationId, $userId, $voucherDate, 
                $fiscalPeriod->id, $currentFiscalYear, $baseCurrency, $level4Accounts
            );
        }

        // 4. OPENING BALANCE ENTRY (Assets + Equity)
        if ($level4Accounts->get('Assets') && $level4Accounts->get('Equity')) {
            $vouchersCreated += $this->createOpeningBalanceVoucher(
                $compId, $locationId, $userId, $voucherDate, 
                $fiscalPeriod->id, $currentFiscalYear, $baseCurrency, $level4Accounts
            );
        }

        $this->command->info("✓ Successfully created {$vouchersCreated} sample journal vouchers (all in Posted status)");
        $this->command->info("Next steps:");
        $this->command->info("1. Visit: http://127.0.0.1:8000/accounts/journal-voucher");
        $this->command->info("2. Select all vouchers and use 'Bulk Post' to post them");
        $this->command->info("3. Then visit: http://127.0.0.1:8000/accounts/income-statement to see the dynamic report");
    }

    /**
     * Create Sales Revenue Journal Entry
     */
    private function createSalesRevenueVoucher($compId, $locationId, $userId, $voucherDate, $periodId, $fiscalYear, $baseCurrency, $level4Accounts)
    {
        // Find appropriate accounts - use base types
        $bankAccount = $this->findAccountByType($level4Accounts, ['Assets']);
        $revenueAccount = $this->findAccountByType($level4Accounts, ['Revenue']);

        if (!$bankAccount || !$revenueAccount) {
            return 0;
        }

        $voucherNumber = 'JV-' . uniqid();
        $amount = 100000;

        DB::table('transactions')->insert([
            'voucher_number' => $voucherNumber,
            'voucher_date' => $voucherDate->toDateString(),
            'voucher_type' => 'Journal',
            'reference_number' => 'INV-001',
            'description' => 'Sales revenue from product sales',
            'status' => 'Posted',
            'total_debit' => $amount,
            'total_credit' => $amount,
            'currency_code' => $baseCurrency,
            'exchange_rate' => 1.0,
            'base_currency_total' => $amount,
            'period_id' => $periodId,
            'fiscal_year' => $fiscalYear,
            'comp_id' => $compId,
            'location_id' => $locationId,
            'created_by' => $userId,
            'created_at' => now(),
            'updated_at' => now()
        ]);

        $transactionId = DB::table('transactions')->orderBy('id', 'desc')->first()->id;

        // Debit: Bank/Asset Account
        DB::table('transaction_entries')->insert([
            'transaction_id' => $transactionId,
            'line_number' => 1,
            'account_id' => $bankAccount->id,
            'description' => 'Cash received from sales',
            'debit_amount' => $amount,
            'credit_amount' => 0,
            'currency_code' => $baseCurrency,
            'exchange_rate' => 1.0,
            'base_debit_amount' => $amount,
            'base_credit_amount' => 0,
            'comp_id' => $compId,
            'location_id' => $locationId,
            'created_at' => now(),
            'updated_at' => now()
        ]);

        // Credit: Sales Revenue
        DB::table('transaction_entries')->insert([
            'transaction_id' => $transactionId,
            'line_number' => 2,
            'account_id' => $revenueAccount->id,
            'description' => 'Sales revenue',
            'debit_amount' => 0,
            'credit_amount' => $amount,
            'currency_code' => $baseCurrency,
            'exchange_rate' => 1.0,
            'base_debit_amount' => 0,
            'base_credit_amount' => $amount,
            'comp_id' => $compId,
            'location_id' => $locationId,
            'created_at' => now(),
            'updated_at' => now()
        ]);

        return 1;
    }

    /**
     * Create Service Revenue Journal Entry
     */
    private function createExpenseVoucher($compId, $locationId, $userId, $voucherDate, $periodId, $fiscalYear, $baseCurrency, $level4Accounts)
    {
        $assetAccount = $this->findAccountByType($level4Accounts, ['Assets']);
        $expenseAccount = $this->findAccountByType($level4Accounts, ['Expenses']);

        if (!$assetAccount || !$expenseAccount) {
            return 0;
        }

        $voucherNumber = 'JV-' . uniqid();
        $amount = 50000;

        DB::table('transactions')->insert([
            'voucher_number' => $voucherNumber,
            'voucher_date' => $voucherDate->copy()->addDay()->toDateString(),
            'voucher_type' => 'Journal',
            'reference_number' => 'EXP-001',
            'description' => 'Operating expenses',
            'status' => 'Posted',
            'total_debit' => $amount,
            'total_credit' => $amount,
            'currency_code' => $baseCurrency,
            'exchange_rate' => 1.0,
            'base_currency_total' => $amount,
            'period_id' => $periodId,
            'fiscal_year' => $fiscalYear,
            'comp_id' => $compId,
            'location_id' => $locationId,
            'created_by' => $userId,
            'created_at' => now(),
            'updated_at' => now()
        ]);

        $transactionId = DB::table('transactions')->orderBy('id', 'desc')->first()->id;

        // Debit: Expense
        DB::table('transaction_entries')->insert([
            'transaction_id' => $transactionId,
            'line_number' => 1,
            'account_id' => $expenseAccount->id,
            'description' => 'Operating expenses',
            'debit_amount' => $amount,
            'credit_amount' => 0,
            'currency_code' => $baseCurrency,
            'exchange_rate' => 1.0,
            'base_debit_amount' => $amount,
            'base_credit_amount' => 0,
            'comp_id' => $compId,
            'location_id' => $locationId,
            'created_at' => now(),
            'updated_at' => now()
        ]);

        // Credit: Asset
        DB::table('transaction_entries')->insert([
            'transaction_id' => $transactionId,
            'line_number' => 2,
            'account_id' => $assetAccount->id,
            'description' => 'Paid from bank',
            'debit_amount' => 0,
            'credit_amount' => $amount,
            'currency_code' => $baseCurrency,
            'exchange_rate' => 1.0,
            'base_debit_amount' => 0,
            'base_credit_amount' => $amount,
            'comp_id' => $compId,
            'location_id' => $locationId,
            'created_at' => now(),
            'updated_at' => now()
        ]);

        return 1;
    }

    /**
     * Create Deferred Revenue Journal Entry
     * 
     * ACCOUNTING PRINCIPLE:
     * When a customer pays in advance, you receive cash (Asset ↑) but the revenue is NOT earned yet.
     * The obligation to deliver goods/services is recorded as a Liability (Deferred Revenue).
     * 
     * Correct Entry:
     *   Debit: Assets (Cash/Bank received from customer)
     *   Credit: Liabilities (Deferred Revenue - obligation to deliver)
     * 
     * Later when service/product is delivered:
     *   Debit: Liabilities (Deferred Revenue)
     *   Credit: Revenue (recognized)
     */
    private function createDeferredRevenueVoucher($compId, $locationId, $userId, $voucherDate, $periodId, $fiscalYear, $baseCurrency, $level4Accounts)
    {
        $assetAccount = $this->findAccountByType($level4Accounts, ['Assets']);
        $liabilityAccount = $this->findAccountByType($level4Accounts, ['Liabilities']);

        if (!$assetAccount || !$liabilityAccount) {
            return 0;
        }

        $voucherNumber = 'JV-' . uniqid();
        $amount = 25000;

        DB::table('transactions')->insert([
            'voucher_number' => $voucherNumber,
            'voucher_date' => $voucherDate->copy()->addDays(5)->toDateString(),
            'voucher_type' => 'Journal',
            'reference_number' => 'DEF-001',
            'description' => 'Advance customer payment - recorded as deferred revenue',
            'status' => 'Posted',
            'total_debit' => $amount,
            'total_credit' => $amount,
            'currency_code' => $baseCurrency,
            'exchange_rate' => 1.0,
            'base_currency_total' => $amount,
            'period_id' => $periodId,
            'fiscal_year' => $fiscalYear,
            'comp_id' => $compId,
            'location_id' => $locationId,
            'created_by' => $userId,
            'created_at' => now(),
            'updated_at' => now()
        ]);

        $transactionId = DB::table('transactions')->orderBy('id', 'desc')->first()->id;

        // Debit: Asset Account (Cash received from customer)
        DB::table('transaction_entries')->insert([
            'transaction_id' => $transactionId,
            'line_number' => 1,
            'account_id' => $assetAccount->id,
            'description' => 'Cash received from customer advance payment',
            'debit_amount' => $amount,
            'credit_amount' => 0,
            'currency_code' => $baseCurrency,
            'exchange_rate' => 1.0,
            'base_debit_amount' => $amount,
            'base_credit_amount' => 0,
            'comp_id' => $compId,
            'location_id' => $locationId,
            'created_at' => now(),
            'updated_at' => now()
        ]);

        // Credit: Liability Account (Deferred Revenue - obligation to deliver goods/services)
        DB::table('transaction_entries')->insert([
            'transaction_id' => $transactionId,
            'line_number' => 2,
            'account_id' => $liabilityAccount->id,
            'description' => 'Deferred revenue liability - service not yet delivered',
            'debit_amount' => 0,
            'credit_amount' => $amount,
            'currency_code' => $baseCurrency,
            'exchange_rate' => 1.0,
            'base_debit_amount' => 0,
            'base_credit_amount' => $amount,
            'comp_id' => $compId,
            'location_id' => $locationId,
            'created_at' => now(),
            'updated_at' => now()
        ]);

        return 1;
    }

    /**
     * Create Opening Balance Journal Entry
     */
    private function createOpeningBalanceVoucher($compId, $locationId, $userId, $voucherDate, $periodId, $fiscalYear, $baseCurrency, $level4Accounts)
    {
        $assetAccount = $this->findAccountByType($level4Accounts, ['Assets']);
        $equityAccount = $this->findAccountByType($level4Accounts, ['Equity']);

        if (!$assetAccount || !$equityAccount) {
            return 0;
        }

        $voucherNumber = 'JV-' . uniqid();
        $amount = 500000;

        DB::table('transactions')->insert([
            'voucher_number' => $voucherNumber,
            'voucher_date' => $voucherDate->copy()->toDateString(),
            'voucher_type' => 'Journal',
            'reference_number' => 'OPEN-001',
            'description' => 'Opening balance - Initial capital contribution',
            'status' => 'Posted',
            'total_debit' => $amount,
            'total_credit' => $amount,
            'currency_code' => $baseCurrency,
            'exchange_rate' => 1.0,
            'base_currency_total' => $amount,
            'period_id' => $periodId,
            'fiscal_year' => $fiscalYear,
            'comp_id' => $compId,
            'location_id' => $locationId,
            'created_by' => $userId,
            'created_at' => now(),
            'updated_at' => now()
        ]);

        $transactionId = DB::table('transactions')->orderBy('id', 'desc')->first()->id;

        // Debit: Asset
        DB::table('transaction_entries')->insert([
            'transaction_id' => $transactionId,
            'line_number' => 1,
            'account_id' => $assetAccount->id,
            'description' => 'Opening asset balance',
            'debit_amount' => $amount,
            'credit_amount' => 0,
            'currency_code' => $baseCurrency,
            'exchange_rate' => 1.0,
            'base_debit_amount' => $amount,
            'base_credit_amount' => 0,
            'comp_id' => $compId,
            'location_id' => $locationId,
            'created_at' => now(),
            'updated_at' => now()
        ]);

        // Credit: Equity
        DB::table('transaction_entries')->insert([
            'transaction_id' => $transactionId,
            'line_number' => 2,
            'account_id' => $equityAccount->id,
            'description' => 'Opening capital',
            'debit_amount' => 0,
            'credit_amount' => $amount,
            'currency_code' => $baseCurrency,
            'exchange_rate' => 1.0,
            'base_debit_amount' => 0,
            'base_credit_amount' => $amount,
            'comp_id' => $compId,
            'location_id' => $locationId,
            'created_at' => now(),
            'updated_at' => now()
        ]);

        return 1;
    }

    /**
     * Helper: Find account by account type
     */
    private function findAccountByType($accounts, $types)
    {
        foreach ((array)$types as $type) {
            if ($accounts->get($type)) {
                return $accounts->get($type);
            }
        }
        return null;
    }
}

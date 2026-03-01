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
     * Creates realistic journal entries for:
     * - Accounts Payable (vendor purchases on credit)
     * - Accounts Receivable (customer sales on credit)
     * - Cash transactions (Cash in Hand)
     * - Bank transactions (HBL Bank)
     * 
     * All entries follow proper double-entry bookkeeping
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

        $this->command->info("Creating realistic accounting entries for Company: {$company->company_name}");

        // Get current fiscal year and dates
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

        // Find specific accounts by code
        $cashAccount = $this->findAccountByCode($compId, $locationId, '100010001000001'); // Cash in Hands
        $bankAccount = $this->findAccountByCode($compId, $locationId, '100010003000001'); // HBL Bank
        $receivableAccount = $this->findAccountByName($compId, $locationId, 'receivable');
        $payableAccount = $this->findAccountByName($compId, $locationId, 'payable');
        $revenueAccount = $this->findAccountByAccountType($compId, $locationId, 'Revenue');
        $expenseAccount = $this->findAccountByAccountType($compId, $locationId, 'Expenses');
        $inventoryAccount = $this->findAccountByName($compId, $locationId, 'inventory');

        $this->command->info("Located accounts:");
        if ($cashAccount) $this->command->info("  ✓ Cash: {$cashAccount->account_name}");
        if ($bankAccount) $this->command->info("  ✓ Bank: {$bankAccount->account_name}");
        if ($receivableAccount) $this->command->info("  ✓ Receivable: {$receivableAccount->account_name}");
        if ($payableAccount) $this->command->info("  ✓ Payable: {$payableAccount->account_name}");
        if ($revenueAccount) $this->command->info("  ✓ Revenue: {$revenueAccount->account_name}");

        $vouchersCreated = 0;
        $dayOffset = 0;

        // 1. PURCHASE ON CREDIT - Creates Accounts Payable
        if ($inventoryAccount && $payableAccount) {
            $vouchersCreated += $this->createPurchaseOnCredit(
                $compId, $locationId, $userId, $voucherDate->copy()->addDays($dayOffset++),
                $fiscalPeriod->id, $currentFiscalYear, $baseCurrency, 
                $inventoryAccount, $payableAccount, 250000, 'INV-SUPP-001'
            );
        }

        // 2. ANOTHER PURCHASE ON CREDIT
        if ($expenseAccount && $payableAccount) {
            $vouchersCreated += $this->createPurchaseOnCredit(
                $compId, $locationId, $userId, $voucherDate->copy()->addDays($dayOffset++),
                $fiscalPeriod->id, $currentFiscalYear, $baseCurrency,
                $expenseAccount, $payableAccount, 75000, 'BILL-SUPP-002'
            );
        }

        // 3. SALE ON CREDIT - Creates Accounts Receivable
        if ($receivableAccount && $revenueAccount) {
            $vouchersCreated += $this->createSaleOnCredit(
                $compId, $locationId, $userId, $voucherDate->copy()->addDays($dayOffset++),
                $fiscalPeriod->id, $currentFiscalYear, $baseCurrency,
                $receivableAccount, $revenueAccount, 350000, 'INV-CUST-001'
            );
        }

        // 4. ANOTHER SALE ON CREDIT
        if ($receivableAccount && $revenueAccount) {
            $vouchersCreated += $this->createSaleOnCredit(
                $compId, $locationId, $userId, $voucherDate->copy()->addDays($dayOffset++),
                $fiscalPeriod->id, $currentFiscalYear, $baseCurrency,
                $receivableAccount, $revenueAccount, 180000, 'INV-CUST-002'
            );
        }

        // 5. CASH SALE - Increases Cash in Hand
        if ($cashAccount && $revenueAccount) {
            $vouchersCreated += $this->createCashSale(
                $compId, $locationId, $userId, $voucherDate->copy()->addDays($dayOffset++),
                $fiscalPeriod->id, $currentFiscalYear, $baseCurrency,
                $cashAccount, $revenueAccount, 125000, 'CASH-001'
            );
        }

        // 6. COLLECTION FROM CUSTOMER (reduces Receivable, increases Bank)
        if ($bankAccount && $receivableAccount) {
            $vouchersCreated += $this->createCustomerPayment(
                $compId, $locationId, $userId, $voucherDate->copy()->addDays($dayOffset++),
                $fiscalPeriod->id, $currentFiscalYear, $baseCurrency,
                $bankAccount, $receivableAccount, 200000, 'RCPT-CUST-001'
            );
        }

        // 7. PAYMENT TO SUPPLIER BY BANK (reduces Payable, reduces Bank)
        if ($bankAccount && $payableAccount) {
            $vouchersCreated += $this->createSupplierPayment(
                $compId, $locationId, $userId, $voucherDate->copy()->addDays($dayOffset++),
                $fiscalPeriod->id, $currentFiscalYear, $baseCurrency,
                $payableAccount, $bankAccount, 150000, 'PAY-SUPP-001'
            );
        }

        // 8. CASH DEPOSIT TO BANK
        if ($cashAccount && $bankAccount) {
            $vouchersCreated += $this->createCashDeposit(
                $compId, $locationId, $userId, $voucherDate->copy()->addDays($dayOffset++),
                $fiscalPeriod->id, $currentFiscalYear, $baseCurrency,
                $bankAccount, $cashAccount, 80000, 'DEP-001'
            );
        }

        // 9. BANK WITHDRAWAL TO CASH
        if ($bankAccount && $cashAccount) {
            $vouchersCreated += $this->createBankWithdrawal(
                $compId, $locationId, $userId, $voucherDate->copy()->addDays($dayOffset++),
                $fiscalPeriod->id, $currentFiscalYear, $baseCurrency,
                $cashAccount, $bankAccount, 50000, 'WD-001'
            );
        }

        // 10. EXPENSE PAID BY CASH
        if ($cashAccount && $expenseAccount) {
            $vouchersCreated += $this->createCashExpense(
                $compId, $locationId, $userId, $voucherDate->copy()->addDays($dayOffset++),
                $fiscalPeriod->id, $currentFiscalYear, $baseCurrency,
                $expenseAccount, $cashAccount, 35000, 'EXP-CASH-001'
            );
        }

        // 11. EXPENSE PAID BY BANK
        if ($bankAccount && $expenseAccount) {
            $vouchersCreated += $this->createBankExpense(
                $compId, $locationId, $userId, $voucherDate->copy()->addDays($dayOffset++),
                $fiscalPeriod->id, $currentFiscalYear, $baseCurrency,
                $expenseAccount, $bankAccount, 65000, 'EXP-BANK-001'
            );
        }

        $this->command->info("✓ Created {$vouchersCreated} realistic journal entries (Posted)");
        $this->command->info("Dashboard cards will now show:");
        $this->command->info("  • Accounts Payable balance");
        $this->command->info("  • Accounts Receivable balance");
        $this->command->info("  • Cash in Hand balance");
        $this->command->info("  • Bank (HBL) balance");
    }

    // ===== ACCOUNT LOOKUP HELPERS =====
    
    private function findAccountByCode($compId, $locationId, $code)
    {
        return DB::table('chart_of_accounts')
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->where('account_code', $code)
            ->where('account_level', 4)
            ->where('is_transactional', true)
            ->first();
    }

    private function findAccountByName($compId, $locationId, $keyword)
    {
        return DB::table('chart_of_accounts')
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->where('account_level', 4)
            ->where('is_transactional', true)
            ->whereRaw('LOWER(account_name) LIKE ?', ['%' . strtolower($keyword) . '%'])
            ->first();
    }

    private function findAccountByAccountType($compId, $locationId, $accountType)
    {
        return DB::table('chart_of_accounts')
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->where('account_level', 4)
            ->where('is_transactional', true)
            ->where('account_type', $accountType)
            ->first();
    }

    // ===== TRANSACTION CREATION METHODS =====

    /**
     * 1. Purchase on Credit - Creates PAYABLE
     * Dr: Inventory/Expense
     * Cr: Accounts Payable
     */
    private function createPurchaseOnCredit($compId, $locationId, $userId, $voucherDate, $periodId, $fiscalYear, $baseCurrency, $debitAccount, $payableAccount, $amount, $refNo)
    {
        $voucherNumber = 'JV-' . uniqid();

        DB::table('transactions')->insert([
            'voucher_number' => $voucherNumber,
            'voucher_date' => $voucherDate->toDateString(),
            'voucher_type' => 'Journal',
            'reference_number' => $refNo,
            'description' => 'Purchase on credit from supplier',
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
            'posted_at' => now(),
            'created_at' => now(),
            'updated_at' => now()
        ]);

        $transactionId = DB::table('transactions')->orderBy('id', 'desc')->first()->id;

        DB::table('transaction_entries')->insert([
            [
                'transaction_id' => $transactionId,
                'line_number' => 1,
                'account_id' => $debitAccount->id,
                'description' => 'Goods/services purchased',
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
            ],
            [
                'transaction_id' => $transactionId,
                'line_number' => 2,
                'account_id' => $payableAccount->id,
                'description' => 'Amount owed to supplier',
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
            ]
        ]);

        return 1;
    }

    /**
     * 2. Sale on Credit - Creates RECEIVABLE
     * Dr: Accounts Receivable
     * Cr: Sales Revenue
     */
    private function createSaleOnCredit($compId, $locationId, $userId, $voucherDate, $periodId, $fiscalYear, $baseCurrency, $receivableAccount, $revenueAccount, $amount, $refNo)
    {
        $voucherNumber = 'JV-' . uniqid();

        DB::table('transactions')->insert([
            'voucher_number' => $voucherNumber,
            'voucher_date' => $voucherDate->toDateString(),
            'voucher_type' => 'Journal',
            'reference_number' => $refNo,
            'description' => 'Credit sale to customer',
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
            'posted_at' => now(),
            'created_at' => now(),
            'updated_at' => now()
        ]);

        $transactionId = DB::table('transactions')->orderBy('id', 'desc')->first()->id;

        DB::table('transaction_entries')->insert([
            [
                'transaction_id' => $transactionId,
                'line_number' => 1,
                'account_id' => $receivableAccount->id,
                'description' => 'Amount due from customer',
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
            ],
            [
                'transaction_id' => $transactionId,
                'line_number' => 2,
                'account_id' => $revenueAccount->id,
                'description' => 'Sales revenue earned',
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
            ]
        ]);

        return 1;
    }

    /**
     * 3. Cash Sale - Increases CASH
     * Dr: Cash
     * Cr: Sales Revenue
     */
    private function createCashSale($compId, $locationId, $userId, $voucherDate, $periodId, $fiscalYear, $baseCurrency, $cashAccount, $revenueAccount, $amount, $refNo)
    {
        $voucherNumber = 'JV-' . uniqid();

        DB::table('transactions')->insert([
            'voucher_number' => $voucherNumber,
            'voucher_date' => $voucherDate->toDateString(),
            'voucher_type' => 'Journal',
            'reference_number' => $refNo,
            'description' => 'Cash sale - payment received immediately',
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
            'posted_at' => now(),
            'created_at' => now(),
            'updated_at' => now()
        ]);

        $transactionId = DB::table('transactions')->orderBy('id', 'desc')->first()->id;

        DB::table('transaction_entries')->insert([
            [
                'transaction_id' => $transactionId,
                'line_number' => 1,
                'account_id' => $cashAccount->id,
                'description' => 'Cash received from customer',
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
            ],
            [
                'transaction_id' => $transactionId,
                'line_number' => 2,
                'account_id' => $revenueAccount->id,
                'description' => 'Sales revenue earned',
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
            ]
        ]);

        return 1;
    }

    /**
     * 4. Customer Payment - Reduces RECEIVABLE, Increases BANK
     * Dr: Bank
     * Cr: Accounts Receivable
     */
    private function createCustomerPayment($compId, $locationId, $userId, $voucherDate, $periodId, $fiscalYear, $baseCurrency, $bankAccount, $receivableAccount, $amount, $refNo)
    {
        $voucherNumber = 'JV-' . uniqid();

        DB::table('transactions')->insert([
            'voucher_number' => $voucherNumber,
            'voucher_date' => $voucherDate->toDateString(),
            'voucher_type' => 'Journal',
            'reference_number' => $refNo,
            'description' => 'Payment received from customer',
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
            'posted_at' => now(),
            'created_at' => now(),
            'updated_at' => now()
        ]);

        $transactionId = DB::table('transactions')->orderBy('id', 'desc')->first()->id;

        DB::table('transaction_entries')->insert([
            [
                'transaction_id' => $transactionId,
                'line_number' => 1,
                'account_id' => $bankAccount->id,
                'description' => 'Deposited to bank from customer',
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
            ],
            [
                'transaction_id' => $transactionId,
                'line_number' => 2,
                'account_id' => $receivableAccount->id,
                'description' => 'Customer receivable cleared',
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
            ]
        ]);

        return 1;
    }

    /**
     * 5. Supplier Payment - Reduces PAYABLE, Reduces BANK
     * Dr: Accounts Payable
     * Cr: Bank
     */
    private function createSupplierPayment($compId, $locationId, $userId, $voucherDate, $periodId, $fiscalYear, $baseCurrency, $payableAccount, $bankAccount, $amount, $refNo)
    {
        $voucherNumber = 'JV-' . uniqid();

        DB::table('transactions')->insert([
            'voucher_number' => $voucherNumber,
            'voucher_date' => $voucherDate->toDateString(),
            'voucher_type' => 'Journal',
            'reference_number' => $refNo,
            'description' => 'Payment made to supplier',
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
            'posted_at' => now(),
            'created_at' => now(),
            'updated_at' => now()
        ]);

        $transactionId = DB::table('transactions')->orderBy('id', 'desc')->first()->id;

        DB::table('transaction_entries')->insert([
            [
                'transaction_id' => $transactionId,
                'line_number' => 1,
                'account_id' => $payableAccount->id,
                'description' => 'Supplier payable cleared',
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
            ],
            [
                'transaction_id' => $transactionId,
                'line_number' => 2,
                'account_id' => $bankAccount->id,
                'description' => 'Paid from bank account',
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
            ]
        ]);

        return 1;
    }

    /**
     * 6. Cash Deposit to Bank
     * Dr: Bank
     * Cr: Cash
     */
    private function createCashDeposit($compId, $locationId, $userId, $voucherDate, $periodId, $fiscalYear, $baseCurrency, $bankAccount, $cashAccount, $amount, $refNo)
    {
        $voucherNumber = 'JV-' . uniqid();

        DB::table('transactions')->insert([
            'voucher_number' => $voucherNumber,
            'voucher_date' => $voucherDate->toDateString(),
            'voucher_type' => 'Journal',
            'reference_number' => $refNo,
            'description' => 'Cash deposited to bank',
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
            'posted_at' => now(),
            'created_at' => now(),
            'updated_at' => now()
        ]);

        $transactionId = DB::table('transactions')->orderBy('id', 'desc')->first()->id;

        DB::table('transaction_entries')->insert([
            [
                'transaction_id' => $transactionId,
                'line_number' => 1,
                'account_id' => $bankAccount->id,
                'description' => 'Cash deposited to bank',
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
            ],
            [
                'transaction_id' => $transactionId,
                'line_number' => 2,
                'account_id' => $cashAccount->id,
                'description' => 'Cash withdrawn from hand',
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
            ]
        ]);

        return 1;
    }

    /**
     * 7. Bank Withdrawal to Cash
     * Dr: Cash
     * Cr: Bank
     */
    private function createBankWithdrawal($compId, $locationId, $userId, $voucherDate, $periodId, $fiscalYear, $baseCurrency, $cashAccount, $bankAccount, $amount, $refNo)
    {
        $voucherNumber = 'JV-' . uniqid();

        DB::table('transactions')->insert([
            'voucher_number' => $voucherNumber,
            'voucher_date' => $voucherDate->toDateString(),
            'voucher_type' => 'Journal',
            'reference_number' => $refNo,
            'description' => 'Cash withdrawn from bank',
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
            'posted_at' => now(),
            'created_at' => now(),
            'updated_at' => now()
        ]);

        $transactionId = DB::table('transactions')->orderBy('id', 'desc')->first()->id;

        DB::table('transaction_entries')->insert([
            [
                'transaction_id' => $transactionId,
                'line_number' => 1,
                'account_id' => $cashAccount->id,
                'description' => 'Cash received from bank',
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
            ],
            [
                'transaction_id' => $transactionId,
                'line_number' => 2,
                'account_id' => $bankAccount->id,
                'description' => 'Withdrawn from bank account',
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
            ]
        ]);

        return 1;
    }

    /**
     * 8. Cash Expense
     * Dr: Expense
     * Cr: Cash
     */
    private function createCashExpense($compId, $locationId, $userId, $voucherDate, $periodId, $fiscalYear, $baseCurrency, $expenseAccount, $cashAccount, $amount, $refNo)
    {
        $voucherNumber = 'JV-' . uniqid();

        DB::table('transactions')->insert([
            'voucher_number' => $voucherNumber,
            'voucher_date' => $voucherDate->toDateString(),
            'voucher_type' => 'Journal',
            'reference_number' => $refNo,
            'description' => 'Expense paid by cash',
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
            'posted_at' => now(),
            'created_at' => now(),
            'updated_at' => now()
        ]);

        $transactionId = DB::table('transactions')->orderBy('id', 'desc')->first()->id;

        DB::table('transaction_entries')->insert([
            [
                'transaction_id' => $transactionId,
                'line_number' => 1,
                'account_id' => $expenseAccount->id,
                'description' => 'Operating expense',
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
            ],
            [
                'transaction_id' => $transactionId,
                'line_number' => 2,
                'account_id' => $cashAccount->id,
                'description' => 'Paid by cash',
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
            ]
        ]);

        return 1;
    }

    /**
     * 9. Bank Expense
     * Dr: Expense
     * Cr: Bank
     */
    private function createBankExpense($compId, $locationId, $userId, $voucherDate, $periodId, $fiscalYear, $baseCurrency, $expenseAccount, $bankAccount, $amount, $refNo)
    {
        $voucherNumber = 'JV-' . uniqid();

        DB::table('transactions')->insert([
            'voucher_number' => $voucherNumber,
            'voucher_date' => $voucherDate->toDateString(),
            'voucher_type' => 'Journal',
            'reference_number' => $refNo,
            'description' => 'Expense paid by bank transfer',
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
            'posted_at' => now(),
            'created_at' => now(),
            'updated_at' => now()
        ]);

        $transactionId = DB::table('transactions')->orderBy('id', 'desc')->first()->id;

        DB::table('transaction_entries')->insert([
            [
                'transaction_id' => $transactionId,
                'line_number' => 1,
                'account_id' => $expenseAccount->id,
                'description' => 'Operating expense',
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
            ],
            [
                'transaction_id' => $transactionId,
                'line_number' => 2,
                'account_id' => $bankAccount->id,
                'description' => 'Paid by bank',
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
            ]
        ]);

        return 1;
    }
}

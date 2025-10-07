<?php

namespace App\Http\Controllers\Accounts;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class JournalVoucherController extends Controller
{
    /**
     * Display a listing of journal vouchers
     */
    public function index(Request $request)
    {
        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');
        $locationId = $request->input('user_location_id') ?? $request->session()->get('user_location_id');
        
        if (!$compId || !$locationId) {
            return Inertia::render('Accounts/JournalVoucher/List', [
                'journalVouchers' => [],
                'accounts' => [],
                'error' => 'Company and Location information is required. Please contact administrator.'
            ]);
        }

        $journalVouchers = DB::table('transactions')
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->where('voucher_type', 'Journal Voucher')
            ->orderBy('voucher_date', 'desc')
            ->orderBy('voucher_number', 'desc')
            ->get();

        $accounts = DB::table('chart_of_accounts')
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->where('status', 'Active')
            ->orderBy('account_code')
            ->get();

        return Inertia::render('Accounts/JournalVoucher/List', [
            'journalVouchers' => $journalVouchers,
            'accounts' => $accounts
        ]);
    }

    /**
     * Show the form for creating a new journal voucher
     */
    public function create(Request $request)
    {
        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');
        $locationId = $request->input('user_location_id') ?? $request->session()->get('user_location_id');
        
        if (!$compId || !$locationId) {
            return Inertia::render('Accounts/JournalVoucher/Create', [
                'accounts' => [],
                'currencies' => [],
                'company' => null,
                'error' => 'Company and Location information is required. Please contact administrator.'
            ]);
        }

        // Get company settings
        $company = DB::table('companies')->where('id', $compId)->first();

        // Get currencies
        $currencies = DB::table('currencies')
            ->where('is_active', true)
            ->orderBy('name')
            ->get()
            ->map(function ($currency) {
                return [
                    'value' => $currency->code,
                    'label' => $currency->name,
                    'symbol' => $currency->symbol
                ];
            });

        $accounts = DB::table('chart_of_accounts')
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->where('status', 'Active')
            ->orderBy('account_code')
            ->get();

        return Inertia::render('Accounts/JournalVoucher/Create', [
            'accounts' => $accounts,
            'currencies' => $currencies,
            'company' => $company
        ]);
    }

    /**
     * Store a newly created journal voucher
     */
    public function store(Request $request)
    {
        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');
        $locationId = $request->input('user_location_id') ?? $request->session()->get('user_location_id');
        $userId = $request->input('user_id') ?? $request->session()->get('user_id');
        
        if (!$compId || !$locationId || !$userId) {
            return redirect()->back()->with('error', 'User authentication information is required.');
        }

        // Validate request
        $validated = $request->validate([
            'voucher_date' => 'required|date',
            'description' => 'required|string|max:500',
            'reference_number' => 'nullable|string|max:100',
            'entries' => 'required|array|min:2',
            'entries.*.account_id' => 'required|integer|exists:chart_of_accounts,id',
            'entries.*.description' => 'nullable|string|max:500',
            'entries.*.debit_amount' => 'required_without:entries.*.credit_amount|numeric|min:0',
            'entries.*.credit_amount' => 'required_without:entries.*.debit_amount|numeric|min:0',
            'entries.*.currency_code' => 'required|string|max:3',
            'entries.*.exchange_rate' => 'required|numeric|min:0.000001',
            'attachments' => 'nullable|array',
            'attachments.*' => 'string'
        ]);

        // Always auto-generate voucher number for Journal Vouchers
        $company = DB::table('companies')->where('id', $compId)->first();

        // Validate double entry principle in base currency
        $totalBaseDebit = 0;
        $totalBaseCredit = 0;
        
        foreach ($request->entries as $entry) {
            $debit = $entry['debit_amount'] ?? 0;
            $credit = $entry['credit_amount'] ?? 0;
            $exchangeRate = $entry['exchange_rate'] ?? 1.0;
            
            if ($debit > 0 && $credit > 0) {
                return redirect()->back()->withErrors(['entries' => 'Each entry must be either debit or credit, not both']);
            }
            
            if ($debit == 0 && $credit == 0) {
                return redirect()->back()->withErrors(['entries' => 'Each entry must have either debit or credit amount']);
            }
            
            // Convert to base currency
            $baseDebit = $debit * $exchangeRate;
            $baseCredit = $credit * $exchangeRate;
            
            $totalBaseDebit += $baseDebit;
            $totalBaseCredit += $baseCredit;
        }
        
        if (abs($totalBaseDebit - $totalBaseCredit) > 0.01) {
            return redirect()->back()->withErrors(['entries' => 'Total debits must equal total credits in base currency (Double Entry Principle)']);
        }

        // Auto-generate voucher number
        $voucherNumber = $this->generateVoucherNumber($compId, $locationId, 'Journal Voucher');
        
        // Debug: Log the generated voucher number
        Log::info('Generated voucher number: ' . $voucherNumber . ' for company: ' . $compId . ', location: ' . $locationId);

        DB::beginTransaction();
        
        try {
            // Create transaction
            $transactionId = DB::table('transactions')->insertGetId([
                'voucher_number' => $voucherNumber,
                'voucher_date' => $request->voucher_date,
                'voucher_type' => 'Journal Voucher',
                'reference_number' => $request->reference_number,
                'description' => $request->description,
                'status' => 'Draft',
                'total_debit' => $totalBaseDebit,
                'total_credit' => $totalBaseCredit,
                'currency_code' => $company->default_currency_code ?? 'PKR',
                'exchange_rate' => 1.0,
                'base_currency_total' => $totalBaseDebit,
                'attachments' => json_encode($request->attachments ?? []),
                'period_id' => 1, // Default period - should be calculated based on date
                'comp_id' => $compId,
                'location_id' => $locationId,
                'created_by' => $userId,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            // Create transaction entries
            foreach ($request->entries as $index => $entry) {
                $debit = $entry['debit_amount'] ?? 0;
                $credit = $entry['credit_amount'] ?? 0;
                $exchangeRate = $entry['exchange_rate'] ?? 1.0;
                
                // Calculate base currency amounts
                $baseDebit = $debit * $exchangeRate;
                $baseCredit = $credit * $exchangeRate;
                
                DB::table('transaction_entries')->insert([
                    'transaction_id' => $transactionId,
                    'line_number' => $index + 1,
                    'account_id' => $entry['account_id'],
                    'description' => $entry['description'],
                    'debit_amount' => $debit,
                    'credit_amount' => $credit,
                    'currency_code' => $entry['currency_code'],
                    'exchange_rate' => $exchangeRate,
                    'base_debit_amount' => $baseDebit,
                    'base_credit_amount' => $baseCredit,
                    'comp_id' => $compId,
                    'location_id' => $locationId,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }

            DB::commit();

            return redirect()->route('accounts.journal-voucher.index')
                           ->with('success', 'Journal voucher created successfully!');

        } catch (\Exception $e) {
            DB::rollback();
            return redirect()->back()->with('error', 'Error creating journal voucher: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified journal voucher
     */
    public function show(Request $request, $id)
    {
        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');
        $locationId = $request->input('user_location_id') ?? $request->session()->get('user_location_id');
        
        if (!$compId || !$locationId) {
            return Inertia::render('Accounts/JournalVoucher/Show', [
                'voucher' => null,
                'entries' => [],
                'error' => 'Company and Location information is required. Please contact administrator.'
            ]);
        }

        $voucher = DB::table('transactions')
            ->where('id', $id)
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->where('voucher_type', 'Journal Voucher')
            ->first();

        if (!$voucher) {
            abort(404, 'Journal voucher not found');
        }

        $entries = DB::table('transaction_entries')
            ->join('chart_of_accounts', 'transaction_entries.account_id', '=', 'chart_of_accounts.id')
            ->where('transaction_entries.transaction_id', $id)
            ->select(
                'transaction_entries.*',
                'chart_of_accounts.account_code',
                'chart_of_accounts.account_name',
                'chart_of_accounts.account_type'
            )
            ->orderBy('transaction_entries.line_number')
            ->get();

        return Inertia::render('Accounts/JournalVoucher/Show', [
            'voucher' => $voucher,
            'entries' => $entries
        ]);
    }

    /**
     * Show the form for editing the specified journal voucher
     */
    public function edit(Request $request, $id)
    {
        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');
        $locationId = $request->input('user_location_id') ?? $request->session()->get('user_location_id');
        
        if (!$compId || !$locationId) {
            return Inertia::render('Accounts/JournalVoucher/Create', [
                'accounts' => [],
                'voucher' => null,
                'entries' => [],
                'error' => 'Company and Location information is required. Please contact administrator.'
            ]);
        }

        $voucher = DB::table('transactions')
            ->where('id', $id)
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->where('voucher_type', 'Journal Voucher')
            ->first();

        if (!$voucher) {
            abort(404, 'Journal voucher not found');
        }

        if ($voucher->status !== 'Draft') {
            return redirect()->route('accounts.journal-voucher.index')
                ->with('error', 'Only draft vouchers can be edited');
        }

        $entries = DB::table('transaction_entries')
            ->where('transaction_id', $id)
            ->orderBy('line_number')
            ->get();

        $accounts = DB::table('chart_of_accounts')
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->where('status', 'Active')
            ->orderBy('account_code')
            ->get();

        // Load attachments
        $attachments = [];
        if ($voucher->attachments) {
            $attachmentIds = json_decode($voucher->attachments, true);
            if (is_array($attachmentIds)) {
                // In a real implementation, you would fetch from a proper attachments table
                // For now, we'll create mock attachment objects
                $attachments = array_map(function($id) {
                    return [
                        'id' => $id,
                        'name' => 'Attachment ' . $id,
                        'url' => '#',
                        'size' => 0
                    ];
                }, $attachmentIds);
            }
        }

        return Inertia::render('Accounts/JournalVoucher/Create', [
            'voucher' => $voucher,
            'entries' => $entries,
            'accounts' => $accounts,
            'attachments' => $attachments
        ]);
    }

    /**
     * Update the specified journal voucher
     */
    public function update(Request $request, $id)
    {
        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');
        $locationId = $request->input('user_location_id') ?? $request->session()->get('user_location_id');
        
        if (!$compId || !$locationId) {
            return redirect()->back()->with('error', 'User authentication information is required.');
        }

        // Validate request
        $validated = $request->validate([
            'voucher_date' => 'required|date',
            'description' => 'required|string|max:500',
            'reference_number' => 'nullable|string|max:100',
            'entries' => 'required|array|min:2',
            'entries.*.account_id' => 'required|integer|exists:chart_of_accounts,id',
            'entries.*.description' => 'nullable|string|max:500',
            'entries.*.debit_amount' => 'required_without:entries.*.credit_amount|numeric|min:0',
            'entries.*.credit_amount' => 'required_without:entries.*.debit_amount|numeric|min:0',
            'entries.*.currency_code' => 'required|string|max:3',
            'entries.*.exchange_rate' => 'required|numeric|min:0.000001',
            'attachments' => 'nullable|array',
            'attachments.*' => 'string'
        ]);

        // Check if voucher exists and is editable
        $voucher = DB::table('transactions')
            ->where('id', $id)
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->where('voucher_type', 'Journal Voucher')
            ->first();

        if (!$voucher) {
            return redirect()->back()->with('error', 'Journal voucher not found');
        }

        if ($voucher->status !== 'Draft') {
            return redirect()->back()->with('error', 'Only draft vouchers can be edited');
        }

        // Validate double entry principle in base currency
        $totalBaseDebit = 0;
        $totalBaseCredit = 0;
        
        foreach ($request->entries as $entry) {
            $debit = $entry['debit_amount'] ?? 0;
            $credit = $entry['credit_amount'] ?? 0;
            $exchangeRate = $entry['exchange_rate'] ?? 1.0;
            
            if ($debit > 0 && $credit > 0) {
                return redirect()->back()->withErrors(['entries' => 'Each entry must be either debit or credit, not both']);
            }
            
            if ($debit == 0 && $credit == 0) {
                return redirect()->back()->withErrors(['entries' => 'Each entry must have either debit or credit amount']);
            }
            
            // Convert to base currency
            $baseDebit = $debit * $exchangeRate;
            $baseCredit = $credit * $exchangeRate;
            
            $totalBaseDebit += $baseDebit;
            $totalBaseCredit += $baseCredit;
        }
        
        if (abs($totalBaseDebit - $totalBaseCredit) > 0.01) {
            return redirect()->back()->withErrors(['entries' => 'Total debits must equal total credits in base currency (Double Entry Principle)']);
        }

        // Get company for base currency
        $company = DB::table('companies')->where('id', $compId)->first();

        DB::beginTransaction();
        
        try {
            // Update transaction
            DB::table('transactions')
                ->where('id', $id)
                ->update([
                    'voucher_date' => $request->voucher_date,
                    'reference_number' => $request->reference_number,
                    'description' => $request->description,
                    'total_debit' => $totalBaseDebit,
                    'total_credit' => $totalBaseCredit,
                    'currency_code' => $company->default_currency_code ?? 'PKR',
                    'exchange_rate' => 1.0,
                    'base_currency_total' => $totalBaseDebit,
                    'attachments' => json_encode($request->attachments ?? []),
                    'updated_at' => now()
                ]);

            // Delete existing entries
            DB::table('transaction_entries')
                ->where('transaction_id', $id)
                ->delete();

            // Create new transaction entries
            foreach ($request->entries as $index => $entry) {
                $debit = $entry['debit_amount'] ?? 0;
                $credit = $entry['credit_amount'] ?? 0;
                $exchangeRate = $entry['exchange_rate'] ?? 1.0;
                
                // Calculate base currency amounts
                $baseDebit = $debit * $exchangeRate;
                $baseCredit = $credit * $exchangeRate;
                
                DB::table('transaction_entries')->insert([
                    'transaction_id' => $id,
                    'line_number' => $index + 1,
                    'account_id' => $entry['account_id'],
                    'description' => $entry['description'],
                    'debit_amount' => $debit,
                    'credit_amount' => $credit,
                    'currency_code' => $entry['currency_code'],
                    'exchange_rate' => $exchangeRate,
                    'base_debit_amount' => $baseDebit,
                    'base_credit_amount' => $baseCredit,
                    'comp_id' => $compId,
                    'location_id' => $locationId,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }

            DB::commit();

            return redirect()->route('accounts.journal-voucher.index')
                           ->with('success', 'Journal voucher updated successfully!');

        } catch (\Exception $e) {
            DB::rollback();
            return redirect()->back()->with('error', 'Error updating journal voucher: ' . $e->getMessage());
        }
    }

    /**
     * Generate voucher number based on configuration
     */
    private function generateVoucherNumber($compId, $locationId, $voucherType)
    {
        $config = DB::table('voucher_number_configurations')
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->where('voucher_type', $voucherType)
            ->where('is_active', true)
            ->first();

        if (!$config) {
            // Create default configuration if none exists
            $defaultConfig = [
                'comp_id' => $compId,
                'location_id' => $locationId,
                'voucher_type' => $voucherType,
                'prefix' => 'JV',
                'number_length' => 4,
                'running_number' => 1,
                'reset_frequency' => 'Never',
                'status' => 'Active',
                'created_at' => now(),
                'updated_at' => now()
            ];
            
            $configId = DB::table('voucher_number_configurations')->insertGetId($defaultConfig);
            $config = (object) array_merge($defaultConfig, ['id' => $configId]);
            
            Log::info('Created default voucher configuration for company: ' . $compId . ', location: ' . $locationId);
        }

        $runningNumber = $config->running_number;
        $numberLength = $config->number_length;
        $prefix = $config->prefix;
        $resetFrequency = $config->reset_frequency;

        // Check if we need to reset the running number based on frequency
        $shouldReset = false;
        $lastReset = $config->last_reset_date;
        
        if ($resetFrequency === 'Monthly') {
            $shouldReset = !$lastReset || (now()->format('Y-m') !== date('Y-m', strtotime($lastReset)));
        } elseif ($resetFrequency === 'Yearly') {
            $shouldReset = !$lastReset || (now()->format('Y') !== date('Y', strtotime($lastReset)));
        }

        if ($shouldReset) {
            $runningNumber = 1;
            // Update last reset date
            DB::table('voucher_number_configurations')
                ->where('id', $config->id)
                ->update(['last_reset_date' => now()]);
        }

        // Generate voucher number based on configuration
        $voucherNumber = $prefix . str_pad($runningNumber, $numberLength, '0', STR_PAD_LEFT);
        
        Log::info('Generated voucher number: ' . $voucherNumber . ' (prefix: ' . $prefix . ', running: ' . $runningNumber . ', length: ' . $numberLength . ')');

        // Update running number
        DB::table('voucher_number_configurations')
            ->where('id', $config->id)
            ->update([
                'running_number' => $runningNumber + 1,
                'updated_at' => now()
            ]);

        return $voucherNumber;
    }
}
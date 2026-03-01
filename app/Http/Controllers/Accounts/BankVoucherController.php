<?php

namespace App\Http\Controllers\Accounts;

use App\Http\Controllers\Controller;
use App\Http\Traits\CheckUserPermissions;
use App\Services\AuditLogService;
use App\Services\RecoveryService;
use App\Helpers\FiscalYearHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class BankVoucherController extends Controller
{
    use CheckUserPermissions;
    /**
     * Display a listing of journal vouchers
     */
    public function index(Request $request)
    {
        // Check if user has permission to can_view
        $this->requirePermission($request, null, 'can_view');
        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');
        $locationId = $request->input('user_location_id') ?? $request->session()->get('user_location_id');
        
        if (!$compId || !$locationId) {
            return Inertia::render('Accounts/BankRec/List', [
                'pageTitle' => 'Bank Vouchers',
                'BankVouchers' => [
                    'data' => [],
                    'total' => 0,
                    'current_page' => 1,
                    'last_page' => 1,
                    'from' => 0,
                    'to' => 0
                ],
                'accounts' => [],
                'filters' => [],
                'error' => 'Company and Location information is required. Please contact administrator.'
            ]);
        }

        // Get filters
        $search = $request->input('search');
        $status = $request->input('status');
        $fromDate = $request->input('from_date');
        $toDate = $request->input('to_date');
        $sortBy = $request->input('sort_by', 'id');
        $sortDirection = $request->input('sort_direction', 'desc');
        $perPage = $request->input('per_page', 25);

        // Build query
        $query = DB::table('transactions')
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->whereIn('voucher_type', ['Bank Payment', 'Bank Receipt']);

        // Apply search filter
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('voucher_number', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('reference_number', 'like', "%{$search}%");
            });
        }

        // Apply status filter
        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        // Apply date filters
        if ($fromDate) {
            $query->where('voucher_date', '>=', $fromDate . ' 00:00:00');
        }

        if ($toDate) {
            $query->where('voucher_date', '<=', $toDate . ' 23:59:59');
        }

        // Apply sorting
        $query->orderBy($sortBy, $sortDirection);

        // Paginate results
        $BankVouchers = $query->paginate($perPage);

        $accounts = $this->getTransactionalAccounts($compId, $locationId);
        
        // Get current fiscal year
        $currentFiscalYear = FiscalYearHelper::getCurrentFiscalYear($compId);

        return Inertia::render('Accounts/BankRec/List', [
            'pageTitle' => 'Bank Vouchers',
            'BankVouchers' => $BankVouchers,
            'accounts' => $accounts,
            'fiscalYear' => $currentFiscalYear,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'from_date' => $fromDate,
                'to_date' => $toDate,
                'sort_by' => $sortBy,
                'sort_direction' => $sortDirection,
                'per_page' => $perPage
            ]
        ]);
    }

    /**
     * Show the form for creating a new journal voucher
     */
    public function create(Request $request)
    {
        // Check if user has permission to can_add
        $this->requirePermission($request, null, 'can_add');
        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');
        $locationId = $request->input('user_location_id') ?? $request->session()->get('user_location_id');
        
        if (!$compId || !$locationId) {
            return Inertia::render('Accounts/BankRec/Create', [
                'pageTitle' => 'Create Bank Voucher',
                'accounts' => [],
                'bankAccounts' => [],
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

        $accounts = $this->getTransactionalAccounts($compId, $locationId);
        $bankAccounts = $this->getBankAccounts($compId, $locationId);

        // Generate preview voucher number for display
        $previewVoucherNumber = $this->generatePreviewVoucherNumber($compId, $locationId, 'Bank Payment');
        
        // Get current fiscal year
        $currentFiscalYear = FiscalYearHelper::getCurrentFiscalYear($compId);
        
        // Get current period information
        $todayDate = date('Y-m-d');
        $currentPeriod = FiscalYearHelper::getFiscalPeriod($todayDate, $compId);
        
        $currentPeriodInfo = null;
        if ($currentPeriod) {
            $currentPeriodInfo = [
                'id' => $currentPeriod->id,
                'period_name' => $currentPeriod->period_name,
                'status' => $currentPeriod->status,
                'is_adjustment_period' => $currentPeriod->is_adjustment_period,
                'start_date' => $currentPeriod->start_date,
                'end_date' => $currentPeriod->end_date,
                'fiscal_year' => $currentPeriod->fiscal_year
            ];
        }

        return Inertia::render('Accounts/BankRec/Create', [
            'pageTitle' => 'Create Bank Voucher',
            'accounts' => $accounts,
            'bankAccounts' => $bankAccounts,
            'currencies' => $currencies,
            'company' => $company,
            'fiscalYear' => $currentFiscalYear,
            'currentPeriod' => $currentPeriodInfo,
            'preview_voucher_number' => $previewVoucherNumber
        ]);
    }

    /**
     * Store a newly created journal voucher
     * 
     * Error Handling Strategy:
     * - Validation errors: Show specific field errors to user
     * - Database errors: Show generic "check your data" message to user
     * - General errors: Show "something went wrong" message to user
     * - All errors: Log detailed information for developers
     */
    public function store(Request $request)
    {
        // Check if user has permission to can_add
        $this->requirePermission($request, null, 'can_add');
        Log::info('=== JOURNAL VOUCHER STORE METHOD CALLED ===');
        Log::info('Request data:', $request->all());
        
        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');
        $locationId = $request->input('user_location_id') ?? $request->session()->get('user_location_id');
        $userId = $request->input('user_id') ?? $request->session()->get('user_id');
        
        if (!$compId || !$locationId || !$userId) {
            return redirect()->back()->with('error', 'User authentication information is required.');
        }

        try {
            // Validate request
            $validated = $request->validate([
            'voucher_date' => 'required|date',
            'voucher_sub_type' => 'required|in:Bank Payment,Bank Receipt',
            'bank_account_id' => 'required|integer|exists:chart_of_accounts,id,account_level,4',
            'description' => 'nullable|string|max:250',
            'reference_number' => 'nullable|string|max:100',
            'entries' => 'required|array|min:1',
            'entries.*.account_id' => 'required|integer|exists:chart_of_accounts,id,account_level,4',
            'entries.*.description' => 'nullable|string|max:500',
            'entries.*.amount' => 'required|numeric|min:0.01',
            'entries.*.currency_code' => 'required|string|max:3',
            'entries.*.exchange_rate' => 'required|numeric|min:0.000001',
            'entries.*.cheque_number' => 'nullable|string|max:100',
            'entries.*.cheque_date' => 'nullable|date',
            'entries.*.slip_number' => 'nullable|string|max:100',
            'entries.*.attachment_id' => 'nullable|string',
            'attachments' => 'nullable|array',
            'attachments.*' => 'nullable|string'
        ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            // Log validation errors for debugging
            Log::warning('Journal voucher validation failed', [
                'errors' => $e->errors(),
                'request_data' => $request->all(),
                'user_id' => $userId,
                'comp_id' => $compId,
                'location_id' => $locationId
            ]);
            
            // Return validation errors to user
            return redirect()->back()->withErrors($e->errors())->withInput();
        }

        // Always auto-generate voucher number for Bank Vouchers
        $company = DB::table('companies')->where('id', $compId)->first();
        $bankAccount = DB::table('chart_of_accounts')
            ->where('id', $request->bank_account_id)
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->where('status', 'Active')
            ->where('account_level', 4)
            ->where('is_transactional', true)
            ->first();

        if (!$bankAccount) {
            return redirect()->back()->withErrors(['bank_account_id' => 'Selected bank account is invalid.']);
        }

        // Validate double entry principle in base currency
        $totalBaseDebit = 0;
        $totalBaseCredit = 0;
        
        foreach ($request->entries as $entry) {
            if ((int) $entry['account_id'] === (int) $request->bank_account_id) {
                return redirect()->back()->withErrors(['entries' => 'Detail account cannot be same as selected bank account']);
            }

            $amount = (float) ($entry['amount'] ?? 0);
            $exchangeRate = $entry['exchange_rate'] ?? 1.0;

            if ($amount <= 0) {
                return redirect()->back()->withErrors(['entries' => 'Each entry must have amount greater than zero']);
            }

            $isBankPayment = $request->voucher_sub_type === 'Bank Payment';
            $debit = $isBankPayment ? $amount : 0;
            $credit = $isBankPayment ? 0 : $amount;

            // Convert to base currency
            // Exchange rate is stored as base_currency/foreign_currency, so we need to invert it
            $baseDebit = $debit * (1 / $exchangeRate);
            $baseCredit = $credit * (1 / $exchangeRate);
            
            $totalBaseDebit += $baseDebit;
            $totalBaseCredit += $baseCredit;
        }
        
        // Auto-generate voucher number
        $voucherNumber = $this->generateVoucherNumber($compId, $locationId, $request->voucher_sub_type);
        
        // Get fiscal year and period from voucher date
        $fiscalYear = FiscalYearHelper::getFiscalYear($request->voucher_date, $compId);
        $fiscalPeriod = FiscalYearHelper::getFiscalPeriod($request->voucher_date, $compId);
        
        if (!$fiscalPeriod) {
            return redirect()->back()->withErrors(['voucher_date' => "No accounting period found for date {$request->voucher_date}. Please configure fiscal year periods."]);
        }

        // Verify period is open (or is an adjustment period)
        if ($fiscalPeriod->status !== 'Open' && !$fiscalPeriod->is_adjustment_period) {
            return redirect()->back()->withErrors(['voucher_date' => "The accounting period is {$fiscalPeriod->status}. Transactions cannot be posted to {$fiscalPeriod->status} periods. Only 'Open' or 'Adjustment' periods allow new transactions."]);
        }

        // Prevent posting to closed periods
        if ($fiscalPeriod->status === 'Closed') {
            return redirect()->back()->withErrors(['voucher_date' => "The accounting period is permanently Closed. No transactions can be posted to closed periods. Please contact your administrator if you need to reopen this period."]);
        }

        DB::beginTransaction();
        
        try {
            Log::info('Starting transaction creation...');

            // Create transaction
            Log::info('Creating transaction record...', [
                'voucher_number' => $voucherNumber,
                'voucher_date' => $request->voucher_date,
                'fiscal_year' => $fiscalYear,
                'period_id' => $fiscalPeriod->id,
                'total_debit' => $totalBaseDebit,
                'total_credit' => $totalBaseCredit,
                'comp_id' => $compId,
                'location_id' => $locationId,
                'user_id' => $userId
            ]);
            
            $transactionId = DB::table('transactions')->insertGetId([
                'voucher_number' => $voucherNumber,
                'voucher_date' => $request->voucher_date,
                'voucher_type' => $request->voucher_sub_type,
                'voucher_sub_type' => $request->voucher_sub_type,
                'bank_account_id' => $request->bank_account_id,
                'reference_number' => $request->reference_number,
                'description' => $request->description,
                'status' => 'Draft',
                'total_debit' => $totalBaseDebit,
                'total_credit' => $totalBaseCredit,
                'currency_code' => $company->default_currency_code ?? 'PKR',
                'exchange_rate' => 1.0,
                'base_currency_total' => $totalBaseDebit,
                'attachments' => json_encode($request->attachments ?? []),
                'period_id' => $fiscalPeriod->id,
                'fiscal_year' => $fiscalYear,
                'comp_id' => $compId,
                'location_id' => $locationId,
                'created_by' => $userId,
                'created_at' => now(),
                'updated_at' => now()
            ]);
            
            Log::info('Transaction created successfully', ['transaction_id' => $transactionId]);

            // Create transaction entries
            Log::info('Creating transaction entries...', ['entries_count' => count($request->entries)]);
            $lineNumber = 1;
            $bankDebitTotal = 0;
            $bankCreditTotal = 0;

            foreach ($request->entries as $index => $entry) {
                $amount = (float) ($entry['amount'] ?? 0);
                $isBankPayment = $request->voucher_sub_type === 'Bank Payment';
                $debit = $isBankPayment ? $amount : 0;
                $credit = $isBankPayment ? 0 : $amount;
                $exchangeRate = $entry['exchange_rate'] ?? 1.0;
                
                // Calculate base currency amounts
                // Exchange rate is stored as base_currency/foreign_currency, so we need to invert it
                $baseDebit = $debit * (1 / $exchangeRate);
                $baseCredit = $credit * (1 / $exchangeRate);
                
                Log::info("Creating entry $index", [
                    'transaction_id' => $transactionId,
                    'account_id' => $entry['account_id'],
                    'debit' => $debit,
                    'credit' => $credit,
                    'base_debit' => $baseDebit,
                    'base_credit' => $baseCredit,
                    'exchange_rate' => $exchangeRate
                ]);
                
                DB::table('transaction_entries')->insert([
                    'transaction_id' => $transactionId,
                    'line_number' => $lineNumber,
                    'account_id' => $entry['account_id'],
                    'description' => $entry['description'],
                    'debit_amount' => $debit,
                    'credit_amount' => $credit,
                    'currency_code' => $entry['currency_code'],
                    'exchange_rate' => $exchangeRate,
                    'base_debit_amount' => $baseDebit,
                    'base_credit_amount' => $baseCredit,
                    'cheque_number' => $entry['cheque_number'] ?? null,
                    'cheque_date' => $entry['cheque_date'] ?? null,
                    'slip_number' => $entry['slip_number'] ?? null,
                    'attachment_id' => $entry['attachment_id'] ?? null,
                    'comp_id' => $compId,
                    'location_id' => $locationId,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);

                $lineNumber++;
                $bankDebitTotal += $baseDebit;
                $bankCreditTotal += $baseCredit;
                
                Log::info("Entry $index created successfully");
            }

            // Auto contra bank entry (single bank line)
            DB::table('transaction_entries')->insert([
                'transaction_id' => $transactionId,
                'line_number' => $lineNumber,
                'account_id' => $request->bank_account_id,
                'description' => 'Auto contra bank entry',
                'debit_amount' => $bankCreditTotal,
                'credit_amount' => $bankDebitTotal,
                'currency_code' => $company->default_currency_code ?? 'PKR',
                'exchange_rate' => 1,
                'base_debit_amount' => $bankCreditTotal,
                'base_credit_amount' => $bankDebitTotal,
                'comp_id' => $compId,
                'location_id' => $locationId,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            DB::table('transactions')
                ->where('id', $transactionId)
                ->update([
                    'total_debit' => $bankDebitTotal,
                    'total_credit' => $bankDebitTotal,
                    'base_currency_total' => $bankDebitTotal,
                    'updated_at' => now(),
                ]);

            Log::info('All entries created, committing transaction...');
            DB::commit();
            
            Log::info('Journal voucher created successfully', [
                'transaction_id' => $transactionId,
                'voucher_number' => $voucherNumber,
                'total_debit' => $totalBaseDebit,
                'total_credit' => $totalBaseCredit,
                'entries_count' => count($request->entries)
            ]);

            // Create audit log for the journal voucher creation
            try {
                $voucherData = [
                    'voucher_number' => $voucherNumber,
                    'voucher_date' => $request->voucher_date,
                    'voucher_type' => $request->voucher_sub_type,
                    'reference_number' => $request->reference_number,
                    'description' => $request->description,
                    'status' => 'Draft',
                    'total_debit' => $totalBaseDebit,
                    'total_credit' => $totalBaseCredit,
                    'currency_code' => $company->default_currency_code ?? 'PKR',
                    'comp_id' => $compId,
                    'location_id' => $locationId,
                    'created_by' => $userId
                ];
                
                AuditLogService::logBankVoucher('CREATE', $transactionId, $voucherData);
                Log::info('Audit log created for journal voucher creation', ['transaction_id' => $transactionId]);
            } catch (\Exception $auditException) {
                // Don't fail the main operation if audit logging fails
                Log::warning('Failed to create audit log for journal voucher creation', [
                    'transaction_id' => $transactionId,
                    'error' => $auditException->getMessage()
                ]);
            }


            return redirect()->route('accounts.bank-voucher.index')
                           ->with('success', 'Bank voucher created successfully!');

        } catch (\Illuminate\Database\QueryException $e) {
            DB::rollback();
            
            // Log detailed error for developers
            Log::error('Database error creating journal voucher', [
                'error' => $e->getMessage(),
                'sql' => $e->getSql(),
                'bindings' => $e->getBindings(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all(),
                'user_id' => $userId,
                'comp_id' => $compId,
                'location_id' => $locationId
            ]);
            
            // Return user-friendly error message
            return redirect()->back()->with('error', 'There was a problem saving your journal voucher. Please check your data and try again.');
            
        } catch (\Exception $e) {
            DB::rollback();
            
            // Log detailed error for developers
            Log::error('Error creating journal voucher', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all(),
                'user_id' => $userId,
                'comp_id' => $compId,
                'location_id' => $locationId
            ]);
            
            // Return user-friendly error message
            return redirect()->back()->with('error', 'Something went wrong while creating the journal voucher. Please try again or contact support if the problem persists.');
        }
    }

    /**
     * Display the specified journal voucher
     */
    public function show(Request $request, $id)
    {
        // Check if user has permission to can_view
        $this->requirePermission($request, null, 'can_view');
        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');
        $locationId = $request->input('user_location_id') ?? $request->session()->get('user_location_id');
        
        if (!$compId || !$locationId) {
            return Inertia::render('Accounts/BankRec/Show', [
                'pageTitle' => 'Bank Voucher Details',
                'voucher' => null,
                'entries' => [],
                'error' => 'Company and Location information is required. Please contact administrator.'
            ]);
        }

        $voucher = DB::table('transactions')
            ->where('id', $id)
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->whereIn('voucher_type', ['Bank Payment', 'Bank Receipt'])
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

        return Inertia::render('Accounts/BankRec/Show', [
            'pageTitle' => 'Bank Voucher Details',
            'voucher' => $voucher,
            'entries' => $entries,
            'currentPeriod' => $this->getPeriodInfoForDate($voucher->voucher_date, $compId)
        ]);
    }

    /**
     * Show the form for editing the specified journal voucher
     */
    public function edit(Request $request, $id)
    {
        // Check if user has permission to can_edit
        $this->requirePermission($request, null, 'can_edit');
        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');
        $locationId = $request->input('user_location_id') ?? $request->session()->get('user_location_id');
        
        if (!$compId || !$locationId) {
            return Inertia::render('Accounts/BankRec/Create', [
                'pageTitle' => 'Edit Bank Voucher',
                'accounts' => [],
                'bankAccounts' => [],
                'voucher' => null,
                'entries' => [],
                'error' => 'Company and Location information is required. Please contact administrator.'
            ]);
        }

        $voucher = DB::table('transactions')
            ->where('id', $id)
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->whereIn('voucher_type', ['Bank Payment', 'Bank Receipt'])
            ->first();

        if (!$voucher) {
            abort(404, 'Journal voucher not found');
        }

        if ($voucher->status !== 'Draft') {
            return redirect()->route('accounts.bank-voucher.index')
                ->with('error', 'Only draft vouchers can be edited');
        }

        $entries = DB::table('transaction_entries')
            ->where('transaction_id', $id)
            ->where('account_id', '!=', $voucher->bank_account_id)
            ->orderBy('line_number')
            ->get();

        $accounts = $this->getTransactionalAccounts($compId, $locationId);
        $bankAccounts = $this->getBankAccounts($compId, $locationId);

        // Load attachments
        $attachments = [];
        if ($voucher->attachments) {
            $attachmentIds = json_decode($voucher->attachments, true);
            
            if (is_array($attachmentIds)) {
                foreach ($attachmentIds as $attachmentId) {
                    $filePath = storage_path('app/public/voucher-attachments/' . $attachmentId);
                    
                    if (file_exists($filePath)) {
                        $attachments[] = [
                            'id' => $attachmentId,
                            'original_name' => $attachmentId,
                            'url' => url('/storage/voucher-attachments/' . $attachmentId),
                            'size' => filesize($filePath)
                        ];
                    } else {
                        // Try to find a matching file with similar name
                        $attachmentDir = storage_path('app/public/voucher-attachments/');
                        $files = glob($attachmentDir . '*');
                        
                        // Extract the original filename from the attachment ID
                        $parts = explode('_', $attachmentId);
                        $originalFileName = end($parts); // Get the last part which should be the original filename
                        
                        foreach ($files as $file) {
                            $fileName = basename($file);
                            
                            // Check if the file ends with the original filename
                            if (str_ends_with($fileName, $originalFileName)) {
                                $attachments[] = [
                                    'id' => $fileName,
                                    'original_name' => $originalFileName, // Use the original filename
                                    'url' => url('/storage/voucher-attachments/' . $fileName),
                                    'size' => filesize($file)
                                ];
                                break;
                            }
                        }
                        
                        // If no exact match found, try to find any file with similar characteristics
                        if (empty($attachments) || count($attachments) === 0) {
                            foreach ($files as $file) {
                                $fileName = basename($file);
                                
                                // Check if the file has a similar extension or contains part of the original name
                                $originalExt = pathinfo($originalFileName, PATHINFO_EXTENSION);
                                $fileExt = pathinfo($fileName, PATHINFO_EXTENSION);
                                
                                if ($originalExt && $fileExt && strtolower($originalExt) === strtolower($fileExt)) {
                                    // Same extension, use this file
                                    $attachments[] = [
                                        'id' => $fileName,
                                        'original_name' => $originalFileName,
                                        'url' => url('/storage/voucher-attachments/' . $fileName),
                                        'size' => filesize($file)
                                    ];
                                    break;
                                }
                            }
                        }
                        
                        // If still no match found, use the most recent file with the same extension
                        if (empty($attachments) || count($attachments) === 0) {
                            $originalExt = pathinfo($originalFileName, PATHINFO_EXTENSION);
                            $matchingFiles = [];
                            
                            foreach ($files as $file) {
                                $fileName = basename($file);
                                $fileExt = pathinfo($fileName, PATHINFO_EXTENSION);
                                
                                if ($originalExt && $fileExt && strtolower($originalExt) === strtolower($fileExt)) {
                                    $matchingFiles[] = [
                                        'file' => $file,
                                        'name' => $fileName,
                                        'mtime' => filemtime($file)
                                    ];
                                }
                            }
                            
                            if (!empty($matchingFiles)) {
                                // Sort by modification time (most recent first)
                                usort($matchingFiles, function($a, $b) {
                                    return $b['mtime'] - $a['mtime'];
                                });
                                
                                $selectedFile = $matchingFiles[0];
                                $attachments[] = [
                                    'id' => $selectedFile['name'],
                                    'original_name' => $originalFileName,
                                    'url' => url('/storage/voucher-attachments/' . $selectedFile['name']),
                                    'size' => filesize($selectedFile['file'])
                                ];
                            }
                        }
                    }
                }
            }
        }

        // Get company settings and currencies for the form
        $company = DB::table('companies')->where('id', $compId)->first();
        
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

        return Inertia::render('Accounts/BankRec/Create', [
            'pageTitle' => 'Edit Bank Voucher',
            'voucher' => $voucher,
            'entries' => $entries,
            'accounts' => $accounts,
            'bankAccounts' => $bankAccounts,
            'currencies' => $currencies,
            'company' => $company,
            'attachments' => $attachments,
            'currentPeriod' => $this->getPeriodInfoForDate($voucher->voucher_date, $compId)
        ]);
    }

    /**
     * Update the specified journal voucher
     */
    public function update(Request $request, $id)
    {
        // Check if user has permission to can_edit
        $this->requirePermission($request, null, 'can_edit');
        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');
        $locationId = $request->input('user_location_id') ?? $request->session()->get('user_location_id');
        
        if (!$compId || !$locationId) {
            return redirect()->back()->with('error', 'User authentication information is required.');
        }

        // Validate request
        $validated = $request->validate([
            'voucher_date' => 'required|date',
            'voucher_sub_type' => 'required|in:Bank Payment,Bank Receipt',
            'bank_account_id' => 'required|integer|exists:chart_of_accounts,id,account_level,4',
            'description' => 'nullable|string|max:250',
            'reference_number' => 'nullable|string|max:100',
            'entries' => 'required|array|min:1',
            'entries.*.account_id' => 'required|integer|exists:chart_of_accounts,id,account_level,4',
            'entries.*.description' => 'nullable|string|max:500',
            'entries.*.amount' => 'required|numeric|min:0.01',
            'entries.*.currency_code' => 'required|string|max:3',
            'entries.*.exchange_rate' => 'required|numeric|min:0.000001',
            'entries.*.cheque_number' => 'nullable|string|max:100',
            'entries.*.cheque_date' => 'nullable|date',
            'entries.*.slip_number' => 'nullable|string|max:100',
            'entries.*.attachment_id' => 'nullable|string',
            'attachments' => 'nullable|array',
            'attachments.*' => 'nullable|string'
        ]);

        // Check if voucher exists and is editable
        $voucher = DB::table('transactions')
            ->where('id', $id)
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->whereIn('voucher_type', ['Bank Payment', 'Bank Receipt'])
            ->first();

        if (!$voucher) {
            return redirect()->back()->with('error', 'Journal voucher not found');
        }

        if ($voucher->status !== 'Draft') {
            return redirect()->back()->with('error', 'Only draft vouchers can be edited');
        }

        // Check period status for locked/closed periods
        $fiscalPeriod = FiscalYearHelper::getFiscalPeriod($request->voucher_date, $compId);
        
        if ($fiscalPeriod) {
            // Prevent modifications to closed periods
            if ($fiscalPeriod->status === 'Closed') {
                return redirect()->back()->with('error', "The accounting period is permanently Closed. No modifications are allowed to transactions in closed periods. Please contact your administrator if you need to reopen this period.");
            }
            
            // Locked periods allow modifications to existing entries (inform user if helpful)
            if ($fiscalPeriod->status === 'Locked' && !$fiscalPeriod->is_adjustment_period) {
                // Note: We allow this but the user should understand they're modifying an entry in a locked period
                // This is acceptable per requirements: "Locked: no new transactions but existing entries can be modified"
            }
        }

        // Validate double entry principle in base currency
        $totalBaseDebit = 0;
        $totalBaseCredit = 0;
        
        foreach ($request->entries as $entry) {
            if ((int) $entry['account_id'] === (int) $request->bank_account_id) {
                return redirect()->back()->withErrors(['entries' => 'Detail account cannot be same as selected bank account']);
            }

            $amount = (float) ($entry['amount'] ?? 0);
            $exchangeRate = $entry['exchange_rate'] ?? 1.0;

            if ($amount <= 0) {
                return redirect()->back()->withErrors(['entries' => 'Each entry must have amount greater than zero']);
            }

            $isBankPayment = $request->voucher_sub_type === 'Bank Payment';
            $debit = $isBankPayment ? $amount : 0;
            $credit = $isBankPayment ? 0 : $amount;
            
            // Convert to base currency
            // Exchange rate is stored as base_currency/foreign_currency, so we need to invert it
            $baseDebit = $debit * (1 / $exchangeRate);
            $baseCredit = $credit * (1 / $exchangeRate);
            
            $totalBaseDebit += $baseDebit;
            $totalBaseCredit += $baseCredit;
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
                    'voucher_type' => $request->voucher_sub_type,
                    'voucher_sub_type' => $request->voucher_sub_type,
                    'bank_account_id' => $request->bank_account_id,
                    'reference_number' => $request->reference_number,
                    'description' => $request->description,
                    'total_debit' => 0,
                    'total_credit' => 0,
                    'currency_code' => $company->default_currency_code ?? 'PKR',
                    'exchange_rate' => 1.0,
                    'base_currency_total' => 0,
                    'attachments' => json_encode($request->attachments ?? []),
                    'updated_at' => now()
                ]);

            // Delete existing entries
            DB::table('transaction_entries')
                ->where('transaction_id', $id)
                ->delete();

            // Create new transaction entries
            $lineNumber = 1;
            $bankDebitTotal = 0;
            $bankCreditTotal = 0;
            foreach ($request->entries as $index => $entry) {
                $amount = (float) ($entry['amount'] ?? 0);
                $isBankPayment = $request->voucher_sub_type === 'Bank Payment';
                $debit = $isBankPayment ? $amount : 0;
                $credit = $isBankPayment ? 0 : $amount;
                $exchangeRate = $entry['exchange_rate'] ?? 1.0;
                
                // Calculate base currency amounts
                // Exchange rate is stored as base_currency/foreign_currency, so we need to invert it
                $baseDebit = $debit * (1 / $exchangeRate);
                $baseCredit = $credit * (1 / $exchangeRate);
                
                DB::table('transaction_entries')->insert([
                    'transaction_id' => $id,
                    'line_number' => $lineNumber,
                    'account_id' => $entry['account_id'],
                    'description' => $entry['description'],
                    'debit_amount' => $debit,
                    'credit_amount' => $credit,
                    'currency_code' => $entry['currency_code'],
                    'exchange_rate' => $exchangeRate,
                    'base_debit_amount' => $baseDebit,
                    'base_credit_amount' => $baseCredit,
                    'cheque_number' => $entry['cheque_number'] ?? null,
                    'cheque_date' => $entry['cheque_date'] ?? null,
                    'slip_number' => $entry['slip_number'] ?? null,
                    'attachment_id' => $entry['attachment_id'] ?? null,
                    'comp_id' => $compId,
                    'location_id' => $locationId,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);

                $lineNumber++;
                $bankDebitTotal += $baseDebit;
                $bankCreditTotal += $baseCredit;
            }

            DB::table('transaction_entries')->insert([
                'transaction_id' => $id,
                'line_number' => $lineNumber,
                'account_id' => $request->bank_account_id,
                'description' => 'Auto contra bank entry',
                'debit_amount' => $bankCreditTotal,
                'credit_amount' => $bankDebitTotal,
                'currency_code' => $company->default_currency_code ?? 'PKR',
                'exchange_rate' => 1,
                'base_debit_amount' => $bankCreditTotal,
                'base_credit_amount' => $bankDebitTotal,
                'comp_id' => $compId,
                'location_id' => $locationId,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            DB::table('transactions')
                ->where('id', $id)
                ->update([
                    'total_debit' => $bankDebitTotal,
                    'total_credit' => $bankDebitTotal,
                    'base_currency_total' => $bankDebitTotal,
                    'updated_at' => now(),
                ]);

            DB::commit();

            // Create audit log for the journal voucher update
            try {
                $voucherData = [
                    'voucher_number' => $voucher->voucher_number,
                    'voucher_date' => $request->voucher_date,
                    'voucher_type' => $request->voucher_sub_type,
                    'reference_number' => $request->reference_number,
                    'description' => $request->description,
                    'status' => 'Draft',
                    'total_debit' => $totalBaseDebit,
                    'total_credit' => $totalBaseCredit,
                    'currency_code' => $company->default_currency_code ?? 'PKR',
                    'comp_id' => $compId,
                    'location_id' => $locationId
                ];
                
                $oldData = [
                    'voucher_date' => $voucher->voucher_date,
                    'reference_number' => $voucher->reference_number,
                    'description' => $voucher->description,
                    'total_debit' => $voucher->total_debit,
                    'total_credit' => $voucher->total_credit
                ];
                
                AuditLogService::logBankVoucher('UPDATE', $id, $voucherData, $oldData);
                Log::info('Audit log created for journal voucher update', ['transaction_id' => $id]);
            } catch (\Exception $auditException) {
                // Don't fail the main operation if audit logging fails
                Log::warning('Failed to create audit log for journal voucher update', [
                    'transaction_id' => $id,
                    'error' => $auditException->getMessage()
                ]);
            }


            return redirect()->route('accounts.bank-voucher.index')
                           ->with('success', 'Bank voucher updated successfully!');

        } catch (\Illuminate\Database\QueryException $e) {
            DB::rollback();
            
            // Log detailed error for developers
            Log::error('Database error updating journal voucher', [
                'error' => $e->getMessage(),
                'sql' => $e->getSql(),
                'bindings' => $e->getBindings(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all(),
                'voucher_id' => $id,
                'user_id' => $compId,
                'comp_id' => $compId,
                'location_id' => $locationId
            ]);
            
            // Return user-friendly error message
            return redirect()->back()->with('error', 'There was a problem updating your journal voucher. Please check your data and try again.');
            
        } catch (\Exception $e) {
            DB::rollback();
            
            // Log detailed error for developers
            Log::error('Error updating journal voucher', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all(),
                'voucher_id' => $id,
                'user_id' => $compId,
                'comp_id' => $compId,
                'location_id' => $locationId
            ]);
            
            // Return user-friendly error message
            return redirect()->back()->with('error', 'Something went wrong while updating the journal voucher. Please try again or contact support if the problem persists.');
        }
    }

    /**
     * Get transactional accounts (level 4) for journal entries
     */
    private function getTransactionalAccounts($compId, $locationId)
    {
        return DB::table('chart_of_accounts')
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->where('status', 'Active')
            ->where('account_level', 4) // Only transactional accounts (Level 4)
            ->where('is_transactional', true) // Additional check for transactional accounts
            ->orderBy('account_code')
            ->get();
    }

    private function getBankAccounts($compId, $locationId)
    {
        $bankCodes = [];
        $parentAccountIds = [];

        $sourceTable = null;
        if (Schema::hasTable('account_configuration')) {
            $sourceTable = 'account_configuration';
        } elseif (Schema::hasTable('account_configurations')) {
            $sourceTable = 'account_configurations';
        }

        if ($sourceTable) {
            $configQuery = DB::table($sourceTable);

            if (Schema::hasColumn($sourceTable, 'comp_id')) {
                $configQuery->where('comp_id', $compId);
            } elseif (Schema::hasColumn($sourceTable, 'company_id')) {
                $configQuery->where('company_id', $compId);
            }

            if (Schema::hasColumn($sourceTable, 'location_id')) {
                $configQuery->where('location_id', $locationId);
            }

            if (Schema::hasColumn($sourceTable, 'is_active')) {
                $configQuery->where('is_active', true);
            }

            if ($sourceTable === 'account_configurations' && Schema::hasColumn($sourceTable, 'config_type')) {
                $configQuery->where('config_type', 'bank');
            }

            $configRows = $configQuery->get();

            foreach ($configRows as $config) {
                if (isset($config->bank_code) && !empty($config->bank_code)) {
                    $bankCodes[] = trim((string) $config->bank_code);
                }

                if (isset($config->account_code) && !empty($config->account_code)) {
                    $bankCodes[] = trim((string) $config->account_code);
                }

                if (isset($config->bank_account_id) && !empty($config->bank_account_id)) {
                    $parentAccountIds[] = (int) $config->bank_account_id;
                }

                if (isset($config->account_id) && !empty($config->account_id)) {
                    $parentAccountIds[] = (int) $config->account_id;
                }
            }
        }

        $bankCodes = array_values(array_unique(array_filter($bankCodes)));
        $parentAccountIds = array_values(array_unique(array_filter($parentAccountIds)));

        $query = DB::table('chart_of_accounts')
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->where('status', 'Active')
            ->where('account_level', 4)
            ->where('is_transactional', true)
            ->whereIn(DB::raw('LOWER(account_type)'), ['asset', 'assets']);

        if (!empty($bankCodes) || !empty($parentAccountIds)) {
            $query->where(function ($childQuery) use ($bankCodes, $parentAccountIds) {
                foreach ($bankCodes as $bankCode) {
                    $escapedCode = addcslashes($bankCode, '%_');
                    $childQuery->orWhere('account_code', 'like', $escapedCode . '%');
                }

                if (!empty($parentAccountIds)) {
                    $childQuery->orWhereIn('parent_account_id', $parentAccountIds)
                               ->orWhereIn('id', $parentAccountIds);
                }
            });
        } else {
            $query->whereRaw('1 = 0');
        }

        return $query->orderBy('account_code')->get();
    }

    /**
     * Generate preview voucher number without updating running number
     */
    private function generatePreviewVoucherNumber($compId, $locationId, $voucherType)
    {
        $config = DB::table('voucher_number_configurations')
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->where('voucher_type', $voucherType)
            ->where('is_active', true)
            ->first();

        if (!$config) {
            // Return default format if no config exists
            return 'JV0001';
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
        }

        // Generate voucher number based on configuration
        return $prefix . str_pad($runningNumber, $numberLength, '0', STR_PAD_LEFT);
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
                'is_active' => true,
                'created_by' => auth()->id() ?? 1,
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

    /**
     * Export journal vouchers to CSV
     */
    public function exportCsv(Request $request)
    {
        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');
        $locationId = $request->input('user_location_id') ?? $request->session()->get('user_location_id');

        // Get filters (same as index method)
        $search = $request->input('search');
        $status = $request->input('status');
        $fromDate = $request->input('from_date');
        $toDate = $request->input('to_date');
        $sortBy = $request->input('sort_by', 'voucher_date');
        $sortDirection = $request->input('sort_direction', 'desc');

        // Build query (same as index method)
        $query = DB::table('transactions')
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->whereIn('voucher_type', ['Bank Payment', 'Bank Receipt']);

        // Apply search filter
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('voucher_number', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('reference_number', 'like', "%{$search}%");
            });
        }

        // Apply status filter
        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        // Apply date filters
        if ($fromDate) {
            $query->where('voucher_date', '>=', $fromDate . ' 00:00:00');
        }

        if ($toDate) {
            $query->where('voucher_date', '<=', $toDate . ' 23:59:59');
        }

        // Apply sorting
        $query->orderBy($sortBy, $sortDirection);

        $vouchers = $query->get();

        $filename = 'bank_vouchers_' . date('Y-m-d_His') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function() use ($vouchers) {
            $file = fopen('php://output', 'w');
            
            // Add CSV headers
            fputcsv($file, ['ID', 'Voucher Number', 'Date', 'Description', 'Reference', 'Debit', 'Credit', 'Currency', 'Status']);
            
            // Add data rows
            foreach ($vouchers as $voucher) {
                fputcsv($file, [
                    $voucher->id,
                    $voucher->voucher_number,
                    $voucher->voucher_date,
                    $voucher->description,
                    $voucher->reference_number ?? '',
                    $voucher->total_debit,
                    $voucher->total_credit,
                    $voucher->currency_code,
                    $voucher->status
                ]);
            }
            
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Export journal vouchers to Excel
     */
    public function exportExcel(Request $request)
    {
        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');
        $locationId = $request->input('user_location_id') ?? $request->session()->get('user_location_id');

        // Get filters (same as index method)
        $search = $request->input('search');
        $status = $request->input('status');
        $fromDate = $request->input('from_date');
        $toDate = $request->input('to_date');
        $sortBy = $request->input('sort_by', 'voucher_date');
        $sortDirection = $request->input('sort_direction', 'desc');

        // Build query (same as index method)
        $query = DB::table('transactions')
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->whereIn('voucher_type', ['Bank Payment', 'Bank Receipt']);

        // Apply search filter
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('voucher_number', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('reference_number', 'like', "%{$search}%");
            });
        }

        // Apply status filter
        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        // Apply date filters
        if ($fromDate) {
            $query->where('voucher_date', '>=', $fromDate . ' 00:00:00');
        }

        if ($toDate) {
            $query->where('voucher_date', '<=', $toDate . ' 23:59:59');
        }

        // Apply sorting
        $query->orderBy($sortBy, $sortDirection);

        $vouchers = $query->get();

        // For now, use CSV format but with .xlsx extension (can be enhanced with PhpSpreadsheet later)
        $filename = 'bank_vouchers_' . date('Y-m-d_His') . '.xlsx';
        
        $headers = [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function() use ($vouchers) {
            $file = fopen('php://output', 'w');
            
            // CSV Headers
            fputcsv($file, [
                'Voucher Number',
                'Voucher Date',
                'Description',
                'Reference Number',
                'Status',
                'Total Amount',
                'Created By',
                'Created At'
            ]);

            foreach ($vouchers as $voucher) {
                fputcsv($file, [
                    $voucher->voucher_number,
                    $voucher->voucher_date,
                    $voucher->description,
                    $voucher->reference_number,
                    $voucher->status,
                    $voucher->total_amount,
                    $voucher->created_by,
                    $voucher->created_at
                ]);
            }
            
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Export journal vouchers to PDF
     */
    public function exportPdf(Request $request)
    {
        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');
        $locationId = $request->input('user_location_id') ?? $request->session()->get('user_location_id');

        // Get filters (same as index method)
        $search = $request->input('search');
        $status = $request->input('status');
        $fromDate = $request->input('from_date');
        $toDate = $request->input('to_date');
        $sortBy = $request->input('sort_by', 'voucher_date');
        $sortDirection = $request->input('sort_direction', 'desc');

        // Build query (same as index method)
        $query = DB::table('transactions')
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->whereIn('voucher_type', ['Bank Payment', 'Bank Receipt']);

        // Apply search filter
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('voucher_number', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('reference_number', 'like', "%{$search}%");
            });
        }

        // Apply status filter
        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        // Apply date filters
        if ($fromDate) {
            $query->where('voucher_date', '>=', $fromDate . ' 00:00:00');
        }

        if ($toDate) {
            $query->where('voucher_date', '<=', $toDate . ' 23:59:59');
        }

        // Apply sorting
        $query->orderBy($sortBy, $sortDirection);

        $vouchers = $query->get();

        // Simple HTML to PDF conversion
        $html = '<html><head><style>
            body { font-family: Arial, sans-serif; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #4CAF50; color: white; }
        </style></head><body>';
        
        $html .= '<h1>Bank Vouchers Report</h1>';
        $html .= '<table><tr><th>ID</th><th>Voucher Number</th><th>Date</th><th>Description</th><th>Debit</th><th>Credit</th><th>Status</th></tr>';
        
        foreach ($vouchers as $voucher) {
            $html .= '<tr>';
            $html .= '<td>' . $voucher->id . '</td>';
            $html .= '<td>' . $voucher->voucher_number . '</td>';
            $html .= '<td>' . $voucher->voucher_date . '</td>';
            $html .= '<td>' . $voucher->description . '</td>';
            $html .= '<td>' . number_format($voucher->total_debit, 2) . '</td>';
            $html .= '<td>' . number_format($voucher->total_credit, 2) . '</td>';
            $html .= '<td>' . $voucher->status . '</td>';
            $html .= '</tr>';
        }
        
        $html .= '</table></body></html>';

        return response($html)
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'attachment; filename="bank_vouchers_' . date('Y-m-d_His') . '.pdf"');
    }

    /**
     * Post a single journal voucher (change status from Draft to Posted)
     */
    public function post(Request $request, $id)
    {
        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');
        $locationId = $request->input('user_location_id') ?? $request->session()->get('user_location_id');
        
        if (!$compId || !$locationId) {
            return redirect()->back()->with('error', 'User authentication information is required.');
        }

        try {
            $voucher = DB::table('transactions')
                ->where('id', $id)
                ->where('comp_id', $compId)
                ->where('location_id', $locationId)
                ->whereIn('voucher_type', ['Bank Payment', 'Bank Receipt'])
                ->first();

            if (!$voucher) {
                return redirect()->back()->with('error', 'Journal voucher not found.');
            }

            if ($voucher->status !== 'Draft') {
                return redirect()->back()->with('error', "Voucher {$voucher->voucher_number} is not in Draft status and cannot be posted.");
            }

            // Update voucher status to Posted
            DB::table('transactions')
                ->where('id', $id)
                ->update([
                    'status' => 'Posted',
                    'posted_at' => now(),
                    'posted_by' => auth()->id(),
                    'updated_at' => now()
                ]);

            // Create audit log for the journal voucher posting
            try {
                $voucherData = [
                    'voucher_number' => $voucher->voucher_number,
                    'voucher_date' => $voucher->voucher_date,
                    'voucher_type' => $voucher->voucher_type,
                    'reference_number' => $voucher->reference_number,
                    'description' => $voucher->description,
                    'status' => 'Posted',
                    'total_debit' => $voucher->total_debit,
                    'total_credit' => $voucher->total_credit,
                    'currency_code' => $voucher->currency_code,
                    'comp_id' => $compId,
                    'location_id' => $locationId,
                    'posted_at' => now(),
                    'posted_by' => auth()->id()
                ];
                
                $oldData = [
                    'status' => 'Draft',
                    'posted_at' => null,
                    'posted_by' => null
                ];
                
                AuditLogService::logBankVoucher('POST', $id, $voucherData, $oldData);
                Log::info('Audit log created for journal voucher posting', ['transaction_id' => $id]);
            } catch (\Exception $auditException) {
                // Don't fail the main operation if audit logging fails
                Log::warning('Failed to create audit log for journal voucher posting', [
                    'transaction_id' => $id,
                    'error' => $auditException->getMessage()
                ]);
            }

            return redirect()->route('accounts.bank-voucher.index')
                           ->with('success', "Bank voucher {$voucher->voucher_number} posted successfully!");

        } catch (\Exception $e) {
            Log::error('Error posting journal voucher', [
                'error' => $e->getMessage(),
                'voucher_id' => $id,
                'comp_id' => $compId,
                'location_id' => $locationId
            ]);

            return redirect()->back()->with('error', 'An error occurred while posting the voucher. Please try again.');
        }
    }

    /**
     * Bulk post journal vouchers
     */
    public function bulkPost(Request $request)
    {
        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');
        $locationId = $request->input('user_location_id') ?? $request->session()->get('user_location_id');
        
        $voucherIds = $request->input('ids', []);
        
        if (empty($voucherIds)) {
            return redirect()->back()->with('error', 'No vouchers selected for posting.');
        }

        try {
            DB::beginTransaction();

            $postedCount = 0;
            $errors = [];

            foreach ($voucherIds as $voucherId) {
                $voucher = DB::table('transactions')
                    ->where('id', $voucherId)
                    ->where('comp_id', $compId)
                    ->where('location_id', $locationId)
                    ->whereIn('voucher_type', ['Bank Payment', 'Bank Receipt'])
                    ->first();

                if (!$voucher) {
                    $errors[] = "Voucher ID {$voucherId} not found.";
                    continue;
                }

                if ($voucher->status !== 'Draft') {
                    $errors[] = "Voucher {$voucher->voucher_number} is not in Draft status and cannot be posted.";
                    continue;
                }

                // Update voucher status to Posted
                DB::table('transactions')
                    ->where('id', $voucherId)
                    ->update([
                        'status' => 'Posted',
                        'posted_at' => now(),
                        'posted_by' => auth()->id(),
                        'updated_at' => now()
                    ]);

                $postedCount++;
            }

            DB::commit();

            $message = "Successfully posted {$postedCount} voucher(s).";
            if (!empty($errors)) {
                $message .= " " . count($errors) . " voucher(s) could not be posted.";
            }

            return redirect()->back()->with('success', $message);

        } catch (\Exception $e) {
            DB::rollback();
            
            Log::error('Error in bulk post journal vouchers', [
                'error' => $e->getMessage(),
                'voucher_ids' => $voucherIds,
                'comp_id' => $compId,
                'location_id' => $locationId
            ]);

            return redirect()->back()->with('error', 'An error occurred while posting vouchers. Please try again.');
        }
    }

    /**
     * Print journal voucher summary
     */
    public function printSummary(Request $request, $id)
    {
        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');
        $locationId = $request->input('user_location_id') ?? $request->session()->get('user_location_id');
        
        if (!$compId || !$locationId) {
            abort(403, 'Company and Location information is required.');
        }

        $voucher = DB::table('transactions')
            ->where('id', $id)
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->whereIn('voucher_type', ['Bank Payment', 'Bank Receipt'])
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

        $company = DB::table('companies')->where('id', $compId)->first();

        return Inertia::render('Accounts/BankRec/PrintSummary', [
            'pageTitle' => 'Bank Voucher Print Summary',
            'voucher' => $voucher,
            'entries' => $entries,
            'company' => $company
        ]);
    }

    /**
     * Print journal voucher detailed
     */
    public function printDetailed(Request $request, $id)
    {
        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');
        $locationId = $request->input('user_location_id') ?? $request->session()->get('user_location_id');
        
        if (!$compId || !$locationId) {
            abort(403, 'Company and Location information is required.');
        }

        $voucher = DB::table('transactions')
            ->where('id', $id)
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->whereIn('voucher_type', ['Bank Payment', 'Bank Receipt'])
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

        $company = DB::table('companies')->where('id', $compId)->first();

        return Inertia::render('Accounts/BankRec/PrintDetailed', [
            'pageTitle' => 'Bank Voucher Print Detailed',
            'voucher' => $voucher,
            'entries' => $entries,
            'company' => $company
        ]);
    }

    /**
     * Delete a journal voucher
     * 
     * Error Handling Strategy:
     * - Only draft vouchers can be deleted
     * - All errors are logged with full details for developers
     * - User-friendly messages are shown to the user
     * - Audit trail is created for all deletions
     */
    public function destroy(Request $request, $id)
    {
        // Check if user has permission to can_delete
        $this->requirePermission($request, null, 'can_delete');
        Log::info('=== JOURNAL VOUCHER DESTROY METHOD CALLED ===', ['voucher_id' => $id]);
        
        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');
        $locationId = $request->input('user_location_id') ?? $request->session()->get('user_location_id');
        $userId = $request->input('user_id') ?? $request->session()->get('user_id');
        
        if (!$compId || !$locationId || !$userId) {
            Log::warning('Missing authentication information for journal voucher delete', [
                'comp_id' => $compId,
                'location_id' => $locationId,
                'user_id' => $userId,
                'voucher_id' => $id
            ]);
            return redirect()->back()->with('error', 'User authentication information is required.');
        }

        try {
            // Find the voucher
            $voucher = DB::table('transactions')
                ->where('id', $id)
                ->where('comp_id', $compId)
                ->where('location_id', $locationId)
                ->whereIn('voucher_type', ['Bank Payment', 'Bank Receipt'])
                ->first();

            if (!$voucher) {
                Log::warning('Journal voucher not found for deletion', [
                    'voucher_id' => $id,
                    'comp_id' => $compId,
                    'location_id' => $locationId
                ]);
                return redirect()->back()->with('error', 'Journal voucher not found.');
            }

            // Only draft vouchers can be deleted
            if ($voucher->status !== 'Draft') {
                Log::warning('Attempted to delete non-draft journal voucher', [
                    'voucher_id' => $id,
                    'voucher_number' => $voucher->voucher_number,
                    'status' => $voucher->status,
                    'user_id' => $userId
                ]);
                return redirect()->back()->with('error', 'Only draft vouchers can be deleted. This voucher has status: ' . $voucher->status);
            }

            $voucherNumber = $voucher->voucher_number;
            
            // Store old data for audit log
            $oldData = [
                'voucher_number' => $voucher->voucher_number,
                'voucher_date' => $voucher->voucher_date,
                'voucher_type' => $voucher->voucher_type,
                'reference_number' => $voucher->reference_number,
                'description' => $voucher->description,
                'status' => $voucher->status,
                'total_debit' => $voucher->total_debit,
                'total_credit' => $voucher->total_credit,
                'currency_code' => $voucher->currency_code,
                'comp_id' => $voucher->comp_id,
                'location_id' => $voucher->location_id,
                'created_by' => $voucher->created_by,
                'created_at' => $voucher->created_at
            ];

            // Get transaction entries for recovery
            $transactionEntries = DB::table('transaction_entries')
                ->where('transaction_id', $id)
                ->get()
                ->toArray();

            // Get attachments for recovery
            $attachments = DB::table('voucher_attachments')
                ->where('voucher_id', $id)
                ->get()
                ->toArray();

            // Prepare related data for recovery
            $relatedData = [
                'transaction_entries' => $transactionEntries,
                'voucher_attachments' => $attachments
            ];

            // Save for recovery before deletion
            try {
                $recoveryId = RecoveryService::saveForRecovery(
                    'transactions',
                    $id,
                    (array) $voucher,
                    $relatedData,
                    $voucherNumber,
                    'Manual deletion from Journal Voucher list'
                );
                
                Log::info('Journal voucher saved for recovery', [
                    'voucher_id' => $id,
                    'voucher_number' => $voucherNumber,
                    'recovery_id' => $recoveryId
                ]);
            } catch (\Exception $recoveryException) {
                Log::warning('Failed to save journal voucher for recovery', [
                    'voucher_id' => $id,
                    'voucher_number' => $voucherNumber,
                    'error' => $recoveryException->getMessage()
                ]);
                // Continue with deletion even if recovery fails
            }

            DB::beginTransaction();

            Log::info('Deleting journal voucher entries', [
                'voucher_id' => $id,
                'voucher_number' => $voucherNumber
            ]);

            // Delete transaction entries first (foreign key constraint)
            $entriesDeleted = DB::table('transaction_entries')
                ->where('transaction_id', $id)
                ->delete();

            Log::info('Journal voucher entries deleted', [
                'voucher_id' => $id,
                'entries_deleted' => $entriesDeleted
            ]);

            // Delete attachments
            $attachmentsDeleted = DB::table('voucher_attachments')
                ->where('voucher_id', $id)
                ->delete();

            Log::info('Journal voucher attachments deleted', [
                'voucher_id' => $id,
                'attachments_deleted' => $attachmentsDeleted
            ]);

            // Delete the transaction
            DB::table('transactions')
                ->where('id', $id)
                ->delete();

            Log::info('Journal voucher deleted successfully', [
                'voucher_id' => $id,
                'voucher_number' => $voucherNumber
            ]);

            DB::commit();

            // Create audit log for the journal voucher deletion
            try {
                AuditLogService::logBankVoucher('DELETE', $id, [], $oldData);
                Log::info('Audit log created for journal voucher deletion', [
                    'voucher_id' => $id,
                    'voucher_number' => $voucherNumber
                ]);
            } catch (\Exception $auditException) {
                // Don't fail the main operation if audit logging fails
                Log::warning('Failed to create audit log for journal voucher deletion', [
                    'voucher_id' => $id,
                    'voucher_number' => $voucherNumber,
                    'error' => $auditException->getMessage()
                ]);
            }


            return redirect()->route('accounts.bank-voucher.index')
                           ->with('success', "Bank voucher {$voucherNumber} deleted successfully!");

        } catch (\Illuminate\Database\QueryException $e) {
            DB::rollback();
            
            // Log detailed error for developers
            Log::error('Database error deleting journal voucher', [
                'error' => $e->getMessage(),
                'sql' => $e->getSql(),
                'bindings' => $e->getBindings(),
                'trace' => $e->getTraceAsString(),
                'voucher_id' => $id,
                'user_id' => $userId,
                'comp_id' => $compId,
                'location_id' => $locationId
            ]);
            
            // Return user-friendly error message
            return redirect()->back()->with('error', 'There was a problem deleting the journal voucher. Please try again or contact support.');
            
        } catch (\Exception $e) {
            DB::rollback();
            
            // Log detailed error for developers
            Log::error('Error deleting journal voucher', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'voucher_id' => $id,
                'user_id' => $userId,
                'comp_id' => $compId,
                'location_id' => $locationId
            ]);
            
            // Return user-friendly error message
            return redirect()->back()->with('error', 'Something went wrong while deleting the journal voucher. Please try again or contact support if the problem persists.');
        }
    }

    /**
     * Get period information for a specific date
     */
    private function getPeriodInfoForDate($date, $compId)
    {
        $period = FiscalYearHelper::getFiscalPeriod($date, $compId);
        
        if (!$period) {
            return null;
        }
        
        return [
            'id' => $period->id,
            'period_name' => $period->period_name,
            'status' => $period->status,
            'is_adjustment_period' => $period->is_adjustment_period,
            'start_date' => $period->start_date,
            'end_date' => $period->end_date,
            'fiscal_year' => $period->fiscal_year
        ];
    }
}
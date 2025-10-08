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
                'journalVouchers' => [
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
            ->where('voucher_type', 'Journal');

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
            $query->whereDate('voucher_date', '>=', $fromDate);
        }

        if ($toDate) {
            $query->whereDate('voucher_date', '<=', $toDate);
        }

        // Apply sorting
        $query->orderBy($sortBy, $sortDirection);

        // Paginate results
        $journalVouchers = $query->paginate($perPage);

        $accounts = $this->getTransactionalAccounts($compId, $locationId);

        return Inertia::render('Accounts/JournalVoucher/List', [
            'journalVouchers' => $journalVouchers,
            'accounts' => $accounts,
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

        $accounts = $this->getTransactionalAccounts($compId, $locationId);

        // Generate preview voucher number for display
        $previewVoucherNumber = $this->generatePreviewVoucherNumber($compId, $locationId, 'Journal');

        return Inertia::render('Accounts/JournalVoucher/Create', [
            'accounts' => $accounts,
            'currencies' => $currencies,
            'company' => $company,
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
            'description' => 'nullable|string|max:250',
            'reference_number' => 'nullable|string|max:100',
            'entries' => 'required|array|min:2',
            'entries.*.account_id' => 'required|integer|exists:chart_of_accounts,id,account_level,3',
            'entries.*.description' => 'nullable|string|max:500',
            'entries.*.debit_amount' => 'nullable|numeric|min:0',
            'entries.*.credit_amount' => 'nullable|numeric|min:0',
            'entries.*.currency_code' => 'required|string|max:3',
            'entries.*.exchange_rate' => 'required|numeric|min:0.000001',
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
            // Exchange rate is stored as base_currency/foreign_currency, so we need to invert it
            $baseDebit = $debit * (1 / $exchangeRate);
            $baseCredit = $credit * (1 / $exchangeRate);
            
            $totalBaseDebit += $baseDebit;
            $totalBaseCredit += $baseCredit;
        }
        
        if (abs($totalBaseDebit - $totalBaseCredit) > 0.01) {
            return redirect()->back()->withErrors(['entries' => 'Total debits must equal total credits in base currency (Double Entry Principle)']);
        }

        // Auto-generate voucher number
        $voucherNumber = $this->generateVoucherNumber($compId, $locationId, 'Journal');
        

        DB::beginTransaction();
        
        try {
            Log::info('Starting transaction creation...');

            // Create transaction
            Log::info('Creating transaction record...', [
                'voucher_number' => $voucherNumber,
                'voucher_date' => $request->voucher_date,
                'total_debit' => $totalBaseDebit,
                'total_credit' => $totalBaseCredit,
                'comp_id' => $compId,
                'location_id' => $locationId,
                'user_id' => $userId
            ]);
            
            $transactionId = DB::table('transactions')->insertGetId([
                'voucher_number' => $voucherNumber,
                'voucher_date' => $request->voucher_date,
                'voucher_type' => 'Journal',
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
            
            Log::info('Transaction created successfully', ['transaction_id' => $transactionId]);

            // Create transaction entries
            Log::info('Creating transaction entries...', ['entries_count' => count($request->entries)]);
            foreach ($request->entries as $index => $entry) {
                $debit = $entry['debit_amount'] ?? 0;
                $credit = $entry['credit_amount'] ?? 0;
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
                
                Log::info("Entry $index created successfully");
            }

            Log::info('All entries created, committing transaction...');
            DB::commit();
            
            Log::info('Journal voucher created successfully', [
                'transaction_id' => $transactionId,
                'voucher_number' => $voucherNumber,
                'total_debit' => $totalBaseDebit,
                'total_credit' => $totalBaseCredit,
                'entries_count' => count($request->entries)
            ]);

            return redirect()->route('accounts.journal-voucher.index')
                           ->with('success', 'Journal voucher created successfully!');

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
            ->where('voucher_type', 'Journal')
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
            ->where('voucher_type', 'Journal')
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

        $accounts = $this->getTransactionalAccounts($compId, $locationId);

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

        return Inertia::render('Accounts/JournalVoucher/Create', [
            'voucher' => $voucher,
            'entries' => $entries,
            'accounts' => $accounts,
            'currencies' => $currencies,
            'company' => $company,
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
            'description' => 'nullable|string|max:250',
            'reference_number' => 'nullable|string|max:100',
            'entries' => 'required|array|min:2',
            'entries.*.account_id' => 'required|integer|exists:chart_of_accounts,id,account_level,3',
            'entries.*.description' => 'nullable|string|max:500',
            'entries.*.debit_amount' => 'nullable|numeric|min:0',
            'entries.*.credit_amount' => 'nullable|numeric|min:0',
            'entries.*.currency_code' => 'required|string|max:3',
            'entries.*.exchange_rate' => 'required|numeric|min:0.000001',
            'attachments' => 'nullable|array',
            'attachments.*' => 'nullable|string'
        ]);

        // Check if voucher exists and is editable
        $voucher = DB::table('transactions')
            ->where('id', $id)
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->where('voucher_type', 'Journal')
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
            // Exchange rate is stored as base_currency/foreign_currency, so we need to invert it
            $baseDebit = $debit * (1 / $exchangeRate);
            $baseCredit = $credit * (1 / $exchangeRate);
            
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
                // Exchange rate is stored as base_currency/foreign_currency, so we need to invert it
                $baseDebit = $debit * (1 / $exchangeRate);
                $baseCredit = $credit * (1 / $exchangeRate);
                
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
     * Get transactional accounts (level 3) for journal entries
     */
    private function getTransactionalAccounts($compId, $locationId)
    {
        return DB::table('chart_of_accounts')
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->where('status', 'Active')
            ->where('account_level', 3) // Only transactional accounts
            ->orderBy('account_code')
            ->get();
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
            ->where('voucher_type', 'Journal');

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
            $query->whereDate('voucher_date', '>=', $fromDate);
        }

        if ($toDate) {
            $query->whereDate('voucher_date', '<=', $toDate);
        }

        // Apply sorting
        $query->orderBy($sortBy, $sortDirection);

        $vouchers = $query->get();

        $filename = 'journal_vouchers_' . date('Y-m-d_His') . '.csv';
        
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
            ->where('voucher_type', 'Journal');

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
            $query->whereDate('voucher_date', '>=', $fromDate);
        }

        if ($toDate) {
            $query->whereDate('voucher_date', '<=', $toDate);
        }

        // Apply sorting
        $query->orderBy($sortBy, $sortDirection);

        $vouchers = $query->get();

        // For now, use CSV format but with .xlsx extension (can be enhanced with PhpSpreadsheet later)
        $filename = 'journal_vouchers_' . date('Y-m-d_His') . '.xlsx';
        
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
            ->where('voucher_type', 'Journal');

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
            $query->whereDate('voucher_date', '>=', $fromDate);
        }

        if ($toDate) {
            $query->whereDate('voucher_date', '<=', $toDate);
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
        
        $html .= '<h1>Journal Vouchers Report</h1>';
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
            ->header('Content-Disposition', 'attachment; filename="journal_vouchers_' . date('Y-m-d_His') . '.pdf"');
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
            return response()->json([
                'success' => false,
                'message' => 'No vouchers selected for posting.'
            ], 400);
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
                    ->where('voucher_type', 'Journal')
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

            return response()->json([
                'success' => true,
                'message' => $message,
                'posted_count' => $postedCount,
                'errors' => $errors
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            
            Log::error('Error in bulk post journal vouchers', [
                'error' => $e->getMessage(),
                'voucher_ids' => $voucherIds,
                'comp_id' => $compId,
                'location_id' => $locationId
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while posting vouchers. Please try again.'
            ], 500);
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
            ->where('voucher_type', 'Journal')
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

        return Inertia::render('Accounts/JournalVoucher/PrintSummary', [
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
            ->where('voucher_type', 'Journal')
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

        return Inertia::render('Accounts/JournalVoucher/PrintDetailed', [
            'voucher' => $voucher,
            'entries' => $entries,
            'company' => $company
        ]);
    }
}
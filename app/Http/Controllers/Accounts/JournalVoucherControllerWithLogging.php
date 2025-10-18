<?php

/**
 * This file contains the logging integration for JournalVoucherController
 * 
 * Instructions:
 * 1. Add "use App\Services\AuditLogService;" at top of JournalVoucherController.php
 * 2. Add "use App\Services\RecoveryService;" at top of JournalVoucherController.php  
 * 3. Replace the store() method with the one below
 * 4. Replace the update() method with the one below
 * 5. Add the new destroy() and post() methods
 */

// ==================== ADD TO IMPORTS ====================
// use App\Services\AuditLogService;
// use App\Services\RecoveryService;

// ==================== REPLACE store() METHOD ====================
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
            'entries.*.account_id' => 'required|integer|exists:chart_of_accounts,id,account_level,4',
            'entries.*.description' => 'nullable|string|max:500',
            'entries.*.debit_amount' => 'nullable|numeric|min:0',
            'entries.*.credit_amount' => 'nullable|numeric|min:0',
            'entries.*.currency_code' => 'required|string|max:3',
            'entries.*.exchange_rate' => 'required|numeric|min:0.000001',
            'attachments' => 'nullable|array',
            'attachments.*' => 'nullable|string'
        ]);
    } catch (\Illuminate\Validation\ValidationException $e) {
        Log::warning('Journal voucher validation failed', [
            'errors' => $e->errors(),
            'request_data' => $request->all(),
            'user_id' => $userId,
            'comp_id' => $compId,
            'location_id' => $locationId
        ]);
        
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
        Log::info('Starting transaction creation...', [
            'voucher_number' => $voucherNumber,
            'voucher_date' => $request->voucher_date,
            'total_debit' => $totalBaseDebit,
            'total_credit' => $totalBaseCredit
        ]);
        
        // Create transaction
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
            'period_id' => 1,
            'comp_id' => $compId,
            'location_id' => $locationId,
            'created_by' => $userId,
            'created_at' => now(),
            'updated_at' => now()
        ]);
        
        Log::info('Transaction created successfully', ['transaction_id' => $transactionId]);

        // Create transaction entries
        $entriesData = [];
        foreach ($request->entries as $index => $entry) {
            $debit = $entry['debit_amount'] ?? 0;
            $credit = $entry['credit_amount'] ?? 0;
            $exchangeRate = $entry['exchange_rate'] ?? 1.0;
            
            $baseDebit = $debit * (1 / $exchangeRate);
            $baseCredit = $credit * (1 / $exchangeRate);
            
            $entryData = [
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
            ];
            
            DB::table('transaction_entries')->insert($entryData);
            $entriesData[] = $entryData;
        }

        // ✅ LOG CREATION TO AUDIT TRAIL
        AuditLogService::log(
            'CREATE',
            'Accounts',
            'transactions',
            $transactionId,
            null,  // no old data for creation
            [
                'voucher_number' => $voucherNumber,
                'voucher_date' => $request->voucher_date,
                'voucher_type' => 'Journal',
                'reference_number' => $request->reference_number,
                'description' => $request->description,
                'status' => 'Draft',
                'total_debit' => $totalBaseDebit,
                'total_credit' => $totalBaseCredit,
                'entries_count' => count($entriesData)
            ],
            "Created Journal Voucher: {$voucherNumber}"
        );

        DB::commit();

        return redirect()->route('accounts.journal-voucher.index')
                       ->with('success', 'Journal voucher created successfully! Voucher Number: ' . $voucherNumber);

    } catch (\Exception $e) {
        DB::rollback();
        
        Log::error('Error creating journal voucher', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        
        return redirect()->back()->with('error', 'Something went wrong while creating the journal voucher. Please try again.');
    }
}

// ==================== REPLACE update() METHOD ====================
public function update(Request $request, $id)
{
    $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');
    $locationId = $request->input('user_location_id') ?? $request->session()->get('user_location_id');
    
    if (!$compId || !$locationId) {
        return redirect()->back()->with('error', 'User authentication information is required.');
    }

    // ✅ GET OLD DATA BEFORE UPDATE
    $oldVoucher = DB::table('transactions')
        ->where('id', $id)
        ->where('comp_id', $compId)
        ->where('location_id', $locationId)
        ->where('voucher_type', 'Journal')
        ->first();

    if (!$oldVoucher) {
        return redirect()->back()->with('error', 'Journal voucher not found');
    }

    if ($oldVoucher->status !== 'Draft') {
        return redirect()->back()->with('error', 'Only draft vouchers can be edited');
    }

    // ✅ GET OLD ENTRIES
    $oldEntries = DB::table('transaction_entries')
        ->where('transaction_id', $id)
        ->get()
        ->toArray();

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

    // Validate double entry principle
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
        
        $baseDebit = $debit * (1 / $exchangeRate);
        $baseCredit = $credit * (1 / $exchangeRate);
        
        $totalBaseDebit += $baseDebit;
        $totalBaseCredit += $baseCredit;
    }
    
    if (abs($totalBaseDebit - $totalBaseCredit) > 0.01) {
        return redirect()->back()->withErrors(['entries' => 'Total debits must equal total credits in base currency (Double Entry Principle)']);
    }

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
        $newEntriesData = [];
        foreach ($request->entries as $index => $entry) {
            $debit = $entry['debit_amount'] ?? 0;
            $credit = $entry['credit_amount'] ?? 0;
            $exchangeRate = $entry['exchange_rate'] ?? 1.0;
            
            $baseDebit = $debit * (1 / $exchangeRate);
            $baseCredit = $credit * (1 / $exchangeRate);
            
            $entryData = [
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
            ];
            
            DB::table('transaction_entries')->insert($entryData);
            $newEntriesData[] = $entryData;
        }

        // ✅ LOG UPDATE TO AUDIT TRAIL (only if actual changes)
        $newVoucherData = [
            'voucher_number' => $oldVoucher->voucher_number,
            'voucher_date' => $request->voucher_date,
            'voucher_type' => 'Journal',
            'reference_number' => $request->reference_number,
            'description' => $request->description,
            'total_debit' => $totalBaseDebit,
            'total_credit' => $totalBaseCredit,
            'entries_count' => count($newEntriesData)
        ];

        $oldVoucherData = [
            'voucher_number' => $oldVoucher->voucher_number,
            'voucher_date' => $oldVoucher->voucher_date,
            'voucher_type' => $oldVoucher->voucher_type,
            'reference_number' => $oldVoucher->reference_number,
            'description' => $oldVoucher->description,
            'total_debit' => $oldVoucher->total_debit,
            'total_credit' => $oldVoucher->total_credit,
            'entries_count' => count($oldEntries)
        ];

        AuditLogService::log(
            'UPDATE',
            'Accounts',
            'transactions',
            $id,
            $oldVoucherData,
            $newVoucherData,
            "Updated Journal Voucher: {$oldVoucher->voucher_number}"
        );

        DB::commit();

        return redirect()->route('accounts.journal-voucher.index')
                       ->with('success', 'Journal voucher updated successfully!');

    } catch (\Exception $e) {
        DB::rollback();
        
        Log::error('Error updating journal voucher', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        
        return redirect()->back()->with('error', 'Something went wrong while updating the journal voucher. Please try again.');
    }
}

// ==================== ADD destroy() METHOD ====================
/**
 * Delete journal voucher (with recovery option)
 */
public function destroy(Request $request, $id)
{
    $compId = $request->session()->get('user_comp_id');
    $locationId = $request->session()->get('user_location_id');
    
    if (!$compId || !$locationId) {
        return response()->json([
            'success' => false,
            'message' => 'User authentication information is required.'
        ], 401);
    }

    DB::beginTransaction();
    
    try {
        // ✅ GET COMPLETE DATA BEFORE DELETE
        $voucher = DB::table('transactions')
            ->where('id', $id)
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->where('voucher_type', 'Journal')
            ->first();

        if (!$voucher) {
            return response()->json([
                'success' => false,
                'message' => 'Journal voucher not found'
            ], 404);
        }

        // Check if can be deleted
        if ($voucher->status === 'Posted') {
            return response()->json([
                'success' => false,
                'message' => 'Posted vouchers cannot be deleted. Please unpost first.'
            ], 400);
        }

        // Get all related data
        $entries = DB::table('transaction_entries')
            ->where('transaction_id', $id)
            ->get()
            ->toArray();

        // ✅ SAVE FOR RECOVERY (90 days)
        $recoveryId = RecoveryService::saveForRecovery(
            'transactions',
            $id,
            (array)$voucher,
            ['entries' => $entries],
            $voucher->voucher_number,
            $request->input('reason', 'User deleted')
        );

        // ✅ DELETE ENTRIES
        DB::table('transaction_entries')
            ->where('transaction_id', $id)
            ->delete();

        // ✅ DELETE VOUCHER
        DB::table('transactions')
            ->where('id', $id)
            ->delete();

        // ✅ LOG DELETION
        AuditLogService::log(
            'DELETE',
            'Accounts',
            'transactions',
            $id,
            (array)$voucher,
            null,
            "Deleted Journal Voucher: {$voucher->voucher_number} (recoverable for 90 days)"
        );

        DB::commit();

        return response()->json([
            'success' => true,
            'message' => 'Journal voucher deleted successfully. Can be recovered within 90 days.',
            'recovery_id' => $recoveryId
        ]);

    } catch (\Exception $e) {
        DB::rollBack();
        
        Log::error('Error deleting journal voucher', [
            'error' => $e->getMessage(),
            'voucher_id' => $id
        ]);
        
        return response()->json([
            'success' => false,
            'message' => 'Error deleting journal voucher'
        ], 500);
    }
}

// ==================== ADD post() METHOD ====================
/**
 * Post journal voucher (change status from Draft to Posted)
 */
public function post(Request $request, $id)
{
    $compId = $request->session()->get('user_comp_id');
    $locationId = $request->session()->get('user_location_id');
    $userId = $request->session()->get('user_id');
    
    if (!$compId || !$locationId || !$userId) {
        return response()->json([
            'success' => false,
            'message' => 'User authentication information is required.'
        ], 401);
    }

    DB::beginTransaction();
    
    try {
        // Get voucher
        $voucher = DB::table('transactions')
            ->where('id', $id)
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->where('voucher_type', 'Journal')
            ->first();

        if (!$voucher) {
            return response()->json([
                'success' => false,
                'message' => 'Journal voucher not found'
            ], 404);
        }

        // Check if already posted
        if ($voucher->status === 'Posted') {
            return response()->json([
                'success' => false,
                'message' => 'Voucher is already posted'
            ], 400);
        }

        // ✅ UPDATE STATUS
        DB::table('transactions')
            ->where('id', $id)
            ->update([
                'status' => 'Posted',
                'posted_by' => $userId,
                'posted_at' => now(),
                'updated_at' => now()
            ]);

        // ✅ LOG STATUS CHANGE
        AuditLogService::log(
            'POST',
            'Accounts',
            'transactions',
            $id,
            ['status' => 'Draft'],
            ['status' => 'Posted', 'posted_by' => $userId, 'posted_at' => now()],
            "Posted Journal Voucher: {$voucher->voucher_number}"
        );

        DB::commit();

        return response()->json([
            'success' => true,
            'message' => 'Journal voucher posted successfully'
        ]);

    } catch (\Exception $e) {
        DB::rollBack();
        
        Log::error('Error posting journal voucher', [
            'error' => $e->getMessage(),
            'voucher_id' => $id
        ]);
        
        return response()->json([
            'success' => false,
            'message' => 'Error posting journal voucher'
        ], 500);
    }
}


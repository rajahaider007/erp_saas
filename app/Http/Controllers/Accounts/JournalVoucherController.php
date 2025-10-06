<?php

namespace App\Http\Controllers\Accounts;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;

class JournalVoucherController extends Controller
{
    /**
     * Get all journal vouchers
     */
    public function index(Request $request)
    {
        try {
            $compId = $request->input('user_comp_id');
            $locationId = $request->input('user_location_id');
            
            if (!$compId || !$locationId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Company and Location information is required.'
                ], 400);
            }
            
            $vouchers = DB::table('transactions')
                ->where('comp_id', $compId)
                ->where('location_id', $locationId)
                ->where('voucher_type', 'Journal Voucher')
                ->orderBy('voucher_date', 'desc')
                ->orderBy('voucher_number', 'desc')
                ->get();
                
            return response()->json([
                'success' => true,
                'data' => $vouchers
            ]);
            
        } catch (\Exception $e) {
            Log::error('Journal Voucher Index Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving journal vouchers: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get specific journal voucher with entries
     */
    public function show(Request $request, $id)
    {
        try {
            $compId = $request->input('user_comp_id');
            $locationId = $request->input('user_location_id');
            
            if (!$compId || !$locationId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Company and Location information is required.'
                ], 400);
            }
            
            $voucher = DB::table('transactions')
                ->where('id', $id)
                ->where('comp_id', $compId)
                ->where('location_id', $locationId)
                ->where('voucher_type', 'Journal Voucher')
                ->first();
                
            if (!$voucher) {
                return response()->json([
                    'success' => false,
                    'message' => 'Journal voucher not found'
                ], 404);
            }
            
            // Get transaction entries
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
                
            $voucher->entries = $entries;
                
            return response()->json([
                'success' => true,
                'data' => $voucher
            ]);
            
        } catch (\Exception $e) {
            Log::error('Journal Voucher Show Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving journal voucher: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create new journal voucher
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'voucher_date' => 'required|date',
                'description' => 'required|string|max:500',
                'reference_number' => 'nullable|string|max:100',
                'entries' => 'required|array|min:2',
                'entries.*.account_id' => 'required|integer|exists:chart_of_accounts,id',
                'entries.*.description' => 'nullable|string|max:500',
                'entries.*.debit_amount' => 'required_without:entries.*.credit_amount|numeric|min:0',
                'entries.*.credit_amount' => 'required_without:entries.*.debit_amount|numeric|min:0',
                'currency_code' => 'required|string|max:3',
                'exchange_rate' => 'required|numeric|min:0.000001'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 400);
            }

            $compId = $request->input('user_comp_id');
            $locationId = $request->input('user_location_id');
            $userId = $request->input('user_id');

            if (!$compId || !$locationId || !$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'User authentication information is required.'
                ], 400);
            }

            // Validate double entry principle
            $totalDebit = 0;
            $totalCredit = 0;
            
            foreach ($request->entries as $entry) {
                $debit = $entry['debit_amount'] ?? 0;
                $credit = $entry['credit_amount'] ?? 0;
                
                if ($debit > 0 && $credit > 0) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Each entry must be either debit or credit, not both'
                    ], 400);
                }
                
                if ($debit == 0 && $credit == 0) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Each entry must have either debit or credit amount'
                    ], 400);
                }
                
                $totalDebit += $debit;
                $totalCredit += $credit;
            }
            
            if (abs($totalDebit - $totalCredit) > 0.01) {
                return response()->json([
                    'success' => false,
                    'message' => 'Total debits must equal total credits (Double Entry Principle)'
                ], 400);
            }

            // Generate voucher number
            $voucherNumber = $this->generateVoucherNumber($compId, $locationId, 'Journal Voucher');

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
                    'total_debit' => $totalDebit,
                    'total_credit' => $totalCredit,
                    'currency_code' => $request->currency_code,
                    'exchange_rate' => $request->exchange_rate,
                    'base_currency_total' => $totalDebit,
                    'period_id' => 1, // Default period - should be calculated based on date
                    'comp_id' => $compId,
                    'location_id' => $locationId,
                    'created_by' => $userId,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);

                // Create transaction entries
                foreach ($request->entries as $index => $entry) {
                    DB::table('transaction_entries')->insert([
                        'transaction_id' => $transactionId,
                        'line_number' => $index + 1,
                        'account_id' => $entry['account_id'],
                        'description' => $entry['description'],
                        'debit_amount' => $entry['debit_amount'] ?? 0,
                        'credit_amount' => $entry['credit_amount'] ?? 0,
                        'currency_code' => $request->currency_code,
                        'exchange_rate' => $request->exchange_rate,
                        'base_debit_amount' => $entry['debit_amount'] ?? 0,
                        'base_credit_amount' => $entry['credit_amount'] ?? 0,
                        'comp_id' => $compId,
                        'location_id' => $locationId,
                        'created_at' => now(),
                        'updated_at' => now()
                    ]);
                }

                DB::commit();

                return response()->json([
                    'success' => true,
                    'message' => 'Journal voucher created successfully',
                    'data' => [
                        'transaction_id' => $transactionId,
                        'voucher_number' => $voucherNumber
                    ]
                ]);

            } catch (\Exception $e) {
                DB::rollback();
                throw $e;
            }

        } catch (\Exception $e) {
            Log::error('Journal Voucher Store Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error creating journal voucher: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update journal voucher
     */
    public function update(Request $request, $id)
    {
        try {
            $validator = Validator::make($request->all(), [
                'voucher_date' => 'required|date',
                'description' => 'required|string|max:500',
                'reference_number' => 'nullable|string|max:100',
                'entries' => 'required|array|min:2',
                'entries.*.account_id' => 'required|integer|exists:chart_of_accounts,id',
                'entries.*.description' => 'nullable|string|max:500',
                'entries.*.debit_amount' => 'required_without:entries.*.credit_amount|numeric|min:0',
                'entries.*.credit_amount' => 'required_without:entries.*.debit_amount|numeric|min:0',
                'currency_code' => 'required|string|max:3',
                'exchange_rate' => 'required|numeric|min:0.000001'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 400);
            }

            $compId = $request->input('user_comp_id');
            $locationId = $request->input('user_location_id');

            if (!$compId || !$locationId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Company and Location information is required.'
                ], 400);
            }

            // Check if voucher exists and is editable
            $voucher = DB::table('transactions')
                ->where('id', $id)
                ->where('comp_id', $compId)
                ->where('location_id', $locationId)
                ->where('voucher_type', 'Journal Voucher')
                ->first();

            if (!$voucher) {
                return response()->json([
                    'success' => false,
                    'message' => 'Journal voucher not found'
                ], 404);
            }

            if ($voucher->status !== 'Draft') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only draft vouchers can be edited'
                ], 400);
            }

            // Validate double entry principle
            $totalDebit = 0;
            $totalCredit = 0;
            
            foreach ($request->entries as $entry) {
                $debit = $entry['debit_amount'] ?? 0;
                $credit = $entry['credit_amount'] ?? 0;
                
                if ($debit > 0 && $credit > 0) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Each entry must be either debit or credit, not both'
                    ], 400);
                }
                
                if ($debit == 0 && $credit == 0) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Each entry must have either debit or credit amount'
                    ], 400);
                }
                
                $totalDebit += $debit;
                $totalCredit += $credit;
            }
            
            if (abs($totalDebit - $totalCredit) > 0.01) {
                return response()->json([
                    'success' => false,
                    'message' => 'Total debits must equal total credits (Double Entry Principle)'
                ], 400);
            }

            DB::beginTransaction();
            
            try {
                // Update transaction
                DB::table('transactions')
                    ->where('id', $id)
                    ->update([
                        'voucher_date' => $request->voucher_date,
                        'reference_number' => $request->reference_number,
                        'description' => $request->description,
                        'total_debit' => $totalDebit,
                        'total_credit' => $totalCredit,
                        'currency_code' => $request->currency_code,
                        'exchange_rate' => $request->exchange_rate,
                        'base_currency_total' => $totalDebit,
                        'updated_at' => now()
                    ]);

                // Delete existing entries
                DB::table('transaction_entries')
                    ->where('transaction_id', $id)
                    ->delete();

                // Create new transaction entries
                foreach ($request->entries as $index => $entry) {
                    DB::table('transaction_entries')->insert([
                        'transaction_id' => $id,
                        'line_number' => $index + 1,
                        'account_id' => $entry['account_id'],
                        'description' => $entry['description'],
                        'debit_amount' => $entry['debit_amount'] ?? 0,
                        'credit_amount' => $entry['credit_amount'] ?? 0,
                        'currency_code' => $request->currency_code,
                        'exchange_rate' => $request->exchange_rate,
                        'base_debit_amount' => $entry['debit_amount'] ?? 0,
                        'base_credit_amount' => $entry['credit_amount'] ?? 0,
                        'comp_id' => $compId,
                        'location_id' => $locationId,
                        'created_at' => now(),
                        'updated_at' => now()
                    ]);
                }

                DB::commit();

                return response()->json([
                    'success' => true,
                    'message' => 'Journal voucher updated successfully'
                ]);

            } catch (\Exception $e) {
                DB::rollback();
                throw $e;
            }

        } catch (\Exception $e) {
            Log::error('Journal Voucher Update Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error updating journal voucher: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete journal voucher
     */
    public function destroy(Request $request, $id)
    {
        try {
            $compId = $request->input('user_comp_id');
            $locationId = $request->input('user_location_id');

            if (!$compId || !$locationId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Company and Location information is required.'
                ], 400);
            }

            // Check if voucher exists and is deletable
            $voucher = DB::table('transactions')
                ->where('id', $id)
                ->where('comp_id', $compId)
                ->where('location_id', $locationId)
                ->where('voucher_type', 'Journal Voucher')
                ->first();

            if (!$voucher) {
                return response()->json([
                    'success' => false,
                    'message' => 'Journal voucher not found'
                ], 404);
            }

            if ($voucher->status !== 'Draft') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only draft vouchers can be deleted'
                ], 400);
            }

            DB::beginTransaction();
            
            try {
                // Delete transaction entries first
                DB::table('transaction_entries')
                    ->where('transaction_id', $id)
                    ->delete();

                // Delete transaction
                DB::table('transactions')
                    ->where('id', $id)
                    ->delete();

                DB::commit();

                return response()->json([
                    'success' => true,
                    'message' => 'Journal voucher deleted successfully'
                ]);

            } catch (\Exception $e) {
                DB::rollback();
                throw $e;
            }

        } catch (\Exception $e) {
            Log::error('Journal Voucher Delete Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error deleting journal voucher: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Post journal voucher (change status from Draft to Posted)
     */
    public function post(Request $request, $id)
    {
        try {
            $compId = $request->input('user_comp_id');
            $locationId = $request->input('user_location_id');
            $userId = $request->input('user_id');

            if (!$compId || !$locationId || !$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'User authentication information is required.'
                ], 400);
            }

            // Check if voucher exists and can be posted
            $voucher = DB::table('transactions')
                ->where('id', $id)
                ->where('comp_id', $compId)
                ->where('location_id', $locationId)
                ->where('voucher_type', 'Journal Voucher')
                ->first();

            if (!$voucher) {
                return response()->json([
                    'success' => false,
                    'message' => 'Journal voucher not found'
                ], 404);
            }

            if ($voucher->status !== 'Draft') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only draft vouchers can be posted'
                ], 400);
            }

            // Update transaction status
            DB::table('transactions')
                ->where('id', $id)
                ->update([
                    'status' => 'Posted',
                    'posted_by' => $userId,
                    'posted_at' => now(),
                    'updated_at' => now()
                ]);

            return response()->json([
                'success' => true,
                'message' => 'Journal voucher posted successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Journal Voucher Post Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error posting journal voucher: ' . $e->getMessage()
            ], 500);
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
            // Default format if no configuration found
            return 'JV-' . date('Y') . '-' . str_pad(1, 4, '0', STR_PAD_LEFT);
        }

        $runningNumber = $config->running_number;
        $numberLength = $config->number_length;
        $prefix = $config->prefix;

        // Generate voucher number
        $voucherNumber = $prefix . '-' . str_pad($runningNumber, $numberLength, '0', STR_PAD_LEFT);

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

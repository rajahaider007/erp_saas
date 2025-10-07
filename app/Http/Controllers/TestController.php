<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TestController extends Controller
{
    public function generateVoucher(Request $request)
    {
        try {
            $compId = $request->comp_id;
            $locationId = $request->location_id;
            $voucherType = $request->voucher_type;

            // Use the same logic as JournalVoucherController
            $config = DB::table('voucher_number_configurations')
                ->where('comp_id', $compId)
                ->where('location_id', $locationId)
                ->where('voucher_type', $voucherType)
                ->where('is_active', true)
                ->first();

            if (!$config) {
                // Create default configuration
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
            }

            $runningNumber = $config->running_number;
            $numberLength = $config->number_length;
            $prefix = $config->prefix;
            
            // Generate voucher number
            $voucherNumber = $prefix . str_pad($runningNumber, $numberLength, '0', STR_PAD_LEFT);
            
            return response()->json([
                'success' => true,
                'data' => [
                    'voucher_number' => $voucherNumber,
                    'config' => $config,
                    'next_number' => $runningNumber + 1
                ],
                'message' => 'Voucher number generated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ]);
        }
    }

    public function getTransactions(Request $request)
    {
        try {
            $compId = $request->comp_id;
            $locationId = $request->location_id;
            
            $transactions = DB::table('transactions')
                ->where('comp_id', $compId)
                ->where('location_id', $locationId)
                ->where('voucher_type', 'Journal')
                ->orderBy('id', 'desc')
                ->limit(5)
                ->get();
                
            return response()->json([
                'success' => true,
                'data' => $transactions,
                'count' => $transactions->count()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ]);
        }
    }

    public function createVoucher(Request $request)
    {
        try {
            $compId = $request->comp_id;
            $locationId = $request->location_id;
            $userId = auth()->id() ?? 1;
            
            // Generate voucher number
            $config = DB::table('voucher_number_configurations')
                ->where('comp_id', $compId)
                ->where('location_id', $locationId)
                ->where('voucher_type', 'Journal')
                ->where('is_active', true)
                ->first();

            if (!$config) {
                $defaultConfig = [
                    'comp_id' => $compId,
                    'location_id' => $locationId,
                    'voucher_type' => 'Journal',
                    'prefix' => 'JV',
                    'number_length' => 4,
                    'running_number' => 1,
                    'reset_frequency' => 'Never',
                    'is_active' => true,
                    'created_by' => $userId,
                    'created_at' => now(),
                    'updated_at' => now()
                ];
                
                $configId = DB::table('voucher_number_configurations')->insertGetId($defaultConfig);
                $config = (object) array_merge($defaultConfig, ['id' => $configId]);
            }

            $runningNumber = $config->running_number;
            $numberLength = $config->number_length;
            $prefix = $config->prefix;
            
            // Generate voucher number
            $voucherNumber = $prefix . str_pad($runningNumber, $numberLength, '0', STR_PAD_LEFT);

            // Create test transaction
            $transactionId = DB::table('transactions')->insertGetId([
                'voucher_number' => $voucherNumber,
                'voucher_date' => $request->voucher_date,
                'voucher_type' => 'Journal',
                'description' => $request->description,
                'comp_id' => $compId,
                'location_id' => $locationId,
                'created_by' => $userId,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            // Update running number
            DB::table('voucher_number_configurations')
                ->where('id', $config->id)
                ->update([
                    'running_number' => $runningNumber + 1,
                    'updated_at' => now()
                ]);

            return response()->json([
                'success' => true,
                'message' => 'Test voucher created successfully',
                'voucher_id' => $transactionId,
                'voucher_number' => $voucherNumber
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ]);
        }
    }
}

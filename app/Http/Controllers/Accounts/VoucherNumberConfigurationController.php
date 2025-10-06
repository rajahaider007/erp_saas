<?php

namespace App\Http\Controllers\Accounts;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class VoucherNumberConfigurationController extends Controller
{
    /**
     * Get all voucher number configurations
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
            
            $configurations = DB::table('voucher_number_configurations')
                ->where('comp_id', $compId)
                ->where('location_id', $locationId)
                ->orderBy('voucher_type')
                ->get();
                
            return response()->json([
                'success' => true,
                'data' => $configurations
            ]);
            
        } catch (\Exception $e) {
            Log::error('Voucher Number Configuration Index Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving configurations: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create new voucher number configuration
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'voucher_type' => 'required|string|max:50',
                'prefix' => 'required|string|max:20',
                'number_length' => 'required|integer|min:1|max:10',
                'reset_frequency' => 'required|in:Monthly,Yearly,Never',
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

            // Check if configuration already exists
            $existing = DB::table('voucher_number_configurations')
                ->where('comp_id', $compId)
                ->where('location_id', $locationId)
                ->where('voucher_type', $request->voucher_type)
                ->first();

            if ($existing) {
                return response()->json([
                    'success' => false,
                    'message' => 'Configuration already exists for this voucher type'
                ], 400);
            }

            $id = DB::table('voucher_number_configurations')->insertGetId([
                'comp_id' => $compId,
                'location_id' => $locationId,
                'voucher_type' => $request->voucher_type,
                'prefix' => $request->prefix,
                'running_number' => 1,
                'number_length' => $request->number_length,
                'reset_frequency' => $request->reset_frequency,
                'last_reset_date' => null,
                'is_active' => true,
                'created_by' => $userId,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Configuration created successfully',
                'data' => ['id' => $id]
            ]);

        } catch (\Exception $e) {
            Log::error('Voucher Number Configuration Store Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error creating configuration: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update voucher number configuration
     */
    public function update(Request $request, $id)
    {
        try {
            $validator = Validator::make($request->all(), [
                'prefix' => 'required|string|max:20',
                'number_length' => 'required|integer|min:1|max:10',
                'reset_frequency' => 'required|in:Monthly,Yearly,Never',
                'is_active' => 'required|boolean'
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

            $updated = DB::table('voucher_number_configurations')
                ->where('id', $id)
                ->where('comp_id', $compId)
                ->where('location_id', $locationId)
                ->update([
                    'prefix' => $request->prefix,
                    'number_length' => $request->number_length,
                    'reset_frequency' => $request->reset_frequency,
                    'is_active' => $request->is_active,
                    'updated_at' => now()
                ]);

            if ($updated) {
                return response()->json([
                    'success' => true,
                    'message' => 'Configuration updated successfully'
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Configuration not found or update failed'
                ], 404);
            }

        } catch (\Exception $e) {
            Log::error('Voucher Number Configuration Update Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error updating configuration: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete voucher number configuration
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

            $deleted = DB::table('voucher_number_configurations')
                ->where('id', $id)
                ->where('comp_id', $compId)
                ->where('location_id', $locationId)
                ->delete();

            if ($deleted) {
                return response()->json([
                    'success' => true,
                    'message' => 'Configuration deleted successfully'
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Configuration not found or delete failed'
                ], 404);
            }

        } catch (\Exception $e) {
            Log::error('Voucher Number Configuration Delete Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error deleting configuration: ' . $e->getMessage()
            ], 500);
        }
    }
}

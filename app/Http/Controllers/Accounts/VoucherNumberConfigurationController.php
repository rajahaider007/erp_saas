<?php

namespace App\Http\Controllers\Accounts;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

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

    /**
     * Bulk update status of voucher number configurations
     */
    public function bulkUpdateStatus(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'ids' => 'required|array|min:1',
                'ids.*' => 'required|integer',
                'status' => 'required|boolean'
            ]);

            if ($validator->fails()) {
                return redirect()->back()->withErrors($validator->errors());
            }

            $compId = $request->input('user_comp_id');
            $locationId = $request->input('user_location_id');

            if (!$compId || !$locationId) {
                return redirect()->back()->with('error', 'Company and Location information is required.');
            }

            $updated = DB::table('voucher_number_configurations')
                ->whereIn('id', $request->ids)
                ->where('comp_id', $compId)
                ->where('location_id', $locationId)
                ->update([
                    'is_active' => $request->status,
                    'updated_at' => now()
                ]);

            return redirect()->back()->with('success', "Successfully updated {$updated} configuration(s)");

        } catch (\Exception $e) {
            Log::error('Voucher Number Configuration Bulk Status Update Error: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Error updating configurations: ' . $e->getMessage());
        }
    }

    /**
     * Bulk delete voucher number configurations
     */
    public function bulkDestroy(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'ids' => 'required|array|min:1',
                'ids.*' => 'required|integer'
            ]);

            if ($validator->fails()) {
                return redirect()->back()->withErrors($validator->errors());
            }

            $compId = $request->input('user_comp_id');
            $locationId = $request->input('user_location_id');

            if (!$compId || !$locationId) {
                return redirect()->back()->with('error', 'Company and Location information is required.');
            }

            $deleted = DB::table('voucher_number_configurations')
                ->whereIn('id', $request->ids)
                ->where('comp_id', $compId)
                ->where('location_id', $locationId)
                ->delete();

            return redirect()->back()->with('success', "Successfully deleted {$deleted} configuration(s)");

        } catch (\Exception $e) {
            Log::error('Voucher Number Configuration Bulk Delete Error: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Error deleting configurations: ' . $e->getMessage());
        }
    }

    /**
     * Export voucher number configurations to CSV
     */
    public function exportCsv(Request $request)
    {
        try {
            $compId = $request->input('user_comp_id');
            $locationId = $request->input('user_location_id');

            if (!$compId || !$locationId) {
                return redirect()->back()->with('error', 'Company and Location information is required.');
            }

            $configurations = DB::table('voucher_number_configurations')
                ->where('comp_id', $compId)
                ->where('location_id', $locationId)
                ->orderBy('voucher_type')
                ->get();

            $filename = 'voucher_number_configurations_' . date('Y-m-d_H-i-s') . '.csv';
            
            $headers = [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            ];

            $callback = function() use ($configurations) {
                $file = fopen('php://output', 'w');
                
                // CSV Headers
                fputcsv($file, [
                    'ID',
                    'Voucher Type',
                    'Prefix',
                    'Running Number',
                    'Number Length',
                    'Reset Frequency',
                    'Last Reset Date',
                    'Status',
                    'Created At',
                    'Updated At'
                ]);

                // CSV Data
                foreach ($configurations as $config) {
                    fputcsv($file, [
                        $config->id,
                        $config->voucher_type,
                        $config->prefix,
                        $config->running_number,
                        $config->number_length,
                        $config->reset_frequency,
                        $config->last_reset_date ?? 'Never',
                        $config->is_active ? 'Active' : 'Inactive',
                        $config->created_at,
                        $config->updated_at
                    ]);
                }

                fclose($file);
            };

            return response()->stream($callback, 200, $headers);

        } catch (\Exception $e) {
            Log::error('Voucher Number Configuration Export Error: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Error exporting configurations: ' . $e->getMessage());
        }
    }
}

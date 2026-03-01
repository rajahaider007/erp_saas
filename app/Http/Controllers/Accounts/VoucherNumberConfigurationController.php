<?php

namespace App\Http\Controllers\Accounts;

use App\Http\Controllers\Controller;
use App\Http\Traits\CheckUserPermissions;
use App\Services\AuditLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class VoucherNumberConfigurationController extends Controller
{
    use CheckUserPermissions;
    public function index(Request $request)
    {
        // Check if user has permission to can_view
        $this->requirePermission($request, null, 'can_view');
        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');
        $locationId = $request->input('user_location_id') ?? $request->session()->get('user_location_id');
        
        // If comp_id and location_id are not available, show all configurations
        // This is a fallback for development/testing
        if (!$compId || !$locationId) {
            $configurations = DB::table('voucher_number_configurations')
                ->orderBy('voucher_type')
                ->get();
                
        return Inertia::render('Accounts/VoucherNumberConfiguration/List', [
            'configurations' => [
                'data' => $configurations,
                'current_page' => 1,
                'last_page' => 1,
                'per_page' => $configurations->count(),
                'total' => $configurations->count()
            ],
            'warning' => 'Company and Location information not available. Showing all configurations.'
        ]);
        }

        $configurations = DB::table('voucher_number_configurations')
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->orderBy('voucher_type')
            ->get();

        return Inertia::render('Accounts/VoucherNumberConfiguration/List', [
            'configurations' => [
                'data' => $configurations,
                'current_page' => 1,
                'last_page' => 1,
                'per_page' => $configurations->count(),
                'total' => $configurations->count()
            ]
        ]);
    }

    public function create(Request $request)
    {
        // Check if user has permission to can_add
        $this->requirePermission($request, null, 'can_add');
        return Inertia::render('Accounts/VoucherNumberConfiguration/create');
    }

    public function store(Request $request)
    {
        // Check if user has permission to can_add
        $this->requirePermission($request, null, 'can_add');
        Log::info('=== VOUCHER NUMBER CONFIGURATION STORE METHOD CALLED ===');
        Log::info('Request data:', $request->all());
        
        $request->validate([
            'voucher_type' => 'required|string|max:255',
            'prefix' => 'required|string|max:10',
            'number_length' => 'required|integer|min:1|max:10',
            'running_number' => 'nullable|integer|min:1',
            'reset_frequency' => 'required|string|in:Never,Monthly,Yearly'
        ]);

        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');
        $locationId = $request->input('user_location_id') ?? $request->session()->get('user_location_id');

        if (!$compId || !$locationId) {
            return redirect()->route('accounts.voucher-number-configuration.index')
                ->with('error', 'Company and Location information is required.');
        }

        // Check if configuration already exists
        $existing = DB::table('voucher_number_configurations')
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->where('voucher_type', $request->voucher_type)
            ->first();

        if ($existing) {
            return redirect()->route('accounts.voucher-number-configuration.create')
                ->with('error', 'Configuration for this voucher type already exists.');
        }

        try {
            // Create the configuration
            $id = DB::table('voucher_number_configurations')->insertGetId([
                'comp_id' => $compId,
                'location_id' => $locationId,
                'voucher_type' => $request->voucher_type,
                'prefix' => $request->prefix,
                'number_length' => $request->number_length,
                'running_number' => (int) ($request->running_number ?? 1),
                'reset_frequency' => $request->reset_frequency,
                'is_active' => true,
                'created_by' => auth()->id(),
                'created_at' => now(),
                'updated_at' => now()
            ]);

            // Create audit log for the voucher number configuration creation
            try {
                $configurationData = [
                    'voucher_type' => $request->voucher_type,
                    'prefix' => $request->prefix,
                    'number_length' => $request->number_length,
                    'running_number' => (int) ($request->running_number ?? 1),
                    'reset_frequency' => $request->reset_frequency,
                    'is_active' => true,
                    'comp_id' => $compId,
                    'location_id' => $locationId,
                    'created_by' => auth()->id()
                ];
                
                AuditLogService::logVoucherNumberConfiguration('CREATE', $id, $configurationData);
                Log::info('Audit log created for voucher number configuration creation', ['configuration_id' => $id]);
            } catch (\Exception $auditException) {
                Log::warning('Failed to create audit log for voucher number configuration creation', [
                    'configuration_id' => $id,
                    'error' => $auditException->getMessage()
                ]);
            }

            return redirect()->route('accounts.voucher-number-configuration.index')
                ->with('success', 'Voucher configuration created successfully!');
                
        } catch (\Exception $e) {
            Log::error('Error creating voucher number configuration', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all(),
                'comp_id' => $compId,
                'location_id' => $locationId
            ]);
            
            return redirect()->back()->with('error', 'Something went wrong while creating the voucher configuration. Please try again.');
        }
    }

    public function edit(Request $request, $id)
    {
        // Check if user has permission to can_edit
        $this->requirePermission($request, null, 'can_edit');
        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');
        $locationId = $request->input('user_location_id') ?? $request->session()->get('user_location_id');

        if (!$compId || !$locationId) {
            return redirect()->route('accounts.voucher-number-configuration.index')
                ->with('error', 'Company and Location information is required.');
        }

        $configuration = DB::table('voucher_number_configurations')
            ->where('id', $id)
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->first();

        if (!$configuration) {
            return redirect()->route('accounts.voucher-number-configuration.index')
                ->with('error', 'Configuration not found.');
        }

        return Inertia::render('Accounts/VoucherNumberConfiguration/create', [
            'configuration' => $configuration,
            'editMode' => true,
            'edit_mode' => true,
            'id' => $configuration->id
        ]);
    }

    public function update(Request $request, $id)
    {
        // Check if user has permission to can_edit
        $this->requirePermission($request, null, 'can_edit');
        Log::info('=== VOUCHER NUMBER CONFIGURATION UPDATE METHOD CALLED ===', ['configuration_id' => $id]);
        Log::info('Request data:', $request->all());
        
        $request->validate([
            'voucher_type' => 'required|string|max:255',
            'prefix' => 'required|string|max:10',
            'number_length' => 'required|integer|min:1|max:10',
            'running_number' => 'nullable|integer|min:1',
            'reset_frequency' => 'required|string|in:Never,Monthly,Yearly'
        ]);

        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');
        $locationId = $request->input('user_location_id') ?? $request->session()->get('user_location_id');

        if (!$compId || !$locationId) {
            return redirect()->route('accounts.voucher-number-configuration.index')
                ->with('error', 'Company and Location information is required.');
        }

        $configuration = DB::table('voucher_number_configurations')
            ->where('id', $id)
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->first();

        if (!$configuration) {
            return redirect()->route('accounts.voucher-number-configuration.index')
                ->with('error', 'Configuration not found.');
        }

        try {
            // Store old data for audit log
            $oldData = [
                'voucher_type' => $configuration->voucher_type,
                'prefix' => $configuration->prefix,
                'number_length' => $configuration->number_length,
                'running_number' => $configuration->running_number,
                'reset_frequency' => $configuration->reset_frequency
            ];

            DB::table('voucher_number_configurations')
                ->where('id', $id)
                ->update([
                    'voucher_type' => $request->voucher_type,
                    'prefix' => $request->prefix,
                    'number_length' => $request->number_length,
                    'running_number' => (int) ($request->running_number ?? 1),
                    'reset_frequency' => $request->reset_frequency,
                    'updated_at' => now()
                ]);

            // Create audit log for the voucher number configuration update
            try {
                $configurationData = [
                    'voucher_type' => $request->voucher_type,
                    'prefix' => $request->prefix,
                    'number_length' => $request->number_length,
                    'running_number' => (int) ($request->running_number ?? 1),
                    'reset_frequency' => $request->reset_frequency,
                    'comp_id' => $compId,
                    'location_id' => $locationId
                ];
                
                AuditLogService::logVoucherNumberConfiguration('UPDATE', $id, $configurationData, $oldData);
                Log::info('Audit log created for voucher number configuration update', ['configuration_id' => $id]);
            } catch (\Exception $auditException) {
                Log::warning('Failed to create audit log for voucher number configuration update', [
                    'configuration_id' => $id,
                    'error' => $auditException->getMessage()
                ]);
            }

            return redirect()->route('accounts.voucher-number-configuration.index')
                ->with('success', 'Voucher configuration updated successfully!');
                
        } catch (\Exception $e) {
            Log::error('Error updating voucher number configuration', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all(),
                'configuration_id' => $id,
                'comp_id' => $compId,
                'location_id' => $locationId
            ]);
            
            return redirect()->back()->with('error', 'Something went wrong while updating the voucher configuration. Please try again.');
        }
    }

    public function show(Request $request, $id)
    {
        // Check if user has permission to can_view
        $this->requirePermission($request, null, 'can_view');
        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');
        $locationId = $request->input('user_location_id') ?? $request->session()->get('user_location_id');

        if (!$compId || !$locationId) {
            return redirect()->route('accounts.voucher-number-configuration.index')
                ->with('error', 'Company and Location information is required.');
        }

        $configuration = DB::table('voucher_number_configurations')
            ->where('id', $id)
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->first();

        if (!$configuration) {
            return redirect()->route('accounts.voucher-number-configuration.index')
                ->with('error', 'Configuration not found.');
        }

        return Inertia::render('Accounts/VoucherNumberConfiguration/show', [
            'configuration' => $configuration
        ]);
    }
}
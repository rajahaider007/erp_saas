<?php

namespace App\Http\Controllers\Accounts;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class VoucherNumberConfigurationController extends Controller
{
    public function index(Request $request)
    {
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
        return Inertia::render('Accounts/VoucherNumberConfiguration/create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'voucher_type' => 'required|string|max:255',
            'prefix' => 'required|string|max:10',
            'number_length' => 'required|integer|min:1|max:10',
            'running_number' => 'required|integer|min:1',
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

        // Create the configuration
        $id = DB::table('voucher_number_configurations')->insertGetId([
            'comp_id' => $compId,
            'location_id' => $locationId,
            'voucher_type' => $request->voucher_type,
            'prefix' => $request->prefix,
            'number_length' => $request->number_length,
            'running_number' => $request->running_number,
            'reset_frequency' => $request->reset_frequency,
            'is_active' => true,
            'created_by' => auth()->id(),
            'created_at' => now(),
            'updated_at' => now()
        ]);

        return redirect()->route('accounts.voucher-number-configuration.index')
            ->with('success', 'Voucher configuration created successfully!');
    }

    public function edit(Request $request, $id)
    {
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
            'editMode' => true
        ]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'voucher_type' => 'required|string|max:255',
            'prefix' => 'required|string|max:10',
            'number_length' => 'required|integer|min:1|max:10',
            'running_number' => 'required|integer|min:1',
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

        DB::table('voucher_number_configurations')
            ->where('id', $id)
            ->update([
                'voucher_type' => $request->voucher_type,
                'prefix' => $request->prefix,
                'number_length' => $request->number_length,
                'running_number' => $request->running_number,
                'reset_frequency' => $request->reset_frequency,
                'updated_at' => now()
            ]);

        return redirect()->route('accounts.voucher-number-configuration.index')
            ->with('success', 'Voucher configuration updated successfully!');
    }

    public function show(Request $request, $id)
    {
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
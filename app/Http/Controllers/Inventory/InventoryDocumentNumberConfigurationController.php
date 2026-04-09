<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Services\InventoryDocumentNumberService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class InventoryDocumentNumberConfigurationController extends Controller
{
    public function index(Request $request)
    {
        $compId = $this->resolvedCompId($request);
        $locationId = $this->resolvedLocationId($request);

        if (! $compId || ! $locationId) {
            $configurations = collect();

            return Inertia::render('Inventory/DocumentNumberConfiguration/List', [
                'configurations' => [
                    'data' => $configurations,
                    'current_page' => 1,
                    'last_page' => 1,
                    'per_page' => 0,
                    'total' => 0,
                ],
                'warning' => __('inventory_messages.document_number_configuration.errors.company_location_required'),
            ]);
        }

        $configurations = DB::table('inventory_document_number_configurations')
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->orderBy('document_type')
            ->get();

        return Inertia::render('Inventory/DocumentNumberConfiguration/List', [
            'configurations' => [
                'data' => $configurations,
                'current_page' => 1,
                'last_page' => 1,
                'per_page' => $configurations->count(),
                'total' => $configurations->count(),
            ],
        ]);
    }

    public function create(Request $request)
    {
        return Inertia::render('Inventory/DocumentNumberConfiguration/create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'document_type' => 'required|string|max:80',
            'prefix' => 'required|string|max:20',
            'number_length' => 'required|integer|min:1|max:10',
            'running_number' => 'nullable|integer|min:1',
            'reset_frequency' => 'required|string|in:Never,Monthly,Yearly',
        ]);

        $compId = $this->resolvedCompId($request);
        $locationId = $this->resolvedLocationId($request);

        if (! $compId || ! $locationId) {
            return redirect()->route('inventory.document-number-configuration.index')
                ->with('error', __('inventory_messages.document_number_configuration.errors.company_location_required'));
        }

        if (! in_array($request->document_type, InventoryDocumentNumberService::documentTypes(), true)) {
            return redirect()->back()->with('error', __('inventory_messages.document_number_configuration.errors.invalid_document_type'));
        }

        $existing = DB::table('inventory_document_number_configurations')
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->where('document_type', $request->document_type)
            ->first();

        if ($existing) {
            return redirect()->route('inventory.document-number-configuration.create')
                ->with('error', __('inventory_messages.document_number_configuration.errors.duplicate'));
        }

        try {
            DB::table('inventory_document_number_configurations')->insert([
                'comp_id' => $compId,
                'location_id' => $locationId,
                'document_type' => $request->document_type,
                'prefix' => $request->prefix,
                'number_length' => $request->number_length,
                'running_number' => (int) ($request->running_number ?? 1),
                'reset_frequency' => $request->reset_frequency,
                'is_active' => true,
                'created_by' => Auth::id() ?? 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return redirect()->route('inventory.document-number-configuration.index')
                ->with('success', __('inventory_messages.document_number_configuration.messages.created'));
        } catch (\Throwable $e) {
            Log::error('inventory document number config store', ['e' => $e->getMessage()]);

            return redirect()->back()->with('error', __('inventory_messages.document_number_configuration.errors.save_failed'));
        }
    }

    public function edit(Request $request, int $id)
    {
        $compId = $this->resolvedCompId($request);
        $locationId = $this->resolvedLocationId($request);

        if (! $compId || ! $locationId) {
            return redirect()->route('inventory.document-number-configuration.index')
                ->with('error', __('inventory_messages.document_number_configuration.errors.company_location_required'));
        }

        $configuration = DB::table('inventory_document_number_configurations')
            ->where('id', $id)
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->first();

        if (! $configuration) {
            return redirect()->route('inventory.document-number-configuration.index')
                ->with('error', __('inventory_messages.document_number_configuration.errors.not_found'));
        }

        return Inertia::render('Inventory/DocumentNumberConfiguration/create', [
            'configuration' => $configuration,
            'editMode' => true,
            'edit_mode' => true,
            'id' => $configuration->id,
        ]);
    }

    public function update(Request $request, int $id)
    {
        $request->validate([
            'document_type' => 'required|string|max:80',
            'prefix' => 'required|string|max:20',
            'number_length' => 'required|integer|min:1|max:10',
            'running_number' => 'nullable|integer|min:1',
            'reset_frequency' => 'required|string|in:Never,Monthly,Yearly',
        ]);

        $compId = $this->resolvedCompId($request);
        $locationId = $this->resolvedLocationId($request);

        if (! $compId || ! $locationId) {
            return redirect()->route('inventory.document-number-configuration.index')
                ->with('error', __('inventory_messages.document_number_configuration.errors.company_location_required'));
        }

        if (! in_array($request->document_type, InventoryDocumentNumberService::documentTypes(), true)) {
            return redirect()->back()->with('error', __('inventory_messages.document_number_configuration.errors.invalid_document_type'));
        }

        $configuration = DB::table('inventory_document_number_configurations')
            ->where('id', $id)
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->first();

        if (! $configuration) {
            return redirect()->route('inventory.document-number-configuration.index')
                ->with('error', __('inventory_messages.document_number_configuration.errors.not_found'));
        }

        $dup = DB::table('inventory_document_number_configurations')
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->where('document_type', $request->document_type)
            ->where('id', '!=', $id)
            ->exists();

        if ($dup) {
            return redirect()->back()->with('error', __('inventory_messages.document_number_configuration.errors.duplicate'));
        }

        try {
            $isActive = $request->boolean('is_active', true);

            DB::table('inventory_document_number_configurations')
                ->where('id', $id)
                ->update([
                    'document_type' => $request->document_type,
                    'prefix' => $request->prefix,
                    'number_length' => $request->number_length,
                    'running_number' => (int) ($request->running_number ?? 1),
                    'reset_frequency' => $request->reset_frequency,
                    'is_active' => $isActive,
                    'updated_at' => now(),
                ]);

            return redirect()->route('inventory.document-number-configuration.index')
                ->with('success', __('inventory_messages.document_number_configuration.messages.updated'));
        } catch (\Throwable $e) {
            Log::error('inventory document number config update', ['e' => $e->getMessage()]);

            return redirect()->back()->with('error', __('inventory_messages.document_number_configuration.errors.save_failed'));
        }
    }

    public function show(Request $request, int $id)
    {
        $compId = $this->resolvedCompId($request);
        $locationId = $this->resolvedLocationId($request);

        if (! $compId || ! $locationId) {
            return redirect()->route('inventory.document-number-configuration.index')
                ->with('error', __('inventory_messages.document_number_configuration.errors.company_location_required'));
        }

        $configuration = DB::table('inventory_document_number_configurations')
            ->where('id', $id)
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->first();

        if (! $configuration) {
            return redirect()->route('inventory.document-number-configuration.index')
                ->with('error', __('inventory_messages.document_number_configuration.errors.not_found'));
        }

        return Inertia::render('Inventory/DocumentNumberConfiguration/show', [
            'configuration' => $configuration,
        ]);
    }

    public function destroy(Request $request, int $id)
    {
        $compId = $this->resolvedCompId($request);
        $locationId = $this->resolvedLocationId($request);

        if (! $compId || ! $locationId) {
            return redirect()->route('inventory.document-number-configuration.index')
                ->with('error', __('inventory_messages.document_number_configuration.errors.company_location_required'));
        }

        $deleted = DB::table('inventory_document_number_configurations')
            ->where('id', $id)
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->delete();

        return redirect()->route('inventory.document-number-configuration.index')
            ->with($deleted ? 'success' : 'error', $deleted
                ? __('inventory_messages.document_number_configuration.messages.deleted')
                : __('inventory_messages.document_number_configuration.errors.not_found'));
    }

    private function resolvedCompId(Request $request): ?int
    {
        $v = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');

        return $v !== null && $v !== '' ? (int) $v : null;
    }

    private function resolvedLocationId(Request $request): ?int
    {
        $v = $request->input('user_location_id') ?? $request->session()->get('user_location_id');

        return $v !== null && $v !== '' ? (int) $v : null;
    }
}

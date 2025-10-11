<?php

namespace App\Http\Controllers\system;

use App\Http\Controllers\Controller;
use App\Models\CodeConfiguration;
use App\Models\Company;
use App\Models\Location;
use App\Models\ChartOfAccount;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Services\AuditLogService;
use App\Helpers\CompanyHelper;

class CodeConfigurationController extends Controller
{
    protected $auditLogService;

    public function __construct(AuditLogService $auditLogService)
    {
        $this->auditLogService = $auditLogService;
    }

    /**
     * Get all available code types for ERP system
     */
    private function getCodeTypes()
    {
        return [
            // Customer & Sales Related
            ['value' => 'customer', 'label' => 'Customer Code'],
            ['value' => 'lead', 'label' => 'Lead/Prospect Code'],
            ['value' => 'sales_order', 'label' => 'Sales Order Code'],
            ['value' => 'sales_invoice', 'label' => 'Sales Invoice Code'],
            ['value' => 'sales_return', 'label' => 'Sales Return Code'],
            ['value' => 'quotation', 'label' => 'Quotation Code'],
            
            // Supplier & Purchase Related
            ['value' => 'vendor', 'label' => 'Vendor Code'],
            ['value' => 'supplier', 'label' => 'Supplier Code'],
            ['value' => 'purchase_order', 'label' => 'Purchase Order Code'],
            ['value' => 'purchase_invoice', 'label' => 'Purchase Invoice Code'],
            ['value' => 'purchase_return', 'label' => 'Purchase Return Code'],
            ['value' => 'grn', 'label' => 'GRN (Goods Receipt Note) Code'],
            
            // Inventory & Products
            ['value' => 'product', 'label' => 'Product Code'],
            ['value' => 'raw_material', 'label' => 'Raw Material Code'],
            ['value' => 'finished_goods', 'label' => 'Finished Goods Code'],
            ['value' => 'batch', 'label' => 'Batch Code'],
            ['value' => 'serial', 'label' => 'Serial Number Code'],
            ['value' => 'bin_location', 'label' => 'Bin/Location Code'],
            ['value' => 'warehouse', 'label' => 'Warehouse Code'],
            
            // Financial
            ['value' => 'bank', 'label' => 'Bank Account Code'],
            ['value' => 'cash', 'label' => 'Cash Account Code'],
            ['value' => 'payment_voucher', 'label' => 'Payment Voucher Code'],
            ['value' => 'receipt_voucher', 'label' => 'Receipt Voucher Code'],
            ['value' => 'journal_voucher', 'label' => 'Journal Voucher Code'],
            ['value' => 'expense', 'label' => 'Expense Code'],
            ['value' => 'budget', 'label' => 'Budget Code'],
            ['value' => 'cost_center', 'label' => 'Cost Center Code'],
            
            // Human Resource
            ['value' => 'employee', 'label' => 'Employee Code'],
            ['value' => 'department', 'label' => 'Department Code'],
            ['value' => 'designation', 'label' => 'Designation Code'],
            ['value' => 'attendance', 'label' => 'Attendance Code'],
            ['value' => 'payroll', 'label' => 'Payroll Code'],
            ['value' => 'leave', 'label' => 'Leave Application Code'],
            
            // Assets
            ['value' => 'asset', 'label' => 'Asset Code'],
            ['value' => 'fixed_asset', 'label' => 'Fixed Asset Code'],
            ['value' => 'asset_maintenance', 'label' => 'Asset Maintenance Code'],
            
            // Projects & Jobs
            ['value' => 'project', 'label' => 'Project Code'],
            ['value' => 'job', 'label' => 'Job Code'],
            ['value' => 'task', 'label' => 'Task Code'],
            ['value' => 'work_order', 'label' => 'Work Order Code'],
            
            // Manufacturing
            ['value' => 'bom', 'label' => 'BOM (Bill of Materials) Code'],
            ['value' => 'production_order', 'label' => 'Production Order Code'],
            ['value' => 'job_card', 'label' => 'Job Card Code'],
            ['value' => 'quality_inspection', 'label' => 'Quality Inspection Code'],
            
            // Others
            ['value' => 'contract', 'label' => 'Contract Code'],
            ['value' => 'delivery_note', 'label' => 'Delivery Note Code'],
            ['value' => 'shipment', 'label' => 'Shipment Code'],
            ['value' => 'complaint', 'label' => 'Complaint/Ticket Code'],
            ['value' => 'warranty', 'label' => 'Warranty Code'],
            ['value' => 'barcode', 'label' => 'Barcode Code'],
        ];
    }

    /**
     * Display a listing of code configurations.
     */
    public function index(Request $request)
    {
        // Only parent companies can access code configuration
        if (!CompanyHelper::isCurrentCompanyParent()) {
            return redirect()->route('dashboard')->with('error', 'Access denied. This feature is only available for parent companies.');
        }

        $query = CodeConfiguration::with(['company', 'location', 'level2Account', 'level3Account', 'creator', 'updater']);

        // Filter by company
        if ($request->filled('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        // Filter by location
        if ($request->filled('location_id')) {
            $query->where('location_id', $request->location_id);
        }

        // Filter by code type
        if ($request->filled('code_type')) {
            $query->where('code_type', $request->code_type);
        }

        // Filter by status
        if ($request->filled('is_active')) {
            $query->where('is_active', $request->is_active);
        }

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('code_type', 'like', "%{$search}%");
            });
        }

        $configurations = $query->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        // Get all companies for filter dropdown
        $companies = Company::where('status', true)
            ->orderBy('company_name')
            ->get(['id', 'company_name as name']);

        // Get all locations for filter dropdown
        $locations = Location::where('status', true)
            ->orderBy('location_name')
            ->get(['id', 'location_name as name', 'company_id']);

        // Available code types
        $codeTypes = $this->getCodeTypes();

        return Inertia::render('system/CodeConfiguration/Index', [
            'configurations' => $configurations,
            'companies' => $companies,
            'locations' => $locations,
            'codeTypes' => $codeTypes,
            'filters' => $request->only(['company_id', 'location_id', 'code_type', 'is_active', 'search']),
        ]);
    }

    /**
     * Show the form for creating a new code configuration.
     */
    public function create()
    {
        // Only parent companies can access code configuration
        if (!CompanyHelper::isCurrentCompanyParent()) {
            return redirect()->route('dashboard')->with('error', 'Access denied. This feature is only available for parent companies.');
        }

        $companies = Company::where('status', true)
            ->orderBy('company_name')
            ->get(['id', 'company_name as name']);

        $locations = Location::where('status', true)
            ->orderBy('location_name')
            ->get(['id', 'location_name as name', 'company_id']);

        // Available code types
        $codeTypes = $this->getCodeTypes();

        return Inertia::render('system/CodeConfiguration/Create', [
            'companies' => $companies,
            'locations' => $locations,
            'codeTypes' => $codeTypes,
        ]);
    }

    /**
     * Store a newly created code configuration.
     */
    public function store(Request $request)
    {
        // Only parent companies can access code configuration
        if (!CompanyHelper::isCurrentCompanyParent()) {
            return redirect()->route('dashboard')->with('error', 'Access denied. This feature is only available for parent companies.');
        }

        $validated = $request->validate([
            'company_id' => 'required|exists:companies,id',
            'location_id' => 'required|exists:locations,id',
            'account_id' => 'nullable|exists:chart_of_accounts,id',
            'code_type' => 'required|string|max:50',
            'is_active' => 'boolean',
        ]);

        // Check for duplicate configuration
        $exists = CodeConfiguration::where('company_id', $validated['company_id'] ?? null)
            ->where('location_id', $validated['location_id'] ?? null)
            ->where('code_type', $validated['code_type'])
            ->exists();

        if ($exists) {
            return back()->withErrors([
                'code_type' => 'A configuration for this code type already exists for the selected company and location.'
            ]);
        }

        // Determine if account is Level 2 or Level 3 and set accordingly
        if (isset($validated['account_id'])) {
            $account = ChartOfAccount::find($validated['account_id']);
            if ($account) {
                if ($account->account_level == 2) {
                    $validated['level2_account_id'] = $validated['account_id'];
                    $validated['level3_account_id'] = null;
                } elseif ($account->account_level == 3) {
                    $validated['level2_account_id'] = null;
                    $validated['level3_account_id'] = $validated['account_id'];
                }
            }
        }
        
        // Remove account_id from validated data as it's not a column in the table
        unset($validated['account_id']);

        $validated['created_by'] = Auth::id();
        
        // Set default values for optional fields
        $validated['code_name'] = $validated['code_name'] ?? $validated['code_type'];
        $validated['separator'] = '-';
        $validated['number_length'] = 4;
        $validated['next_number'] = 1;
        $validated['account_level'] = 2;

        $configuration = CodeConfiguration::create($validated);

        // Log the activity
        $this->auditLogService->log(
            'code_configuration',
            'create',
            $configuration->id,
            null,
            $validated,
            'Code configuration created: ' . $configuration->code_name
        );

        return redirect()->route('code-configurations.index')
            ->with('success', 'Code configuration created successfully.');
    }

    /**
     * Display the specified code configuration.
     */
    public function show(CodeConfiguration $codeConfiguration)
    {
        // Only parent companies can access code configuration
        if (!CompanyHelper::isCurrentCompanyParent()) {
            return redirect()->route('dashboard')->with('error', 'Access denied. This feature is only available for parent companies.');
        }

        $codeConfiguration->load(['company', 'location', 'level2Account', 'level3Account', 'creator', 'updater']);

        return Inertia::render('system/CodeConfiguration/Show', [
            'configuration' => $codeConfiguration,
        ]);
    }

    /**
     * Show the form for editing the specified code configuration.
     */
    public function edit(CodeConfiguration $codeConfiguration)
    {
        // Only parent companies can access code configuration
        if (!CompanyHelper::isCurrentCompanyParent()) {
            return redirect()->route('dashboard')->with('error', 'Access denied. This feature is only available for parent companies.');
        }

        $companies = Company::where('status', true)
            ->orderBy('company_name')
            ->get(['id', 'company_name as name']);

        $locations = Location::where('status', true)
            ->orderBy('location_name')
            ->get(['id', 'location_name as name', 'company_id']);

        // Available code types
        $codeTypes = $this->getCodeTypes();

        return Inertia::render('system/CodeConfiguration/Edit', [
            'configuration' => $codeConfiguration,
            'companies' => $companies,
            'locations' => $locations,
            'codeTypes' => $codeTypes,
        ]);
    }

    /**
     * Update the specified code configuration.
     */
    public function update(Request $request, CodeConfiguration $codeConfiguration)
    {
        // Only parent companies can access code configuration
        if (!CompanyHelper::isCurrentCompanyParent()) {
            return redirect()->route('dashboard')->with('error', 'Access denied. This feature is only available for parent companies.');
        }

        $validated = $request->validate([
            'company_id' => 'required|exists:companies,id',
            'location_id' => 'required|exists:locations,id',
            'account_id' => 'nullable|exists:chart_of_accounts,id',
            'code_type' => 'required|string|max:50',
            'is_active' => 'boolean',
        ]);

        // Check for duplicate configuration (excluding current record)
        $exists = CodeConfiguration::where('id', '!=', $codeConfiguration->id)
            ->where('company_id', $validated['company_id'] ?? null)
            ->where('location_id', $validated['location_id'] ?? null)
            ->where('code_type', $validated['code_type'])
            ->exists();

        if ($exists) {
            return back()->withErrors([
                'code_type' => 'A configuration for this code type already exists for the selected company and location.'
            ]);
        }

        // Determine if account is Level 2 or Level 3 and set accordingly
        if (isset($validated['account_id'])) {
            $account = ChartOfAccount::find($validated['account_id']);
            if ($account) {
                if ($account->account_level == 2) {
                    $validated['level2_account_id'] = $validated['account_id'];
                    $validated['level3_account_id'] = null;
                } elseif ($account->account_level == 3) {
                    $validated['level2_account_id'] = null;
                    $validated['level3_account_id'] = $validated['account_id'];
                }
            }
        }
        
        // Remove account_id from validated data as it's not a column in the table
        unset($validated['account_id']);

        $oldData = $codeConfiguration->toArray();
        $validated['updated_by'] = Auth::id();
        
        // Preserve existing values for fields not in the form
        $validated['code_name'] = $codeConfiguration->code_name ?? $validated['code_type'];
        $validated['separator'] = $codeConfiguration->separator ?? '-';
        $validated['number_length'] = $codeConfiguration->number_length ?? 4;
        $validated['next_number'] = $codeConfiguration->next_number ?? 1;
        $validated['account_level'] = $codeConfiguration->account_level ?? 2;

        $codeConfiguration->update($validated);

        // Log the activity
        $this->auditLogService->log(
            'code_configuration',
            'update',
            $codeConfiguration->id,
            $oldData,
            $validated,
            'Code configuration updated: ' . $codeConfiguration->code_name
        );

        return redirect()->route('code-configurations.index')
            ->with('success', 'Code configuration updated successfully.');
    }

    /**
     * Remove the specified code configuration.
     */
    public function destroy(CodeConfiguration $codeConfiguration)
    {
        // Only parent companies can access code configuration
        if (!CompanyHelper::isCurrentCompanyParent()) {
            return redirect()->route('dashboard')->with('error', 'Access denied. This feature is only available for parent companies.');
        }

        $oldData = $codeConfiguration->toArray();
        $configName = $codeConfiguration->code_name;

        $codeConfiguration->delete();

        // Log the activity
        $this->auditLogService->log(
            'code_configuration',
            'delete',
            $codeConfiguration->id,
            $oldData,
            null,
            'Code configuration deleted: ' . $configName
        );

        return redirect()->route('code-configurations.index')
            ->with('success', 'Code configuration deleted successfully.');
    }

    /**
     * Get locations by company.
     */
    public function getLocationsByCompany(Request $request)
    {
        // Only parent companies can access code configuration
        if (!CompanyHelper::isCurrentCompanyParent()) {
            return response()->json(['error' => 'Access denied'], 403);
        }

        $request->validate([
            'company_id' => 'required|exists:companies,id',
        ]);

        $locations = Location::where('company_id', $request->company_id)
            ->where('status', true)
            ->orderBy('location_name')
            ->get(['id', 'location_name as name', 'company_id']);

        return response()->json($locations);
    }
}


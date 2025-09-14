<?php

namespace App\Http\Controllers\system;

use App\Http\Controllers\Controller;
use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Illuminate\Support\Str;

class CompanyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Optimized query - only select columns needed for the list view
        $query = Company::select([
            'id',
            'company_name',
            'company_code',
            'email',
            'phone',
            'country',
            'industry',
            'status',
            'subscription_status',
            'subscription_expiry',
            'created_at',
            'updated_at'
        ]);

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('company_name', 'like', "%{$search}%")
                  ->orWhere('company_code', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('registration_number', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status === '1');
        }

        // Filter by subscription status
        if ($request->filled('subscription_status')) {
            $query->where('subscription_status', $request->subscription_status);
        }

        // Filter by country
        if ($request->filled('country')) {
            $query->where('country', $request->country);
        }

        // Sort functionality
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortBy, $sortDirection);

        $companies = $query->paginate($request->get('per_page', 25))
                          ->withQueryString();

        return Inertia::render('system/Companies/List', [
            'companies' => $companies,
            'filters' => $request->only(['search', 'status', 'subscription_status', 'country', 'sort_by', 'sort_direction', 'per_page']),
            'pageTitle' => 'Companies Management'
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('system/Companies/Create', [
            'pageTitle' => 'Register New Company'
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate($this->validationRules());

        // Generate company code if not provided
        if (empty($validated['company_code'])) {
            $validated['company_code'] = strtoupper(substr($validated['company_name'], 0, 3)) . rand(1000, 9999);
        }

        // Handle file upload
        if ($request->hasFile('logo')) {
            $validated['logo'] = $request->file('logo')->store('companies/logos', 'public');
        }

        // Set default subscription expiry for trial (30 days)
        if ($validated['subscription_status'] === 'trial' && !isset($validated['subscription_expiry'])) {
            $validated['subscription_expiry'] = now()->addDays(30);
        }

        // Set created_by
        $validated['created_by'] = auth()->id();

        $company = Company::create($validated);

        return redirect()->route('system.companies.index')
                        ->with('success', 'Company "' . $company->company_name . '" registered successfully!');
    }

    /**
     * Display the specified resource.
     */
    public function show(Company $company)
    {
        $company->load(['creator', 'updater']);
        
        return Inertia::render('system/Companies/Show', [
            'company' => $company,
            'pageTitle' => 'Company Details: ' . $company->company_name
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Company $company)
    {
        return Inertia::render('system/Companies/Edit', [
            'company' => $company,
            'pageTitle' => 'Edit Company: ' . $company->company_name
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Company $company)
    {
        $validated = $request->validate($this->validationRules($company->id));

        // Handle file upload
        if ($request->hasFile('logo')) {
            // Delete old logo if exists
            if ($company->logo && Storage::disk('public')->exists($company->logo)) {
                Storage::disk('public')->delete($company->logo);
            }
            $validated['logo'] = $request->file('logo')->store('companies/logos', 'public');
        }

        // Set updated_by
        $validated['updated_by'] = auth()->id();

        $company->update($validated);

        return redirect()->route('system.companies.index')
                        ->with('success', 'Company "' . $company->company_name . '" updated successfully!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Company $company)
    {
        try {
            $companyName = $company->company_name;
            
            // Delete associated logo
            if ($company->logo && Storage::disk('public')->exists($company->logo)) {
                Storage::disk('public')->delete($company->logo);
            }

            $company->delete();

            return redirect()->route('system.companies.index')
                           ->with('success', 'Company "' . $companyName . '" deleted successfully!');

        } catch (\Exception $e) {
            Log::error('Company deletion failed: ' . $e->getMessage(), [
                'company_id' => $company->id,
                'trace' => $e->getTraceAsString()
            ]);
            
            return redirect()->back()
                           ->with('error', 'Failed to delete company. Please try again or contact support.');
        }
    }

    /**
     * Bulk delete companies
     */
    public function bulkDestroy(Request $request)
    {
        $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'exists:companies,id'
        ]);

        try {
            $companies = Company::whereIn('id', $request->ids)->get();
            
            // Delete logos
            foreach ($companies as $company) {
                if ($company->logo && Storage::disk('public')->exists($company->logo)) {
                    Storage::disk('public')->delete($company->logo);
                }
            }

            $count = Company::whereIn('id', $request->ids)->delete();

            return redirect()->back()->with('success', "{$count} company(s) deleted successfully!");

        } catch (\Exception $e) {
            Log::error('Bulk delete failed: ' . $e->getMessage());
            
            return redirect()->back()->with('error', 'Failed to delete companies. Please try again.');
        }
    }

    /**
     * Bulk update status
     */
    public function bulkUpdateStatus(Request $request)
    {
        $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'exists:companies,id',
            'status' => 'required|boolean'
        ]);

        try {
            $count = Company::whereIn('id', $request->ids)
                          ->update(['status' => $request->status]);

            $action = $request->status ? 'activated' : 'deactivated';

            return redirect()->back()->with('success', "{$count} company(s) {$action} successfully!");

        } catch (\Exception $e) {
            Log::error('Bulk status update failed: ' . $e->getMessage());
            
            return redirect()->back()->with('error', 'Failed to update company status. Please try again.');
        }
    }

    /**
     * Export companies to CSV
     */
    public function exportCsv(Request $request)
    {
        // Optimized query - only select columns needed for CSV export
        $companies = Company::select([
            'id',
            'company_name',
            'company_code',
            'legal_name',
            'registration_number',
            'email',
            'phone',
            'country',
            'industry',
            'status',
            'subscription_status',
            'created_at',
            'updated_at'
        ])->get();

        $filename = 'companies_export_' . now()->format('Y-m-d_H-i-s') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function() use ($companies) {
            $file = fopen('php://output', 'w');
            
            // CSV Headers
            fputcsv($file, [
                'ID', 'Company Name', 'Company Code', 'Legal Name', 'Registration Number',
                'Email', 'Phone', 'Country', 'Industry', 'Status', 'Subscription Status',
                'Created At', 'Updated At'
            ]);

            // CSV Data
            foreach ($companies as $company) {
                fputcsv($file, [
                    $company->id,
                    $company->company_name,
                    $company->company_code,
                    $company->legal_name,
                    $company->registration_number,
                    $company->email,
                    $company->phone,
                    $company->country,
                    $company->industry,
                    $company->status ? 'Active' : 'Inactive',
                    ucfirst($company->subscription_status),
                    $company->created_at->format('Y-m-d H:i:s'),
                    $company->updated_at->format('Y-m-d H:i:s')
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Get validation rules for company
     */
    private function validationRules($companyId = null)
    {
        return [
            'company_name' => 'required|string|max:255',
            'company_code' => 'nullable|string|max:50|unique:companies,company_code,' . $companyId,
            'legal_name' => 'nullable|string|max:255',
            'trading_name' => 'nullable|string|max:255',
            'registration_number' => 'required|string|max:100|unique:companies,registration_number,' . $companyId,
            'tax_id' => 'nullable|string|max:100|unique:companies,tax_id,' . $companyId,
            'vat_number' => 'nullable|string|max:100',
            'incorporation_date' => 'nullable|date',
            'company_type' => 'required|in:private_limited,public_limited,partnership,sole_proprietorship,llc',
            'email' => 'required|email|max:255|unique:companies,email,' . $companyId,
            'phone' => 'nullable|string|max:20',
            'fax' => 'nullable|string|max:20',
            'website' => 'nullable|url|max:255',
            'address_line_1' => 'required|string|max:500',
            'address_line_2' => 'nullable|string|max:500',
            'city' => 'required|string|max:100',
            'state_province' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'required|string|max:100',
            'timezone' => 'nullable|string|max:50',
            'industry' => 'nullable|string|max:255',
            'business_description' => 'nullable|string|max:1000',
            'employee_count' => 'nullable|integer|min:0',
            'annual_revenue' => 'nullable|numeric|min:0',
            'currency' => 'nullable|string|max:10',
            'fiscal_year_start' => 'nullable|string|max:10',
            'license_number' => 'nullable|string|max:100',
            'license_expiry' => 'nullable|date',
            'compliance_certifications' => 'nullable|array',
            'legal_notes' => 'nullable|string|max:1000',
            'bank_name' => 'nullable|string|max:255',
            'bank_account_number' => 'nullable|string|max:100',
            'bank_routing_number' => 'nullable|string|max:100',
            'swift_code' => 'nullable|string|max:100',
            'iban' => 'nullable|string|max:100',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:10240', // 10MB max
            'brand_color_primary' => 'nullable|string|max:7',
            'brand_color_secondary' => 'nullable|string|max:7',
            'status' => 'required|boolean',
            'subscription_status' => 'required|in:active,trial,expired,suspended',
            'subscription_expiry' => 'nullable|date',
            'settings' => 'nullable|array',
            'features' => 'nullable|array'
        ];
    }
}

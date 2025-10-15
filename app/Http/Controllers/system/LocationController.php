<?php

namespace App\Http\Controllers\system;

use App\Http\Controllers\Controller;
use App\Http\Traits\CheckUserPermissions;
use App\Models\Location;
use App\Models\Company;
use App\Helpers\CompanyHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class LocationController extends Controller
{
    use CheckUserPermissions;
    /**
     * Check if current user's company can access locations module
     */
    private function checkAccess()
    {
        if (!CompanyHelper::canManageParentSettings()) {
            abort(403, 'Access Denied: Only parent companies can manage locations.');
        }
    }

    private function rules($id = null): array
    {
        return [
            'company_id' => 'required|exists:companies,id',
            'location_name' => [
                'required', 'string', 'min:2', 'max:100', 'regex:/^[a-zA-Z0-9\s\-\_\.]+$/',
                Rule::unique('locations')->where(function ($query) {
                    return $query->where('company_id', request('company_id'));
                })->ignore($id)
            ],
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:100',
            'status' => ['sometimes', 'boolean'],
            'sort_order' => ['sometimes', 'integer', 'min:0', 'max:9999'],
        ];
    }

    public function index(Request $request)
    {
        // Check if user has permission to view locations
        $this->requirePermission($request, null, 'can_view');
        // Only parent companies can access Locations module
        if (!CompanyHelper::canManageParentSettings()) {
            return redirect()->route('dashboard')
                ->with('error', 'Access Denied: Only parent companies can manage locations.');
        }

        $query = Location::with('company');

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function($q) use ($s) {
                $q->where('location_name', 'like', "%$s%")
                  ->orWhere('address', 'like', "%$s%")
                  ->orWhere('city', 'like', "%$s%")
                  ->orWhereHas('company', function($companyQuery) use ($s) {
                      $companyQuery->where('company_name', 'like', "%$s%");
                  });
            });
        }
        if ($request->filled('company_id')) $query->where('company_id', $request->company_id);
        if ($request->filled('status')) $query->where('status', $request->status);

        $locations = $query->orderBy('sort_order')->orderBy('location_name')->paginate(min($request->get('per_page', 25), 100));

        return Inertia::render('system/Locations/List', [
            'locations' => $locations,
            'companies' => Company::where('status', true)->orderBy('company_name')->get(['id', 'company_name']),
            'filters' => $request->only(['search', 'company_id', 'status', 'per_page']),
            'pageTitle' => 'Locations',
            'activeNav' => ['group' => 'Configuration', 'item' => 'Locations']
        ]);
    }

    public function create(Request $request)
    {
        // Check if user has permission to create locations
        $this->requirePermission($request, null, 'can_add');
        $this->checkAccess();
        
        return Inertia::render('system/Locations/create', [
            'location' => null,
            'companies' => Company::where('status', true)->orderBy('company_name')->get(['id', 'company_name']),
            'pageTitle' => 'Add Location',
            'activeNav' => ['group' => 'Configuration', 'item' => 'Locations']
        ]);
    }

    public function store(Request $request)
    {
        // Check if user has permission to create locations
        $this->requirePermission($request, null, 'can_add');
        $this->checkAccess();
        
        $validated = $request->validate($this->rules());

        if (!isset($validated['sort_order']) || $validated['sort_order'] === 0) {
            $validated['sort_order'] = (Location::max('sort_order') ?? 0) + 1;
        }
        $validated['status'] = filter_var($validated['status'] ?? true, FILTER_VALIDATE_BOOLEAN);
        
        $location = Location::create($validated);

        return redirect()->route('system.locations.index')->with('success', 'Location "'.$location->location_name.'" created.');
    }

    public function edit(Request $request, Location $location)
    {
        $this->checkAccess();
        
        return Inertia::render('system/Locations/create', [
            'location' => $location,
            'companies' => Company::where('status', true)->orderBy('company_name')->get(['id', 'company_name']),
            'pageTitle' => 'Edit Location',
            'activeNav' => ['group' => 'Configuration', 'item' => 'Locations']
        ]);
    }

    public function update(Request $request, Location $location)
    {
        // Check if user has permission to edit locations
        $this->requirePermission($request, null, 'can_edit');
        $this->checkAccess();
        
        $validated = $request->validate($this->rules($location->id));
        
        $validated['status'] = filter_var($validated['status'] ?? $location->status, FILTER_VALIDATE_BOOLEAN);
        $location->update($validated);

        return redirect()->route('system.locations.index')->with('success', 'Location updated.');
    }

    public function destroy(Request $request, Location $location)
    {
        // Check if user has permission to delete locations
        $this->requirePermission($request, null, 'can_delete');
        $this->checkAccess();
        
        $name = $location->location_name;
        $location->delete();
        return redirect()->back()->with('success', 'Location "'.$name.'" deleted.');
    }

    public function bulkUpdateStatus(Request $request)
    {
        $this->checkAccess();
        
        $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'exists:locations,id',
            'status' => 'required|boolean'
        ]);

        try {
            $count = Location::whereIn('id', $request->ids)->update(['status' => $request->status]);
            $action = $request->status ? 'activated' : 'deactivated';
            return redirect()->back()->with('success', "$count location(s) $action successfully!");
        } catch (\Exception $e) {
            Log::error('Locations bulk status failed: '.$e->getMessage());
            return redirect()->back()->with('error', 'Failed to update locations status.');
        }
    }

    public function bulkDestroy(Request $request)
    {
        $this->checkAccess();
        
        $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'exists:locations,id'
        ]);

        try {
            $count = Location::whereIn('id', $request->ids)->delete();
            return redirect()->back()->with('success', "$count location(s) deleted successfully!");
        } catch (\Exception $e) {
            Log::error('Locations bulk delete failed: '.$e->getMessage());
            return redirect()->back()->with('error', 'Failed to delete locations.');
        }
    }

    public function updateSortOrder(Request $request)
    {
        $this->checkAccess();
        
        $request->validate([
            'locations' => 'required|array|min:1',
            'locations.*.id' => 'required|exists:locations,id',
            'locations.*.sort_order' => 'required|integer|min:0'
        ]);

        try {
            foreach ($request->locations as $item) {
                Location::where('id', $item['id'])->update(['sort_order' => $item['sort_order']]);
            }
            return response()->json(['success' => true, 'message' => 'Location order updated successfully!']);
        } catch (\Exception $e) {
            Log::error('Locations sort order update failed: '.$e->getMessage());
            return response()->json(['success' => false, 'message' => 'Failed to update location order.'], 500);
        }
    }

    public function listByCompany($companyId)
    {
        $locations = Location::where('company_id', $companyId)
                           ->where('status', true)
                           ->orderBy('location_name')
                           ->get(['id', 'location_name']);

        return response()->json(['data' => $locations]);
    }
}
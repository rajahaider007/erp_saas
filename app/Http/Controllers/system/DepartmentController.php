<?php

namespace App\Http\Controllers\system;

use App\Http\Controllers\Controller;
use App\Http\Traits\CheckUserPermissions;
use App\Models\Department;
use App\Models\Company;
use App\Models\Location;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class DepartmentController extends Controller
{
    use CheckUserPermissions;
    private function rules($id = null): array
    {
        return [
            'company_id' => 'required|exists:companies,id',
            'location_id' => 'required|exists:locations,id',
            'department_name' => [
                'required', 'string', 'min:2', 'max:100', 'regex:/^[a-zA-Z0-9\s\-\_\.]+$/',
                Rule::unique('departments')->where(function ($query) {
                    return $query->where('location_id', request('location_id'));
                })->ignore($id)
            ],
            'description' => 'nullable|string|max:500',
            'manager_name' => 'nullable|string|max:100',
            'manager_email' => 'nullable|email|max:100',
            'manager_phone' => 'nullable|string|max:20',
            'status' => ['sometimes', 'boolean'],
            'sort_order' => ['sometimes', 'integer', 'min:0', 'max:9999'],
        ];
    }

    public function index(Request $request)
    {
        // Check if user has permission to view departments
        $this->requirePermission($request, null, 'can_view');
        $query = Department::with(['company', 'location']);

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function($q) use ($s) {
                $q->where('department_name', 'like', "%$s%")
                  ->orWhere('manager_name', 'like', "%$s%")
                  ->orWhereHas('company', function($companyQuery) use ($s) {
                      $companyQuery->where('company_name', 'like', "%$s%");
                  })
                  ->orWhereHas('location', function($locationQuery) use ($s) {
                      $locationQuery->where('location_name', 'like', "%$s%");
                  });
            });
        }
        if ($request->filled('company_id')) $query->where('company_id', $request->company_id);
        if ($request->filled('location_id')) $query->where('location_id', $request->location_id);
        if ($request->filled('status')) $query->where('status', $request->status);

        $departments = $query->orderBy('sort_order')->orderBy('department_name')->paginate(min($request->get('per_page', 25), 100));

        return Inertia::render('system/Departments/List', [
            'departments' => $departments,
            'companies' => Company::where('status', true)->orderBy('company_name')->get(['id', 'company_name']),
            'locations' => Location::where('status', true)->orderBy('location_name')->get(['id', 'location_name', 'company_id']),
            'filters' => $request->only(['search', 'company_id', 'location_id', 'status', 'per_page']),
            'pageTitle' => 'Departments',
            'activeNav' => ['group' => 'Configuration', 'item' => 'Departments']
        ]);
    }

    public function create(Request $request)
    {
        // Check if user has permission to create departments
        $this->requirePermission($request, null, 'can_add');
        return Inertia::render('system/Departments/create', [
            'department' => null,
            'companies' => Company::where('status', true)->orderBy('company_name')->get(['id', 'company_name']),
            'locations' => Location::where('status', true)->orderBy('location_name')->get(['id', 'location_name', 'company_id']),
            'pageTitle' => 'Add Department',
            'activeNav' => ['group' => 'Configuration', 'item' => 'Departments']
        ]);
    }

    public function store(Request $request)
    {
        // Check if user has permission to create departments
        $this->requirePermission($request, null, 'can_add');
        $validated = $request->validate($this->rules());

        if (!isset($validated['sort_order']) || $validated['sort_order'] === 0) {
            $validated['sort_order'] = (Department::max('sort_order') ?? 0) + 1;
        }
        $validated['status'] = filter_var($validated['status'] ?? true, FILTER_VALIDATE_BOOLEAN);
        
        $department = Department::create($validated);

        return redirect()->route('system.departments.index')->with('success', 'Department "'.$department->department_name.'" created.');
    }

    public function edit(Request $request, Department $department)
    {
        return Inertia::render('system/Departments/create', [
            'department' => $department,
            'companies' => Company::where('status', true)->orderBy('company_name')->get(['id', 'company_name']),
            'locations' => Location::where('status', true)->orderBy('location_name')->get(['id', 'location_name', 'company_id']),
            'pageTitle' => 'Edit Department',
            'activeNav' => ['group' => 'Configuration', 'item' => 'Departments']
        ]);
    }

    public function update(Request $request, Department $department)
    {
        // Check if user has permission to edit departments
        $this->requirePermission($request, null, 'can_edit');
        $validated = $request->validate($this->rules($department->id));
        
        $validated['status'] = filter_var($validated['status'] ?? $department->status, FILTER_VALIDATE_BOOLEAN);
        $department->update($validated);

        return redirect()->route('system.departments.index')->with('success', 'Department updated.');
    }

    public function destroy(Request $request, Department $department)
    {
        // Check if user has permission to delete departments
        $this->requirePermission($request, null, 'can_delete');
        $name = $department->department_name;
        $department->delete();
        return redirect()->back()->with('success', 'Department "'.$name.'" deleted.');
    }

    public function bulkUpdateStatus(Request $request)
    {
        $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'exists:departments,id',
            'status' => 'required|boolean'
        ]);

        try {
            $count = Department::whereIn('id', $request->ids)->update(['status' => $request->status]);
            $action = $request->status ? 'activated' : 'deactivated';
            return redirect()->back()->with('success', "$count department(s) $action successfully!");
        } catch (\Exception $e) {
            Log::error('Departments bulk status failed: '.$e->getMessage());
            return redirect()->back()->with('error', 'Failed to update departments status.');
        }
    }

    public function bulkDestroy(Request $request)
    {
        $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'exists:departments,id'
        ]);

        try {
            $count = Department::whereIn('id', $request->ids)->delete();
            return redirect()->back()->with('success', "$count department(s) deleted successfully!");
        } catch (\Exception $e) {
            Log::error('Departments bulk delete failed: '.$e->getMessage());
            return redirect()->back()->with('error', 'Failed to delete departments.');
        }
    }

    public function updateSortOrder(Request $request)
    {
        $request->validate([
            'departments' => 'required|array|min:1',
            'departments.*.id' => 'required|exists:departments,id',
            'departments.*.sort_order' => 'required|integer|min:0'
        ]);

        try {
            foreach ($request->departments as $item) {
                Department::where('id', $item['id'])->update(['sort_order' => $item['sort_order']]);
            }
            return response()->json(['success' => true, 'message' => 'Department order updated successfully!']);
        } catch (\Exception $e) {
            Log::error('Departments sort order update failed: '.$e->getMessage());
            return response()->json(['success' => false, 'message' => 'Failed to update department order.'], 500);
        }
    }

    public function listByLocation($locationId)
    {
        $departments = Department::where('location_id', $locationId)
                               ->where('status', true)
                               ->orderBy('department_name')
                               ->get(['id', 'department_name']);

        return response()->json(['data' => $departments]);
    }
}
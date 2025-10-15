<?php

namespace App\Http\Controllers\system;

use App\Http\Controllers\Controller;
use App\Http\Traits\CheckUserPermissions;
use App\Models\User;
use App\Models\Company;
use App\Models\Location;
use App\Models\Department;
use App\Services\AuditLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    use CheckUserPermissions;
    /**
     * Display a listing of users.
     */
    public function index(Request $request)
    {
        // Check if user has permission to view users
        $this->requirePermission($request, null, 'can_view');
        // Optimized query - only select columns needed for the list view
        $query = User::with(['company', 'location', 'department'])->select([
            'id',
            'fname',
            'mname',
            'lname',
            'email',
            'phone',
            'loginid',
            'role',
            'status',
            'comp_id',
            'location_id',
            'dept_id',
            'last_login_at',
            'created_at',
            'updated_at'
        ]);

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('fname', 'like', "%{$search}%")
                  ->orWhere('mname', 'like', "%{$search}%")
                  ->orWhere('lname', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('loginid', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        // Filter by company
        if ($request->filled('company_id')) {
            $query->where('comp_id', $request->company_id);
        }

        // Filter by location
        if ($request->filled('location_id')) {
            $query->where('location_id', $request->location_id);
        }

        // Filter by department
        if ($request->filled('department_id')) {
            $query->where('dept_id', $request->department_id);
        }

        // Filter by role
        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Sort functionality
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortBy, $sortDirection);

        $users = $query->paginate($request->get('per_page', 25));

        return Inertia::render('system/Users/index', [
            'users' => $users,
            'companies' => Company::where('status', true)->orderBy('company_name')->get(['id', 'company_name']),
            'locations' => Location::where('status', true)->orderBy('location_name')->get(['id', 'location_name', 'company_id']),
            'departments' => Department::where('status', true)->orderBy('department_name')->get(['id', 'department_name', 'location_id', 'company_id']),
            'filters' => $request->only(['search', 'company_id', 'location_id', 'department_id', 'role', 'status', 'sort_by', 'sort_direction', 'per_page']),
            'pageTitle' => 'Users Management'
        ]);
    }

    /**
     * Show the form for creating a new user.
     */
    public function create()
    {
        $companies = Company::where('status', true)->get(['id', 'company_name']);
        $locations = Location::where('status', true)->get(['id', 'location_name', 'company_id']);
        $departments = Department::where('status', true)->get(['id', 'department_name', 'location_id', 'company_id']);

        return Inertia::render('system/Users/create', [
            'companies' => $companies,
            'locations' => $locations,
            'departments' => $departments
        ]);
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(Request $request)
    {
        // Check if user has permission to add users
        $this->requirePermission($request, null, 'can_add');
        Log::info('=== USER STORE METHOD CALLED ===');
        Log::info('Request data:', $request->except(['password', 'password_confirmation']));
        
        try {
            $validator = Validator::make($request->all(), [
                'fname' => 'required|string|max:100',
                'mname' => 'nullable|string|max:100',
                'lname' => 'required|string|max:100',
                'email' => 'required|string|email|max:255|unique:tbl_users,email',
                'phone' => 'nullable|string|max:20',
                'loginid' => 'required|string|max:255|unique:tbl_users,loginid',
                'pincode' => 'nullable|string|max:10',
                'comp_id' => 'nullable|exists:companies,id',
                'location_id' => 'nullable|exists:locations,id',
                'dept_id' => 'nullable|exists:departments,id',
                'password' => 'required|string|min:8|confirmed',
                'status' => 'required|in:active,inactive,suspended,pending',
                'timezone' => 'nullable|string|max:50',
                'language' => 'nullable|string|max:10',
                'currency' => 'nullable|string|max:10',
                'theme' => 'nullable|in:light,dark,system',
            ]);

            if ($validator->fails()) {
                Log::warning('User validation failed', [
                    'errors' => $validator->errors(),
                    'request_data' => $request->except(['password', 'password_confirmation'])
                ]);
                return redirect()->back()
                    ->withErrors($validator)
                    ->withInput();
            }

            $userData = [
                'fname' => $request->fname,
                'mname' => $request->mname,
                'lname' => $request->lname,
                'email' => $request->email,
                'phone' => $request->phone,
                'loginid' => $request->loginid,
                'pincode' => $request->pincode,
                'comp_id' => $request->comp_id,
                'location_id' => $request->location_id,
                'dept_id' => $request->dept_id,
                'password' => Hash::make($request->password),
                'status' => $request->status,
                'timezone' => $request->timezone ?? 'UTC',
                'language' => $request->language ?? 'en',
                'currency' => $request->currency ?? 'USD',
                'theme' => $request->theme ?? 'system',
                'created_by' => auth()->user()->loginid ?? 'system',
            ];

            $user = User::create($userData);

            // Create audit log for the user creation
            try {
                AuditLogService::logUser('CREATE', $user->id, $user->toArray());
                Log::info('Audit log created for user creation', ['user_id' => $user->id]);
            } catch (\Exception $auditException) {
                Log::warning('Failed to create audit log for user creation', [
                    'user_id' => $user->id,
                    'error' => $auditException->getMessage()
                ]);
            }

            return redirect()->route('system.users.index')
                ->with('success', 'User created successfully!');
                
        } catch (\Exception $e) {
            Log::error('Error creating user', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->except(['password', 'password_confirmation'])
            ]);
            
            return redirect()->back()->with('error', 'Something went wrong while creating the user. Please try again.');
        }
    }

    /**
     * Display the specified user.
     */
    public function show(User $user)
    {
        $user->load(['company', 'location', 'department']);
        
        return Inertia::render('system/Users/show', [
            'user' => $user
        ]);
    }

    /**
     * Show the form for editing the specified user.
     */
    public function edit(Request $request, User $user)
    {
        // Debug: Log session and request data
        $routeName = $request->route() ? $request->route()->getName() : 'system.users.edit';
        Log::info('=== USER EDIT METHOD DEBUG ===', [
            'session_user_id' => session('user_id'),
            'session_user_comp_id' => session('user_comp_id'),
            'session_user_location_id' => session('user_location_id'),
            'request_user_id' => $request->input('user_id'),
            'route_name' => $routeName,
            'target_user_id' => $user->id
        ]);
        
        // Check if user has permission to edit users
        Log::info('About to check permission for user edit', [
            'auth_check' => auth()->check(),
            'auth_user_id' => auth()->user() ? auth()->user()->id : null,
            'session_user_id' => session('user_id'),
            'route_name' => $routeName
        ]);
        
        try {
            $this->requirePermission($request, null, 'can_edit');
            Log::info('Permission check passed for user edit');
        } catch (\Exception $e) {
            Log::error('Permission check failed for user edit', [
                'error' => $e->getMessage(),
                'auth_check' => auth()->check(),
                'auth_user_id' => auth()->user() ? auth()->user()->id : null,
                'session_user_id' => session('user_id'),
                'route_name' => $routeName
            ]);
            throw $e;
        }
        
        // Load user with relationships
        $user->load(['company', 'location', 'department']);
        
        $companies = Company::where('status', true)->orderBy('company_name')->get(['id', 'company_name']);
        
        // Get locations for the user's company (if any)
        $locations = collect();
        if ($user->comp_id) {
            $locations = Location::where('company_id', $user->comp_id)
                ->where('status', true)
                ->orderBy('location_name')
                ->get(['id', 'location_name', 'company_id']);
        }
        
        // Get departments for the user's location (if any)
        $departments = collect();
        if ($user->location_id) {
            $departments = Department::where('location_id', $user->location_id)
                ->where('status', true)
                ->orderBy('department_name')
                ->get(['id', 'department_name', 'location_id', 'company_id']);
        }
        
        // Get available menus for rights based on user's company package
        $availableMenus = collect();
        if ($user->comp_id) {
            $company = Company::with('package')->find($user->comp_id);
            if ($company) {
                $availableMenus = $company->getAvailableMenusForRights();
            }
        }
        
        // Get user's current rights
        $userRights = $user->rights()->get()->keyBy('menu_id');

        return Inertia::render('system/Users/create', [
            'user' => $user,
            'companies' => $companies,
            'locations' => $locations,
            'departments' => $departments
        ]);
    }

    /**
     * Show the user rights configuration form.
     */
    public function rights(User $user)
    {
        // Load user with relationships
        $user->load(['company', 'location', 'department']);
        
        // Get available menus for rights based on user's company package
        $availableMenus = collect();
        if ($user->comp_id) {
            $company = Company::with('package')->find($user->comp_id);
            if ($company) {
                $availableMenus = $company->getAvailableMenusForRights();
            }
        }
        
        // Get user's current rights
        $userRights = $user->rights()->get()->keyBy('menu_id');

        return Inertia::render('system/Users/UserRights', [
            'user' => $user,
            'availableMenus' => $availableMenus,
            'userRights' => $userRights,
            'pageTitle' => 'User Rights Configuration'
        ]);
    }

    /**
     * Update user rights only.
     */
    public function updateRights(Request $request, User $user)
    {
        try {
            $this->updateUserRights($user, $request->user_rights);
            
            return redirect()->route('system.users.rights', $user)
                ->with('success', 'User rights updated successfully!');
        } catch (\Exception $e) {
            \Log::error('Error updating user rights: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return redirect()->back()
                ->with('error', 'Failed to update user rights: ' . $e->getMessage());
        }
    }

    /**
     * Update the specified user in storage.
     */
    public function update(Request $request, User $user)
    {
        // Check if user has permission to edit users
        $this->requirePermission($request, null, 'can_edit');
        Log::info('=== USER UPDATE METHOD CALLED ===', ['user_id' => $user->id]);
        Log::info('Request data:', $request->except(['password', 'password_confirmation']));
        
        try {
            $validator = Validator::make($request->all(), [
                'fname' => 'required|string|max:100',
                'mname' => 'nullable|string|max:100',
                'lname' => 'required|string|max:100',
                'email' => 'required|string|email|max:255|unique:tbl_users,email,' . $user->id,
                'phone' => 'nullable|string|max:20',
                'loginid' => 'required|string|max:255|unique:tbl_users,loginid,' . $user->id,
                'pincode' => 'nullable|string|max:10',
                'comp_id' => 'nullable|exists:companies,id',
                'location_id' => 'nullable|exists:locations,id',
                'dept_id' => 'nullable|exists:departments,id',
                'password' => 'nullable|string|min:8|confirmed',
                'status' => 'required|in:active,inactive,suspended,pending',
                'timezone' => 'nullable|string|max:50',
                'language' => 'nullable|string|max:10',
                'currency' => 'nullable|string|max:10',
                'theme' => 'nullable|in:light,dark,system',
            ]);

            if ($validator->fails()) {
                Log::warning('User update validation failed', [
                    'errors' => $validator->errors(),
                    'user_id' => $user->id,
                    'request_data' => $request->except(['password', 'password_confirmation'])
                ]);
                return redirect()->back()
                    ->withErrors($validator)
                    ->withInput();
            }

            // Store old data for audit log
            $oldData = $user->toArray();

            $updateData = [
                'fname' => $request->fname,
                'mname' => $request->mname,
                'lname' => $request->lname,
                'email' => $request->email,
                'phone' => $request->phone,
                'loginid' => $request->loginid,
                'pincode' => $request->pincode,
                'comp_id' => $request->comp_id,
                'location_id' => $request->location_id,
                'dept_id' => $request->dept_id,
                'status' => $request->status,
                'timezone' => $request->timezone ?? 'UTC',
                'language' => $request->language ?? 'en',
                'currency' => $request->currency ?? 'USD',
                'theme' => $request->theme ?? 'system',
                'updated_by' => auth()->user()->loginid ?? 'system',
            ];

            if ($request->filled('password')) {
                $updateData['password'] = Hash::make($request->password);
            }

            $user->update($updateData);

            // Create audit log for the user update
            try {
                AuditLogService::logUser('UPDATE', $user->id, $user->fresh()->toArray(), $oldData);
                Log::info('Audit log created for user update', ['user_id' => $user->id]);
            } catch (\Exception $auditException) {
                Log::warning('Failed to create audit log for user update', [
                    'user_id' => $user->id,
                    'error' => $auditException->getMessage()
                ]);
            }

            return redirect()->route('system.users.edit', $user)
                ->with('success', 'User updated successfully!');
                
        } catch (\Exception $e) {
            Log::error('Error updating user', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => $user->id,
                'request_data' => $request->except(['password', 'password_confirmation'])
            ]);
            
            return redirect()->back()->with('error', 'Something went wrong while updating the user. Please try again.');
        }
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy(Request $request, User $user)
    {
        // Check if user has permission to delete users
        $this->requirePermission($request, null, 'can_delete');
        Log::info('=== USER DESTROY METHOD CALLED ===', ['user_id' => $user->id]);
        
        try {
            // Store old data for audit log
            $oldData = $user->toArray();
            
            $user->delete();

            // Create audit log for the user deletion
            try {
                AuditLogService::logUser('DELETE', $user->id, [], $oldData);
                Log::info('Audit log created for user deletion', ['user_id' => $user->id]);
            } catch (\Exception $auditException) {
                Log::warning('Failed to create audit log for user deletion', [
                    'user_id' => $user->id,
                    'error' => $auditException->getMessage()
                ]);
            }

            return redirect()->route('system.users.index')
                ->with('success', 'User deleted successfully!');
                
        } catch (\Exception $e) {
            Log::error('Error deleting user', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => $user->id
            ]);
            
            return redirect()->back()->with('error', 'Something went wrong while deleting the user. Please try again.');
        }
    }

    /**
     * Get locations by company ID
     */
    public function getLocationsByCompany($companyId)
    {
        $locations = Location::where('company_id', $companyId)
            ->where('status', true)
            ->get(['id', 'location_name']);

        return response()->json(['data' => $locations]);
    }

    /**
     * Get departments by location ID
     */
    public function getDepartmentsByLocation($locationId)
    {
        $departments = Department::where('location_id', $locationId)
            ->where('status', true)
            ->get(['id', 'department_name']);

        return response()->json(['data' => $departments]);
    }

    /**
     * Bulk update user status
     */
    public function bulkUpdateStatus(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:tbl_users,id',
            'status' => 'required|in:active,inactive,suspended,pending'
        ]);

        $count = User::whereIn('id', $request->ids)
            ->update(['status' => $request->status]);

        return redirect()->back()->with('success', "Status updated for {$count} user(s).");
    }

    /**
     * Bulk delete users
     */
    public function bulkDestroy(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:tbl_users,id'
        ]);

        $count = User::whereIn('id', $request->ids)->delete();

        return redirect()->back()->with('success', "{$count} user(s) deleted successfully.");
    }

    /**
     * Update user rights
     */
    private function updateUserRights(User $user, array $userRights)
    {
        // Delete existing rights
        $user->rights()->delete();

        // Create new rights
        foreach ($userRights as $rightData) {
            // Check if this is an array with menu_id key (from our form)
            if (is_array($rightData) && isset($rightData['menu_id'])) {
                
                \App\Models\UserRight::create([
                    'user_id' => $user->id,
                    'menu_id' => $rightData['menu_id'],
                    'can_view' => $rightData['can_view'] ?? false,
                    'can_add' => $rightData['can_add'] ?? false,
                    'can_edit' => $rightData['can_edit'] ?? false,
                    'can_delete' => $rightData['can_delete'] ?? false,
                ]);
            }
            // Check if this is an array with menu_id as key (alternative format)
            elseif (is_array($rightData) && isset($rightData['can_view'])) {
                $menuId = array_search($rightData, $userRights);
                
                \App\Models\UserRight::create([
                    'user_id' => $user->id,
                    'menu_id' => $menuId,
                    'can_view' => $rightData['can_view'] ?? false,
                    'can_add' => $rightData['can_add'] ?? false,
                    'can_edit' => $rightData['can_edit'] ?? false,
                    'can_delete' => $rightData['can_delete'] ?? false,
                ]);
            }
        }
    }

    /**
     * Get user rights for a specific user
     */
    public function getUserRights(User $user)
    {
        $company = Company::with('package')->find($user->comp_id);
        $availableMenus = collect();
        
        if ($company) {
            $availableMenus = $company->getAvailableMenusForRights();
        }
        
        $userRights = $user->rights()->get()->keyBy('menu_id');

        return response()->json([
            'availableMenus' => $availableMenus,
            'userRights' => $userRights
        ]);
    }
}

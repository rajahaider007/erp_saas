<?php

namespace App\Http\Controllers\system;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Company;
use App\Models\Location;
use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Display a listing of users.
     */
    public function index()
    {
        $users = User::with(['company', 'location', 'department'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('system/Users/index', [
            'users' => $users
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
            'role' => 'required|in:super_admin,admin,manager,user',
            'status' => 'required|in:active,inactive,suspended,pending',
            'timezone' => 'nullable|string|max:50',
            'language' => 'nullable|string|max:10',
            'currency' => 'nullable|string|max:10',
            'theme' => 'nullable|in:light,dark,system',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        $user = User::create([
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
            'role' => $request->role,
            'status' => $request->status,
            'timezone' => $request->timezone ?? 'UTC',
            'language' => $request->language ?? 'en',
            'currency' => $request->currency ?? 'USD',
            'theme' => $request->theme ?? 'system',
            'created_by' => auth()->user()->loginid ?? 'system',
        ]);

        return redirect()->route('system.users.index')
            ->with('success', 'User created successfully!');
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
    public function edit(User $user)
    {
        $companies = Company::where('status', true)->get(['id', 'company_name']);
        $locations = Location::where('status', true)->get(['id', 'location_name', 'company_id']);
        $departments = Department::where('status', true)->get(['id', 'department_name', 'location_id', 'company_id']);

        return Inertia::render('system/Users/edit', [
            'user' => $user,
            'companies' => $companies,
            'locations' => $locations,
            'departments' => $departments
        ]);
    }

    /**
     * Update the specified user in storage.
     */
    public function update(Request $request, User $user)
    {
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
            'role' => 'required|in:super_admin,admin,manager,user',
            'status' => 'required|in:active,inactive,suspended,pending',
            'timezone' => 'nullable|string|max:50',
            'language' => 'nullable|string|max:10',
            'currency' => 'nullable|string|max:10',
            'theme' => 'nullable|in:light,dark,system',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

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
            'role' => $request->role,
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

        return redirect()->route('system.users.index')
            ->with('success', 'User updated successfully!');
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy(User $user)
    {
        $user->delete();

        return redirect()->route('system.users.index')
            ->with('success', 'User deleted successfully!');
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
}

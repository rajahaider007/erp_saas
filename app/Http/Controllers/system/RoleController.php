<?php

namespace App\Http\Controllers\system;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\Menu;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RoleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $roles = Role::orderBy('sort_order')
            ->orderBy('role_name')
            ->get();

        return Inertia::render('system/Roles/index', [
            'roles' => $roles,
            'pageTitle' => 'Roles Management'
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('system/Roles/create', [
            'pageTitle' => 'Create New Role'
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'role_name' => 'required|string|max:100',
            'description' => 'nullable|string|max:500',
            'status' => 'boolean',
            'sort_order' => 'integer|min:0'
        ]);

        if (!isset($validated['sort_order']) || $validated['sort_order'] === 0) {
            $validated['sort_order'] = (Role::max('sort_order') ?? 0) + 1;
        }
        
        $validated['status'] = filter_var($validated['status'] ?? true, FILTER_VALIDATE_BOOLEAN);
        
        $role = Role::create($validated);

        return redirect()->route('system.roles.index')
                        ->with('success', 'Role "' . $role->role_name . '" created successfully!');
    }

    /**
     * Display the specified resource.
     */
    public function show(Role $role)
    {
        $role->load(['features.menu.section.module']);
        
        return Inertia::render('system/Roles/show', [
            'role' => $role,
            'pageTitle' => 'Role Details: ' . $role->role_name
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Role $role)
    {
        return Inertia::render('system/Roles/edit', [
            'role' => $role,
            'pageTitle' => 'Edit Role: ' . $role->role_name
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Role $role)
    {
        $validated = $request->validate([
            'role_name' => 'required|string|max:100',
            'description' => 'nullable|string|max:500',
            'status' => 'boolean',
            'sort_order' => 'integer|min:0'
        ]);

        $validated['status'] = filter_var($validated['status'] ?? true, FILTER_VALIDATE_BOOLEAN);
        
        $role->update($validated);

        return redirect()->route('system.roles.index')
                        ->with('success', 'Role "' . $role->role_name . '" updated successfully!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Role $role)
    {
        $roleName = $role->role_name;
        $role->delete();

        return redirect()->route('system.roles.index')
                        ->with('success', 'Role "' . $roleName . '" deleted successfully!');
    }
}
<?php

namespace App\Http\Controllers\system;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\RoleFeature;
use App\Models\Menu;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RoleFeatureController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $roles = Role::where('status', true)
            ->orderBy('sort_order')
            ->get(['id', 'role_name']);

        return Inertia::render('system/RoleFeatures/index', [
            'roles' => $roles,
            'pageTitle' => 'Role Features Management'
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $roles = Role::where('status', true)
            ->orderBy('sort_order')
            ->get(['id', 'role_name']);
            
        $menus = Menu::with(['section.module'])
            ->where('status', true)
            ->orderBy('menu_name')
            ->get(['id', 'menu_name', 'section_id']);

        return Inertia::render('system/RoleFeatures/create', [
            'roles' => $roles,
            'menus' => $menus,
            'pageTitle' => 'Configure Role Features'
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'role_id' => 'required|exists:roles,id',
            'menu_features' => 'required|array|min:1',
            'menu_features.*.menu_id' => 'required|exists:menus,id',
            'menu_features.*.is_enabled' => 'boolean'
        ]);

        try {
            // Delete existing features for this role
            RoleFeature::where('role_id', $request->role_id)->delete();

            // Create new features
            foreach ($request->menu_features as $feature) {
                RoleFeature::create([
                    'role_id' => $request->role_id,
                    'menu_id' => $feature['menu_id'],
                    'is_enabled' => $feature['is_enabled'] ?? false
                ]);
            }

            $role = Role::find($request->role_id);
            return redirect()->route('system.role-features.index')
                ->with('success', 'Role features for "' . $role->role_name . '" updated successfully.');
        } catch (\Exception $e) {
            \Log::error('Role features creation failed: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to create role features.');
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Role $role)
    {
        $roleFeatures = $role->features()->pluck('is_enabled', 'menu_id')->toArray();
        
        return Inertia::render('system/RoleFeatures/show', [
            'role' => $role,
            'roleFeatures' => $roleFeatures,
            'pageTitle' => 'Role Features: ' . $role->role_name
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Role $role)
    {
        $roleFeatures = RoleFeature::where('role_id', $role->id)
            ->pluck('is_enabled', 'menu_id')
            ->toArray();
        
        return Inertia::render('system/RoleFeatures/edit', [
            'role' => $role,
            'roles' => Role::where('status', true)->orderBy('role_name')->get(['id', 'role_name']),
            'menus' => Menu::with(['section.module'])->where('status', true)->orderBy('menu_name')->get(['id', 'menu_name', 'section_id']),
            'roleFeatures' => $roleFeatures,
            'pageTitle' => 'Edit Role Features'
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Role $role)
    {
        $request->validate([
            'menu_features' => 'required|array|min:1',
            'menu_features.*.menu_id' => 'required|exists:menus,id',
            'menu_features.*.is_enabled' => 'boolean'
        ]);

        try {
            // Delete existing features for this role
            RoleFeature::where('role_id', $role->id)->delete();

            // Create new features
            foreach ($request->menu_features as $feature) {
                RoleFeature::create([
                    'role_id' => $role->id,
                    'menu_id' => $feature['menu_id'],
                    'is_enabled' => $feature['is_enabled'] ?? false
                ]);
            }

            return redirect()->route('system.role-features.index')
                ->with('success', 'Role features for "' . $role->role_name . '" updated successfully.');
        } catch (\Exception $e) {
            \Log::error('Role features update failed: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to update role features.');
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Role $role)
    {
        RoleFeature::where('role_id', $role->id)->delete();
        
        return redirect()->route('system.role-features.index')
                        ->with('success', 'Role features for "' . $role->role_name . '" deleted successfully.');
    }
}
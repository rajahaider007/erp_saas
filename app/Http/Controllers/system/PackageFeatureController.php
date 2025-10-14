<?php

namespace App\Http\Controllers\system;

use App\Http\Controllers\Controller;
use App\Http\Traits\CheckUserPermissions;
use App\Models\Package;
use App\Models\PackageFeature;
use App\Models\Menu;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PackageFeatureController extends Controller
{
    use CheckUserPermissions;
    public function index(Request $request)
    {
        // Check if user has permission to can_view
        $this->requirePermission($request, null, 'can_view');
        $query = PackageFeature::with(['package', 'menu']);

        if ($request->filled('package_id')) {
            $query->where('package_id', $request->package_id);
        }

        $packageFeatures = $query->orderBy('package_id')->orderBy('menu_id')->paginate(min($request->get('per_page', 25), 100));

        return Inertia::render('system/PackageFeatures/List', [
            'packageFeatures' => $packageFeatures,
            'packages' => Package::orderBy('package_name')->get(['id', 'package_name']),
            'filters' => $request->only(['package_id', 'per_page']),
            'pageTitle' => 'Package Features',
            'activeNav' => ['group' => 'Configuration', 'item' => 'Package Features']
        ]);
    }

    public function create()
    {
        // Check if user has permission to can_add
        $this->requirePermission($request, null, 'can_add');
        return Inertia::render('system/PackageFeatures/add', [
            'packages' => Package::where('status', true)->orderBy('package_name')->get(['id', 'package_name']),
            'menus' => Menu::with(['section.module'])->where('status', true)->orderBy('menu_name')->get(['id', 'menu_name', 'section_id']),
            'pageTitle' => 'Add Package Features',
            'activeNav' => ['group' => 'Configuration', 'item' => 'Package Features']
        ]);
    }

    public function store(Request $request)
    {
        // Check if user has permission to can_add
        $this->requirePermission($request, null, 'can_add');
        $request->validate([
            'package_id' => 'required|exists:packages,id',
            'menu_features' => 'required|array|min:1',
            'menu_features.*.menu_id' => 'required|exists:menus,id',
            'menu_features.*.is_enabled' => 'boolean'
        ]);

        try {
            // Delete existing features for this package
            PackageFeature::where('package_id', $request->package_id)->delete();

            // Create new features
            foreach ($request->menu_features as $feature) {
                PackageFeature::create([
                    'package_id' => $request->package_id,
                    'menu_id' => $feature['menu_id'],
                    'is_enabled' => $feature['is_enabled'] ?? false
                ]);
            }

            $package = Package::find($request->package_id);
            return redirect()->route('system.package-features.index')->with('success', 'Package features for "'.$package->package_name.'" updated successfully.');
        } catch (\Exception $e) {
            \Log::error('Package features creation failed: '.$e->getMessage());
            return redirect()->back()->with('error', 'Failed to create package features.');
        }
    }

    public function edit(Package $package)
    {
        // Check if user has permission to can_edit
        $this->requirePermission($request, null, 'can_edit');
        $packageFeatures = PackageFeature::where('package_id', $package->id)->pluck('is_enabled', 'menu_id')->toArray();
        
        return Inertia::render('system/PackageFeatures/edit', [
            'package' => $package,
            'packages' => Package::where('status', true)->orderBy('package_name')->get(['id', 'package_name']),
            'menus' => Menu::with(['section.module'])->where('status', true)->orderBy('menu_name')->get(['id', 'menu_name', 'section_id']),
            'packageFeatures' => $packageFeatures,
            'pageTitle' => 'Edit Package Features',
            'activeNav' => ['group' => 'Configuration', 'item' => 'Package Features']
        ]);
    }

    public function update(Request $request, Package $package)
    {
        // Check if user has permission to can_edit
        $this->requirePermission($request, null, 'can_edit');
        $request->validate([
            'package_id' => 'required|exists:packages,id',
            'menu_features' => 'required|array|min:1',
            'menu_features.*.menu_id' => 'required|exists:menus,id',
            'menu_features.*.is_enabled' => 'boolean'
        ]);

        try {
            // Delete existing features for this package
            PackageFeature::where('package_id', $package->id)->delete();

            // Create new features
            foreach ($request->menu_features as $feature) {
                PackageFeature::create([
                    'package_id' => $package->id,
                    'menu_id' => $feature['menu_id'],
                    'is_enabled' => $feature['is_enabled'] ?? false
                ]);
            }

            return redirect()->route('system.package-features.index')->with('success', 'Package features updated successfully.');
        } catch (\Exception $e) {
            \Log::error('Package features update failed: '.$e->getMessage());
            return redirect()->back()->with('error', 'Failed to update package features.');
        }
    }

    public function destroy(PackageFeature $packageFeature)
    {
        // Check if user has permission to can_delete
        $this->requirePermission($request, null, 'can_delete');
        $packageFeature->delete();
        return redirect()->back()->with('success', 'Package feature deleted.');
    }

    public function bulkDestroy(Request $request)
    {
        $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'exists:package_features,id'
        ]);

        try {
            $count = PackageFeature::whereIn('id', $request->ids)->delete();
            return redirect()->back()->with('success', "$count package feature(s) deleted successfully!");
        } catch (\Exception $e) {
            \Log::error('Package features bulk delete failed: '.$e->getMessage());
            return redirect()->back()->with('error', 'Failed to delete package features.');
        }
    }
}

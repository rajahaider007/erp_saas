<?php

namespace App\Http\Controllers\system;

use App\Http\Controllers\Controller;
use App\Http\Traits\CheckUserPermissions;
use App\Models\Package;
use App\Helpers\CompanyHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class PackageController extends Controller
{
    use CheckUserPermissions;
    /**
     * Check if current user's company can access packages module
     */
    private function checkAccess()
    {
        if (!CompanyHelper::canManageParentSettings()) {
            abort(403, 'Access Denied: Only parent companies can manage packages.');
        }
    }

    private function rules($id = null): array
    {
        return [
            'package_name' => [
                'required', 'string', 'min:2', 'max:100', 'regex:/^[a-zA-Z0-9\s\-\_\.]+$/',
                Rule::unique('packages')->ignore($id)
            ],
            'status' => ['sometimes', 'boolean'],
            'sort_order' => ['sometimes', 'integer', 'min:0', 'max:9999'],
        ];
    }

    public function index(Request $request)
    {
        // Check if user has permission to can_view
        $this->requirePermission($request, null, 'can_view');
        $this->checkAccess();
        
        $query = Package::query();

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where('package_name', 'like', "%$s%");
        }
        if ($request->filled('status')) $query->where('status', $request->status);

        $packages = $query->orderBy('sort_order')->orderBy('package_name')->paginate(min($request->get('per_page', 25), 100));

        return Inertia::render('system/Packages/List', [
            'packages' => $packages,
            'filters' => $request->only(['search', 'status', 'per_page']),
            'pageTitle' => 'Packages',
            'activeNav' => ['group' => 'Configuration', 'item' => 'Packages']
        ]);
    }

    public function create()
    {
        // Check if user has permission to can_add
        $this->requirePermission($request, null, 'can_add');
        $this->checkAccess();
        
        return Inertia::render('system/Packages/add', [
            'menus' => \App\Models\Menu::with(['module', 'section'])->where('status', true)->orderBy('menu_name')->get(['id', 'menu_name', 'module_id', 'section_id']),
            'pageTitle' => 'Add Package',
            'activeNav' => ['group' => 'Configuration', 'item' => 'Packages']
        ]);
    }

    public function store(Request $request)
    {
        // Check if user has permission to can_add
        $this->requirePermission($request, null, 'can_add');
        $this->checkAccess();
        
        $validated = $request->validate([
            ...$this->rules(),
            'menu_features' => 'sometimes|array',
            'menu_features.*.menu_id' => 'required_with:menu_features|exists:menus,id',
            'menu_features.*.is_enabled' => 'boolean',
        ]);

        if (!isset($validated['sort_order']) || $validated['sort_order'] === 0) {
            $validated['sort_order'] = (Package::max('sort_order') ?? 0) + 1;
        }
        $validated['status'] = filter_var($validated['status'] ?? true, FILTER_VALIDATE_BOOLEAN);
        
        $package = Package::create($validated);

        // Attach menu features if provided
        if (isset($validated['menu_features'])) {
            $menuData = [];
            foreach ($validated['menu_features'] as $feature) {
                $menuData[$feature['menu_id']] = ['is_enabled' => $feature['is_enabled']];
            }
            $package->menus()->attach($menuData);
        }

        return redirect()->route('system.packages.index')->with('success', 'Package "'.$package->package_name.'" created.');
    }

    public function edit(Request $request, Package $package)
    {
        // Check if user has permission to can_edit
        $this->requirePermission($request, null, 'can_edit');
        $this->checkAccess();
        
        $packageFeatures = $package->features()->pluck('is_enabled', 'menu_id')->toArray();
        
        return Inertia::render('system/Packages/edit', [
            'package' => $package,
            'menus' => \App\Models\Menu::with(['module', 'section'])->where('status', true)->orderBy('menu_name')->get(['id', 'menu_name', 'module_id', 'section_id']),
            'packageFeatures' => $packageFeatures,
            'pageTitle' => 'Edit Package',
            'activeNav' => ['group' => 'Configuration', 'item' => 'Packages']
        ]);
    }

    public function update(Request $request, Package $package)
    {
        // Check if user has permission to can_edit
        $this->requirePermission($request, null, 'can_edit');
        $this->checkAccess();
        
        $validated = $request->validate([
            ...$this->rules($package->id),
            'menu_features' => 'sometimes|array',
            'menu_features.*.menu_id' => 'required_with:menu_features|exists:menus,id',
            'menu_features.*.is_enabled' => 'boolean',
        ]);
        
        $validated['status'] = filter_var($validated['status'] ?? $package->status, FILTER_VALIDATE_BOOLEAN);
        $package->update($validated);

        // Update menu features if provided
        if (isset($validated['menu_features'])) {
            $package->menus()->detach();
            $menuData = [];
            foreach ($validated['menu_features'] as $feature) {
                $menuData[$feature['menu_id']] = ['is_enabled' => $feature['is_enabled']];
            }
            $package->menus()->attach($menuData);
        }

        return redirect()->route('system.packages.index')->with('success', 'Package updated.');
    }

    public function destroy(Package $package)
    {
        // Check if user has permission to can_delete
        $this->requirePermission($request, null, 'can_delete');
        $this->checkAccess();
        
        $name = $package->package_name;
        $package->delete();
        return redirect()->back()->with('success', 'Package "'.$name.'" deleted.');
    }

    public function bulkUpdateStatus(Request $request)
    {
        $this->checkAccess();
        
        $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'exists:packages,id',
            'status' => 'required|boolean'
        ]);

        try {
            $count = Package::whereIn('id', $request->ids)->update(['status' => $request->status]);
            $action = $request->status ? 'activated' : 'deactivated';
            return redirect()->back()->with('success', "$count package(s) $action successfully!");
        } catch (\Exception $e) {
            Log::error('Packages bulk status failed: '.$e->getMessage());
            return redirect()->back()->with('error', 'Failed to update packages status.');
        }
    }

    public function bulkDestroy(Request $request)
    {
        $this->checkAccess();
        
        $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'exists:packages,id'
        ]);

        try {
            $count = Package::whereIn('id', $request->ids)->delete();
            return redirect()->back()->with('success', "$count package(s) deleted successfully!");
        } catch (\Exception $e) {
            Log::error('Packages bulk delete failed: '.$e->getMessage());
            return redirect()->back()->with('error', 'Failed to delete packages.');
        }
    }

    public function updateSortOrder(Request $request)
    {
        $this->checkAccess();
        
        $request->validate([
            'packages' => 'required|array|min:1',
            'packages.*.id' => 'required|exists:packages,id',
            'packages.*.sort_order' => 'required|integer|min:0'
        ]);

        try {
            foreach ($request->packages as $item) {
                Package::where('id', $item['id'])->update(['sort_order' => $item['sort_order']]);
            }
            return response()->json(['success' => true, 'message' => 'Package order updated successfully!']);
        } catch (\Exception $e) {
            Log::error('Packages sort order update failed: '.$e->getMessage());
            return response()->json(['success' => false, 'message' => 'Failed to update package order.'], 500);
        }
    }
}

<?php

namespace App\Http\Controllers\system;

use App\Http\Controllers\Controller;
use App\Http\Traits\CheckUserPermissions;
use App\Models\Menu;
use App\Models\Module;
use App\Models\Section;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class MenuController extends Controller
{
    use CheckUserPermissions;
    private function rules($id = null): array
    {
        return [
            'module_id' => ['required', 'exists:modules,id'],
            'section_id' => ['required', 'exists:sections,id'],
            'menu_name' => [
                'required','string','min:2','max:100','regex:/^[a-zA-Z0-9\s\-\_\.]+$/',
                Rule::unique('menus')->where(fn ($q) => $q->where('section_id', request('section_id')))->ignore($id)
            ],
            'route' => ['nullable','string','max:255'],
            'icon' => ['nullable','string','max:100'],
            'status' => ['sometimes','boolean'],
            'sort_order' => ['sometimes','integer','min:0','max:9999'],
        ];
    }

    public function index(Request $request)
    {
        // Check if user has permission to can_view
        $this->requirePermission($request, null, 'can_view');
        $query = Menu::with(['module','section']);
        if ($request->filled('module_id')) $query->where('module_id', $request->module_id);
        if ($request->filled('section_id')) $query->where('section_id', $request->section_id);
        if ($request->filled('search')) $query->where('menu_name', 'like', "%{$request->search}%");
        if ($request->filled('status')) $query->where('status', $request->status);

        $menus = $query->orderBy('sort_order')->orderBy('menu_name')->paginate(min($request->get('per_page', 25), 100));

        return Inertia::render('system/Menus/List', [
            'menus' => $menus,
            'modules' => Module::orderBy('module_name')->get(['id','module_name']),
            'filters' => $request->only(['module_id','section_id','search','status','per_page']),
            'pageTitle' => 'Menus',
            'activeNav' => ['group' => 'Configuration', 'item' => 'Menus']
        ]);
    }

    public function create()
    {
        // Check if user has permission to can_add
        $this->requirePermission($request, null, 'can_add');
        return Inertia::render('system/Menus/add', [
            'modules' => Module::orderBy('module_name')->get(['id','module_name'])
        ]);
    }

    public function store(Request $request)
    {
        // Check if user has permission to can_add
        $this->requirePermission($request, null, 'can_add');
        $validated = $request->validate($this->rules());
        $validated['status'] = filter_var($validated['status'] ?? true, FILTER_VALIDATE_BOOLEAN);
        if (!isset($validated['sort_order']) || $validated['sort_order'] === 0) {
            $validated['sort_order'] = (Menu::where('section_id', $validated['section_id'])->max('sort_order') ?? 0) + 1;
        }
        $menu = Menu::create($validated);
        return redirect()->route('system.menus.index')->with('success', 'Menu "'.$menu->menu_name.'" created.');
    }

    public function edit(Request $request, Menu $menu)
    {
        // Check if user has permission to can_edit
        $this->requirePermission($request, null, 'can_edit');
        return Inertia::render('system/Menus/edit', [
            'menu' => $menu->load(['module','section']),
            'modules' => Module::orderBy('module_name')->get(['id','module_name'])
        ]);
    }

    public function update(Request $request, Menu $menu)
    {
        // Check if user has permission to can_edit
        $this->requirePermission($request, null, 'can_edit');
        $validated = $request->validate($this->rules($menu->id));
        $validated['status'] = filter_var($validated['status'] ?? $menu->status, FILTER_VALIDATE_BOOLEAN);
        $menu->update($validated);
        return redirect()->route('system.menus.index')->with('success', 'Menu updated.');
    }

    public function destroy(Menu $menu)
    {
        // Check if user has permission to can_delete
        $this->requirePermission($request, null, 'can_delete');
        $name = $menu->menu_name;
        $menu->delete();
        return redirect()->back()->with('success', 'Menu "'.$name.'" deleted.');
    }

    public function listByModule(Module $module)
    {
        $sections = Section::where('module_id', $module->id)
            ->where('status', true)
            ->orderBy('sort_order')
            ->with(['menus' => function ($q) {
                $q->where('status', true)
                  ->orderBy('sort_order')
                  ->select('id', 'section_id', 'menu_name', 'route', 'icon', 'sort_order', 'status');
            }])
            ->get(['id', 'module_id', 'section_name', 'sort_order']);

        return response()->json([
            'success' => true,
            'data' => [
                'module' => [
                    'id' => $module->id,
                    'name' => $module->module_name,
                ],
                'sections' => $sections,
            ]
        ]);
    }

    public function bulkUpdateStatus(Request $request)
    {
        $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'exists:menus,id',
            'status' => 'required|boolean'
        ]);

        try {
            $count = Menu::whereIn('id', $request->ids)->update(['status' => $request->status]);
            $action = $request->status ? 'activated' : 'deactivated';
            return redirect()->back()->with('success', "$count menu(s) $action successfully!");
        } catch (\Exception $e) {
            \Log::error('Menus bulk status failed: '.$e->getMessage());
            return redirect()->back()->with('error', 'Failed to update menus status.');
        }
    }

    public function bulkDestroy(Request $request)
    {
        $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'exists:menus,id'
        ]);

        try {
            $count = Menu::whereIn('id', $request->ids)->delete();
            return redirect()->back()->with('success', "$count menu(s) deleted successfully!");
        } catch (\Exception $e) {
            \Log::error('Menus bulk delete failed: '.$e->getMessage());
            return redirect()->back()->with('error', 'Failed to delete menus.');
        }
    }

    public function exportCsv(Request $request)
    {
        try {
            $query = Menu::with(['module','section']);
            if ($request->filled('module_id')) $query->where('module_id', $request->module_id);
            if ($request->filled('section_id')) $query->where('section_id', $request->section_id);
            if ($request->filled('search')) $query->where('menu_name', 'like', '%'.$request->search.'%');
            if ($request->filled('status')) $query->where('status', $request->status);

            $menus = $query->get();
            $filename = 'menus_export_' . date('Y-m-d_H-i-s') . '.csv';
            $headers = [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => "attachment; filename=\"{$filename}\"",
                'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
                'Expires' => '0',
            ];

            $callback = function() use ($menus) {
                $file = fopen('php://output', 'w');
                fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));
                fputcsv($file, ['ID','Menu Name','Module','Section','Route','Icon','Status','Sort Order','Created At','Updated At']);
                foreach ($menus as $m) {
                    fputcsv($file, [
                        $m->id,
                        $m->menu_name,
                        optional($m->module)->module_name,
                        optional($m->section)->section_name,
                        $m->route,
                        $m->icon,
                        $m->status ? '1' : '0',
                        $m->sort_order ?? 0,
                        $m->created_at ? $m->created_at->format('Y-m-d H:i:s') : '',
                        $m->updated_at ? $m->updated_at->format('Y-m-d H:i:s') : '',
                    ]);
                }
                fclose($file);
            };

            return response()->stream($callback, 200, $headers);
        } catch (\Exception $e) {
            \Log::error('Menus CSV export failed: '.$e->getMessage());
            return redirect()->back()->with('error', 'Failed to export menus.');
        }
    }
}



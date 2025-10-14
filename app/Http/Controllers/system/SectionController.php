<?php

namespace App\Http\Controllers\system;

use App\Http\Controllers\Controller;
use App\Http\Traits\CheckUserPermissions;
use App\Models\Module;
use App\Models\Section;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class SectionController extends Controller
{
    use CheckUserPermissions;
    private function rules($id = null): array
    {
        return [
            'module_id' => ['required', 'exists:modules,id'],
            'section_name' => [
                'required','string','min:2','max:100','regex:/^[a-zA-Z0-9\s\-\_\.]+$/',
                Rule::unique('sections')->where(fn ($q) => $q->where('module_id', request('module_id')))->ignore($id)
            ],
            'status' => ['sometimes','boolean'],
            'sort_order' => ['sometimes','integer','min:0','max:9999'],
        ];
    }

    public function index(Request $request)
    {
        // Check if user has permission to can_view
        $this->requirePermission($request, null, 'can_view');
        $query = Section::with('module');

        if ($request->filled('module_id')) $query->where('module_id', $request->module_id);
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where('section_name', 'like', "%$s%");
        }
        if ($request->filled('status')) $query->where('status', $request->status);

        $sections = $query->orderBy('sort_order')->orderBy('section_name')->paginate(min($request->get('per_page', 25), 100));

        return Inertia::render('system/Sections/List', [
            'sections' => $sections,
            'modules' => Module::orderBy('module_name')->get(['id','module_name']),
            'filters' => $request->only(['module_id','search','status','per_page']),
            'pageTitle' => 'Sections',
            'activeNav' => ['group' => 'Configuration', 'item' => 'Sections']
        ]);
    }

    public function create()
    {
        // Check if user has permission to can_add
        $this->requirePermission($request, null, 'can_add');
        return Inertia::render('system/Sections/add', [
            'modules' => Module::orderBy('module_name')->get(['id','module_name'])
        ]);
    }

    public function store(Request $request)
    {
        // Check if user has permission to can_add
        $this->requirePermission($request, null, 'can_add');
        $validated = $request->validate($this->rules());
        if (!isset($validated['sort_order']) || $validated['sort_order'] === 0) {
            $validated['sort_order'] = (Section::where('module_id', $validated['module_id'])->max('sort_order') ?? 0) + 1;
        }
        $validated['status'] = filter_var($validated['status'] ?? true, FILTER_VALIDATE_BOOLEAN);
        $section = Section::create($validated);
        return redirect()->route('system.sections.index')->with('success', 'Section "'.$section->section_name.'" created.');
    }

    public function edit(Section $section)
    {
        // Check if user has permission to can_edit
        $this->requirePermission($request, null, 'can_edit');
        return Inertia::render('system/Sections/edit', [
            'section' => $section,
            'modules' => Module::orderBy('module_name')->get(['id','module_name'])
        ]);
    }

    public function update(Request $request, Section $section)
    {
        // Check if user has permission to can_edit
        $this->requirePermission($request, null, 'can_edit');
        $validated = $request->validate($this->rules($section->id));
        $validated['status'] = filter_var($validated['status'] ?? $section->status, FILTER_VALIDATE_BOOLEAN);
        $section->update($validated);
        return redirect()->route('system.sections.index')->with('success', 'Section updated.');
    }

    public function destroy(Section $section)
    {
        // Check if user has permission to can_delete
        $this->requirePermission($request, null, 'can_delete');
        $name = $section->section_name;
        $section->delete();
        return redirect()->back()->with('success', 'Section "'.$name.'" deleted.');
    }

    public function listByModule(Module $module)
    {
        $sections = Section::where('module_id', $module->id)->where('status', true)->orderBy('sort_order')->get(['id','section_name']);
        return response()->json(['success' => true, 'data' => ['sections' => $sections]]);
    }

    /**
     * Bulk update status
     */
    public function bulkUpdateStatus(Request $request)
    {
        $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'exists:sections,id',
            'status' => 'required|boolean'
        ]);

        try {
            $count = Section::whereIn('id', $request->ids)->update(['status' => $request->status]);
            $action = $request->status ? 'activated' : 'deactivated';
            return redirect()->back()->with('success', "$count section(s) $action successfully!");
        } catch (\Exception $e) {
            \Log::error('Sections bulk status failed: '.$e->getMessage());
            return redirect()->back()->with('error', 'Failed to update sections status.');
        }
    }

    /**
     * Bulk delete
     */
    public function bulkDestroy(Request $request)
    {
        $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'exists:sections,id'
        ]);

        try {
            $count = Section::whereIn('id', $request->ids)->delete();
            return redirect()->back()->with('success', "$count section(s) deleted successfully!");
        } catch (\Exception $e) {
            \Log::error('Sections bulk delete failed: '.$e->getMessage());
            return redirect()->back()->with('error', 'Failed to delete sections.');
        }
    }

    /**
     * Update sort order
     */
    public function updateSortOrder(Request $request)
    {
        $request->validate([
            'sections' => 'required|array',
            'sections.*.id' => 'required|exists:sections,id',
            'sections.*.sort_order' => 'required|integer|min:0'
        ]);

        try {
            foreach ($request->sections as $item) {
                Section::where('id', $item['id'])->update(['sort_order' => $item['sort_order']]);
            }
            return response()->json(['success' => true, 'message' => 'Section order updated successfully!']);
        } catch (\Exception $e) {
            \Log::error('Sections sort order update failed: '.$e->getMessage());
            return response()->json(['success' => false, 'message' => 'Failed to update section order.'], 500);
        }
    }

    /**
     * Export CSV
     */
    public function exportCsv(Request $request)
    {
        try {
            $query = Section::with('module');
            if ($request->filled('module_id')) $query->where('module_id', $request->module_id);
            if ($request->filled('search')) $query->where('section_name', 'like', '%'.$request->search.'%');
            if ($request->filled('status')) $query->where('status', $request->status);

            $sections = $query->get();
            $filename = 'sections_export_' . date('Y-m-d_H-i-s') . '.csv';
            $headers = [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => "attachment; filename=\"{$filename}\"",
                'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
                'Expires' => '0',
            ];

            $callback = function() use ($sections) {
                $file = fopen('php://output', 'w');
                fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));
                fputcsv($file, ['ID','Section Name','Module','Status','Sort Order','Created At','Updated At']);
                foreach ($sections as $s) {
                    fputcsv($file, [
                        $s->id,
                        $s->section_name,
                        optional($s->module)->module_name,
                        $s->status ? '1' : '0',
                        $s->sort_order ?? 0,
                        $s->created_at ? $s->created_at->format('Y-m-d H:i:s') : '',
                        $s->updated_at ? $s->updated_at->format('Y-m-d H:i:s') : '',
                    ]);
                }
                fclose($file);
            };

            return response()->stream($callback, 200, $headers);
        } catch (\Exception $e) {
            \Log::error('Sections CSV export failed: '.$e->getMessage());
            return redirect()->back()->with('error', 'Failed to export sections.');
        }
    }
}



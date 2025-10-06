<?php

namespace App\Http\Controllers\system;

use App\Http\Controllers\Controller;
use App\Models\Module;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ModuleController extends Controller
{
    /**
     * Get validation rules for module
     */
    private function getValidationRules($moduleId = null): array
    {
        return [
            'module_name' => [
                'required',
                'string',
                'min:2',
                'max:100',
                'regex:/^[a-zA-Z0-9\s\-\_\.]+$/',
                Rule::unique('modules')->ignore($moduleId),
            ],
            'folder_name' => [
                'required',
                'string',
                'min:2',
                'max:50',
                'regex:/^[a-zA-Z0-9\-\_]+$/',
                Rule::unique('modules')->ignore($moduleId),
            ],
            'image' => [
                'sometimes',
                'nullable',
                'image',
                'mimes:jpeg,jpg,png,gif,webp',
                'max:2048',
                'dimensions:min_width=100,min_height=100,max_width=2000,max_height=2000'
            ],
            'status' => [
                'sometimes',
                'boolean'
            ],
            'sort_order' => [
                'sometimes',
                'integer',
                'min:0',
                'max:9999'
            ]
        ];
    }

    /**
     * Get custom validation messages
     */
    private function getValidationMessages(): array
    {
        return [
            'module_name.required' => 'Module name is required and cannot be empty.',
            'module_name.min' => 'Module name must be at least 2 characters long.',
            'module_name.max' => 'Module name cannot exceed 100 characters.',
            'module_name.unique' => 'This module name is already taken. Please choose a different name.',
            'module_name.regex' => 'Module name can only contain letters, numbers, spaces, hyphens, underscores, and dots.',
            
            'folder_name.required' => 'Folder name is required and cannot be empty.',
            'folder_name.min' => 'Folder name must be at least 2 characters long.',
            'folder_name.max' => 'Folder name cannot exceed 50 characters.',
            'folder_name.unique' => 'This folder name is already taken. Please choose a different name.',
            'folder_name.regex' => 'Folder name can only contain letters, numbers, hyphens, and underscores.',
            
            'image.image' => 'The file must be a valid image.',
            'image.mimes' => 'Image must be a JPEG, JPG, PNG, GIF, or WebP file.',
            'image.max' => 'Image size cannot exceed 2MB.',
            'image.dimensions' => 'Image dimensions must be between 100x100 and 2000x2000 pixels.',

            'status.boolean' => 'Status must be either 1 or 0.',
            
            'sort_order.integer' => 'Sort order must be a valid number.',
            'sort_order.min' => 'Sort order cannot be negative.',
            'sort_order.max' => 'Sort order cannot exceed 9999.',
      
        ];
    }

    /**
     * Get custom attribute names
     */
    private function getValidationAttributes(): array
    {
        return [
            'module_name' => 'module name',
            'folder_name' => 'folder name',
            'image' => 'module image',
            'status' => 'status',
            'sort_order' => 'sort order',
        
        ];
    }

    /**
     * Prepare data for validation
     */
    private function prepareDataForValidation(Request $request): array
    {
        $data = $request->all();
        
        // Clean up the data
        $data['module_name'] = trim($data['module_name'] ?? '');
        $data['folder_name'] = trim($data['folder_name'] ?? '');
        $data['status'] = filter_var($data['status'] ?? true, FILTER_VALIDATE_BOOLEAN);
        $data['sort_order'] = intval($data['sort_order'] ?? 0);

        // Convert folder_name to lowercase and replace spaces with underscores
        if (!empty($data['folder_name'])) {
            $data['folder_name'] = strtolower(str_replace([' ', '-'], '_', $data['folder_name']));
        }

        return $data;
    }

    /**
     * Validate request data
     */
    private function validateModuleData(Request $request, $moduleId = null): array
    {
        $data = $this->prepareDataForValidation($request);
        
        return $request->validate(
            $this->getValidationRules($moduleId),
            $this->getValidationMessages(),
            $this->getValidationAttributes()
        );
    }

    /**
     * Display a listing of modules
     */
    public function index(Request $request)
    {
        $query = Module::query();

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('module_name', 'like', "%{$search}%")
                  ->orWhere('folder_name', 'like', "%{$search}%");
            });
        }

        // Status filter
        if ($request->filled('status')) {
            $query->where('status', $request->get('status'));
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'id');
        $sortDirection = $request->get('sort_direction', 'desc');
        $allowedSorts = ['id', 'module_name', 'folder_name', 'status', 'created_at', 'updated_at', 'sort_order'];
        
        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDirection);
        } else {
            $query->orderBy('id', 'desc');
        }

        // Pagination
        $perPage = min($request->get('per_page', 25), 100); // Limit max per page
        $modules = $query->paginate($perPage);

        // Add image URLs to modules
        $modules->getCollection()->transform(function ($module) {
            if ($module->image) {
                $module->image_url = Storage::disk('public')->url($module->image);
            } else {
                // Generate placeholder image URL based on module name
                $initials = strtoupper(substr($module->module_name, 0, 2));
                $colors = ['3B82F6', '10B981', '8B5CF6', 'F59E0B', 'EF4444', '06B6D4'];
                $color = $colors[strlen($module->module_name) % count($colors)];
                $module->image_url = "https://via.placeholder.com/80x60/{$color}/ffffff?text={$initials}";
            }
            return $module;
        });

        return Inertia::render('system/AddModules/List', [
            'modules' => $modules,
            'filters' => $request->only(['search', 'status', 'sort_by', 'sort_direction', 'per_page']),
            'pageTitle' => 'Modules',
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ]
        ]);
    }

    /**
     * Show the form for creating a new module
     */
    public function create()
    {
        return Inertia::render('system/AddModules/add');
    }

    /**
     * Store a newly created module
     */
    public function store(Request $request)
    {
        try {
            $validated = $this->validateModuleData($request);

            // Handle image upload
            if ($request->hasFile('image')) {
                $image = $request->file('image');
                $filename = time() . '_' . Str::slug($validated['module_name']) . '.' . $image->getClientOriginalExtension();
                $imagePath = $image->storeAs('modules', $filename, 'public');
                $validated['image'] = $imagePath;
            }

            // Set sort order if not provided
            if (!isset($validated['sort_order']) || $validated['sort_order'] === 0) {
                $maxSortOrder = Module::max('sort_order') ?? 0;
                $validated['sort_order'] = $maxSortOrder + 1;
            }

            // Create the module
            $module = Module::create($validated);

            return redirect()->route('system.add_modules')
                           ->with('success', 'Module "' . $module->module_name . '" created successfully!');

        } catch (\Illuminate\Validation\ValidationException $e) {
            return redirect()->back()
                           ->withErrors($e->errors())
                           ->withInput()
                           ->with('error', 'Please correct the errors below and try again.');
        } catch (\Exception $e) {
            \Log::error('Module creation failed: ' . $e->getMessage(), [
                'request_data' => $request->all(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return redirect()->back()
                           ->withInput()
                           ->with('error', 'Failed to create module. Please try again or contact support.');
        }
    }

    /**
     * Display the specified module
     */
    public function show(Module $module)
    {
        // Add image URL
        if ($module->image) {
            $module->image_url = Storage::disk('public')->url($module->image);
        }

        return Inertia::render('system/AddModules/show', [
            'module' => $module
        ]);
    }

    /**
     * Show the form for editing the specified module
     */
    public function edit(Module $module)
    {
        // Add image URL
        if ($module->image) {
            $module->image_url = Storage::disk('public')->url($module->image);
        }

        return Inertia::render('system/AddModules/edit', [
            'module' => $module
        ]);
    }

    /**
     * Update the specified module
     */
    public function update(Request $request, Module $module)
    {
        try {
            $validated = $this->validateModuleData($request, $module->id);

            // Handle image upload
            if ($request->hasFile('image')) {
                // Delete old image if exists
                if ($module->image && Storage::disk('public')->exists($module->image)) {
                    Storage::disk('public')->delete($module->image);
                }

                $image = $request->file('image');
                $filename = time() . '_' . Str::slug($validated['module_name']) . '.' . $image->getClientOriginalExtension();
                $imagePath = $image->storeAs('modules', $filename, 'public');
                $validated['image'] = $imagePath;
            }

            // Update the module
            $module->update($validated);

            return redirect()->route('system.add_modules')
                           ->with('success', 'Module "' . $module->module_name . '" updated successfully!');

        } catch (\Illuminate\Validation\ValidationException $e) {
            return redirect()->back()
                           ->withErrors($e->errors())
                           ->withInput()
                           ->with('error', 'Please correct the errors below and try again.');
        } catch (\Exception $e) {
            \Log::error('Module update failed: ' . $e->getMessage(), [
                'module_id' => $module->id,
                'request_data' => $request->all(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return redirect()->back()
                           ->withInput()
                           ->with('error', 'Failed to update module. Please try again or contact support.');
        }
    }

    /**
     * Remove the specified module
     */
    public function destroy(Module $module)
    {
        try {
            $moduleName = $module->module_name;
            
            // Delete associated image
            if ($module->image && Storage::disk('public')->exists($module->image)) {
                Storage::disk('public')->delete($module->image);
            }

            $module->delete();

            return redirect()->route('system.add_modules')
                           ->with('success', 'Module "' . $moduleName . '" deleted successfully!');

        } catch (\Exception $e) {
            \Log::error('Module deletion failed: ' . $e->getMessage(), [
                'module_id' => $module->id,
                'trace' => $e->getTraceAsString()
            ]);
            
            return redirect()->back()
                           ->with('error', 'Failed to delete module. Please try again or contact support.');
        }
    }

   /**
 * Bulk update status - FIXED VERSION
 */
public function bulkUpdateStatus(Request $request)
{
    $request->validate([
        'ids' => 'required|array|min:1',
        'ids.*' => 'exists:modules,id',
        'status' => 'required|boolean'
    ]);

    try {
        $count = Module::whereIn('id', $request->ids)
                      ->update(['status' => $request->status]);

        $action = $request->status ? 'activated' : 'deactivated';

        // Return redirect for Inertia instead of JSON
        return redirect()->back()->with('success', "{$count} module(s) {$action} successfully!");

    } catch (\Exception $e) {
        \Log::error('Bulk status update failed: ' . $e->getMessage());
        
        return redirect()->back()->with('error', 'Failed to update module status. Please try again.');
    }
}

    /**
 * Bulk delete modules - FIXED VERSION
 */
public function bulkDestroy(Request $request)
{
    $request->validate([
        'ids' => 'required|array|min:1',
        'ids.*' => 'exists:modules,id'
    ]);

    try {
        $modules = Module::whereIn('id', $request->ids)->get();
        
        // Delete images
        foreach ($modules as $module) {
            if ($module->image && Storage::disk('public')->exists($module->image)) {
                Storage::disk('public')->delete($module->image);
            }
        }

        $count = Module::whereIn('id', $request->ids)->delete();

        // Return redirect for Inertia instead of JSON
        return redirect()->back()->with('success', "{$count} module(s) deleted successfully!");

    } catch (\Exception $e) {
        \Log::error('Bulk delete failed: ' . $e->getMessage());
        
        return redirect()->back()->with('error', 'Failed to delete modules. Please try again.');
    }
}

    /**
     * Update sort order
     */
    public function updateSortOrder(Request $request)
    {
        $request->validate([
            'modules' => 'required|array',
            'modules.*.id' => 'required|exists:modules,id',
            'modules.*.sort_order' => 'required|integer|min:0'
        ]);

        try {
            foreach ($request->modules as $moduleData) {
                Module::where('id', $moduleData['id'])
                      ->update(['sort_order' => $moduleData['sort_order']]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Module order updated successfully!'
            ]);

        } catch (\Exception $e) {
            \Log::error('Sort order update failed: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to update module order. Please try again.'
            ], 500);
        }
    }

    /**
     * Get active modules for dropdown/select
     */
    public function getActiveModules()
    {
        $modules = Module::where('status', true)
                        ->orderBy('sort_order', 'asc')
                        ->orderBy('module_name', 'asc')
                        ->select('id', 'module_name', 'folder_name', 'image')
                        ->get()
                        ->map(function ($module) {
                            if ($module->image) {
                                $module->image_url = Storage::disk('public')->url($module->image);
                            }
                            return $module;
                        });

        return response()->json([
            'success' => true,
            'data' => ['modules' => $modules]
        ]);
    }

    /**
     * Get single module data (API endpoint)
     */
    public function getSingleModule($id)
    {
        try {
            $module = Module::findOrFail($id);
            
            if ($module->image) {
                $module->image_url = Storage::disk('public')->url($module->image);
            }
            
            return response()->json([
                'success' => true,
                'data' => ['module' => $module]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Module not found.'
            ], 404);
        }
    }

    /**
 * Export modules to CSV - FIXED VERSION
 */
public function exportCsv(Request $request)
{
    try {
        $query = Module::query();

        // Apply same filters as index method
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('module_name', 'like', "%{$search}%")
                  ->orWhere('folder_name', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->get('status'));
        }

        $modules = $query->get();
        
        $filename = 'modules_export_' . date('Y-m-d_H-i-s') . '.csv';
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        $callback = function() use ($modules) {
            $file = fopen('php://output', 'w');
            
            // Add BOM for Excel compatibility
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));
            
            // CSV Headers
            fputcsv($file, [
                'ID', 
                'Module Name', 
                'Folder Name', 
                'Status', 
                'Sort Order', 
                'Created At', 
                'Updated At'
            ]);

            // CSV Data
            foreach ($modules as $module) {
                fputcsv($file, [
                    $module->id,
                    $module->module_name,
                    $module->folder_name,
                    $module->status ? '1' : '0',
                    $module->sort_order ?? 0,
                    $module->created_at ? $module->created_at->format('Y-m-d H:i:s') : '',
                    $module->updated_at ? $module->updated_at->format('Y-m-d H:i:s') : '',
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
        
    } catch (\Exception $e) {
        \Log::error('CSV export failed: ' . $e->getMessage());
        return redirect()->back()->with('error', 'Failed to export modules. Please try again.');
    }
}

/**
 * Get current module data based on URL
 */
public function getCurrentModuleData(Request $request)
{
    try {
        $url = $request->get('url', '');
        
        // Parse URL to extract module name
        $path = parse_url($url, PHP_URL_PATH);
        $pathSegments = explode('/', trim($path, '/'));
        
        // Check if this is a module-specific URL (e.g., /accounting/dashboard, /inventory/items)
        $moduleName = null;
        if (count($pathSegments) >= 1 && $pathSegments[0] !== 'system' && $pathSegments[0] !== 'dashboard' && $pathSegments[0] !== 'erp-modules') {
            $moduleName = $pathSegments[0];
        }
        
        if (!$moduleName) {
            return response()->json([
                'success' => false,
                'message' => 'No module detected in URL',
                'data' => null
            ]);
        }
        
        // Get module data
        $module = Module::where('folder_name', $moduleName)
            ->where('status', true)
            ->first();
            
        if (!$module) {
            return response()->json([
                'success' => false,
                'message' => 'Module not found',
                'data' => null
            ]);
        }
        
        // Get sections and menus for this module
        $sections = $module->sections()
            ->where('status', true)
            ->orderBy('sort_order')
            ->with(['menus' => function ($q) {
                $q->where('status', true)
                  ->orderBy('sort_order')
                  ->select('id', 'section_id', 'menu_name', 'route', 'icon', 'sort_order', 'status');
            }])
            ->get(['id', 'module_id', 'section_name', 'slug', 'sort_order']);
        
        return response()->json([
            'success' => true,
            'data' => [
                'module' => [
                    'id' => $module->id,
                    'name' => $module->module_name,
                    'folder_name' => $module->folder_name,
                ],
                'sections' => $sections,
            ]
        ]);
        
    } catch (\Exception $e) {
        \Log::error('Get current module data failed: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Failed to get module data',
            'data' => null
        ], 500);
    }
}
}
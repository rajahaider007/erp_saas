<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $currentModule = $request->session()->get('current_module');
        
        if (!$currentModule) {
            return redirect()->route('modules.index');
        }

        // Get sections and menus for current module
        $sections = DB::table('sections')
            ->where('module_id', $currentModule['id'])
            ->where('status', true)
            ->orderBy('sort_order')
            ->get();

        // Get menus for each section
        $sectionsWithMenus = $sections->map(function ($section) {
            $menus = DB::table('menus')
                ->where('section_id', $section->id)
                ->where('status', true)
                ->orderBy('sort_order')
                ->get();

            $section->menus = $menus;
            return $section;
        });

        return Inertia::render('Dashboard', [
            'currentModule' => $currentModule,
            'sections' => $sectionsWithMenus
        ]);
    }

    public function systemDashboard(Request $request)
    {
        // Get system module info
        $moduleData = DB::table('modules')
            ->where('folder_name', 'system')
            ->where('status', true)
            ->first();

        if (!$moduleData) {
            return redirect()->route('modules.index')
                ->with('error', 'System module not found.');
        }

        // Get system module's sections with their menus
        $sections = DB::table('sections')
            ->where('module_id', $moduleData->id)
            ->where('status', true)
            ->orderBy('sort_order', 'asc')
            ->get();

        // Get all menus for system module
        $menus = DB::table('menus')
            ->join('sections', 'menus.section_id', '=', 'sections.id')
            ->where('sections.module_id', $moduleData->id)
            ->where('menus.status', true)
            ->orderBy('sections.sort_order')
            ->orderBy('menus.sort_order')
            ->get();

        // Group menus by section
        $sectionsWithMenus = $sections->map(function ($section) use ($menus) {
            $section->menus = $menus->where('section_id', $section->id)->values();
            return $section;
        });

        return Inertia::render('Modules/System/Dashboard', [
            'module' => $moduleData,
            'sections' => $sectionsWithMenus
        ]);
    }

    public function moduleDashboard(Request $request, $module)
    {
        // Get module info from database
        $moduleData = DB::table('modules')
            ->where('folder_name', $module)
            ->where('status', true)
            ->first();

        if (!$moduleData) {
            return redirect()->route('modules.index')
                ->with('error', 'Module not found.');
        }

        // Get module's sections with their menus
        $sections = DB::table('sections')
            ->where('module_id', $moduleData->id)
            ->where('status', true)
            ->orderBy('sort_order', 'asc')
            ->get();

        // Get all menus for this module
        $menus = DB::table('menus')
            ->join('sections', 'menus.section_id', '=', 'sections.id')
            ->where('sections.module_id', $moduleData->id)
            ->where('menus.status', true)
            ->orderBy('sections.sort_order')
            ->orderBy('menus.sort_order')
            ->get();

        // Group menus by section
        $sectionsWithMenus = $sections->map(function ($section) use ($menus) {
            $section->menus = $menus->where('section_id', $section->id)->values();
            return $section;
        });

        return Inertia::render('Modules/Dynamic/index', [
            'module' => $moduleData,
            'sections' => $sectionsWithMenus
        ]);
    }
}

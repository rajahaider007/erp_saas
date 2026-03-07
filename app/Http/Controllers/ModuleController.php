<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ModuleController extends Controller
{
    public function setCurrentModule(Request $request)
    {
        $request->validate([
            'module_id' => 'required|exists:modules,id'
        ]);

        $module = DB::table('modules')->where('id', $request->module_id)->first();
        if (!$module) {
            if ($request->header('X-Inertia')) {
                return back()->withErrors(['module_id' => 'Module not found']);
            }
            return response()->json(['success' => false, 'message' => 'Module not found'], 404);
        }

        // Store in session
        $request->session()->put('current_module', [
            'id' => $module->id,
            'name' => $module->module_name,
            'folder_name' => $module->folder_name,
            'slug' => $module->slug,
            'image' => $module->image
        ]);

        // Inertia requests: redirect so client follows (avoids 419 / CSRF issues with fetch)
        $moduleRoute = '/' . ltrim($module->folder_name, '/') . '/dashboard';
        return redirect()->to($moduleRoute);
    }
}

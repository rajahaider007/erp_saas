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
            return response()->json(['success' => false, 'message' => 'Module not found']);
        }

        // Store in session
        $request->session()->put('current_module', [
            'id' => $module->id,
            'name' => $module->name,
            'folder_name' => $module->folder_name,
            'icon' => $module->icon,
            'description' => $module->description
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Module set successfully',
            'module' => $module
        ]);
    }
}

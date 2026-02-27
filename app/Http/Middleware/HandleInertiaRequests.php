<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use App\Models\Currency;
use App\Helpers\FiscalYearHelper;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        // Get user from custom authentication system
        $user = null;
        $userId = $request->session()->get('user_id');
        
        if ($userId) {
            $user = \App\Models\User::where('id', $userId)->where('status', 'active')->first();
        }
        
        // If no user is authenticated, return minimal shared data
        if (!$user) {
            return [
                ...parent::share($request),
                'auth' => [
                    'user' => null,
                ],
                'userRights' => [],
                'availableMenus' => [],
                'availableModules' => [],
                'company' => null,
                'currencies' => [],
            ];
        }
        
        $userRights = [];
        $availableMenus = [];
        $availableModules = [];
        $company = null;
        
        

        if ($user) {
            // Get user rights
            $userRights = DB::table('user_rights')
                ->where('user_id', $user->id)
                ->get()
                ->map(function ($right) {
                    return [
                        'menu_id' => $right->menu_id,
                        'can_view' => (bool) $right->can_view,
                        'can_add' => (bool) $right->can_add,
                        'can_edit' => (bool) $right->can_edit,
                        'can_delete' => (bool) $right->can_delete,
                    ];
                })
                ->toArray();
                
            // Get company data
            if ($user->comp_id) {
                $company = DB::table('companies')
                    ->where('id', $user->comp_id)
                    ->first();
            }

            // Get available modules for the user's company
            if ($user->comp_id) {
                // For super admin, get all modules
                if ($user->role === 'super_admin') {
                    $availableModules = DB::table('modules')
                        ->where('status', true)
                        ->orderBy('sort_order', 'asc')
                        ->orderBy('module_name', 'asc')
                        ->get()
                        ->map(function ($module) {
                            return [
                                'id' => $module->id,
                                'module_name' => $module->module_name,
                                'folder_name' => $module->folder_name,
                                'slug' => $module->slug,
                                'image' => $module->image,
                                'status' => $module->status,
                                'sort_order' => $module->sort_order,
                                'created_at' => $module->created_at,
                                'updated_at' => $module->updated_at,
                            ];
                        })
                        ->toArray();
                } else {
                    // For other users, get modules through package system
                    $availableModules = DB::table('modules')
                        ->join('package_modules', 'modules.id', '=', 'package_modules.module_id')
                        ->join('packages', 'package_modules.package_id', '=', 'packages.id')
                        ->join('companies', 'packages.id', '=', 'companies.package_id')
                        ->where('companies.id', $user->comp_id)
                        ->where('modules.status', true)
                        ->select('modules.*')
                        ->orderBy('modules.sort_order', 'asc')
                        ->orderBy('modules.module_name', 'asc')
                        ->get()
                        ->map(function ($module) {
                            return [
                                'id' => $module->id,
                                'module_name' => $module->module_name,
                                'folder_name' => $module->folder_name,
                                'slug' => $module->slug,
                                'image' => $module->image,
                                'status' => $module->status,
                                'sort_order' => $module->sort_order,
                                'created_at' => $module->created_at,
                                'updated_at' => $module->updated_at,
                            ];
                        })
                        ->toArray();
                }
            }

            // Get available menus for the user's company
            if ($user->comp_id) {
                // For super admin, get all menus
                if ($user->role === 'super_admin') {
                    $availableMenus = DB::table('menus')
                        ->join('sections', 'menus.section_id', '=', 'sections.id')
                        ->join('modules', 'sections.module_id', '=', 'modules.id')
                        ->where('menus.status', true)
                        ->where('sections.status', true)
                        ->where('modules.status', true)
                        ->select('menus.*', 'sections.section_name', 'sections.module_id', 'modules.module_name', 'modules.folder_name')
                        ->get()
                        ->map(function ($menu) {
                            return [
                                'id' => $menu->id,
                                'menu_name' => $menu->menu_name,
                                'route' => $menu->route,
                                'icon' => $menu->icon,
                                'section_name' => $menu->section_name,
                                'module_id' => $menu->module_id,
                                'module_name' => $menu->module_name,
                                'folder_name' => $menu->folder_name,
                            ];
                        })
                        ->toArray();
                } else {
                    // For other users, use package system
                    $availableMenus = DB::table('menus')
                        ->join('sections', 'menus.section_id', '=', 'sections.id')
                        ->join('modules', 'sections.module_id', '=', 'modules.id')
                        ->join('package_modules', 'modules.id', '=', 'package_modules.module_id')
                        ->join('packages', 'package_modules.package_id', '=', 'packages.id')
                        ->join('companies', 'packages.id', '=', 'companies.package_id')
                        ->where('companies.id', $user->comp_id)
                        ->where('menus.status', true)
                        ->where('sections.status', true)
                        ->where('modules.status', true)
                        ->select('menus.*', 'sections.section_name', 'sections.module_id', 'modules.module_name', 'modules.folder_name')
                        ->get()
                        ->map(function ($menu) {
                            return [
                                'id' => $menu->id,
                                'menu_name' => $menu->menu_name,
                                'route' => $menu->route,
                                'icon' => $menu->icon,
                                'section_name' => $menu->section_name,
                                'module_id' => $menu->module_id,
                                'module_name' => $menu->module_name,
                                'folder_name' => $menu->folder_name,
                            ];
                        })
                        ->toArray();
                }
            }
        }


        // Get active currencies for dropdowns
        $currencies = Cache::remember('active_currencies', 3600, function () {
            return Currency::active()
                ->ordered()
                ->get()
                ->map(function ($currency) {
                    return [
                        'value' => $currency->code,
                        'label' => "{$currency->name} ({$currency->code})",
                        'symbol' => $currency->symbol,
                        'exchange_rate' => $currency->exchange_rate,
                        'country' => $currency->country
                    ];
                })
                ->toArray();
        });


        $sharedData = [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
            ],
            'userRights' => $userRights,
            'availableMenus' => $availableMenus,
            'availableModules' => $availableModules,
            'company' => $company,
            'currencies' => $currencies,
        ];

        // Add fiscal year if user has a company
        if ($user && $user->comp_id) {
            $sharedData['fiscalYear'] = FiscalYearHelper::getCurrentFiscalYear($user->comp_id);
        }
        
        return $sharedData;
    }
}

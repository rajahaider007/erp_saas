<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

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
        $user = $request->user();
        
        $userRights = [];
        $availableMenus = [];
        
        

        if ($user) {
            // Get user rights
            $userRights = \DB::table('user_rights')
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

            // Get available menus for the user's company
            if ($user->comp_id) {
                // For super admin, get all menus
                if ($user->role === 'super_admin') {
                    $availableMenus = \DB::table('menus')
                        ->where('status', true)
                        ->get()
                        ->map(function ($menu) {
                            return [
                                'id' => $menu->id,
                                'menu_name' => $menu->menu_name,
                                'route' => $menu->route,
                                'icon' => $menu->icon,
                            ];
                        })
                        ->toArray();
                } else {
                    // For other users, use package system
                    $availableMenus = \DB::table('menus')
                        ->join('sections', 'menus.section_id', '=', 'sections.id')
                        ->join('modules', 'sections.module_id', '=', 'modules.id')
                        ->join('package_modules', 'modules.id', '=', 'package_modules.module_id')
                        ->join('packages', 'package_modules.package_id', '=', 'packages.id')
                        ->join('companies', 'packages.id', '=', 'companies.package_id')
                        ->where('companies.id', $user->comp_id)
                        ->where('menus.status', true)
                        ->select('menus.*')
                        ->get()
                        ->map(function ($menu) {
                            return [
                                'id' => $menu->id,
                                'menu_name' => $menu->menu_name,
                                'route' => $menu->route,
                                'icon' => $menu->icon,
                            ];
                        })
                        ->toArray();
                }
            }
        }


        $sharedData = [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
            ],
            'userRights' => $userRights,
            'availableMenus' => $availableMenus,
        ];
        
        
        return $sharedData;
    }
}

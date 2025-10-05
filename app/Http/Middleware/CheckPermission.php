<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CheckPermission
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string  $permission
     * @param  string|null  $menuRoute
     * @return mixed
     */
    public function handle(Request $request, Closure $next, string $permission = 'can_view', string $menuRoute = null)
    {
        $user = $request->user();
        
        if (!$user) {
            return redirect()->route('login')->with('error', 'Please log in to access this resource.');
        }

        // Super admin bypass
        if ($user->role === 'super_admin') {
            return $next($request);
        }

        // Get the menu ID from route or parameter
        $menuId = $this->getMenuId($request, $menuRoute);
        
        if (!$menuId) {
            return redirect()->route('dashboard')->with('error', 'Access denied: Invalid resource.');
        }

        // Check user permission
        $hasPermission = $this->checkUserPermission($user->id, $menuId, $permission);
        
        if (!$hasPermission) {
            return redirect()->route('dashboard')->with('error', 'You do not have permission to perform this action. Please contact your administrator.');
        }

        return $next($request);
    }

    /**
     * Get menu ID from request
     */
    private function getMenuId(Request $request, ?string $menuRoute = null)
    {
        // If menu route is provided, use it
        if ($menuRoute) {
            $menu = DB::table('menus')->where('route', $menuRoute)->first();
            return $menu ? $menu->id : null;
        }

        // Try to get from current route name
        $currentRoute = $request->route()->getName();
        if ($currentRoute) {
            $menu = DB::table('menus')->where('route_name', $currentRoute)->first();
            if ($menu) {
                return $menu->id;
            }
        }

        // Try to get from URL path
        $path = $request->path();
        $menu = DB::table('menus')->where('route', '/' . $path)->first();
        if ($menu) {
            return $menu->id;
        }

        // Try to get from URL path without leading slash
        $menu = DB::table('menus')->where('route', $path)->first();
        if ($menu) {
            return $menu->id;
        }

        return null;
    }

    /**
     * Check if user has specific permission for a menu
     */
    private function checkUserPermission(int $userId, int $menuId, string $permission): bool
    {
        $right = DB::table('user_rights')
            ->where('user_id', $userId)
            ->where('menu_id', $menuId)
            ->first();

        if (!$right) {
            return false;
        }

        return (bool) $right->$permission;
    }
}

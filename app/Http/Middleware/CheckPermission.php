<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Menu;
use App\Models\UserRight;
use Illuminate\Support\Facades\Auth;

class CheckPermission
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string  $permission  The permission to check (can_view, can_add, can_edit, can_delete)
     * @param  string  $routeName   The route name to check against menu
     * @return mixed
     */
    public function handle(Request $request, Closure $next, string $permission = 'can_view', string $routeName = null)
    {
        // Get the current user
        $userId = $request->input('user_id') ?? Auth::id();
        
        if (!$userId) {
            return response()->json([
                'success' => false,
                'message' => 'Authentication required.',
                'error' => 'Unauthorized'
            ], 401);
        }

        // Get user from database
        $user = User::find($userId);
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found.',
                'error' => 'User not found'
            ], 404);
        }

        // Get route name from request if not provided
        if (!$routeName) {
            $routeName = $request->route()->getName();
        }

        // Find menu by route name
        $menu = Menu::where('route', $routeName)->first();
        
        if (!$menu) {
            // If no menu found, allow access (for routes not in menu system)
            return $next($request);
        }

        // Check user rights for this menu
        $userRight = UserRight::where('user_id', $userId)
            ->where('menu_id', $menu->id)
            ->first();

        if (!$userRight) {
            return response()->json([
                'success' => false,
                'message' => "You don't have permission to access this feature. Please contact your administrator.",
                'error' => 'Access Denied'
            ], 403);
        }

        // Check specific permission
        if (!$userRight->$permission) {
            $action = match($permission) {
                'can_view' => 'view',
                'can_add' => 'create',
                'can_edit' => 'edit/update',
                'can_delete' => 'delete',
                default => 'access'
            };
            
            return response()->json([
                'success' => false,
                'message' => "You don't have permission to {$action} records. Please contact your administrator.",
                'error' => 'Access Denied'
            ], 403);
        }

        return $next($request);
    }
}
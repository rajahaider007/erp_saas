<?php

namespace App\Http\Traits;

use App\Models\User;
use App\Models\Menu;
use Illuminate\Http\Request;

trait CheckUserPermissions
{
    /**
     * Check if current user has permission for a specific menu and action
     */
    protected function checkPermission(Request $request, ?string $menuRouteName = null, string $permission = 'can_view'): bool
    {
        $userId = $request->input('user_id');
        
        if (!$userId) {
            return false;
        }

        $user = User::find($userId);
        if (!$user) {
            return false;
        }

        // Use provided route name or get from current request
        $routeName = $menuRouteName ?? $request->route()->getName();
        
        if (!$routeName) {
            // If no route name, allow access
            return true;
        }

        // Find menu by route name
        $menu = Menu::where('route', $routeName)->first();
        if (!$menu) {
            // If menu not found, allow access (for routes not in menu system)
            return true;
        }

        return $user->hasPermission($menu->id, $permission);
    }

    /**
     * Abort with 403 if user doesn't have permission
     */
    protected function requirePermission(Request $request, ?string $menuRouteName = null, string $permission = 'can_view'): void
    {
        if (!$this->checkPermission($request, $menuRouteName, $permission)) {
            $action = match($permission) {
                'can_view' => 'view',
                'can_add' => 'create',
                'can_edit' => 'edit/update',
                'can_delete' => 'delete',
                default => 'access'
            };
            
            abort(403, "You don't have permission to {$action} records. Please contact your administrator.");
        }
    }

    /**
     * Get current user from request
     */
    protected function getCurrentUser(Request $request): ?User
    {
        $userId = $request->input('user_id');
        return $userId ? User::find($userId) : null;
    }
}

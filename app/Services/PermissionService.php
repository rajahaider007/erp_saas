<?php

namespace App\Services;

use App\Models\Company;
use App\Models\User;
use App\Models\Menu;

class PermissionService
{
    /**
     * Check if user has access to a specific feature
     */
    public static function userHasAccess(User $user, string $feature, string $permission = 'can_view'): bool
    {
        if (!$user->comp_id) {
            return false;
        }

        $company = Company::with('package')->find($user->comp_id);
        
        if (!$company) {
            return false;
        }

        // Get menu by feature name (could be route name, menu name, or slug)
        $menu = Menu::where('route', $feature)
            ->orWhere('menu_name', $feature)
            ->orWhere('slug', $feature)
            ->first();

        if (!$menu) {
            return false;
        }

        return $company->userHasAccessToFeature($user->id, $menu->id, $permission);
    }

    /**
     * Get user's accessible menus
     */
    public static function getUserAccessibleMenus(User $user): \Illuminate\Database\Eloquent\Collection
    {
        if (!$user->comp_id) {
            return collect();
        }

        $company = Company::with('package')->find($user->comp_id);
        
        if (!$company) {
            return collect();
        }

        return $company->getAccessibleMenusForUser($user->id);
    }

    /**
     * Check if user has any of the specified roles
     */
    public static function userHasAnyRole(User $user, array $roles): bool
    {
        return in_array($user->role, $roles);
    }

    /**
     * Check if user has a specific role
     */
    public static function userHasRole(User $user, string $role): bool
    {
        return $user->role === $role;
    }

    /**
     * Get user's effective permissions based on their rights and company package
     */
    public static function getUserEffectivePermissions(User $user): array
    {
        if (!$user->comp_id) {
            return [];
        }

        $company = Company::with('package')->find($user->comp_id);
        
        if (!$company || !$company->hasValidLicense()) {
            return [];
        }

        // Get package features
        $packageFeatures = [];
        if ($company->package) {
            $packageFeatures = $company->package->features()
                ->where('is_enabled', true)
                ->with('menu')
                ->get()
                ->pluck('menu.route')
                ->filter()
                ->toArray();
        }

        // Get user's accessible menus (where they have view permission)
        $userMenuIds = $user->rights()
            ->where('can_view', true)
            ->pluck('menu_id')
            ->toArray();

        $userFeatures = Menu::whereIn('id', $userMenuIds)
            ->pluck('route')
            ->filter()
            ->toArray();

        // Return intersection
        return array_intersect($packageFeatures, $userFeatures);
    }

    /**
     * Get user's permissions for a specific menu
     */
    public static function getUserMenuPermissions(User $user, int $menuId): array
    {
        $right = $user->rights()->where('menu_id', $menuId)->first();
        
        if (!$right) {
            return [
                'can_view' => false,
                'can_add' => false,
                'can_edit' => false,
                'can_delete' => false,
            ];
        }

        return [
            'can_view' => $right->can_view,
            'can_add' => $right->can_add,
            'can_edit' => $right->can_edit,
            'can_delete' => $right->can_delete,
        ];
    }
}

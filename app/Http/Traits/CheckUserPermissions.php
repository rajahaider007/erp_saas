<?php

namespace App\Http\Traits;

use App\Models\Menu;
use App\Models\User;
use App\Services\AuthLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

trait CheckUserPermissions
{
    /**
     * Check if current user has permission for a specific menu and action
     */
    protected function checkPermission(Request $request, ?string $menuRouteName = null, string $permission = 'can_view'): bool
    {
        $routeName = $request->route() ? $request->route()->getName() : null;
        Log::debug('CheckUserPermissions: Starting permission check', [
            'route' => $routeName,
            'menu_route' => $menuRouteName,
            'permission' => $permission,
            'url' => $request->url(),
        ]);

        // Try to get user from Laravel's auth system first, then from request, then from session
        $user = auth()->user();

        if (! $user) {
            $userId = $request->input('user_id') ?? session('user_id');

            if (! $userId) {
                Log::warning('CheckUserPermissions: No authenticated user found', [
                    'request_user_id' => $request->input('user_id'),
                    'session_user_id' => session('user_id'),
                    'route' => $routeName,
                    'auth_check' => auth()->check(),
                ]);

                return false;
            }

            $user = User::find($userId);
            if (! $user) {
                Log::warning('CheckUserPermissions: User not found', ['user_id' => $userId]);

                return false;
            }
        }

        Log::debug('CheckUserPermissions: User found', [
            'user_id' => $user->id,
            'user_role' => $user->role,
            'user_status' => $user->status,
        ]);

        // Use provided route name or get from current request
        $routeName = $menuRouteName ?? ($request->route() ? $request->route()->getName() : null);

        if (! $routeName) {
            Log::warning('CheckUserPermissions: No route name available', [
                'url' => $request->url(),
                'method' => $request->method(),
            ]);

            // If no route name, allow access
            return true;
        }

        // Find menu by route name - try exact match first, then base route
        $menu = Menu::where('route', $routeName)->first();

        // GRN + supplier-invoice landing share two menu rows (same module); allow if user has rights on either.
        if (! $menu && $routeName && str_starts_with($routeName, 'inventory.goods-receipt-note.')) {
            return $this->checkGrnMenusPermission($user, $permission);
        }

        // inventory.master-data.* uses one route name for all masters; menus store list URL /inventory/master-data/{key}
        if (! $menu && $routeName && str_starts_with($routeName, 'inventory.master-data.')) {
            $segments = explode('/', trim($request->path(), '/'));
            if (count($segments) >= 3 && $segments[0] === 'inventory' && $segments[1] === 'master-data') {
                $listPath = '/'.implode('/', array_slice($segments, 0, 3));
                $menu = Menu::where('route', $listPath)->first();
            }
        }

        // If exact match fails, try to find by base route (e.g., system.users.edit -> /system/users)
        if (! $menu && $routeName) {
            $baseRoute = $this->getBaseRouteFromRouteName($routeName);
            if ($baseRoute) {
                $menu = Menu::where('route', $baseRoute)->first();
            }
        }

        if (! $menu) {
            Log::warning('Menu not found for route', [
                'route' => $routeName,
                'base_route' => $this->getBaseRouteFromRouteName($routeName),
                'user_id' => $user->id,
            ]);

            // If menu not found, allow access (for routes not in menu system)
            return true;
        }

        // Super admin bypasses all permission checks
        if ($user->role === 'super_admin') {
            return true;
        }

        $hasPermission = $user->hasPermission($menu->id, $permission);

        Log::debug('CheckUserPermissions: Permission check result', [
            'user_id' => $user->id,
            'route' => $routeName,
            'menu_id' => $menu->id,
            'menu_name' => $menu->menu_name,
            'permission' => $permission,
            'has_permission' => $hasPermission,
            'user_rights_count' => $user->rights()->count(),
        ]);

        if (! $hasPermission) {
            AuthLogger::logPermissionDenied($routeName, $permission, $user->id, [
                'menu_id' => $menu->id,
                'menu_name' => $menu->menu_name,
                'user_role' => $user->role,
            ]);
        }

        return $hasPermission;
    }

    /**
     * Abort with 403 if user doesn't have permission
     */
    protected function requirePermission(Request $request, ?string $menuRouteName = null, string $permission = 'can_view'): void
    {
        $routeName = $request->route() ? $request->route()->getName() : null;
        Log::debug('CheckUserPermissions: requirePermission called', [
            'route' => $routeName,
            'menu_route' => $menuRouteName,
            'permission' => $permission,
            'url' => $request->url(),
        ]);

        if (! $this->checkPermission($request, $menuRouteName, $permission)) {
            $action = match ($permission) {
                'can_view' => 'view',
                'can_add' => 'create',
                'can_edit' => 'edit',
                'can_delete' => 'delete',
                default => 'access'
            };

            $resource = match ($menuRouteName ?? $routeName) {
                'system.users.index' => 'users',
                'system.users.create' => 'users',
                'system.users.edit' => 'users',
                'system.users.update' => 'users',
                'system.users.destroy' => 'users',
                default => 'records'
            };

            Log::error('CheckUserPermissions: Access denied - throwing 403', [
                'route' => $routeName,
                'menu_route' => $menuRouteName,
                'permission' => $permission,
                'action' => $action,
                'resource' => $resource,
                'user_id' => auth()->id() ?? session('user_id'),
                'url' => $request->url(),
            ]);

            abort(403, "You don't have permission to {$action} {$resource}. Please contact your administrator.");
        }

        Log::debug('CheckUserPermissions: Permission granted', [
            'route' => $routeName,
            'permission' => $permission,
        ]);
    }

    /**
     * Get current user from request
     */
    protected function getCurrentUser(Request $request): ?User
    {
        // Try to get user from Laravel's auth system first, then from request, then from session
        $user = auth()->user();

        if (! $user) {
            $userId = $request->input('user_id') ?? session('user_id');

            return $userId ? User::find($userId) : null;
        }

        return $user;
    }

    /**
     * Convert Laravel route name to base route for menu lookup
     */
    private function getBaseRouteFromRouteName(string $routeName): ?string
    {
        // Route name patterns to base route mappings
        $routeMappings = [
            'system.users.index' => '/system/users',
            'system.users.create' => '/system/users',
            'system.users.edit' => '/system/users',
            'system.users.update' => '/system/users',
            'system.users.destroy' => '/system/users',
            'system.users.show' => '/system/users',
            'system.users.rights' => '/system/users',
            'system.users.update-rights' => '/system/users',

            'system.add_modules.index' => '/system/AddModules',
            'system.add_modules.create' => '/system/AddModules',
            'system.add_modules.edit' => '/system/AddModules',
            'system.add_modules.update' => '/system/AddModules',
            'system.add_modules.destroy' => '/system/AddModules',
            'system.add_modules.show' => '/system/AddModules',

            'system.companies.index' => '/system/companies',
            'system.companies.create' => '/system/companies',
            'system.companies.edit' => '/system/companies',
            'system.companies.update' => '/system/companies',
            'system.companies.destroy' => '/system/companies',
            'system.companies.show' => '/system/companies',

            'system.locations.index' => '/system/locations',
            'system.locations.create' => '/system/locations',
            'system.locations.edit' => '/system/locations',
            'system.locations.update' => '/system/locations',
            'system.locations.destroy' => '/system/locations',
            'system.locations.show' => '/system/locations',

            'system.departments.index' => '/system/departments',
            'system.departments.create' => '/system/departments',
            'system.departments.edit' => '/system/departments',
            'system.departments.update' => '/system/departments',
            'system.departments.destroy' => '/system/departments',
            'system.departments.show' => '/system/departments',

            'system.menus.index' => '/system/menus',
            'system.menus.create' => '/system/menus',
            'system.menus.edit' => '/system/menus',
            'system.menus.update' => '/system/menus',
            'system.menus.destroy' => '/system/menus',
            'system.menus.show' => '/system/menus',

            'system.sections.index' => '/system/sections',
            'system.sections.create' => '/system/sections',
            'system.sections.edit' => '/system/sections',
            'system.sections.update' => '/system/sections',
            'system.sections.destroy' => '/system/sections',
            'system.sections.show' => '/system/sections',

            'system.packages.index' => '/system/packages',
            'system.packages.create' => '/system/packages',
            'system.packages.edit' => '/system/packages',
            'system.packages.update' => '/system/packages',
            'system.packages.destroy' => '/system/packages',
            'system.packages.show' => '/system/packages',

            'accounts.chart-of-accounts.index' => '/accounts/chart-of-accounts',
            'accounts.chart-of-accounts.create' => '/accounts/chart-of-accounts',
            'accounts.chart-of-accounts.edit' => '/accounts/chart-of-accounts',
            'accounts.chart-of-accounts.update' => '/accounts/chart-of-accounts',
            'accounts.chart-of-accounts.destroy' => '/accounts/chart-of-accounts',
            'accounts.chart-of-accounts.show' => '/accounts/chart-of-accounts',

            'accounts.journal-voucher.index' => '/accounts/journal-voucher',
            'accounts.journal-voucher.create' => '/accounts/journal-voucher',
            'accounts.journal-voucher.edit' => '/accounts/journal-voucher',
            'accounts.journal-voucher.update' => '/accounts/journal-voucher',
            'accounts.journal-voucher.destroy' => '/accounts/journal-voucher',
            'accounts.journal-voucher.show' => '/accounts/journal-voucher',

            'inventory.item-class-coding.list' => '/inventory/item-class-coding',
            'inventory.item-class-coding.create' => '/inventory/item-class-coding',
            'inventory.item-class-coding.store' => '/inventory/item-class-coding',
            'inventory.item-class-coding.edit' => '/inventory/item-class-coding',
            'inventory.item-class-coding.update' => '/inventory/item-class-coding',
            'inventory.item-class-coding.destroy' => '/inventory/item-class-coding',
            'inventory.item-class-coding.bulk-destroy' => '/inventory/item-class-coding',

            'inventory.item-category-coding.list' => '/inventory/item-category-coding',
            'inventory.item-category-coding.create' => '/inventory/item-category-coding',
            'inventory.item-category-coding.store' => '/inventory/item-category-coding',
            'inventory.item-category-coding.edit' => '/inventory/item-category-coding',
            'inventory.item-category-coding.update' => '/inventory/item-category-coding',
            'inventory.item-category-coding.destroy' => '/inventory/item-category-coding',

            'inventory.item-group-coding.list' => '/inventory/item-group-coding',
            'inventory.item-group-coding.create' => '/inventory/item-group-coding',
            'inventory.item-group-coding.store' => '/inventory/item-group-coding',
            'inventory.item-group-coding.edit' => '/inventory/item-group-coding',
            'inventory.item-group-coding.update' => '/inventory/item-group-coding',
            'inventory.item-group-coding.destroy' => '/inventory/item-group-coding',
            'inventory.item-group-coding.bulk-destroy' => '/inventory/item-group-coding',

            'inventory.item-master.list' => '/inventory/item-master',
            'inventory.item-master.create' => '/inventory/item-master',
            'inventory.item-master.store' => '/inventory/item-master',
            'inventory.item-master.edit' => '/inventory/item-master',
            'inventory.item-master.update' => '/inventory/item-master',
            'inventory.item-master.destroy' => '/inventory/item-master',
            'inventory.item-master.bulk-destroy' => '/inventory/item-master',
            'inventory.item-master.export-csv' => '/inventory/item-master',

            'inventory.uom-master.list' => '/inventory/uom-master',
            'inventory.uom-master.create' => '/inventory/uom-master',
            'inventory.uom-master.store' => '/inventory/uom-master',
            'inventory.uom-master.edit' => '/inventory/uom-master',
            'inventory.uom-master.update' => '/inventory/uom-master',
            'inventory.uom-master.destroy' => '/inventory/uom-master',
            'inventory.uom-master.bulk-destroy' => '/inventory/uom-master',

            'inventory.uom-conversion.list' => '/inventory/uom-conversion',
            'inventory.uom-conversion.create' => '/inventory/uom-conversion',
            'inventory.uom-conversion.store' => '/inventory/uom-conversion',
            'inventory.uom-conversion.edit' => '/inventory/uom-conversion',
            'inventory.uom-conversion.update' => '/inventory/uom-conversion',
            'inventory.uom-conversion.destroy' => '/inventory/uom-conversion',
            'inventory.uom-conversion.bulk-destroy' => '/inventory/uom-conversion',

            'inventory.grn-supplier-invoice.index' => '/inventory/grn-supplier-invoice',
            'inventory.grn-supplier-invoice.create' => '/inventory/grn-supplier-invoice',
            'inventory.grn-supplier-invoice.store' => '/inventory/grn-supplier-invoice',
            'inventory.grn-supplier-invoice.eligible-grns' => '/inventory/grn-supplier-invoice',
            'inventory.grn-supplier-invoice.preview-lines' => '/inventory/grn-supplier-invoice',
            'inventory.grn-supplier-invoice.invoice' => '/inventory/grn-supplier-invoice',
            'inventory.grn-supplier-invoice.edit' => '/inventory/grn-supplier-invoice',
            'inventory.grn-supplier-invoice.update' => '/inventory/grn-supplier-invoice',
            'inventory.grn-supplier-invoice.destroy' => '/inventory/grn-supplier-invoice',
            'inventory.grn-supplier-invoice.post' => '/inventory/grn-supplier-invoice',

            'inventory.reports.index' => '/inventory/reports',
            'inventory.reports.goods-receipt-register' => '/inventory/reports/goods-receipt-register',
            'inventory.reports.goods-receipt-register.report' => '/inventory/reports/goods-receipt-register',
            'inventory.reports.goods-receipt-register.data' => '/inventory/reports/goods-receipt-register',
            'inventory.reports.goods-receipt-register.export.csv' => '/inventory/reports/goods-receipt-register',
            'inventory.reports.goods-receipt-register.export.excel' => '/inventory/reports/goods-receipt-register',
            'inventory.reports.goods-receipt-register.export.pdf' => '/inventory/reports/goods-receipt-register',
            'inventory.reports.goods-receipt-register.print' => '/inventory/reports/goods-receipt-register',
            'inventory.reports.purchase-order-lines' => '/inventory/reports/purchase-order-lines',
            'inventory.reports.purchase-order-lines.report' => '/inventory/reports/purchase-order-lines',
            'inventory.reports.purchase-order-lines.data' => '/inventory/reports/purchase-order-lines',
            'inventory.reports.purchase-order-lines.export.csv' => '/inventory/reports/purchase-order-lines',
            'inventory.reports.purchase-order-lines.export.excel' => '/inventory/reports/purchase-order-lines',
            'inventory.reports.purchase-order-lines.export.pdf' => '/inventory/reports/purchase-order-lines',
            'inventory.reports.purchase-order-lines.print' => '/inventory/reports/purchase-order-lines',
            'inventory.reports.stock-position' => '/inventory/reports/stock-position',
            'inventory.reports.stock-position.report' => '/inventory/reports/stock-position',
            'inventory.reports.stock-position.data' => '/inventory/reports/stock-position',
            'inventory.reports.stock-position.export.csv' => '/inventory/reports/stock-position',
            'inventory.reports.stock-position.export.excel' => '/inventory/reports/stock-position',
            'inventory.reports.grn-po-variance' => '/inventory/reports/grn-po-variance',
            'inventory.reports.grn-po-variance.report' => '/inventory/reports/grn-po-variance',
            'inventory.reports.grn-po-variance.data' => '/inventory/reports/grn-po-variance',
            'inventory.reports.grn-po-variance.export.csv' => '/inventory/reports/grn-po-variance',
            'inventory.reports.grn-po-variance.export.excel' => '/inventory/reports/grn-po-variance',
            'inventory.reports.grn-supplier-invoice-listing' => '/inventory/reports/grn-supplier-invoice-listing',
            'inventory.reports.grn-supplier-invoice-listing.report' => '/inventory/reports/grn-supplier-invoice-listing',
            'inventory.reports.grn-supplier-invoice-listing.data' => '/inventory/reports/grn-supplier-invoice-listing',
            'inventory.reports.grn-supplier-invoice-listing.export.csv' => '/inventory/reports/grn-supplier-invoice-listing',
            'inventory.reports.grn-supplier-invoice-listing.export.excel' => '/inventory/reports/grn-supplier-invoice-listing',
            'inventory.reports.purchase-requisition-lines' => '/inventory/reports/purchase-requisition-lines',
            'inventory.reports.purchase-requisition-lines.report' => '/inventory/reports/purchase-requisition-lines',
            'inventory.reports.purchase-requisition-lines.data' => '/inventory/reports/purchase-requisition-lines',
            'inventory.reports.purchase-requisition-lines.export.csv' => '/inventory/reports/purchase-requisition-lines',
            'inventory.reports.purchase-requisition-lines.export.excel' => '/inventory/reports/purchase-requisition-lines',
            'inventory.reports.pr-to-po-conversion' => '/inventory/reports/pr-to-po-conversion',
            'inventory.reports.pr-to-po-conversion.report' => '/inventory/reports/pr-to-po-conversion',
            'inventory.reports.pr-to-po-conversion.data' => '/inventory/reports/pr-to-po-conversion',
            'inventory.reports.pr-to-po-conversion.export.csv' => '/inventory/reports/pr-to-po-conversion',
            'inventory.reports.pr-to-po-conversion.export.excel' => '/inventory/reports/pr-to-po-conversion',
            'inventory.reports.inventory-movements' => '/inventory/reports/inventory-movements',
            'inventory.reports.inventory-movements.report' => '/inventory/reports/inventory-movements',
            'inventory.reports.inventory-movements.data' => '/inventory/reports/inventory-movements',
            'inventory.reports.inventory-movements.export.csv' => '/inventory/reports/inventory-movements',
            'inventory.reports.inventory-movements.export.excel' => '/inventory/reports/inventory-movements',
        ];

        return $routeMappings[$routeName] ?? null;
    }

    /**
     * GRN routes: user must have rights on the goods receipt menu (supplier invoice is a separate menu).
     */
    private function checkGrnMenusPermission(User $user, string $permission): bool
    {
        if ($user->role === 'super_admin') {
            return true;
        }

        $menu = Menu::query()
            ->whereIn('route', ['/inventory/goods-receipt-note', '/inventory/goods-receipt-note/create'])
            ->orderByRaw("CASE WHEN route = '/inventory/goods-receipt-note' THEN 0 ELSE 1 END")
            ->first();

        if (! $menu) {
            return false;
        }

        return $user->hasPermission($menu->id, $permission);
    }
}

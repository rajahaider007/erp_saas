<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Company;

class CheckUserPermissions
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string  $requiredFeature  The menu/feature name to check access for
     * @return mixed
     */
    public function handle(Request $request, Closure $next, $requiredFeature = null)
    {
        $user = $request->get('authenticated_user');
        
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Get user's company
        $company = Company::with('package')
            ->where('id', $user->comp_id)
            ->first();

        if (!$company) {
            return response()->json(['error' => 'Company not found'], 403);
        }

        // Check if company has valid license
        if (!$company->hasValidLicense()) {
            return response()->json([
                'error' => 'Company license expired',
                'message' => 'Your company license has expired. Please contact your administrator.'
            ], 403);
        }

        // If a specific feature is required, check access
        if ($requiredFeature) {
            // Get menu ID by route name or menu name
            $menu = DB::table('menus')
                ->where('route_name', $requiredFeature)
                ->orWhere('menu_name', $requiredFeature)
                ->first();

            if ($menu && !$company->userHasAccessToFeature($user->id, $menu->id, 'can_view')) {
                return response()->json([
                    'error' => 'Access denied',
                    'message' => 'You do not have permission to access this feature.'
                ], 403);
            }
        }

        // Add company and accessible menus to request
        $request->merge([
            'user_company' => $company,
            'accessible_menus' => $company->getAccessibleMenusForUser($user->id)
        ]);

        return $next($request);
    }
}
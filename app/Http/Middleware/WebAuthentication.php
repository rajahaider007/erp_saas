<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class WebAuthentication
{
    public function handle(Request $request, Closure $next)
    {
        $user = $this->getAuthenticatedUser($request);

        if (!$user) {
            if ($request->header('X-Inertia')) {
                return redirect()->route('login');
            }
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // ... locked account check ...

        // Check for license alert
        $licenseAlert = $request->session()->get('license_alert');
        
        // Convert user object to array to avoid stdClass issues
        $userArray = (array) $user;
        $permissions = json_decode($user->permissions, true);
        if (!is_array($permissions)) {
            $permissions = [];
        }
        
        // Get comp_id and location_id from session first, then from user object
        $compId = $request->session()->get('user_comp_id') ?? $user->comp_id;
        $locationId = $request->session()->get('user_location_id') ?? $user->location_id;
        
        $request->merge([
            'authenticated_user' => $userArray,
            'user_id' => $user->id,
            'user_role' => $user->role,
            'user_permissions' => $permissions,
            'user_comp_id' => $compId,
            'user_location_id' => $locationId,
            'license_alert' => $licenseAlert
        ]);

        return $next($request);
    }

    private function getAuthenticatedUser($request)
    {
        try {
            // 1. Check for user ID in session
            $userId = $request->session()->get('user_id');
            if (!$userId) {
                return null;
            }

            // 2. Retrieve user by ID
            return DB::table('tbl_users')
                ->where('id', $userId)
                ->where('status', 'active')
                ->first();

        } catch (\Exception $e) {
            \Log::error('Web auth error: '.$e->getMessage());
            return null;
        }
    }
}
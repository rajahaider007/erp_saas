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
        
        $request->merge([
            'authenticated_user' => $user,
            'user_id' => $user->id,
            'user_role' => $user->role,
            'user_permissions' => json_decode($user->permissions, true) ?? [],
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
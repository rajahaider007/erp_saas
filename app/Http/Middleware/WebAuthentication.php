<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use App\Services\AuthLogger;

class WebAuthentication
{
    public function handle(Request $request, Closure $next)
    {
        AuthLogger::logAuthEvent('Authentication check started', [
            'url' => $request->url(),
            'method' => $request->method(),
            'session_id' => session()->getId(),
            'user_id_session' => session('user_id')
        ]);

        $user = $this->getAuthenticatedUser($request);

        if (!$user) {
            AuthLogger::logAuthEvent('Authentication failed - no user found', [
                'url' => $request->url(),
                'session_id' => session()->getId(),
                'user_id_session' => session('user_id'),
                'auth_check' => auth()->check()
            ]);
            
            // For web requests, always redirect to login
            if ($request->expectsJson() || $request->header('X-Inertia')) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }
            return redirect()->route('login')->with('error', 'Please log in to access this resource.');
        }

        AuthLogger::logUserAuth('User authenticated successfully', $user->id, [
            'user_role' => $user->role,
            'user_status' => $user->status,
            'url' => $request->url()
        ]);

        // ... locked account check ...

        // Check for license alert
        $licenseAlert = $request->session()->get('license_alert');
        
        // Convert user object to array to avoid stdClass issues
        $userArray = (array) $user;
        
        // Handle permissions - they might be an array (from Eloquent) or JSON string (from DB query)
        $permissions = $user->permissions;
        if (is_string($permissions)) {
            $permissions = json_decode($permissions, true);
        }
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
            // 1. First try Laravel's built-in auth system
            if (auth()->check()) {
                return auth()->user();
            }

            // 2. Fallback: Check for user ID in session
            $userId = $request->session()->get('user_id');
            if (!$userId) {
                return null;
            }

            // 3. Retrieve user by ID using Eloquent model
            return \App\Models\User::where('id', $userId)
                ->where('status', 'active')
                ->first();

        } catch (\Exception $e) {
            Log::error('Web auth error: '.$e->getMessage());
            return null;
        }
    }
}
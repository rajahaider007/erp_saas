<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class TokenAuthentication
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        // Check if user is authenticated via session
        $sessionUser = session('auth_user');
        $userId = session('user_id');
        
        
        if (!$sessionUser || !$userId) {
            // For web requests, redirect to login
            if ($request->expectsJson() || $request->header('X-Inertia')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Authentication required.',
                    'error' => 'Unauthorized'
                ], 401);
            }
            
            return redirect()->route('login')->with('error', 'Please log in to access this resource.');
        }

        try {
            // Get user from database to verify status
            $user = DB::table('tbl_users')
                ->where('id', $userId)
                ->where('status', 'active')
                ->first();

            if (!$user) {
                // Clear invalid session
                session()->forget(['auth_user', 'user_id', 'auth_token']);
                
                // For web requests, redirect to login
                if ($request->expectsJson() || $request->header('X-Inertia')) {
                    return response()->json([
                        'success' => false,
                        'message' => 'User not found or inactive.',
                        'error' => 'Unauthorized'
                    ], 401);
                }
                
                return redirect()->route('login')->with('error', 'User not found or inactive.');
            }

            // Check if account is locked
            if ($user->locked_until && Carbon::parse($user->locked_until)->isFuture()) {
                // For web requests, redirect to login
                if ($request->expectsJson() || $request->header('X-Inertia')) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Account is temporarily locked.',
                        'error' => 'Account locked'
                    ], 423);
                }
                
                return redirect()->route('login')->with('error', 'Account is temporarily locked.');
            }

            // Add user data to request for use in controllers
            $request->merge([
                'authenticated_user' => $user,
                'user_id' => $user->id,
                'user_role' => $user->role,
                'user_permissions' => (is_string($user->permissions) ? json_decode($user->permissions, true) : $user->permissions) ?? []
            ]);

            return $next($request);

        } catch (\Exception $e) {
            // Clear session on error
            session()->forget(['auth_user', 'user_id', 'auth_token']);
            
            if ($request->expectsJson() || $request->header('X-Inertia')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Authentication error.',
                    'error' => 'Internal server error'
                ], 500);
            }
            
            return redirect()->route('login')->with('error', 'Authentication error occurred.');
        }
    }
}
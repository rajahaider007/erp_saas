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
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json([
                'success' => false,
                'message' => 'Authentication token required.',
                'error' => 'Unauthorized'
            ], 401);
        }

        try {
            $hashedToken = hash('sha256', $token);
            
            $user = DB::table('tbl_users')
                ->where('token', $hashedToken)
                ->where('status', 'active')
                ->first();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid or expired authentication token.',
                    'error' => 'Unauthorized'
                ], 401);
            }

            // Check if account is locked
            if ($user->locked_until && Carbon::parse($user->locked_until)->isFuture()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Account is temporarily locked.',
                    'error' => 'Account locked'
                ], 423);
            }

            // Optional: Check token expiry (if you implement token expiration)
            // if ($user->token_expires_at && Carbon::parse($user->token_expires_at)->isPast()) {
            //     return response()->json([
            //         'success' => false,
            //         'message' => 'Authentication token has expired.',
            //         'error' => 'Token expired'
            //     ], 401);
            // }

            // Add user data to request for use in controllers
            $request->merge([
                'authenticated_user' => $user,
                'user_id' => $user->id,
                'user_role' => $user->role,
                'user_permissions' => json_decode($user->permissions, true) ?? []
            ]);

            return $next($request);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Authentication error.',
                'error' => 'Internal server error'
            ], 500);
        }
    }
}
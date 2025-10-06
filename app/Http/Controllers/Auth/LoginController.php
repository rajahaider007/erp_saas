<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cookie;

class LoginController extends Controller
{
    /**
     * Show the login form
     */
    public function showLoginForm()
    {
        return inertia('Login');
    }

    /**
     * Handle login request - FIXED FOR INERTIA
     */
    public function login(Request $request)
    {
        try {
        
            $validated = $request->validate([
                'email' => 'required|string|max:255',
                'password' => 'required|string|min:6',
                'remember_me' => 'sometimes|boolean'
            ]);
  
            $key = Str::transliterate(Str::lower($validated['email']) . '|' . $request->ip());

            if (RateLimiter::tooManyAttempts($key, 5)) {
                $seconds = RateLimiter::availableIn($key);
                return back()->withErrors([
                    'email' => "Too many attempts. Try again in {$seconds} seconds."
                ]);
            }

            $user = DB::table('tbl_users')
                ->where(function ($query) use ($validated) {
                    $query->where('email', $validated['email'])
                        ->orWhere('loginid', $validated['email']);
                })
                ->where('status', 'active')
                ->first();

            if (!$user) {
                RateLimiter::hit($key);
                return back()->withErrors([
                    'email' => 'These credentials do not match our records.'
                ]);
            }

            if ($user->locked_until && Carbon::parse($user->locked_until)->isFuture()) {
                return back()->withErrors([
                    'email' => 'Account is temporarily locked. Please try again later.'
                ]);
            }

            if (!Hash::check($validated['password'], $user->password)) {
                $this->handleFailedLogin($user->id);
                RateLimiter::hit($key);
                return back()->withErrors([
                    'password' => 'The provided password is incorrect.'
                ]);
            }

            // Concurrent session detection
            $activeSessions = $this->getActiveSessions($user->id);
            if ($activeSessions) {
                $hasActiveSessions = count($activeSessions) > 0;
            }else {
                $hasActiveSessions = false;
            }

            if ($hasActiveSessions && !$request->has('force_logout')) {
                return back()->with([
                    'concurrent_sessions' => $activeSessions,
                    'login_data' => $validated
                ]);
            }
  
            RateLimiter::clear($key);
            $this->handleSuccessfulLogin($user, $request);

            $token = Str::random(80);
            $rememberToken = $validated['remember_me'] ? Str::random(100) : null;

            $updateData = [
                'token' => hash('sha256', $token),
                'last_login_at' => Carbon::now(),
                'last_login_ip' => $request->ip(),
                'failed_login_attempts' => 0,
                'locked_until' => null,
                'session_id' => Session::getId(),
                'updated_at' => Carbon::now()
            ];

            if ($rememberToken) {
                $updateData['remember_token'] = $rememberToken;
            }

            DB::table('tbl_users')
                ->where('id', $user->id)
                ->update($updateData);

            $request->session()->put('auth_token', $token);
            $request->session()->put('user_id', $user->id);
            $request->session()->put('user_comp_id', $user->comp_id);
            $request->session()->put('user_location_id', $user->location_id);
            $this->logLoginHistory($user->id, $request);

            // Set remember me cookie
            if ($rememberToken) {
                Cookie::queue('remember_token', $rememberToken, 43200); // 30 days
            }

            return redirect()->intended('/erp-modules');
        } catch (ValidationException $e) {
            return back()->withErrors($e->errors());
        } catch (\Exception $e) {
            Log::error('Login error: ' . $e->getMessage());
            return back()->withErrors(['general' => 'An error occurred during login. Please try again.']);
        }
    }
    private function getActiveSessions($userId)
    {
        return DB::table('tbl_users')
            ->where('id', $userId)
            ->whereNotNull('session_id')
            ->where('last_activity', '>', Carbon::now()->subMinutes(config('session.lifetime')))
            ->get(['id', 'session_id', 'last_login_at', 'last_login_ip', 'last_activity'])
            ->map(function ($session) {
                return [
                    'session_id' => $session->session_id,
                    'last_login_at' => Carbon::parse($session->last_login_at)->format('M d, Y H:i'),
                    'last_activity' => Carbon::parse($session->last_activity)->format('M d, Y H:i'),
                    'ip' => $session->last_login_ip,
                    'device' => $this->detectDevice($session->user_agent)
                ];
            })
            ->toArray();
    }

    private function detectDevice($userAgent)
    {
        if (stripos($userAgent, 'mobile') !== false) {
            return 'Mobile';
        } elseif (stripos($userAgent, 'tablet') !== false) {
            return 'Tablet';
        } else {
            return 'Desktop';
        }
    }
    public function forceLogout(Request $request)
    {
        $request->validate([
            'session_id' => 'required|string',
            'login_data' => 'required|array'
        ]);

        // Clear the specified session
        DB::table('tbl_users')
            ->where('session_id', $request->session_id)
            ->update([
                'token' => null,
                'session_id' => null,
                'last_activity' => null
            ]);

        // Attempt login again with force_logout flag
        return redirect()->route('login')->withInput($request->login_data)->with([
            'force_logout' => true
        ]);
    }
    /**
     * Handle failed login attempt
     */
    private function handleFailedLogin($userId)
    {
        try {
            $user = DB::table('tbl_users')->where('id', $userId)->first();
            $failedAttempts = ($user->failed_login_attempts ?? 0) + 1;

            $updateData = [
                'failed_login_attempts' => $failedAttempts,
                'updated_at' => Carbon::now()
            ];

            // Lock account after 5 failed attempts for 15 minutes
            if ($failedAttempts >= 5) {
                $updateData['locked_until'] = Carbon::now()->addMinutes(15);
            }

            DB::table('tbl_users')
                ->where('id', $userId)
                ->update($updateData);
        } catch (\Exception $e) {
            Log::error('Failed login handling error: ' . $e->getMessage());
        }
    }

    /**
     * Handle successful login
     */
    private function handleSuccessfulLogin($user, $request)
    {
        try {
            // Reset failed login attempts
            DB::table('tbl_users')
                ->where('id', $user->id)
                ->update([
                    'failed_login_attempts' => 0,
                    'locked_until' => null
                ]);
        } catch (\Exception $e) {
            Log::error('Successful login handling error: ' . $e->getMessage());
        }
    }

    /**
     * Log login history
     */
    private function logLoginHistory($userId, $request)
    {
        try {
            $user = DB::table('tbl_users')->where('id', $userId)->first();
            $loginHistory = json_decode($user->login_history ?? '[]', true);

            // Add new login entry
            array_unshift($loginHistory, [
                'timestamp' => Carbon::now()->toISOString(),
                'ip' => $request->ip(),
                'user_agent' => $request->header('User-Agent'),
                'success' => true
            ]);

            // Keep only last 20 login attempts
            $loginHistory = array_slice($loginHistory, 0, 20);

            DB::table('tbl_users')
                ->where('id', $userId)
                ->update([
                    'login_history' => json_encode($loginHistory)
                ]);
        } catch (\Exception $e) {
            Log::error('Login history logging error: ' . $e->getMessage());
        }
    }

    /**
     * Handle logout
     */
    public function logout(Request $request)
    {
        try {
            $token = $request->session()->get('auth_token');

            if ($token) {
                $hashedToken = hash('sha256', $token);

                // Clear token from database
                DB::table('tbl_users')
                    ->where('token', $hashedToken)
                    ->update([
                        'token' => null,
                        'session_id' => null,
                        'updated_at' => Carbon::now()
                    ]);
            }

            // Clear session
            $request->session()->forget(['auth_token', 'user_id']);
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect('/login');
        } catch (\Exception $e) {
            Log::error('Logout error: ' . $e->getMessage());
            return redirect('/login');
        }
    }

    /**
     * Get authenticated user
     */
    public function user(Request $request)
    {
        try {
            $token = $request->session()->get('auth_token');

            if (!$token) {
                return response()->json([
                    'success' => false,
                    'message' => 'Token not provided.'
                ], 401);
            }

            $hashedToken = hash('sha256', $token);

            $user = DB::table('tbl_users')
                ->where('token', $hashedToken)
                ->where('status', 'active')
                ->first();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid or expired token.'
                ], 401);
            }

            $userData = [
                'id' => $user->id,
                'name' => trim($user->fname . ' ' . $user->mname . ' ' . $user->lname),
                'email' => $user->email,
                'loginid' => $user->loginid,
                'role' => $user->role,
                'permissions' => json_decode($user->permissions, true),
                'timezone' => $user->timezone ?? 'UTC',
                'language' => $user->language ?? 'en',
                'currency' => $user->currency ?? 'USD',
                'theme' => $user->theme ?? 'light',
                'avatar' => $user->avatar,
                'last_login_at' => $user->last_login_at,
                'force_password_change' => $user->force_password_change ?? false,
                'two_factor_enabled' => $user->two_factor_enabled ?? false
            ];

            return response()->json([
                'success' => true,
                'data' => ['user' => $userData]
            ], 200);
        } catch (\Exception $e) {
            Log::error('User fetch error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while fetching user data.'
            ], 500);
        }
    }
}

<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;
use App\Models\User;

class LoginController extends Controller
{
    public function showLoginForm()
    {
        return inertia('Auth/Login');
    }

    public function login(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email|max:255',
                'password' => 'required|string|min:6',
            ]);

            // Rate limiting
            $key = Str::transliterate(Str::lower($request->input('email')) . '|' . $request->ip());
            if (RateLimiter::tooManyAttempts($key, 5)) {
                $seconds = RateLimiter::availableIn($key);
                throw ValidationException::withMessages([
                    'email' => ["Too many attempts. Try again in {$seconds} seconds."]
                ])->status(429);
            }

            // Find user by email or loginid
            $user = DB::table('tbl_users')
                ->where(function ($query) use ($request) {
                    $query->where('email', $request->email)
                        ->orWhere('loginid', $request->email);
                })
                ->where('status', 'active')
                ->first();

            if (!$user) {
                RateLimiter::hit($key);
                throw ValidationException::withMessages([
                    'email' => ['These credentials do not match our records.']
                ]);
            }

            // Check account lock
            if ($user->locked_until && Carbon::parse($user->locked_until)->isFuture()) {
                throw ValidationException::withMessages([
                    'email' => ['Account is temporarily locked.']
                ])->status(423);
            }

            // Verify password
            if (!Hash::check($request->password, $user->password)) {
                $this->handleFailedLogin($user->id);
                RateLimiter::hit($key);
                throw ValidationException::withMessages([
                    'password' => ['The provided password is incorrect.']
                ]);
            }

            // Successful login
            RateLimiter::clear($key);
            $this->handleSuccessfulLogin($user);

            // Generate token
            $token = Str::random(80);
            DB::table('tbl_users')
                ->where('id', $user->id)
                ->update([
                    'token' => hash('sha256', $token),
                    'last_login_at' => Carbon::now(),
                    'last_login_ip' => $request->ip(),
                    'failed_login_attempts' => 0,
                    'locked_until' => null,
                    'session_id' => session()->getId(),
                    'updated_at' => Carbon::now()
                ]);
            $token = Str::random(80);

            // Store token in SESSION only (not in database)
            $request->session()->put('auth_token', $token);
            $request->session()->put('user_id', $user->id);

            $this->logLoginHistory($user->id, $request);

            // Redirect for Inertia SPA
            return redirect()->intended('/dashboard');
        } catch (ValidationException $e) {
            throw $e; // Let Inertia handle validation errors automatically
        } catch (\Exception $e) {
            return back()->withErrors([
                'email' => 'An error occurred during login. Please try again.'
            ]);
        }
    }

    private function handleFailedLogin($userId)
    {
        $user = DB::table('tbl_users')->where('id', $userId)->first();
        $failedAttempts = $user->failed_login_attempts + 1;

        $updateData = [
            'failed_login_attempts' => $failedAttempts,
            'updated_at' => Carbon::now()
        ];

        if ($failedAttempts >= 5) {
            $updateData['locked_until'] = Carbon::now()->addMinutes(15);
        }

        DB::table('tbl_users')->where('id', $userId)->update($updateData);
    }

    private function handleSuccessfulLogin($user)
    {
        DB::table('tbl_users')
            ->where('id', $user->id)
            ->update([
                'failed_login_attempts' => 0,
                'locked_until' => null
            ]);
    }

    private function logLoginHistory($userId, $request)
    {
        $user = DB::table('tbl_users')->where('id', $userId)->first();
        $loginHistory = json_decode($user->login_history, true) ?? [];

        array_unshift($loginHistory, [
            'timestamp' => Carbon::now()->toISOString(),
            'ip' => $request->ip(),
            'user_agent' => $request->header('User-Agent'),
            'success' => true
        ]);

        $loginHistory = array_slice($loginHistory, 0, 20);

        DB::table('tbl_users')->where('id', $userId)
            ->update(['login_history' => json_encode($loginHistory)]);
    }

    public function logout(Request $request)
    {
        $token = $request->bearerToken();

        if ($token) {
            $hashedToken = hash('sha256', $token);
            DB::table('tbl_users')
                ->where('token', $hashedToken)
                ->update([
                    'token' => null,
                    'session_id' => null,
                    'updated_at' => Carbon::now()
                ]);
        }

        return redirect('/login');
    }

    public function user(Request $request)
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json(['success' => false, 'message' => 'Token not provided.'], 401);
        }

        $hashedToken = hash('sha256', $token);
        $user = DB::table('tbl_users')
            ->where('token', $hashedToken)
            ->where('status', 'active')
            ->first();

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Invalid or expired token.'], 401);
        }

        return response()->json([
            'success' => true,
            'data' => ['user' => $this->formatUser($user)]
        ]);
    }

    private function formatUser($user)
    {
        return [
            'id' => $user->id,
            'name' => trim($user->fname . ' ' . $user->mname . ' ' . $user->lname),
            'email' => $user->email,
            'loginid' => $user->loginid,
            'role' => $user->role,
            'permissions' => json_decode($user->permissions, true),
            'timezone' => $user->timezone,
            'language' => $user->language,
            'currency' => $user->currency,
            'theme' => $user->theme,
            'avatar' => $user->avatar,
            'last_login_at' => $user->last_login_at,
            'force_password_change' => $user->force_password_change,
            'two_factor_enabled' => $user->two_factor_enabled
        ];
    }
}

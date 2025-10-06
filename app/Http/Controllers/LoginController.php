<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;
use App\Models\User;
use Inertia\Inertia;

class LoginController extends Controller
{
    public function showLoginForm()
    {
        return inertia('Auth/Login');
    }

    public function login(Request $request)
    {
        Log::info('Login attempt started', [
            'email' => $request->email,
            'ip' => $request->ip(),
            'user_agent' => $request->header('User-Agent')
        ]);
        
        try {
            $request->validate([
                'email' => 'required|string|max:255',
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

            // Regenerate session BEFORE login to prevent session fixation attacks
            $request->session()->regenerate();
            
            // Create User model instance and login
            $userModel = User::find($user->id);
            auth()->login($userModel, $request->remember_me ?? false);
            
            // Store additional session data (required by custom middleware)
            $request->session()->put('auth_token', $token);
            $request->session()->put('user_id', $user->id);
            $request->session()->put('user_comp_id', $user->comp_id);
            $request->session()->put('user_location_id', $user->location_id);
            $request->session()->put('auth_user', $user);
            
            // Save session immediately
            $request->session()->save();
            
            // Debug: Log session data
            Log::info('Session data after login:', [
                'user_id' => $request->session()->get('user_id'),
                'auth_check' => auth()->check(),
                'auth_id' => auth()->id(),
                'session_id' => $request->session()->getId()
            ]);

            $this->logLoginHistory($user->id, $request);

            // Check license expiration
            $licenseAlert = $this->checkLicenseExpiration($user->id);
            if ($licenseAlert) {
                $request->session()->put('license_alert', $licenseAlert);
            }

            // Debug logging
            Log::info('Login successful for user ID: ' . $user->id);
            
            // Redirect for Inertia SPA
            return redirect()->intended('/dashboard');
        } catch (ValidationException $e) {
            Log::error('Login validation error: ' . $e->getMessage());
            throw $e; // Let Inertia handle validation errors automatically
        } catch (\Exception $e) {
            Log::error('Login exception: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
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

    private function checkLicenseExpiration($userId)
    {
        try {
            // Get user with company information
            $user = DB::table('tbl_users')
                ->join('companies', 'tbl_users.comp_id', '=', 'companies.id')
                ->where('tbl_users.id', $userId)
                ->select('companies.company_name', 'companies.license_end_date', 'companies.license_start_date')
                ->first();

            if (!$user || !$user->license_end_date) {
                return null;
            }

            $licenseEndDate = Carbon::parse($user->license_end_date);
            $now = Carbon::now();
            $daysUntilExpiry = $now->diffInDays($licenseEndDate, false);

            // Show alert if license expires within 30 days or has expired
            if ($daysUntilExpiry <= 30) {
                if ($daysUntilExpiry < 0) {
                    return [
                        'type' => 'error',
                        'title' => 'License Expired',
                        'message' => "Your company license for {$user->company_name} has expired on {$licenseEndDate->format('M d, Y')}. Please contact your administrator to renew the license.",
                        'company_name' => $user->company_name,
                        'expiry_date' => $licenseEndDate->format('M d, Y'),
                        'days_expired' => abs($daysUntilExpiry)
                    ];
                } else {
                    return [
                        'type' => 'warning',
                        'title' => 'License Expiring Soon',
                        'message' => "Your company license for {$user->company_name} will expire on {$licenseEndDate->format('M d, Y')}. Please contact your administrator to renew the license.",
                        'company_name' => $user->company_name,
                        'expiry_date' => $licenseEndDate->format('M d, Y'),
                        'days_remaining' => $daysUntilExpiry
                    ];
                }
            }

            return null;
        } catch (\Exception $e) {
            Log::error('License check failed: ' . $e->getMessage());
            return null;
        }
    }
}

<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;
use App\Services\AuditLogService;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        Log::info('=== USER REGISTRATION STARTED ===');
        Log::info('Registration request data:', $request->except(['password', 'password_confirmation']));
        
        try {
            $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
                'password' => ['required', 'confirmed', Rules\Password::defaults()],
            ]);

            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
            ]);

            // Log user registration
            try {
                AuditLogService::logAuthentication('USER_REGISTERED', $user->id, [
                    'name' => $request->name,
                    'email' => $request->email,
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->header('User-Agent'),
                    'registration_time' => now()
                ]);
                Log::info('User registration successful', [
                    'user_id' => $user->id,
                    'email' => $request->email,
                    'name' => $request->name
                ]);
            } catch (\Exception $auditException) {
                Log::warning('Failed to create audit log for user registration', [
                    'user_id' => $user->id,
                    'error' => $auditException->getMessage()
                ]);
            }

            event(new Registered($user));

            Auth::login($user);

            return redirect(route('dashboard', absolute: false));
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('User registration validation failed', [
                'errors' => $e->errors(),
                'request_data' => $request->except(['password', 'password_confirmation'])
            ]);
            throw $e;
        } catch (\Exception $e) {
            Log::error('Error during user registration', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->except(['password', 'password_confirmation'])
            ]);
            
            return redirect()->back()->with('error', 'Something went wrong during registration. Please try again.');
        }
    }
}

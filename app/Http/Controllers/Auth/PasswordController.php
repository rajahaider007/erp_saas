<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rules\Password;
use App\Services\AuditLogService;

class PasswordController extends Controller
{
    /**
     * Update the user's password.
     */
    public function update(Request $request): RedirectResponse
    {
        Log::info('=== PASSWORD CHANGE STARTED ===');
        
        try {
            $validated = $request->validate([
                'current_password' => ['required', 'current_password'],
                'password' => ['required', Password::defaults(), 'confirmed'],
            ]);

            $user = $request->user();
            
            // Store old password hash for audit (we don't log the actual password)
            $oldPasswordHash = $user->password;

            $user->update([
                'password' => Hash::make($validated['password']),
            ]);

            // Log password change
            try {
                AuditLogService::logAuthentication('PASSWORD_CHANGED', $user->id, [
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->header('User-Agent'),
                    'change_time' => now(),
                    'old_password_hash' => substr($oldPasswordHash, 0, 10) . '...', // Only log first 10 chars for security
                    'new_password_hash' => substr(Hash::make($validated['password']), 0, 10) . '...'
                ]);
                Log::info('Password changed successfully', [
                    'user_id' => $user->id,
                    'user_email' => $user->email ?? 'unknown'
                ]);
            } catch (\Exception $auditException) {
                Log::warning('Failed to create audit log for password change', [
                    'user_id' => $user->id,
                    'error' => $auditException->getMessage()
                ]);
            }

            return back()->with('success', 'Password updated successfully.');
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('Password change validation failed', [
                'errors' => $e->errors(),
                'user_id' => $request->user()->id ?? null
            ]);
            throw $e;
        } catch (\Exception $e) {
            Log::error('Error during password change', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => $request->user()->id ?? null
            ]);
            
            return redirect()->back()->with('error', 'Something went wrong while changing the password. Please try again.');
        }
    }
}

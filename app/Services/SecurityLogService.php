<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SecurityLogService
{
    /**
     * Log security event
     */
    public static function log(
        string $eventType,
        string $eventStatus,
        ?int $userId = null,
        ?string $username = null,
        string $riskLevel = 'LOW',
        array $additionalData = []
    ): bool {
        try {
            $request = request();
            
            // Auto-detect risk level for failed logins
            if ($eventType === 'LOGIN_FAILED' && $username) {
                $riskLevel = self::calculateLoginRiskLevel($username);
            }
            
            DB::table('tbl_security_logs')->insert([
                'user_id' => $userId,
                'username' => $username,
                'event_type' => $eventType,
                'event_status' => $eventStatus,
                'ip_address' => $request->ip(),
                'user_agent' => $request->header('User-Agent'),
                'location_info' => self::getLocationFromIP($request->ip()),
                'additional_data' => !empty($additionalData) ? json_encode($additionalData) : null,
                'risk_level' => $riskLevel,
                'created_at' => now()
            ]);
            
            return true;
        } catch (\Exception $e) {
            Log::error('Security log error: ' . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Log login attempt
     */
    public static function logLogin(?int $userId, string $username, bool $success): bool
    {
        return self::log(
            $success ? 'LOGIN_SUCCESS' : 'LOGIN_FAILED',
            $success ? 'SUCCESS' : 'FAILED',
            $userId,
            $username,
            $success ? 'LOW' : self::calculateLoginRiskLevel($username)
        );
    }
    
    /**
     * Log logout
     */
    public static function logLogout(int $userId, string $username): bool
    {
        return self::log(
            'LOGOUT',
            'SUCCESS',
            $userId,
            $username,
            'LOW'
        );
    }
    
    /**
     * Log permission change
     */
    public static function logPermissionChange(
        int $targetUserId,
        string $action,
        array $changes
    ): bool {
        return self::log(
            'PERMISSION_CHANGE',
            'SUCCESS',
            Auth::id(),
            null,
            'MEDIUM',
            [
                'target_user_id' => $targetUserId,
                'action' => $action,
                'changes' => $changes
            ]
        );
    }
    
    /**
     * Calculate risk level based on failed login attempts
     */
    private static function calculateLoginRiskLevel(string $username): string
    {
        $recentFailed = DB::table('tbl_security_logs')
            ->where('username', $username)
            ->where('event_type', 'LOGIN_FAILED')
            ->where('created_at', '>', now()->subMinutes(15))
            ->count();
        
        if ($recentFailed >= 5) {
            return 'CRITICAL';
        } elseif ($recentFailed >= 3) {
            return 'HIGH';
        } elseif ($recentFailed >= 2) {
            return 'MEDIUM';
        }
        
        return 'LOW';
    }
    
    /**
     * Get approximate location from IP
     */
    private static function getLocationFromIP(string $ip): string
    {
        // Simple implementation - can be enhanced with GeoIP services
        return $ip;
    }
    
    /**
     * Get security incidents for monitoring
     */
    public static function getSecurityIncidents(int $days = 7)
    {
        return DB::table('tbl_security_logs')
            ->where('event_status', 'FAILED')
            ->where('created_at', '>=', now()->subDays($days))
            ->orderBy('created_at', 'desc')
            ->get();
    }
    
    /**
     * Get high-risk security events
     */
    public static function getHighRiskEvents(int $limit = 50)
    {
        return DB::table('tbl_security_logs as sl')
            ->leftJoin('tbl_users as u', 'sl.user_id', '=', 'u.id')
            ->select('sl.*', 'u.name as user_name', 'u.email as user_email')
            ->whereIn('sl.risk_level', ['HIGH', 'CRITICAL'])
            ->orderBy('sl.created_at', 'desc')
            ->limit($limit)
            ->get();
    }
}


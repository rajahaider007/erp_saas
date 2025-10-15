<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

class AuthLogger
{
    /**
     * Log authentication events
     */
    public static function logAuthEvent(string $event, array $data = []): void
    {
        Log::channel('auth')->info("Auth Event: {$event}", array_merge([
            'timestamp' => now()->toISOString(),
            'event' => $event,
        ], $data));
    }

    /**
     * Log permission checks
     */
    public static function logPermissionCheck(string $action, array $data = []): void
    {
        Log::channel('auth')->info("Permission Check: {$action}", array_merge([
            'timestamp' => now()->toISOString(),
            'action' => $action,
        ], $data));
    }

    /**
     * Log user authentication
     */
    public static function logUserAuth(string $event, int $userId, array $data = []): void
    {
        self::logAuthEvent($event, array_merge([
            'user_id' => $userId,
        ], $data));
    }

    /**
     * Log permission denied events
     */
    public static function logPermissionDenied(string $route, string $permission, int $userId, array $data = []): void
    {
        Log::channel('auth')->warning("Permission Denied", array_merge([
            'timestamp' => now()->toISOString(),
            'user_id' => $userId,
            'route' => $route,
            'permission' => $permission,
        ], $data));
    }
}

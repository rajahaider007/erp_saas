<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class TrackUserActivity
{
    public function handle($request, Closure $next)
    {
        if (Auth::check()) {
            DB::table('tbl_users')
                ->where('id', Auth::id())
                ->update(['last_activity' => Carbon::now()]);
        }

        return $next($request);
    }
}
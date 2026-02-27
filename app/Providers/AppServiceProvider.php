<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Ensure default string length is compatible with older MySQL/MariaDB
        // installations using utf8mb4. This prevents migrations from creating
        // varchar(255) columns that later cause "key too long" errors when
        // indexed.
        \Illuminate\Support\Facades\Schema::defaultStringLength(191);

        Vite::prefetch(concurrency: 3);
    }
}

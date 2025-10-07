<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule automatic currency exchange rate updates
Schedule::command('currency:update-rates')
    ->daily()
    ->at('00:00')
    ->withoutOverlapping()
    ->appendOutputTo(storage_path('logs/currency-updates.log'));

// Alternative: Update exchange rates every 6 hours
// Schedule::command('currency:update-rates')->everySixHours()->withoutOverlapping();

// Alternative: Update exchange rates on weekdays at 9 AM
// Schedule::command('currency:update-rates')->weekdays()->at('09:00')->withoutOverlapping();

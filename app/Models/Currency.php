<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\CurrencyExchangeRateHistory;

class Currency extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'code',
        'name',
        'symbol',
        'country',
        'exchange_rate',
        'is_active',
        'is_base_currency',
        'sort_order'
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'exchange_rate' => 'decimal:4',
        'is_active' => 'boolean',
        'is_base_currency' => 'boolean',
        'sort_order' => 'integer'
    ];

    /**
     * Scope to get only active currencies
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get base currency
     */
    public function scopeBase($query)
    {
        return $query->where('is_base_currency', true);
    }

    /**
     * Scope to order by sort order
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('code');
    }

    /**
     * Get formatted currency display
     */
    public function getDisplayAttribute()
    {
        return "{$this->name} ({$this->code})";
    }

    /**
     * Get formatted currency with symbol
     */
    public function getDisplayWithSymbolAttribute()
    {
        return "{$this->symbol} {$this->name} ({$this->code})";
    }

    /**
     * Convert amount from base currency to this currency
     */
    public function convertFromBase($amount)
    {
        return $amount * $this->exchange_rate;
    }

    /**
     * Convert amount from this currency to base currency
     */
    public function convertToBase($amount)
    {
        return $amount / $this->exchange_rate;
    }

    /**
     * Format amount with currency symbol
     */
    public function formatAmount($amount, $showCode = false)
    {
        $formatted = $this->symbol . ' ' . number_format($amount, 2);
        
        if ($showCode) {
            $formatted .= ' ' . $this->code;
        }
        
        return $formatted;
    }

    /**
     * Get exchange rate history for this currency
     */
    public function exchangeRateHistory()
    {
        return $this->hasMany(CurrencyExchangeRateHistory::class);
    }

    /**
     * Get latest exchange rate history
     */
    public function latestHistory($limit = 10)
    {
        return $this->exchangeRateHistory()
            ->latest('effective_date')
            ->limit($limit)
            ->get();
    }

    /**
     * Log exchange rate change
     */
    public function logRateChange($newRate, $source = 'manual', $apiProvider = null, $notes = null)
    {
        $previousRate = $this->exchange_rate;
        $rateChange = 0;
        
        if ($previousRate > 0) {
            $rateChange = (($newRate - $previousRate) / $previousRate) * 100;
        }

        return CurrencyExchangeRateHistory::create([
            'currency_id' => $this->id,
            'exchange_rate' => $newRate,
            'previous_rate' => $previousRate,
            'rate_change' => $rateChange,
            'source' => $source,
            'api_provider' => $apiProvider,
            'notes' => $notes,
            'effective_date' => now()
        ]);
    }
}


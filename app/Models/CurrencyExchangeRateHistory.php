<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CurrencyExchangeRateHistory extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     */
    protected $table = 'currency_exchange_rate_history';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'currency_id',
        'exchange_rate',
        'previous_rate',
        'rate_change',
        'source',
        'api_provider',
        'notes',
        'effective_date'
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'exchange_rate' => 'decimal:6',
        'previous_rate' => 'decimal:6',
        'rate_change' => 'decimal:6',
        'effective_date' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    /**
     * Get the currency that owns the history record.
     */
    public function currency()
    {
        return $this->belongsTo(Currency::class);
    }

    /**
     * Scope to get history for a specific currency
     */
    public function scopeForCurrency($query, $currencyId)
    {
        return $query->where('currency_id', $currencyId);
    }

    /**
     * Scope to get history within date range
     */
    public function scopeBetweenDates($query, $startDate, $endDate)
    {
        return $query->whereBetween('effective_date', [$startDate, $endDate]);
    }

    /**
     * Scope to get latest rates
     */
    public function scopeLatest($query, $limit = 10)
    {
        return $query->orderBy('effective_date', 'desc')->limit($limit);
    }

    /**
     * Scope to get history by source
     */
    public function scopeBySource($query, $source)
    {
        return $query->where('source', $source);
    }

    /**
     * Calculate percentage change from previous rate
     */
    public function calculateRateChange()
    {
        if ($this->previous_rate && $this->previous_rate > 0) {
            $change = (($this->exchange_rate - $this->previous_rate) / $this->previous_rate) * 100;
            return round($change, 2);
        }
        return 0;
    }

    /**
     * Check if rate increased
     */
    public function isRateIncrease()
    {
        return $this->rate_change > 0;
    }

    /**
     * Check if rate decreased
     */
    public function isRateDecrease()
    {
        return $this->rate_change < 0;
    }

    /**
     * Get formatted rate change with symbol
     */
    public function getFormattedRateChangeAttribute()
    {
        if (!$this->rate_change) {
            return '0%';
        }
        
        $symbol = $this->rate_change > 0 ? '+' : '';
        return $symbol . number_format($this->rate_change, 2) . '%';
    }
}


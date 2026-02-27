<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FiscalPeriod extends Model
{
    use HasFactory;

    protected $table = 'fiscal_periods';

    protected $fillable = [
        'comp_id',
        'fiscal_year',
        'period_number',
        'period_name',
        'start_date',
        'end_date',
        'period_type',
        'status',
        'is_adjustment_period',
        'closing_notes',
        'closed_by',
        'closed_at',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'closed_at' => 'datetime',
        'is_adjustment_period' => 'boolean',
    ];

    /**
     * Get the company that owns this fiscal period
     */
    public function company()
    {
        return $this->belongsTo(Company::class, 'comp_id');
    }

    /**
     * Get transactions in this period
     */
    public function transactions()
    {
        return $this->hasMany(Transaction::class, 'period_id');
    }

    /**
     * Scope to get open periods
     */
    public function scopeOpen($query)
    {
        return $query->where('status', 'Open');
    }

    /**
     * Scope to get closed periods
     */
    public function scopeClosed($query)
    {
        return $query->where('status', 'Closed');
    }

    /**
     * Scope to get locked periods
     */
    public function scopeLocked($query)
    {
        return $query->where('status', 'Locked');
    }

    /**
     * Scope to get periods by fiscal year
     */
    public function scopeForYear($query, $year)
    {
        return $query->where('fiscal_year', $year);
    }

    /**
     * Scope to get periods by company
     */
    public function scopeForCompany($query, $compId)
    {
        return $query->where('comp_id', $compId);
    }

    /**
     * Check if period can be edited
     */
    public function canEdit(): bool
    {
        return $this->status === 'Open';
    }

    /**
     * Check if period can be closed
     */
    public function canClose(): bool
    {
        return $this->status === 'Open' && !$this->is_adjustment_period;
    }
}

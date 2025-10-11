<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CodeConfiguration extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'location_id',
        'code_type',
        'code_name',
        'account_level',
        'prefix',
        'next_number',
        'number_length',
        'separator',
        'description',
        'is_active',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'account_level' => 'integer',
        'next_number' => 'integer',
        'number_length' => 'integer',
    ];

    /**
     * Get the company that owns the code configuration.
     */
    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * Get the location that owns the code configuration.
     */
    public function location()
    {
        return $this->belongsTo(Location::class);
    }

    /**
     * Get the user who created the configuration.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who last updated the configuration.
     */
    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Generate the next code based on configuration.
     */
    public function generateNextCode(): string
    {
        $number = str_pad($this->next_number, $this->number_length, '0', STR_PAD_LEFT);
        
        if ($this->prefix) {
            return $this->prefix . $this->separator . $number;
        }
        
        return $number;
    }

    /**
     * Increment the next number.
     */
    public function incrementNextNumber(): void
    {
        $this->increment('next_number');
    }

    /**
     * Scope to filter by company.
     */
    public function scopeForCompany($query, $companyId)
    {
        return $query->where(function ($q) use ($companyId) {
            $q->where('company_id', $companyId)
              ->orWhereNull('company_id');
        });
    }

    /**
     * Scope to filter by location.
     */
    public function scopeForLocation($query, $locationId)
    {
        return $query->where(function ($q) use ($locationId) {
            $q->where('location_id', $locationId)
              ->orWhereNull('location_id');
        });
    }

    /**
     * Scope to filter by code type.
     */
    public function scopeOfType($query, $codeType)
    {
        return $query->where('code_type', $codeType);
    }

    /**
     * Scope to filter active configurations.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}


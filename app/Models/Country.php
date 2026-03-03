<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Country extends Model
{
    use HasFactory;

    protected $table = 'countries';
    protected $fillable = [
        'country_code',
        'country_name',
        'currency_id',
        'iso_2_code',
        'iso_numeric_code',
        'tax_system',
        'region',
        'sub_region',
        'customs_rules',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByCode($query, $code)
    {
        return $query->where('country_code', $code);
    }

    public function scopeByRegion($query, $region)
    {
        return $query->where('region', $region);
    }
}

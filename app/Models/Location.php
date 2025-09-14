<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Location extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'location_name',
        'address',
        'city',
        'state',
        'country',
        'postal_code',
        'phone',
        'email',
        'status',
        'sort_order'
    ];

    protected $casts = [
        'status' => 'boolean',
        'sort_order' => 'integer'
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function departments(): HasMany
    {
        return $this->hasMany(Department::class);
    }
}
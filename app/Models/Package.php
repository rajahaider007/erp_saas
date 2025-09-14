<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Package extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'package_name',
        'slug',
        'status',
        'sort_order',
    ];

    protected $casts = [
        'status' => 'boolean',
        'sort_order' => 'integer'
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($package) {
            if (!$package->slug) {
                $package->slug = Str::slug($package->package_name);
            }
        });

        static::updating(function ($package) {
            if ($package->isDirty('package_name')) {
                $package->slug = Str::slug($package->package_name);
            }
        });
    }

    public function features()
    {
        return $this->hasMany(PackageFeature::class);
    }

    public function menus()
    {
        return $this->belongsToMany(Menu::class, 'package_features')
                    ->withPivot('is_enabled')
                    ->withTimestamps();
    }

    /**
     * Get modules through package features (menus)
     */
    public function modules()
    {
        $menuIds = $this->features()->where('is_enabled', true)->pluck('menu_id');
        return Module::whereHas('menus', function($query) use ($menuIds) {
            $query->whereIn('id', $menuIds);
        })->distinct();
    }

    /**
     * Get sections through package features (menus)
     */
    public function sections()
    {
        $menuIds = $this->features()->where('is_enabled', true)->pluck('menu_id');
        return Section::whereHas('menus', function($query) use ($menuIds) {
            $query->whereIn('id', $menuIds);
        })->distinct();
    }
}

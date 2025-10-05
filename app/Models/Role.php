<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Role extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'role_name',
        'slug',
        'description',
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

        static::creating(function ($role) {
            if (!$role->slug) {
                $role->slug = Str::slug($role->role_name);
            }
        });

        static::updating(function ($role) {
            if ($role->isDirty('role_name')) {
                $role->slug = Str::slug($role->role_name);
            }
        });
    }

    public function features()
    {
        return $this->hasMany(RoleFeature::class);
    }

    public function menus()
    {
        return $this->belongsToMany(Menu::class, 'role_features')
                    ->withPivot('is_enabled')
                    ->withTimestamps();
    }

    /**
     * Get modules through role features (menus)
     */
    public function modules()
    {
        $menuIds = $this->features()->where('is_enabled', true)->pluck('menu_id');
        return Module::whereHas('menus', function($query) use ($menuIds) {
            $query->whereIn('id', $menuIds);
        })->distinct();
    }

    /**
     * Get sections through role features (menus)
     */
    public function sections()
    {
        $menuIds = $this->features()->where('is_enabled', true)->pluck('menu_id');
        return Section::whereHas('menus', function($query) use ($menuIds) {
            $query->whereIn('id', $menuIds);
        })->distinct();
    }

    /**
     * Get the companies associated with this role.
     */
    public function companies()
    {
        return $this->belongsToMany(Company::class, 'company_roles');
    }
}
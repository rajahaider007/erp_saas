<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Module extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'module_name',
        'folder_name',
        'slug',
        'image',
        'status',
        'sort_order',
    ];

    protected $casts = [
        'status' => 'boolean',
        'sort_order' => 'integer'
    ];

    protected $dates = [
        'deleted_at'
    ];

    /**
     * Boot the model
     */
    protected static function boot()
    {
        parent::boot();

        // Auto-generate slug before creating
        static::creating(function ($module) {
            if (!$module->slug) {
                $module->slug = Str::slug($module->module_name);
            }
        });

        // Update slug before updating if module_name changed
        static::updating(function ($module) {
            if ($module->isDirty('module_name')) {
                $module->slug = Str::slug($module->module_name);
            }
        });
    }

    /**
     * Scope for active modules
     */
    public function scopeActive($query)
    {
        return $query->where('status', true);
    }

    /**
     * Scope for ordered modules
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order', 'asc')->orderBy('module_name', 'asc');
    }

    /**
     * Get the image URL
     */
    public function getImageUrlAttribute()
    {
        return $this->image ? asset('storage/' . $this->image) : null;
    }

  
}
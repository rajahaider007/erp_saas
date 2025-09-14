<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Section extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'module_id',
        'section_name',
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

        static::creating(function ($section) {
            if (!$section->slug) {
                $section->slug = Str::slug($section->section_name);
            }
        });

        static::updating(function ($section) {
            if ($section->isDirty('section_name')) {
                $section->slug = Str::slug($section->section_name);
            }
        });
    }

    public function module()
    {
        return $this->belongsTo(Module::class);
    }

    public function menus()
    {
        return $this->hasMany(Menu::class);
    }
}



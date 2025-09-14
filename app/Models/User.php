<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    /**
     * The table associated with the model.
     */
    protected $table = 'tbl_users';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'fname',
        'mname',
        'lname',
        'email',
        'loginid',
        'password',
        'role',
        'permissions',
        'status',
        'token',
        'session_id',
        'login_history',
        'timezone',
        'language',
        'currency',
        'theme',
        'avatar',
        'last_login_at',
        'force_password_change',
        'two_factor_enabled'
    ];

    /**
     * The attributes that should be hidden for serialization.
     */
    protected $hidden = [
        'password',
        'remember_token',
        'token',
    ];

    /**
     * Cast attributes to native types.
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'permissions' => 'array',
    ];

    /**
     * Get the user's full name.
     */
    public function getNameAttribute()
    {
        return trim($this->fname . ' ' . $this->mname . ' ' . $this->lname);
    }
}

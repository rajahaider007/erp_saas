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
        'phone',
        'pincode',
        'loginid',
        'password',
        'comp_id',
        'location_id',
        'dept_id',
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
     * Get the name of the unique identifier for the user.
     */
    public function getAuthIdentifierName()
    {
        return 'id';
    }

    /**
     * Get the unique identifier for the user.
     */
    public function getAuthIdentifier()
    {
        return $this->id;
    }

    /**
     * Get the password for the user.
     */
    public function getAuthPassword()
    {
        return $this->password;
    }

    /**
     * Get the token value for the "remember me" session.
     */
    public function getRememberToken()
    {
        return $this->remember_token;
    }

    /**
     * Set the token value for the "remember me" session.
     */
    public function setRememberToken($value)
    {
        $this->remember_token = $value;
    }

    /**
     * Get the column name for the "remember me" token.
     */
    public function getRememberTokenName()
    {
        return 'remember_token';
    }

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

    /**
     * Get the company that owns the user.
     */
    public function company()
    {
        return $this->belongsTo(Company::class, 'comp_id');
    }

    /**
     * Get the location that owns the user.
     */
    public function location()
    {
        return $this->belongsTo(Location::class, 'location_id');
    }

    /**
     * Get the department that owns the user.
     */
    public function department()
    {
        return $this->belongsTo(Department::class, 'dept_id');
    }

    /**
     * Get the user's rights/permissions.
     */
    public function rights()
    {
        return $this->hasMany(UserRight::class);
    }

    /**
     * Check if user has specific permission for a menu
     */
    public function hasPermission($menuId, $permission = 'can_view')
    {
        $right = $this->rights()->where('menu_id', $menuId)->first();
        
        if (!$right) {
            return false;
        }

        return $right->$permission ?? false;
    }

    /**
     * Get user's accessible menus based on their rights
     */
    public function getAccessibleMenus()
    {
        $menuIds = $this->rights()->where('can_view', true)->pluck('menu_id');
        
        return Menu::whereIn('id', $menuIds)
            ->where('status', true)
            ->with(['section.module'])
            ->get();
    }
}

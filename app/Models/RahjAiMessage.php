<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RahjAiMessage extends Model
{
    protected $fillable = [
        'conversation_id',
        'role',
        'content',
        'model',
        'sources',
        'is_error',
    ];

    protected $casts = [
        'sources' => 'array',
        'is_error' => 'boolean',
    ];

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(RahjAiConversation::class, 'conversation_id');
    }
}

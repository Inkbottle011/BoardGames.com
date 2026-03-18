<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Game extends Model
{
    protected $fillable = [
        'status',
        'current_turn',
        'game_state',
        'catastrophe_count',
        'current_age',
    ];

    protected $casts = [
        'game_state'  => 'array',
        'current_age' => 'array',
    ];

    public function players()
    {
        return $this->hasMany(GamePlayer::class);
    }

    public function messages()
    {
        return $this->hasMany(Message::class);
    }
}
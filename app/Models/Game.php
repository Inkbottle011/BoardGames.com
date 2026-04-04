<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Game extends Model
{
    protected $fillable = [
        'status',
        'slug',
        'current_turn',
        'game_state',
        'catastrophe_count',
        'current_age',
        'password',
        'visibility',
        'max_players',
    ];

    protected $casts = [
        'game_state' => 'array',
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

    public function getRouteKeyName()
    {
        return 'slug';
    }
}

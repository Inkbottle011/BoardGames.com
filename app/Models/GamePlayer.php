<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GamePlayer extends Model
{
    protected $fillable = [
        'game_id',
        'user_id',
        'seat',
        'genepool',
        'points',
        'hand_cards',
        'trait_pool',
        'worlds_end_effects',
        'last_seen',
    ];

    protected $casts = [
        'hand_cards'         => 'array',
        'trait_pool'         => 'array',
        'worlds_end_effects' => 'array',
    ];

    public function game()
    {
        return $this->belongsTo(Game::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
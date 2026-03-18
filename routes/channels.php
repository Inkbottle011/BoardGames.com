<?php

use App\Models\GamePlayer;
use Illuminate\Support\Facades\Broadcast;

// default Laravel user channel — keep this
Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// lobby channel — any logged in user can join
Broadcast::channel('lobby', function ($user) {
    return ['id' => $user->id, 'name' => $user->name];
});

// game channel — only players in that game can join
Broadcast::channel('game.{gameId}', function ($user, $gameId) {
    $player = GamePlayer::where('game_id', $gameId)
                        ->where('user_id', $user->id)
                        ->first();

    if ($player) {
        return [
            'id'   => $user->id,
            'name' => $user->name,
            'seat' => $player->seat,
        ];
    }

    return false;
});
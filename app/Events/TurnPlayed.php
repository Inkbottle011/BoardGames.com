<?php

namespace App\Events;

use App\Models\Game;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TurnPlayed implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Game $game) {}

    public function broadcastOn()
    {
        return new PresenceChannel("game.{$this->game->id}");
    }

    public function broadcastWith()
    {
        return [
            'game' => [
                'id'                => $this->game->id,
                'status'            => $this->game->status,
                'current_turn'      => $this->game->current_turn,
                'catastrophe_count' => $this->game->catastrophe_count,
                'current_age'       => $this->game->current_age,
                'game_state'        => $this->game->game_state,
            ],
            'players' => $this->game->players->map(fn($p) => [
                'id'         => $p->user->id,
                'name'       => $p->user->name,
                'seat'       => $p->seat,
                'hand_cards' => $p->hand_cards,
                'trait_pool' => $p->trait_pool,
                'genepool'   => $p->genepool,
            ]),
        ];
    }
}
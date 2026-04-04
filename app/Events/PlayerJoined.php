<?php

namespace App\Events;

use App\Models\Game;
use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PlayerJoined implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Game $game,
        public User $user,
    ) {}

    public function broadcastOn()
    {
        return new PresenceChannel("game.{$this->game->id}");
    }

    public function broadcastWith()
    {
        return [
            'user' => [
                'id' => $this->user->id,
                'name' => $this->user->name,
            ],
            'game' => [
                'id' => $this->game->id,
                'status' => $this->game->status,
            ],
        ];
    }
}

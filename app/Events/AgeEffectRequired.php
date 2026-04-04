<?php

namespace App\Events;

use App\Models\Game;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AgeEffectRequired implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public int $gameId;

    public array $effect;

    public function __construct(Game $game, array $effect)
    {
        $this->gameId = $game->id;
        $this->effect = $effect;
    }

    public function broadcastOn(): PrivateChannel
    {
        return new PrivateChannel("game.{$this->gameId}");
    }

    public function broadcastWith(): array
    {
        return ['effect' => $this->effect];
    }
}

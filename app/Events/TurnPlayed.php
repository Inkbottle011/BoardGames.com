<?php

namespace App\Events;

use App\Models\Game;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TurnPlayed implements ShouldBroadcast
{
use Dispatchable, InteractsWithSockets, SerializesModels;

public int $gameId;

public function __construct(Game $game)
{
$this->gameId = $game->id;
}

public function broadcastOn(): PrivateChannel
{
return new PrivateChannel("game.{$this->gameId}");
}

public function broadcastWith(): array
{
$game = Game::with('players.user')->find($this->gameId);

return [
'game' => [
'id'                => $game->id,
'status'            => $game->status,
'current_turn'      => (int) $game->current_turn,
'catastrophe_count' => (int) $game->catastrophe_count,
'current_age'       => $game->current_age,
],
'players' => $game->players->map(fn($p) => [
'id'        => (int) $p->user_id,
'hand'      => $p->hand_cards ?? [],
'traitpool' => $p->trait_pool ?? [],
'genepool'  => (int) $p->genepool,
'points'    => (int) ($p->points ?? 0),
]),
];
}
}
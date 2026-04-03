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
public array $payload;

public function __construct(Game $game)
{
$this->gameId = $game->id;
$gameState = $game->game_state ?? [];
$agePiles = $gameState['age_piles'] ?? [[], [], []];

// Build payload at construction time — data is fresh right now
$this->payload = [
'game' => [
'id'                => $game->id,
'status'            => $game->status,
'current_turn'      => (int) $game->current_turn,
'catastrophe_count' => (int) $game->catastrophe_count,
'current_age'       => $game->current_age,
'agePile1'          => $agePiles[0] ?? [],
'agePile2'          => $agePiles[1] ?? [],
'agePile3'          => $agePiles[2] ?? [],
'ageDeckSize'       => count($gameState['age_deck'] ?? []),
'deckSize'          => $gameState['deckSize'] ?? 0,
'discardPile'       => $gameState['discardPile'] ?? [],
],
'players' => $game->players->map(fn($p) => [
'id'        => (int) $p->user_id,
'name'      => $p->user?->username ?? "Player {$p->user_id}",
'hand'      => $p->hand_cards ?? [],
'traitpool' => $p->trait_pool ?? [],
'genepool'  => (int) $p->genepool,
'points'    => (int) ($p->points ?? 0),
])->values()->toArray(),
];
}

public function broadcastOn(): PrivateChannel
{
return new PrivateChannel("game.{$this->gameId}");
}

public function broadcastWith(): array
{
return $this->payload;
}
}
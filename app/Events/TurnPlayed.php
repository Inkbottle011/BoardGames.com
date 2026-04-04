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

        $this->payload = [
            'game' => [
                'id'                => $game->id,
                'status'            => $game->status,
                'current_turn'      => (int) $game->current_turn,
                'catastrophe_count' => (int) $game->catastrophe_count,
                'current_age'       => $game->current_age,
                'agePile1'          => $agePiles[0] ? [end($agePiles[0])] : [],
                'agePile2'          => $agePiles[1] ? [end($agePiles[1])] : [],
                'agePile3'          => $agePiles[2] ? [end($agePiles[2])] : [],
                'ageDeckSize'       => count($gameState['age_deck'] ?? []),
                'deckSize'          => $gameState['deckSize'] ?? 0,
            ],
            'players' => $game->players->map(fn($p) => [
                'id'       => (int) $p->user_id,
                'name'     => $p->user?->username ?? "Player {$p->user_id}",
                'hand'     => collect($p->hand_cards ?? [])->map(fn($c) => [
                    'id'        => $c['id'] ?? null,
                    'card_name' => $c['card_name'] ?? '',
                    'color'     => $c['color'] ?? '',
                    'points'    => $c['points'] ?? 0,
                    'img'       => $c['img'] ?? '',
                    'action'    => $c['action'] ?? false,
                ])->toArray(),
                'traitpool' => collect($p->trait_pool ?? [])->map(fn($c) => [
                    'id'        => $c['id'] ?? null,
                    'card_name' => $c['card_name'] ?? '',
                    'color'     => $c['color'] ?? '',
                    'points'    => $c['points'] ?? 0,
                    'img'       => $c['img'] ?? '',
                ])->toArray(),
                'genepool' => (int) $p->genepool,
                'points'   => (int) ($p->points ?? 0),
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

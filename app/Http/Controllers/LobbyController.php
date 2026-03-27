<?php

namespace App\Http\Controllers;

use App\Models\Game;
use App\Models\GamePlayer;
use Illuminate\Http\Request;

class LobbyController extends Controller
{
    // Show all open games waiting for players
    public function index()
    {
        $games = Game::where('status', 'waiting')
                     ->with('players.user')
                     ->get();

        return view('lobby', ['games' => $games]);
    }

    // Create a new game and join it as the host
    public function create()
    {
        $game = Game::create([
            'status'            => 'waiting',
            'catastrophe_count' => 0,
            'current_turn'      => auth()->id(),
            'game_state'        => ['deckSize' => 118, 'discardPile' => []],
        ]);

        GamePlayer::create([
            'game_id'            => $game->id,
            'user_id'            => auth()->id(),
            'seat'               => 1,
            'genepool'           => 0,
            'points'             => 0,
            'hand_cards'         => [],
            'trait_pool'         => [],
            'worlds_end_effects' => [],
        ]);

        return redirect("/game/{$game->id}");
    }

    // Join an existing game
    public function join(Game $game)
    {
        // Check game is still waiting for players
        if ($game->status !== 'waiting') {
            return back()->with('error', 'Game already started');
        }

        // Check game is not full
        if ($game->players()->count() >= 4) {
            return back()->with('error', 'Game is full');
        }

        // Check player isn't already in the game
        $alreadyIn = GamePlayer::where('game_id', $game->id)
                               ->where('user_id', auth()->id())
                               ->exists();

        if ($alreadyIn) {
            return redirect("/game/{$game->id}");
        }

        // Assign next available seat dynamically
        $seat = $game->players()->count() + 1;

        GamePlayer::create([
            'game_id'            => $game->id,
            'user_id'            => auth()->id(),
            'seat'               => $seat,
            'genepool'           => 0,
            'points'             => 0,
            'hand_cards'         => [],
            'trait_pool'         => [],
            'worlds_end_effects' => [],
        ]);

        return redirect("/game/{$game->id}");
    }
}
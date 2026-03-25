<?php

namespace App\Http\Controllers;

use App\Models\Game;
use App\Models\GamePlayer;
use App\Events\TurnPlayed;
use Illuminate\Http\Request;

class GameController extends Controller
{
    public function index()
    {
        $games = Game::all();
        return view('home', compact('games'));
    }

    public function show(Game $game)
    {
        $game->load(['players.user', 'messages.user']);
        return view('game.show', ['game' => $game]);
    }

    public function playTurn(Request $request, Game $game)
    {
        if ($game->current_turn !== auth()->id()) {
            return response()->json(['error' => 'Not your turn'], 403);
        }

        $game->update([
            'current_turn'      => $request->current_turn,
            'catastrophe_count' => $request->catastrophe_count,
            'current_age'       => $request->current_age,
            'game_state'        => $request->game_state,
            'status'            => $request->status ?? $game->status,
        ]);

        foreach ($request->players as $playerData) {
            GamePlayer::where('game_id', $game->id)
                      ->where('user_id', $playerData['id'])
                      ->update([
                          'hand_cards' => $playerData['cards'],
                          'trait_pool' => $playerData['traitpool'],
                          'genepool'   => $playerData['genepool'],
                      ]);
        }

        broadcast(new TurnPlayed($game))->toOthers();

        return response()->json(['status' => 'ok']);
    }
}
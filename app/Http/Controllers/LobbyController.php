<?php

namespace App\Http\Controllers;

use App\Models\Game;
use App\Models\GamePlayer;
use Illuminate\Http\Request;

class LobbyController extends Controller
{
    // show all open games
    public function index()
    {
        $games = Game::where('status', 'waiting')
                     ->with('players.user')
                     ->get();

        return view('lobby', ['games' => $games]);
    }

    // create a new game
    public function create()
    {
        $game = Game::create(['status' => 'waiting']);

        GamePlayer::create([
            'game_id' => $game->id,
            'user_id' => auth()->id(),
            'seat'    => 1,
        ]);

        return redirect("/game/{$game->id}");
    }

    // join an existing game
    public function join(Game $game)
    {
        // check game is still waiting
        if ($game->status !== 'waiting') {
            return back()->with('error', 'Game already started');
        }

        // check player isnt already in the game
        $alreadyIn = GamePlayer::where('game_id', $game->id)
                               ->where('user_id', auth()->id())
                               ->exists();

        if ($alreadyIn) {
            return redirect("/game/{$game->id}");
        }

        GamePlayer::create([
            'game_id' => $game->id,
            'user_id' => auth()->id(),
            'seat'    => 2,
        ]);

        // start the game if we now have 2 players
        if ($game->players()->count() >= 2) {
            $game->update(['status' => 'active']);
        }

        return redirect("/game/{$game->id}");
    }
}
<?php

namespace App\Http\Controllers;

use App\Models\Game;
use App\Models\GamePlayer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class LobbyController extends Controller
{
// Show all open games waiting for players
// Shows public games + private games the user is already in
public function index()
{
$games = Game::where('status', 'waiting')
->where(function($q) {
$q->where('visibility', 'public')
->orWhereHas('players', function($q) {
$q->where('user_id', auth()->id());
});
})
->with('players.user')
->get();

return view('lobby', ['games' => $games]);
}

// Create a new game and join it as the host
public function create()
{
$existingGame = GamePlayer::where('user_id', auth()->id())
->whereHas('game', fn($q) => $q->where('status', 'waiting'))
->first();

$visibility = request('visibility', 'public');
$password = null;

// Hash password if game is private and password is provided
if ($visibility === 'private' && request('password')) {
$password = bcrypt(request('password'));
}

// Generate unique 6 character code
$slug = strtoupper(substr(str_shuffle('ABCDEFGHJKLMNPQRSTUVWXYZ23456789'), 0, 6));

$game = Game::create([
    'status'            => 'waiting',
    'slug'              => $slug,
    'catastrophe_count' => 0,
    'current_turn'      => auth()->id(),
    'game_state'        => ['deckSize' => 118, 'discardPile' => []],
    'visibility'        => $visibility,
    'password'          => $password,
    'max_players'       => request('max_players', 4),
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

return redirect("/game/{$game->slug}");
}

// Join an existing game
public function join(Game $game)
{
$existingGame = GamePlayer::where('user_id', auth()->id())
->whereHas('game', fn($q) => $q->where('status', 'waiting'))
->first();
// Check game is still waiting for players
if ($game->status !== 'waiting') {
return back()->with('error', 'Game already started');
}

// Check game is not full
if ($game->players()->count() >= 4) {
return back()->with('error', 'Game is full');
}

// Check password for private games
if ($game->visibility === 'private') {
if (!request('password') || !Hash::check(request('password'), $game->password)) {
return back()->with('error', 'Incorrect password');
}
}

// Check player isn't already in the game
$alreadyIn = GamePlayer::where('game_id', $game->id)
->where('user_id', auth()->id())
->exists();

if ($alreadyIn) {
return redirect("/game/{$game->slug}");
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

return redirect("/game/{$game->slug}");
}
}
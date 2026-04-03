<?php

namespace App\Http\Controllers;

use App\Models\Game;
use App\Models\GamePlayer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class LobbyController extends Controller
{
public function index()
{
$games = Game::where('status', 'waiting')
->where(function($q) {
$q->where('visibility', 'public')
->orWhere('visibility', 'private')  // show all games
->orWhereHas('players', function($q) {
$q->where('user_id', auth()->id());
});
})
->with('players.user')
->get();

return view('lobby', ['games' => $games]);
}

public function create()
{
$visibility = request('visibility', 'public');
$password = null;

if ($visibility === 'private' && request('password')) {
$password = bcrypt(request('password'));
}

$slug = strtoupper(substr(str_shuffle('ABCDEFGHJKLMNPQRSTUVWXYZ23456789'), 0, 6));

$game = Game::create([
'status'            => 'waiting',
'slug'              => $slug,
'catastrophe_count' => 0,
'current_turn'      => auth()->id(),
'game_state'        => ['deck' => [], 'deckSize' => 0, 'discardPile' => []],
'visibility'        => $visibility,
'password'          => $password,
'max_players'       => request('max_players', 4),
]);

GamePlayer::create([
'game_id'            => $game->id,
'user_id'            => auth()->id(),
'seat'               => 1,
'genepool'           => 5,
'points'             => 0,
'hand_cards'         => [],
'trait_pool'         => [],
'worlds_end_effects' => [],
]);

return redirect("/game/{$game->slug}");
}

public function join(Game $game)
{
if ($game->status !== 'waiting') {
return back()->with('error', 'Game already started');
}

if ($game->players()->count() >= $game->max_players) {
return back()->with('error', 'Game is full');
}

if ($game->visibility === 'private') {
if (!request('password') || !Hash::check(request('password'), $game->password)) {
return back()->with('error', 'Incorrect password');
}
}

$alreadyIn = GamePlayer::where('game_id', $game->id)
->where('user_id', auth()->id())
->exists();

if ($alreadyIn) {
return redirect("/game/{$game->slug}");
}

$seat = $game->players()->count() + 1;

GamePlayer::create([
'game_id'            => $game->id,
'user_id'            => auth()->id(),
'seat'               => $seat,
'genepool'           => 5,
'points'             => 0,
'hand_cards'         => [],
'trait_pool'         => [],
'worlds_end_effects' => [],
]);

return redirect("/game/{$game->slug}");
}
}
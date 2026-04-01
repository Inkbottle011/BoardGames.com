<?php

namespace App\Http\Controllers;

use App\Models\Game;
use App\Models\GamePlayer;
use App\Events\TurnPlayed;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
class GameController extends Controller
{
public function show(Game $game)
{
$game->load(['players.user']);

// Only return JSON if explicitly requested via Accept header
if (request()->ajax() || request()->header('Accept') === 'application/json') {
return response()->json([
'id'                => $game->id,
'age'               => $game->current_age,
'catastrophe'       => $game->catastrophe_count >= 3,
'catastrophe_count' => $game->catastrophe_count,
'current_turn'      => $game->current_turn,
'status'            => $game->status,
'deckSize'          => $game->game_state['deckSize'] ?? 0,
'discardPile'       => $game->game_state['discardPile'] ?? [],
'players'           => $game->players->map(fn($p) => [
'id'        => $p->user_id,
'hand'      => $p->hand_cards ?? [],
'traitpool' => $p->trait_pool ?? [],
'genepool'  => $p->genepool,
'points'    => $p->points ?? 0,
]),
]);
}

$game->load(['players.user', 'messages.user']);
return view('game', ['game' => $game]);
}

public function playTurn(Request $request, Game $game)
{
// Check game is active
if ($game->status !== 'active') {
return response()->json(['error' => 'Game is not active'], 400);
}

// Check it is the player's turn
if ($game->current_turn !== auth()->id()) {
return response()->json(['error' => 'Not your turn'], 403);
}

// Check player is in this game
$gamePlayer = GamePlayer::where('game_id', $game->id)
->where('user_id', auth()->id())
->first();

if (!$gamePlayer) {
return response()->json(['error' => 'You are not in this game'], 403);
}

// Validate the card being played exists in the player's hand
$hand = $gamePlayer->hand_cards ?? [];
$cardId = $request->cardId;
$cardInHand = collect($hand)->firstWhere('id', $cardId);

if (!$cardInHand) {
return response()->json(['error' => 'Card not in hand'], 400);
}

// Validate request data
$request->validate([
'current_turn'      => 'required',
'catastrophe_count' => 'required|integer|min:0',
'players'           => 'required|array',
'players.*.id'      => 'required',
'players.*.cards'   => 'required|array',
'players.*.traitpool' => 'required|array',
'players.*.genepool'  => 'required|integer|min:0',
'players.*.points'    => 'required|integer',
]);

// Update game state
$game->update([
'current_turn'      => $request->current_turn,
'catastrophe_count' => $request->catastrophe_count,
'current_age'       => $request->current_age,
'game_state'        => $request->game_state,
'status'            => $request->status ?? $game->status,
]);

// Update each player's state
foreach ($request->players as $playerData) {
GamePlayer::where('game_id', $game->id)
->where('user_id', $playerData['id'])
->update([
'hand_cards' => $playerData['cards'],
'trait_pool' => $playerData['traitpool'],
'genepool'   => $playerData['genepool'],
'points'     => $playerData['points'] ?? 0,
]);
}

broadcast(new TurnPlayed($game))->toOthers();

// Return full updated game state
$game->load(['players.user']);
return response()->json([
'id'                => $game->id,
'age'               => $game->current_age,
'catastrophe'       => $game->catastrophe_count >= 3,
'catastrophe_count' => $game->catastrophe_count,
'current_turn'      => $game->current_turn,
'status'            => $game->status,
'deckSize'          => $game->game_state['deckSize'] ?? 0,
'discardPile'       => $game->game_state['discardPile'] ?? [],
'players'           => $game->players->map(fn($p) => [
'id'        => $p->user_id,
'hand'      => $p->hand_cards ?? [],
'traitpool' => $p->trait_pool ?? [],
'genepool'  => $p->genepool,
'points'    => $p->points ?? 0,
]),
]);
}
public function startGame(Game $game)
{
$host = $game->players()->orderBy('seat')->first();
if ($host->user_id !== auth()->id()) {
return back()->with('error', 'Only the host can start the game');
}

if ($game->players()->count() < 2) {
return back()->with('error', 'Need at least 2 players to start');
}

// Shuffle deck
$deck = DB::table('doomlings_deck')->get()->shuffle();
$cardIndex = 0;

// Deal 5 cards to each player
foreach ($game->players as $player) {
$hand = $deck->slice($cardIndex, 5)->map(fn($c) => [
'id'        => $c->id,
'card_name' => $c->card_name,
'points'    => $c->points,
'img'       => $c->img,
'text'      => $c->text,
'color'     => $c->color,
'dominant'  => $c->dominant,
'action'    => $c->action,
])->values()->toArray();

$cardIndex += 5;

$player->update(['hand_cards' => $hand]);
}

// Update game state with remaining deck size
$game->update([
'status'       => 'active',
'current_turn' => $host->user_id,
'game_state'   => [
'deckSize'    => $deck->count() - $cardIndex,
'discardPile' => [],
],
]);

return redirect("/game/{$game->slug}");
}

public function leave(Game $game)
{
GamePlayer::where('game_id', $game->id)
->where('user_id', auth()->id())
->delete();

if ($game->players()->count() === 0) {
$game->delete();
} else {
$newHost = $game->players()->orderBy('seat')->first();
if ($newHost) {
$newHost->update(['seat' => 1]);
}
}

// If JSON request (beacon) return ok, otherwise redirect
if (request()->expectsJson() || request()->isMethod('post') && !request()->has('_token')) {
return response()->json(['status' => 'ok']);
}

return redirect('/lobby');
}
public function heartbeat(Game $game)
{
GamePlayer::where('game_id', $game->id)
->where('user_id', auth()->id())
->update(['last_seen' => now()]);

return response()->json(['status' => 'ok']);
}
}
<?php

namespace App\Http\Controllers;

use App\Models\Game;
use App\Models\GamePlayer;
use App\Events\TurnPlayed;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class GameController extends Controller
{
public function show(Game $game)
{
$game->load(['players.user']);

if (request()->ajax() || request()->header('Accept') === 'application/json') {
return response()->json($this->formatGameState($game));
}

$game->load(['players.user', 'messages.user']);
return view('game', ['game' => $game]);
}

public function playTurn(Request $request, Game $game)
{
if ($game->status !== 'active') {
return response()->json(['error' => 'Game is not active'], 400);
}

if ((int) $game->current_turn !== (int) auth()->id()) {
return response()->json([
'error'        => 'Not your turn',
'current_turn' => $game->current_turn,
'your_id'      => auth()->id(),
], 403);
}

$gamePlayer = GamePlayer::where('game_id', $game->id)
->where('user_id', auth()->id())
->first();

if (!$gamePlayer) {
return response()->json(['error' => 'You are not in this game'], 403);
}

$validator = Validator::make($request->all(), [
'current_turn'        => 'required',
'catastrophe_count'   => 'required|integer|min:0',
'players'             => 'required|array',
'players.*.id'        => 'required',
'players.*.cards'     => 'present|array',
'players.*.traitpool' => 'present|array',
'players.*.genepool'  => 'required|integer|min:0',
'players.*.points'    => 'required|integer',
]);

if ($validator->fails()) {
return response()->json(['error' => $validator->errors()], 422);
}

// Get current deck from game_state
$gameState   = $game->game_state ?? [];
$deck        = $gameState['deck'] ?? [];
$discardPile = $gameState['discardPile'] ?? [];

// Update each player's state, dealing cards to the player who just played
foreach ($request->players as $playerData) {
$playerId = (int) $playerData['id'];
$hand     = $playerData['cards'];
$genepool = (int) $playerData['genepool'];

// Deal cards back up to genepool size for the player who just played
if ($playerId === (int) auth()->id()) {
$cardsToDraw = max(0, $genepool - count($hand));
for ($i = 0; $i < $cardsToDraw; $i++) {
if (empty($deck)) break;
$hand[] = array_shift($deck);
}
}

GamePlayer::where('game_id', $game->id)
->where('user_id', $playerId)
->update([
'hand_cards' => $hand,
'trait_pool' => $playerData['traitpool'],
'genepool'   => $genepool,
'points'     => (int) ($playerData['points'] ?? 0),
]);
}

// Update game state with remaining deck
$game->update([
'current_turn'      => (int) $request->current_turn,
'catastrophe_count' => (int) $request->catastrophe_count,
'current_age'       => $request->current_age,
'game_state'        => [
'deck'        => $deck,
'deckSize'    => count($deck),
'discardPile' => $discardPile,
],
'status' => $request->status ?? $game->status,
]);

$game->load(['players.user']);

// No toOthers() — client filters own broadcast echo via lastSentTurnRef
broadcast(new TurnPlayed($game));

try {
ChatController::systemMessage($game, "Player {$gamePlayer->user->name} played a card");
} catch (\Exception $e) {
// Don't let chat failure break the game
}

return response()->json($this->formatGameState($game));
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

$allCards = DB::table('doomlings_deck')->get()->map(fn($c) => [
'id'        => $c->id,
'card_name' => $c->card_name,
'points'    => $c->points,
'img'       => $c->img,
'text'      => $c->text,
'color'     => $c->color,
'dominant'  => $c->dominant,
'action'    => $c->action,
])->shuffle()->values()->toArray();

$deck      = $allCards;
$cardIndex = 0;

foreach ($game->players as $player) {
$handSize = $player->genepool > 0 ? $player->genepool : 5;
$hand     = array_slice($deck, $cardIndex, $handSize);
$cardIndex += $handSize;
$player->update(['hand_cards' => $hand]);
}

$remainingDeck = array_slice($deck, $cardIndex);

$game->update([
'status'       => 'active',
'current_turn' => (int) $host->user_id,
'game_state'   => [
'deck'        => $remainingDeck,
'deckSize'    => count($remainingDeck),
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

private function formatGameState(Game $game): array
{
$gameState = $game->game_state ?? [];
return [
'id'                => $game->id,
'age'               => $game->current_age,
'catastrophe'       => $game->catastrophe_count >= 3,
'catastrophe_count' => (int) $game->catastrophe_count,
'current_turn'      => (int) $game->current_turn,
'status'            => $game->status,
'deckSize'          => $gameState['deckSize'] ?? 0,
'discardPile'       => $gameState['discardPile'] ?? [],
'players'           => $game->players->map(fn($p) => [
'id'        => (int) $p->user_id,
'hand'      => $p->hand_cards ?? [],
'traitpool' => $p->trait_pool ?? [],
'genepool'  => (int) $p->genepool,
'points'    => (int) ($p->points ?? 0),
]),
];
}
}
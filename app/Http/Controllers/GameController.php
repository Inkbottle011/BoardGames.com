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

$gameState   = $game->game_state ?? [];
$deck        = $gameState['deck'] ?? [];
$discardPile = $request->input('game_state.discardPile', $gameState['discardPile'] ?? []);
$ageDeck     = $gameState['age_deck'] ?? [];
$roundPlayers = $gameState['round_players'] ?? [];
$playerOrder  = $gameState['player_order'] ?? [];
$agePiles     = $gameState['age_piles'] ?? [[], [], []]; // ← moved here
$currentAge   = $game->current_age;

// Update each player's state, dealing cards to the player who just played
foreach ($request->players as $playerData) {
$playerId = (int) $playerData['id'];
$hand     = $playerData['cards'];
$genepool = (int) $playerData['genepool'];

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

// Track who has played this round
$roundPlayers[] = (int) auth()->id();
$roundPlayers = array_unique($roundPlayers);

$nextPlayerId    = (int) $request->current_turn;
$catastropheCount = (int) $request->catastrophe_count;
$newAge          = $currentAge;
$gameStatus      = $game->status;

// Check if all players have played this round
$allPlayerIds = collect($playerOrder)->map(fn($id) => (int) $id)->toArray();
$roundComplete = count(array_intersect($allPlayerIds, $roundPlayers)) === count($allPlayerIds);

if ($roundComplete) {
$roundPlayers = [];

if (!empty($ageDeck)) {
$newAge = array_shift($ageDeck);

// Add age to correct pile based on current catastrophe count
$pileIndex = min($catastropheCount, 2);
$agePiles[$pileIndex][] = $newAge;

if ($newAge['catastrophe']) {
$catastropheCount++;

// Rotate turn order
if (!empty($playerOrder)) {
$first = array_shift($playerOrder);
$playerOrder[] = $first;
$nextPlayerId = $playerOrder[0];
}

if ($catastropheCount >= 3) {
$gameStatus = 'worlds_end';
}
}

try {
ChatController::systemMessage($game, "A new age begins: {$newAge['age_name']}");
} catch (\Exception $e) {}

} else {
$catastropheCount = 3;
$gameStatus = 'worlds_end';
}
}

// Update game
$game->update([
'current_turn'      => $nextPlayerId,
'catastrophe_count' => $catastropheCount,
'current_age'       => $newAge ?? $currentAge,
'status'            => $gameStatus,
'game_state'        => [
'deck'          => $deck,
'deckSize'      => count($deck),
'discardPile'   => $discardPile,
'age_deck'      => $ageDeck,
'age_piles'     => $agePiles,
'round_players' => $roundPlayers,
'player_order'  => $playerOrder,
],
]);

$game->load(['players.user']);
broadcast(new TurnPlayed($game));

try {
ChatController::systemMessage($game, "Player {$gamePlayer->user->name} played a card");
} catch (\Exception $e) {}

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

// Build card deck
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

$cardIndex = 0;
foreach ($game->players as $player) {
$handSize = $player->genepool > 0 ? $player->genepool : 5;
$hand     = array_slice($allCards, $cardIndex, $handSize);
$cardIndex += $handSize;
$player->update(['hand_cards' => $hand]);
}
$remainingDeck = array_slice($allCards, $cardIndex);

// Build age deck
// Always start with Birth of Life
$birthOfLife = DB::table('doomlings_ages')
->where('age_name', 'The Birth of Life')
->first();

// Pick 3 random catastrophes
$catastrophes = DB::table('doomlings_ages')
->where('catastrophe', 1)
->inRandomOrder()
->limit(3)
->get()
->map(fn($a) => [
'id'          => $a->id,
'age_name'    => $a->age_name,
'img'         => $a->img,
'text'        => $a->text,
'catastrophe' => (bool) $a->catastrophe,
'world_end_text' => $a->World_End_text,
])->toArray();

// Pick 12 random normal ages
$normalAges = DB::table('doomlings_ages')
->where('catastrophe', 0)
->where('age_name', '!=', 'The Birth of Life')
->inRandomOrder()
->limit(12)
->get()
->map(fn($a) => [
'id'          => $a->id,
'age_name'    => $a->age_name,
'img'         => $a->img,
'text'        => $a->text,
'catastrophe' => (bool) $a->catastrophe,
'world_end_text' => $a->World_End_text,
])->toArray();

// Shuffle normal ages and catastrophes together, Birth of Life always first
$shuffledAges = collect(array_merge($normalAges, $catastrophes))
->shuffle()
->values()
->toArray();

$birthOfLifeFormatted = [
'id'          => $birthOfLife->id,
'age_name'    => $birthOfLife->age_name,
'img'         => $birthOfLife->img,
'text'        => $birthOfLife->text,
'catastrophe' => (bool) $birthOfLife->catastrophe,
'world_end_text' => $birthOfLife->World_End_text,
];

// Full age deck: Birth of Life first, then shuffled rest
$ageDeck = array_merge([$birthOfLifeFormatted], $shuffledAges);

// Flip Birth of Life immediately as starting age
$currentAge = array_shift($ageDeck);
$agePiles = [[$currentAge], [], []]; // Birth of Life goes in pile 1

// Player order — by seat
$playerOrder = $game->players()
->orderBy('seat')
->pluck('user_id')
->map(fn($id) => (int) $id)
->toArray();

$game->update([
'status'            => 'active',
'current_turn'      => (int) $host->user_id,
'current_age'       => $currentAge,
'catastrophe_count' => 0,
'game_state'        => [
'deck'          => $remainingDeck,
'deckSize'      => count($remainingDeck),
'discardPile'   => [],
'age_deck'      => $ageDeck,
'age_piles'     => $agePiles,
'round_players' => [],
'player_order'  => $playerOrder,
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
$agePiles = $gameState['age_piles'] ?? [[], [], []];

return [
'id'                => $game->id,
'age'               => $game->current_age,
'catastrophe'       => $game->catastrophe_count >= 3,
'catastrophe_count' => (int) $game->catastrophe_count,
'current_turn'      => (int) $game->current_turn,
'status'            => $game->status,
'deckSize'          => $gameState['deckSize'] ?? 0,
'ageDeckSize' => count($gameState['age_deck'] ?? []),
'discardPile'       => $gameState['discardPile'] ?? [],
'agePile1'          => $agePiles[0] ?? [],
'agePile2'          => $agePiles[1] ?? [],
'agePile3'          => $agePiles[2] ?? [],
'players'           => $game->players->map(fn($p) => [
'id'        => (int) $p->user_id,
'name'      => $p->user?->username ?? "Player {$p->user_id}",
'hand'      => $p->hand_cards ?? [],
'traitpool' => $p->trait_pool ?? [],
'genepool'  => (int) $p->genepool,
'points'    => (int) ($p->points ?? 0),
]),
];
}
}
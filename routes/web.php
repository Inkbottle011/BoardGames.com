<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\LobbyController;
use App\Http\Controllers\GameController;
use App\Http\Controllers\GameCatalogueController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\DB;

Route::get('/', [GameCatalogueController::class, 'index'])->name('home');

Route::get('/profile', [AuthController::class, 'showProfile'])
    ->middleware('auth')
    ->name('profile');
Route::get('/authentification', [AuthController::class, 'showLogin'])->name('authentification');
Route::post('/profile/login', [AuthController::class, 'login']);
Route::post('/profile/register', [AuthController::class, 'register']);
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

Route::get('/doomlings', function () {
return view('doomling');
})->name('doomlings');



Route::get('/login', function() {
return redirect('/profile');
})->name('login');



Route::get('/cards', function(){
return DB::table('doomlings_deck')->get();
});

Route::get('/cards/{id}', function($id){
return DB::table('doomlings_deck')->where('id', $id)->first();
});

Route::get('/test-game', function() {
$old = App\Models\Game::where('slug', 'TEST00')->first();
if ($old) {
$old->players()->delete();
$old->messages()->delete();
$old->delete();
}

$game = App\Models\Game::create([
'status'            => 'active',
'slug'              => 'TEST00',
'current_turn'      => auth()->id(),
'catastrophe_count' => 0,
'current_age'       => null,
'visibility'        => 'public',
'max_players'       => 2,
'game_state'        => ['deckSize' => 108, 'discardPile' => []],
]);

$cards = DB::table('doomlings_deck')->get()->shuffle();

App\Models\GamePlayer::create([
'game_id'            => $game->id,
'user_id'            => auth()->id(),
'seat'               => 1,
'genepool'           => 3,
'points'             => 0,
'hand_cards'         => $cards->take(5)->values()->map(fn($c) => (array)$c)->toArray(),
'trait_pool'         => [],
'worlds_end_effects' => [],
]);

App\Models\GamePlayer::create([
'game_id'            => $game->id,
'user_id'            => auth()->id(),
'seat'               => 2,
'genepool'           => 3,
'points'             => 0,
'hand_cards'         => $cards->slice(5, 5)->values()->map(fn($c) => (array)$c)->toArray(),
'trait_pool'         => [],
'worlds_end_effects' => [],
]);

return redirect("/game/TEST00");
})->middleware('auth');

Route::middleware(['auth'])->group(function () {
Route::get('/game/{game}', [GameController::class, 'show']);
Route::get('/lobby', [LobbyController::class, 'index']);
Route::post('/lobby/create', [LobbyController::class, 'create']);
Route::post('/lobby/join/{game}', [LobbyController::class, 'join']);
Route::post('/game/{game}/turn', [GameController::class, 'playTurn']);
Route::post('/game/{game}/start', [GameController::class, 'startGame']);
Route::post('/game/{game}/chat', [ChatController::class, 'send']);
Route::post('/game/{game}/leave', [GameController::class, 'leave']);
Route::post('/game/{game}/heartbeat', [GameController::class, 'heartbeat']);
Route::get('/game/{game}/messages', [ChatController::class, 'index']);
});
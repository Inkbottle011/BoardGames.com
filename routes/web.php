<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\LobbyController;
use App\Http\Controllers\GameController;
use App\Http\Controllers\ChatController;
use Illuminate\Support\Facades\DB;

Route::get('/', function () {
    return view('home');
})->name('home');

Route::view('/doomling','doomling')->name('doomling');

<<<<<<< HEAD
Route::middleware(['auth'])->group(function () {
    // lobby
    Route::get('/lobby', [LobbyController::class, 'index']);
    Route::post('/lobby/create', [LobbyController::class, 'create']);
    Route::post('/lobby/join/{game}', [LobbyController::class, 'join']);

    // game
    Route::get('/game/{game}', [GameController::class, 'show']);
    Route::post('/game/{game}/turn', [GameController::class, 'playTurn']);

    // chat
    Route::post('/game/{game}/chat', [ChatController::class, 'send']);
    Route::get('/cards', function(){
    return DB::table('doomlings_deck')->get();
});
=======
Route::get('/cards', function(){
    return DB::table('doomlings_deck')->get();
>>>>>>> df8ac1f (test)
});
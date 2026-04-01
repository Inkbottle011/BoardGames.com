<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\LobbyController;
use App\Http\Controllers\GameController;
use App\Http\Controllers\GameCatalogueController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\DB;

Route::get('/', [GameCatalogueController::class, 'index'])->name('home');

Route::get('/doomlings', function () {
    return view('doomlings');
})->name('doomlings');







Route::get('/profile', [AuthController::class, 'showLogin'])->name('authentication');
Route::post('/profile/login', [AuthController::class, 'login']);
Route::post('/profile/register', [AuthController::class, 'register']);
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// Game routes — outside auth for now
Route::get('/game/{game}', [GameController::class, 'show']);

Route::middleware(['auth'])->group(function () {
Route::get('/lobby', [LobbyController::class, 'index']);
Route::post('/lobby/create', [LobbyController::class, 'create']);
Route::post('/lobby/join/{game}', [LobbyController::class, 'join']);
Route::post('/game/{game}/turn', [GameController::class, 'playTurn']);
Route::post('/game/{game}/start', [GameController::class, 'startGame']);
Route::post('/game/{game}/chat', [ChatController::class, 'send']);
});

Route::get('/cards', function(){
return DB::table('doomlings_deck')->get();
});

Route::get('/cards/{id}', function($id){
return DB::table('doomlings_deck')->where('id', $id)->first();
});
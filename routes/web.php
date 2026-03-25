<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\LobbyController;
use App\Http\Controllers\GameController;
use App\Http\Controllers\ChatController;

Route::get('/', [GameController::class, 'index'])->name('home');

Route::get('/game/{game}', [GameController::class, 'show'])->name('game.show');
Route::post('/game/{game}/turn', [GameController::class, 'playTurn'])->name('game.turn');

Route::get('/doomling', function () {
    return view('doomling');
})->name('doomling');
Route::get('/login', function () {
    return view('Authentification');
})->name('authentication');
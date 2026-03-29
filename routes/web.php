<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\LobbyController;
use App\Http\Controllers\GameController;
use App\Http\Controllers\GameCatalogueController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\AuthController;

Route::get('/', [GameCatalogueController::class, 'index'])->name('home');

Route::get('/game/{game}', [GameController::class, 'show'])->name('game.show');
Route::post('/game/{game}/turn', [GameController::class, 'playTurn'])->name('game.turn');

Route::get('/doomling', function () {
    return view('doomling');
})->name('doomling');







Route::get('/profile', [AuthController::class, 'showLogin'])->name('authentication');
Route::post('/profile/login', [AuthController::class, 'login']);
Route::post('/profile/register', [AuthController::class, 'register']);
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
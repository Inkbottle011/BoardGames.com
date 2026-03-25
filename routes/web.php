<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\LobbyController;
use App\Http\Controllers\GameController;
use App\Http\Controllers\ChatController;
use Illuminate\Support\Facades\DB;

Route::get('/', [GameController::class, 'index'])->name('home');

Route::get('/doomling', function () {
    return view('doomling');
})->name('doomling');

Route::get('/Authentification', function () {
    return view('Authentification');
})->name('Authentification');


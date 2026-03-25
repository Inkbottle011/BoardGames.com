<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\GameController;

Route::get('/', [GameController::class, 'index'])->name('home');

Route::get('/doomling', function () {
    return view('doomling');
})->name('doomling');

Route::get('/Authentification', function () {
    return view('Authentification');
})->name('Authentification');


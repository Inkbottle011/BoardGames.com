<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('home');
})->name('home');

Route::view('/doomling','doomling')->name('doomling');

Route::get('/cards', function(){
    return DB::table('doomlings_deck')->get();
});
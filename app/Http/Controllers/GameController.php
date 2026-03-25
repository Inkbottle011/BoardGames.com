<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\GameCatalogue;

class GameController extends Controller
{
    public function index()
{
    $games = GameCatalogue::all();
    return view('home', compact('games'));
}
}

<?php

namespace App\Http\Controllers;

use App\Models\GameCatalogue;

class GameCatalogueController extends Controller
{
    public function index()
    {
        $games = GameCatalogue::all();

        return view('home', compact('games'));
    }
}

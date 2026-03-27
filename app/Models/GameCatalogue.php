<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GameCatalogue extends Model
{
    protected $table = "gamecatalogues";
    protected $fillable = ['thumbnail', 'title', 'slug', 'description', 'genre'];
}

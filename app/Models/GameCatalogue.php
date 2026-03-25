<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GameCatalogue extends Model
{
    protected $fillable = ['title', 'slug', 'description', 'genre', 'thumbnail'];
}

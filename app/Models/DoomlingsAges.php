<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DoomlingsAges extends Model
{
    protected $table = 'doomlings_ages';

    protected $fillable = [
        'id',
        'card_name',
        'img',
        'catastrophe',
    ];
}

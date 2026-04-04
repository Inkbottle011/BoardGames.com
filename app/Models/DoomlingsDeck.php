<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DoomlingsDeck extends Model
{
    protected $table = 'doomlings_deck';

    protected $fillable = [
        'id',
        'card_name',
        'img',
        'text',
        'color',
        'dominant',
        'action',
    ];
}

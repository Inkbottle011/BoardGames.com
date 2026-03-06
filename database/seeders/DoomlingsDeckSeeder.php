<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\DoomlingsDeck;
use Illuminate\Database\Seeder;

class DoomlingsDeckSeeder extends Seeder
{
    public function run(): void
    {
        $cards = json_decode(file_get_contents(database_path('seeders/cards.json')), true);

        foreach ($cards as $card) {
            DoomlingsDeck::create($card);
        }
    }
}

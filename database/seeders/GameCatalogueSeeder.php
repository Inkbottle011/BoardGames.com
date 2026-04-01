<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class GameCatalogueSeeder extends Seeder
{
public function run(): void
{
DB::table('game_catalogues')->insertOrIgnore([[
'title'       => 'Doomlings',
'description' => 'Card Game',
'genre'       => 'Strategy',
'slug'        => 'doomlings',
'thumbnail'   => 'doomlings.jpg',
'created_at'  => now(),
'updated_at'  => now(),
],
]);
}
}
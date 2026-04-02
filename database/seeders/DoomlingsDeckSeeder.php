<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\DoomlingsDeck;
use Illuminate\Database\Seeder;

class DoomlingsDeckSeeder extends Seeder
{
public function run(): void
{
DB::table('doomlings_deck')->truncate();
$cards = json_decode(file_get_contents(database_path('seeders/cards.json')), true);

foreach ($cards as $card) {
DoomlingsDeck::create($card);
}
}
}
// run php artisan db:seed --class=DoomlingsDeckSeeder to load cards into database
//php artisan migrate:fresh --seed for loading all seeds fresh
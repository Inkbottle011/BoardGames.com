<?php

namespace Database\Seeders;

use App\Models\DoomlingsDeck;
use Illuminate\Database\Seeder;

class DoomlingsDeckSeeder extends Seeder
{
public function run(): void
{
DoomlingsDeck::truncate();

$cards = json_decode(file_get_contents(database_path('seeders/cards.json')), true);

foreach ($cards as $card) {
// Normalize img — derive from card_name if missing or empty
if (empty($card['img'])) {
$filename = str_replace(' ', '_', $card['card_name']).'.png';
$card['img'] = "images/doomlings_basegame_images/cards/{$filename}";
} else {
// Ensure consistent path format
$card['img'] = $this->normalizeCardImg($card['img'], $card['card_name']);
}

DoomlingsDeck::create($card);
}
}

private function normalizeCardImg(string $img, string $cardName): string
{
// Special cases where filename doesn't match card name pattern
$special = [
'The Third Eye' => 'TheThirdEye.png',
'Optimistic Nihilism' => 'Optimistic Nihilism.png',
'Super Spreader' => 'Super Spreader.png',
'Hyper-Intelligence'  => 'Hyper_Intelligence.png',
];

foreach ($special as $name => $file) {
if (str_contains($cardName, $name)) {
return "images/doomlings_basegame_images/cards/{$file}";
}
}

// Strip directory if already has full path, rebuild clean
$basename = basename($img);
if (empty($basename) || $basename === $img) {
$basename = str_replace(' ', '_', $cardName).'.png';
}

return "images/doomlings_basegame_images/cards/{$basename}";
}
}

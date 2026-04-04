<?php

namespace Database\Seeders;

use App\Models\DoomlingsAges;
use Illuminate\Database\Seeder;

class DoomlingsAgesSeeder extends Seeder
{
    public function run(): void
    {
        DoomlingsAges::truncate();

        $ages = json_decode(file_get_contents(database_path('seeders/ages.json')), true);

        foreach ($ages as $age) {
            $age['img'] = $this->normalizeAgeImg($age['age_name']);
            DoomlingsAges::create($age);
        }
    }

    private function normalizeAgeImg(string $ageName): string
    {
        // Special cases where filename doesn't match age_name pattern
        $special = [
            'Tectonic Shifts' => 'Tectonic_Shift', // file is singular
        ];

        if (isset($special[$ageName])) {
            return "images/doomlings_basegame_images/ages/{$special[$ageName]}";
        }

        // Standard: spaces to underscores, no extension (added at render)
        $filename = str_replace(' ', '_', $ageName);

        return "images/doomlings_basegame_images/ages/{$filename}";
    }
}

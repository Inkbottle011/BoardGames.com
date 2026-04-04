<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            \Database\Seeders\DoomlingsAgesSeeder::class,
            \Database\Seeders\DoomlingsDeckSeeder::class,
        ]);

        $this->call([
            GameCatalogueSeeder::class,
        ]);
    }
}

// To sync databses:
// git pull
// composer install
// php artisan migrate
// php artisan db:seed

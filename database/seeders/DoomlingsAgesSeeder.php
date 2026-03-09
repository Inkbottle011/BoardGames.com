<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\DoomlingsAges;
use Illuminate\Database\Seeder;

class DoomlingsAgesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $age = json_decode(file_get_contents(database_path('seeders/ages.json')), true);

        foreach ($age as $age) {
            DoomlingsAges::create($age);
        }
    }
}
// run php artisan db:seed --class=DoomlingsAgesSeeder to load into database
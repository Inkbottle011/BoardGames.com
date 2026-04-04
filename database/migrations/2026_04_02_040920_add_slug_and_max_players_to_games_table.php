<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('games', function (Blueprint $table) {
            $table->string('slug')->unique()->nullable()->after('status');
            $table->integer('max_players')->default(4)->after('visibility');
        });
    }

    public function down(): void
    {
        Schema::table('games', function (Blueprint $table) {
            $table->dropColumn(['slug', 'max_players']);
        });
    }
};

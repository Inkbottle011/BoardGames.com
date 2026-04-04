<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('game_players', function (Blueprint $table) {
            $table->timestamp('last_seen')->nullable()->after('points');
        });
    }

    public function down(): void
    {
        Schema::table('game_players', function (Blueprint $table) {
            $table->dropColumn('last_seen');
        });
    }
};

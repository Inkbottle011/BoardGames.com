<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('doomlings_deck', function (Blueprint $table) {
            $table->id();
            $table->string('card_name');
            $table->integer('points');
            $table->string('img');
            $table->string('text')->nullable();
            $table->string('color');
            $table->boolean('dominant');
            $table->boolean('action');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('doomlings_deck');
    }
};

<?php

namespace App\Console\Commands;

use App\Models\Game;
use App\Models\GamePlayer;
use Illuminate\Console\Command;

class CleanInactiveLobbies extends Command
{
protected $signature = 'lobbies:clean';
protected $description = 'Remove players who have been inactive for over 3 minute in waiting games';

public function handle()
{
// Find players in waiting games who haven't sent a heartbeat in 3 minute
$inactive = GamePlayer::whereHas('game', fn($q) => $q->where('status', 'waiting'))
->where('last_seen', '<', now()->subMinute(3))
->orWhereNull('last_seen')
->whereHas('game', fn($q) => $q->where('status', 'waiting'))
->get();

foreach ($inactive as $player) {
$player->delete();
}

// Delete empty waiting games
Game::where('status', 'waiting')
->doesntHave('players')
->delete();

$this->info('Cleaned ' . $inactive->count() . ' inactive players');
}
}
<?php

namespace App\Http\Controllers;

use App\Models\Game;
use App\Models\Message;
use App\Models\GamePlayer;
use App\Events\MessageSent;
use Illuminate\Http\Request;

class ChatController extends Controller
{
public function send(Request $request, Game $game)
{
// Check player is in this game
$inGame = GamePlayer::where('game_id', $game->id)
->where('user_id', auth()->id())
->exists();

if (!$inGame) {
return response()->json(['error' => 'You are not in this game'], 403);
}

$request->validate([
'body' => 'required|string|max:500',
]);

$message = Message::create([
'game_id' => $game->id,
'user_id' => auth()->id(),
'body'    => $request->body,
]);

$message->load('user');

// Broadcast to all other players in the game
broadcast(new MessageSent($message))->toOthers();

return response()->json($message);
}
}
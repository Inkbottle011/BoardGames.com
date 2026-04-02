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
'type'    => 'user',
]);

$message->load('user');

broadcast(new MessageSent($message))->toOthers();

return response()->json([
'id'         => $message->id,
'body'       => $message->body,
'type'       => $message->type,
'created_at' => $message->created_at,
'user'       => [
'id'       => $message->user->id,
'username' => $message->user->username,
],
]);
}

public function index(Game $game)
{
$messages = $game->messages()
->with('user')
->orderBy('created_at')
->get()
->map(fn($m) => [
'id'         => $m->id,
'body'       => $m->body,
'type'       => $m->type ?? 'user',
'created_at' => $m->created_at,
'user'       => $m->user ? [
'id'       => $m->user->id,
'username' => $m->user->username,
] : null,
]);

return response()->json($messages);
}

public static function systemMessage(Game $game, string $body)
{
// Use the host's user_id to satisfy the foreign key constraint
$host = GamePlayer::where('game_id', $game->id)
->orderBy('seat')
->first();

if (!$host) return;

$message = Message::create([
'game_id' => $game->id,
'user_id' => $host->user_id,
'body'    => $body,
'type'    => 'system',
]);

broadcast(new MessageSent($message))->toOthers();
}
}
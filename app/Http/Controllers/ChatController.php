<?php

namespace App\Http\Controllers;

use App\Models\Game;
use App\Models\Message;
use App\Events\MessageSent;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    public function send(Request $request, Game $game)
    {
        $request->validate([
            'body' => 'required|string|max:500',
        ]);

        $message = Message::create([
            'game_id' => $game->id,
            'user_id' => auth()->id(),
            'body'    => $request->body,
        ]);

        $message->load('user');

        // broadcast to all other players in the game
        broadcast(new MessageSent($message))->toOthers();

        return response()->json($message);
    }
}
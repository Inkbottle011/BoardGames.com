<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Message $message) {}

    public function broadcastOn()
    {
        return new PrivateChannel("game.{$this->message->game_id}");
    }

    public function broadcastWith()
    {
        return [
            'message' => [
                'id' => $this->message->id,
                'body' => $this->message->body,
                'created_at' => $this->message->created_at,
                'user' => [
                    'id' => $this->message->user->id,
                    'username' => $this->message->user->username,
                ],
            ],
        ];
    }
}

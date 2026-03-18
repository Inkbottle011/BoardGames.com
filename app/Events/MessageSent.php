<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Message $message) {}

    public function broadcastOn()
    {
        return new PresenceChannel("game.{$this->message->game_id}");
    }

    public function broadcastWith()
    {
        return [
            'message' => [
                'id'   => $this->message->id,
                'body' => $this->message->body,
                'user' => [
                    'id'   => $this->message->user->id,
                    'name' => $this->message->user->name,
                ],
            ],
        ];
    }
}

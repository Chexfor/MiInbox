<?php

namespace App\Events;

use App\Domain\Communication\Entities\Message;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;

class MessageSent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Message $message;

    /**
     * Create a new event instance.
     */
    public function __construct(Message $message)
    {
        $this->message = $message;
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        // Emitir evento a todos los participantes en su canal privado personal
        $participants = DB::table('thread_user')
            ->where('thread_id', $this->message->thread_id)
            ->pluck('user_id');

        $channels = [];
        foreach ($participants as $userId) {
            $channels[] = new PrivateChannel('user.' . $userId);
        }

        return $channels;
    }

    /**
     * Data attached to the broadcast.
     */
    public function broadcastWith(): array
    {
        $this->message->loadMissing('sender');
        $resource = new \App\Http\Resources\MessageResource($this->message);
        return $resource->resolve(); 
    }
}

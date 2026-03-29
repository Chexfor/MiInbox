<?php

namespace App\Domain\Shared\Events\Auth;

use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

final class UserSessionStarted implements ShouldBroadcast
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public readonly string $userName,
        public readonly string $startedAt,
    ) {}

    /**
     * Broadcast on a public channel so the front-end can listen without auth.
     */
    public function broadcastOn(): Channel
    {
        return new Channel('presence');
    }

    public function broadcastAs(): string
    {
        return 'user.session.started';
    }
}

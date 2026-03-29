<?php

namespace App\Infrastructure\Communication\Repositories;

use App\Domain\Communication\Contracts\MessageRepositoryInterface;
use App\Domain\Communication\Entities\Message;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class EloquentMessageRepository implements MessageRepositoryInterface
{
    public function findById(int $id): ?Message
    {
        return Message::find($id);
    }

    public function getThreadMessages(int $threadId, int $limit = 50): Collection
    {
        return Message::where('thread_id', $threadId)
            ->with('sender')
            ->latest()
            ->limit($limit)
            ->get()
            ->reverse();
    }

    public function create(array $data): Message
    {
        return Message::create($data);
    }

    public function markAsRead(int $threadId, int $userId): void
    {
        Message::where('thread_id', $threadId)
            ->where('sender_id', '!=', $userId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        DB::table('thread_user')
            ->where('thread_id', $threadId)
            ->where('user_id', $userId)
            ->update(['unread_count' => 0]);
    }
}

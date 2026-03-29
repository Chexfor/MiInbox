<?php

namespace App\Infrastructure\Communication\Repositories;

use App\Domain\Communication\Contracts\ThreadRepositoryInterface;
use App\Domain\Communication\Entities\Thread;
use Illuminate\Support\Collection;

class EloquentThreadRepository implements ThreadRepositoryInterface
{
    public function findById(int $id): ?Thread
    {
        return Thread::find($id);
    }

    public function getAllForUser(int $userId): Collection
    {
        return Thread::whereHas('participants', function ($query) use ($userId) {
            $query->where('user_id', $userId);
        })
        ->with(['participants', 'latestMessage.sender'])
        ->orderBy('last_message_at', 'desc')
        ->get();
    }

    public function findBetweenUsers(int $userId, int $otherUserId): ?Thread
    {
        return Thread::where('is_group', false)
            ->whereHas('participants', fn($q) => $q->where('user_id', $userId))
            ->whereHas('participants', fn($q) => $q->where('user_id', $otherUserId))
            ->first();
    }

    public function create(array $data): Thread
    {
        return Thread::create($data);
    }

    public function addParticipants(Thread $thread, array $userIds): void
    {
        $thread->participants()->syncWithoutDetaching($userIds);
    }

    public function updateLastMessageAt(int $threadId): void
    {
        Thread::where('id', $threadId)->update([
            'last_message_at' => now()
        ]);
    }
}

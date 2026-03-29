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

    public function getAllForUserPaginated(int $userId, int $limit = 20, ?string $search = null)
    {
        $query = Thread::whereHas('participants', function ($q) use ($userId) {
            $q->where('user_id', $userId);
        })
        ->with(['participants', 'latestMessage.sender'])
        ->orderBy('last_message_at', 'desc');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('subject', 'like', "%{$search}%")
                  ->orWhereHas('participants', function ($pq) use ($search) {
                      $pq->where('name', 'like', "%{$search}%");
                  });
            });
        }

        return $query->paginate($limit);
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

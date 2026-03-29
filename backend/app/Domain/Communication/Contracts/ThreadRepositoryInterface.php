<?php

namespace App\Domain\Communication\Contracts;

use App\Domain\Communication\Entities\Thread;
use Illuminate\Support\Collection;

interface ThreadRepositoryInterface
{
    public function findById(int $id): ?Thread;
    
    public function getAllForUser(int $userId): Collection;
    
    public function getAllForUserPaginated(int $userId, int $limit = 20, ?string $search = null);
    
    public function findBetweenUsers(int $userId, int $otherUserId): ?Thread;
    
    public function create(array $data): Thread;
    
    public function addParticipants(Thread $thread, array $userIds): void;
    
    public function updateLastMessageAt(int $threadId): void;
}

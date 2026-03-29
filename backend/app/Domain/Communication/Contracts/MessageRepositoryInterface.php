<?php

namespace App\Domain\Communication\Contracts;

use App\Domain\Communication\Entities\Message;
use Illuminate\Support\Collection;

interface MessageRepositoryInterface
{
    public function findById(int $id): ?Message;
    
    public function getThreadMessages(int $threadId, int $limit = 50): Collection;
    
    public function getThreadMessagesPaginated(int $threadId, int $limit = 50, ?int $beforeId = null): Collection;
    
    public function create(array $data): Message;
    
    public function markAsRead(int $threadId, int $userId): void;
}

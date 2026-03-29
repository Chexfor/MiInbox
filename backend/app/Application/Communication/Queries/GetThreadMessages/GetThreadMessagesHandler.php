<?php

namespace App\Application\Communication\Queries\GetThreadMessages;

use App\Domain\Communication\Contracts\MessageRepositoryInterface;
use Illuminate\Support\Collection;

final class GetThreadMessagesHandler
{
    public function __construct(
        private readonly MessageRepositoryInterface $messageRepository
    ) {}

    /**
     * Handle the query to get all messages for a thread and mark them as read.
     */
    public function handle(GetThreadMessagesQuery $query): Collection
    {
        // Mark messages as read for this user in this thread
        $this->messageRepository->markAsRead($query->threadId, $query->currentUserId);

        // Retrieve messages with eager loading
        return $this->messageRepository->getThreadMessages($query->threadId, $query->limit);
    }
}

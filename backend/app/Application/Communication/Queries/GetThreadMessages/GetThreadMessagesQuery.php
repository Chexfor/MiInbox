<?php

namespace App\Application\Communication\Queries\GetThreadMessages;

final class GetThreadMessagesQuery
{
    public function __construct(
        public readonly int $threadId,
        public readonly int $currentUserId,
        public readonly int $limit = 50,
        public readonly ?int $beforeId = null
    ) {}
}

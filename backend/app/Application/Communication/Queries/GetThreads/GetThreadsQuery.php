<?php

namespace App\Application\Communication\Queries\GetThreads;

final class GetThreadsQuery
{
    public function __construct(
        public readonly int $userId,
        public readonly int $limit = 20,
        public readonly ?string $search = null
    ) {}
}

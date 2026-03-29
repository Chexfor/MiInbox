<?php

namespace App\Application\Communication\Queries\GetThreads;

final class GetThreadsQuery
{
    public function __construct(
        public readonly int $userId
    ) {}
}

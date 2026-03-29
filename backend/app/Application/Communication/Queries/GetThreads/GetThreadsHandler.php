<?php

namespace App\Application\Communication\Queries\GetThreads;

use App\Domain\Communication\Contracts\ThreadRepositoryInterface;
use Illuminate\Support\Collection;

final class GetThreadsHandler
{
    public function __construct(
        private readonly ThreadRepositoryInterface $threadRepository
    ) {}

    /**
     * Handle the query to get all threads for a user.
     */
    public function handle(GetThreadsQuery $query): mixed
    {
        return $this->threadRepository->getAllForUserPaginated(
            $query->userId,
            $query->limit,
            $query->search
        );
    }
}

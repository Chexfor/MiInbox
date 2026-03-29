<?php

namespace App\Application\Communication\Commands\CreateThread;

use App\Domain\Communication\Contracts\ThreadRepositoryInterface;
use App\Domain\Communication\Entities\Thread;

final class CreateThreadHandler
{
    public function __construct(
        private readonly ThreadRepositoryInterface $threadRepository
    ) {}

    /**
     * Handle the creation of a new thread conversation.
     */
    public function handle(CreateThreadCommand $command): Thread
    {
        // For non-groups, check if a conversation already exists between the first two participants
        if (!$command->isGroup && count($command->participantIds) === 2) {
            $existingThread = $this->threadRepository->findBetweenUsers(
                $command->participantIds[0],
                $command->participantIds[1]
            );

            if ($existingThread) {
                return $existingThread;
            }
        }

        $thread = $this->threadRepository->create([
            'subject' => $command->subject ?? 'Nueva Conversación',
            'is_group' => $command->isGroup,
        ]);

        $this->threadRepository->addParticipants($thread, $command->participantIds);

        return $thread;
    }
}

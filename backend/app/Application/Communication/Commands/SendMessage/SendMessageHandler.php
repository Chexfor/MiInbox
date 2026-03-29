<?php

namespace App\Application\Communication\Commands\SendMessage;

use App\Domain\Communication\Contracts\MessageRepositoryInterface;
use App\Domain\Communication\Contracts\ThreadRepositoryInterface;
use App\Domain\Communication\Entities\Message;
use Illuminate\Support\Facades\DB;

final class SendMessageHandler
{
    public function __construct(
        private readonly MessageRepositoryInterface $messageRepository,
        private readonly ThreadRepositoryInterface $threadRepository
    ) {}

    /**
     * Handle the sending of a message to a thread.
     */
    public function handle(SendMessageCommand $command): Message
    {
        return DB::transaction(function () use ($command) {
            $message = $this->messageRepository->create([
                'thread_id' => $command->threadId,
                'sender_id' => $command->senderId,
                'body'      => $command->body,
                'type'      => $command->type,
            ]);

            // Update thread's last message timestamp
            $this->threadRepository->updateLastMessageAt($command->threadId);

            // Increment unread count for other participants
            \Illuminate\Support\Facades\DB::table('thread_user')
                ->where('thread_id', $command->threadId)
                ->where('user_id', '!=', $command->senderId)
                ->increment('unread_count');

            // Optional: MessageSent::dispatch($message); // We'll fully implement broadcasting in Etapa 4/6

            return $message;
        });
    }
}

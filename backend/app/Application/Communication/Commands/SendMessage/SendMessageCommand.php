<?php

namespace App\Application\Communication\Commands\SendMessage;

final class SendMessageCommand
{
    public function __construct(
        public readonly int $threadId,
        public readonly int $senderId,
        public readonly string $body,
        public readonly string $type = 'text'
    ) {}
}

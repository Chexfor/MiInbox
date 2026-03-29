<?php

namespace App\Application\Communication\Commands\CreateThread;

final class CreateThreadCommand
{
    public function __construct(
        public readonly array $participantIds,
        public readonly ?string $subject = null,
        public readonly bool $isGroup = false
    ) {}
}

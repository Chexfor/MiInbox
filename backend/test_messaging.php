<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';

use App\Application\Communication\Commands\CreateThread\CreateThreadCommand;
use App\Application\Communication\Commands\CreateThread\CreateThreadHandler;
use App\Application\Communication\Commands\SendMessage\SendMessageCommand;
use App\Application\Communication\Commands\SendMessage\SendMessageHandler;
use App\Domain\Communication\Contracts\ThreadRepositoryInterface;
use App\Domain\Communication\Contracts\MessageRepositoryInterface;

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    $threadRepo = app(ThreadRepositoryInterface::class);
    $msgRepo = app(MessageRepositoryInterface::class);

    $createHandler = new CreateThreadHandler($threadRepo);
    $sendHandler = new SendMessageHandler($msgRepo, $threadRepo);

    // Create a thread between User 1 and User 2
    echo "Creando hilo...\n";
    $thread = $createHandler->handle(new CreateThreadCommand([1, 2], 'Hilo de Prueba'));
    echo "Hilo ID: {$thread->id}\n";

    // Send a message
    echo "Enviando mensaje...\n";
    $message = $sendHandler->handle(new SendMessageCommand($thread->id, 1, 'Hola, esto es una prueba.'));
    echo "Mensaje ID: {$message->id}, Body: {$message->body}\n";

    // Verify unread count for User 2
    $user2Status = DB::table('thread_user')
        ->where('thread_id', $thread->id)
        ->where('user_id', 2)
        ->first();
    
    echo "Mensajes no leídos para User 2: {$user2Status->unread_count}\n";

    echo "\n¡Prueba terminada con éxito!\n";
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString();
}

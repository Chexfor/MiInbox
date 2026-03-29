<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';

use Illuminate\Http\Request;
use App\Http\Resources\UserResource;
use App\Http\Resources\ThreadResource;
use App\Http\Resources\MessageResource;
use Illuminate\Support\Facades\Auth;

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

function simulateRequest($method, $uri, $token = null, $data = []) {
    global $app;
    $request = Request::create($uri, $method, $data);
    if ($token) {
        $request->headers->set('Authorization', 'Bearer ' . $token);
    }
    $request->headers->set('Accept', 'application/json');
    $response = $app->handle($request);
    return json_decode($response->getContent(), true);
}

try {
    echo "--- INICIANDO PRUEBA REAL DE API ---\n\n";

    // 1. LOGIN como User 1 (test@example.com)
    echo "Step 1: Login User 1...\n";
    $loginRes = simulateRequest('POST', '/api/v1/auth/login', null, [
        'email' => 'test@example.com',
        'password' => 'password'
    ]);
    
    if (!isset($loginRes['access_token'])) {
        throw new Exception("Login fallido para User 1: " . print_r($loginRes, true));
    }
    $token1 = $loginRes['access_token'];
    echo "Login exitoso (Token obtenido).\n\n";

    // 2. CREAR HILO con User 2 (user1@example.com)
    echo "Step 2: User 1 creando hilo con User 2 (ID: 2)...\n";
    $threadRes = simulateRequest('POST', '/api/v1/messaging/threads', $token1, [
        'participant_ids' => [2],
        'subject' => 'Vuelo Real de Prueba'
    ]);
    
    if (!isset($threadRes['data']['id'])) {
        throw new Exception("Error al crear hilo: " . print_r($threadRes, true));
    }
    $threadId = $threadRes['data']['id'];
    echo "Hilo creado con ID: $threadId\n\n";

    // 3. ENVIAR MENSAJE
    echo "Step 3: User 1 enviando mensaje...\n";
    $msgRes = simulateRequest('POST', "/api/v1/messaging/threads/$threadId/messages", $token1, [
        'body' => 'Hola User 2, esta es una prueba desde la API real.'
    ]);
    echo "Mensaje enviado exitosamente.\n\n";

    // 4. LOGIN como User 2 (user1@example.com)
    echo "Step 4: Login User 2...\n";
    $loginRes2 = simulateRequest('POST', '/api/v1/auth/login', null, [
        'email' => 'user1@example.com',
        'password' => 'password'
    ]);
    $token2 = $loginRes2['access_token'];

    // 5. LISTAR HILOS (Verificar aumento de unread_count)
    echo "Step 5: User 2 listando hilos (Obteniendo unread_count inicial)...\n";
    $listResInitial = simulateRequest('GET', '/api/v1/messaging/threads', $token2);
    $threadInitial = collect($listResInitial['data'])->where('id', $threadId)->first();
    $initialUnread = $threadInitial['unread_count'] ?? 0;
    echo "Initial Unread Count: $initialUnread\n";

    // ENVIAR OTRA VEZ PARA VER EL INCREMENTO
    echo "Enviando otro mensaje para verificar incremento...\n";
    simulateRequest('POST', "/api/v1/messaging/threads/$threadId/messages", $token1, [
        'body' => 'Mensaje de validación de incremento.'
    ]);

    echo "Consultando hilos nuevamente...\n";
    $listResFinal = simulateRequest('GET', '/api/v1/messaging/threads', $token2);
    $threadFinal = collect($listResFinal['data'])->where('id', $threadId)->first();
    $finalUnread = $threadFinal['unread_count'] ?? 0;
    echo "Final Unread Count: $finalUnread\n";

    if ($finalUnread != ($initialUnread + 1)) {
        throw new Exception("ERROR: El contador de no leídos no incrementó correctamente (Esperado: ".($initialUnread + 1).", Real: $finalUnread)");
    }
    echo "Incremento verificado correctamente.\n\n";

    // 6. VER MENSAJES (Verificar que se marquen como leídos)
    echo "Step 6: User 2 abriendo historial del hilo (Marcado como leído)...\n";
    $messagesRes = simulateRequest('GET', "/api/v1/messaging/threads/$threadId/messages", $token2);
    echo "Historial recuperado (".count($messagesRes['data'])." mensajes).\n";
    
    echo "Reconsultando hilos para verificar contador 0...\n";
    $listResAfterRead = simulateRequest('GET', '/api/v1/messaging/threads', $token2);
    $threadAfterRead = collect($listResAfterRead['data'])->where('id', $threadId)->first();
    echo "Unread Messages tras leer: {$threadAfterRead['unread_count']}\n";
    
    if ($threadAfterRead['unread_count'] != 0) {
        throw new Exception("ERROR: El contador debería ser 0 tras leer los mensajes.");
    }

    echo "\n--- ¡PRUEBA REAL COMPLETADA CON ÉXITO! O ---";
    echo "\nTodo el flujo de API está listo para el Frontend.";

} catch (Exception $e) {
    echo "\n\n!!! ERROR EN LA PRUEBA !!!\n";
    echo $e->getMessage() . "\n";
}

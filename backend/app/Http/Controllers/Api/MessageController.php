<?php

namespace App\Http\Controllers\Api;

use App\Application\Communication\Commands\SendMessage\SendMessageCommand;
use App\Application\Communication\Commands\SendMessage\SendMessageHandler;
use App\Application\Communication\Queries\GetThreadMessages\GetThreadMessagesHandler;
use App\Application\Communication\Queries\GetThreadMessages\GetThreadMessagesQuery;
use App\Http\Controllers\Controller;
use App\Http\Resources\MessageResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MessageController extends Controller
{
    public function __construct(
        private readonly GetThreadMessagesHandler $getThreadMessagesHandler,
        private readonly SendMessageHandler $sendMessageHandler
    ) {}

    /**
     * Display a listing of messages for a specific thread.
     */
    public function index(Request $request, int $threadId): JsonResponse
    {
        $userId = Auth::guard('api')->id();
        $query = new GetThreadMessagesQuery(
            $threadId, 
            $userId, 
            (int) $request->query('limit', 50),
            $request->query('before_id') ? (int) $request->query('before_id') : null
        );
        
        $messages = $this->getThreadMessagesHandler->handle($query);

        return response()->json([
            'status' => 'success',
            'data'   => MessageResource::collection($messages),
            'meta'   => [
                'has_more' => $messages->count() >= (int) $request->query('limit', 50),
                'oldest_id' => $messages->first()?->id,
            ]
        ]);
    }

    /**
     * Store a newly created message in storage.
     */
    public function store(Request $request, int $threadId): JsonResponse
    {
        $request->validate([
            'body' => 'required|string',
            'type' => 'string|in:text,image,file',
        ]);

        $senderId = Auth::guard('api')->id();

        $command = new SendMessageCommand(
            $threadId,
            $senderId,
            $request->body,
            $request->type ?? 'text'
        );

        $message = $this->sendMessageHandler->handle($command);

        return response()->json([
            'status' => 'success',
            'data'   => new MessageResource($message->load('sender')),
        ], 201);
    }
}

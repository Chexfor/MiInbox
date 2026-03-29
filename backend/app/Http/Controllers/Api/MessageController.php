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
    public function index(int $threadId): JsonResponse
    {
        $userId = Auth::guard('api')->id();
        $query = new GetThreadMessagesQuery($threadId, $userId);
        $messages = $this->getThreadMessagesHandler->handle($query);

        return response()->json([
            'status' => 'success',
            'data'   => MessageResource::collection($messages),
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

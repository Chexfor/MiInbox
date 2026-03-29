<?php

namespace App\Http\Controllers\Api;

use App\Application\Communication\Commands\CreateThread\CreateThreadCommand;
use App\Application\Communication\Commands\CreateThread\CreateThreadHandler;
use App\Application\Communication\Queries\GetThreads\GetThreadsHandler;
use App\Application\Communication\Queries\GetThreads\GetThreadsQuery;
use App\Http\Controllers\Controller;
use App\Http\Resources\ThreadResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ThreadController extends Controller
{
    public function __construct(
        private readonly GetThreadsHandler $getThreadsHandler,
        private readonly CreateThreadHandler $createThreadHandler
    ) {}

    /**
     * Display a listing of the user's conversation threads.
     */
    public function index(): JsonResponse
    {
        $userId = Auth::guard('api')->id();
        $query = new GetThreadsQuery($userId);
        $threads = $this->getThreadsHandler->handle($query);

        return response()->json([
            'status' => 'success',
            'data'   => ThreadResource::collection($threads),
        ]);
    }

    /**
     * Store a newly created conversation thread in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'participant_ids' => 'required|array|min:1',
            'participant_ids.*' => 'exists:users,id',
            'subject' => 'nullable|string|max:255',
            'is_group' => 'boolean',
        ]);

        $senderId = Auth::guard('api')->id();
        $participantIds = array_unique(array_merge($request->participant_ids, [$senderId]));

        $command = new CreateThreadCommand(
            $participantIds,
            $request->subject,
            $request->is_group ?? false
        );

        $thread = $this->createThreadHandler->handle($command);

        return response()->json([
            'status' => 'success',
            'data'   => new ThreadResource($thread->load('participants')),
        ], 201);
    }
}

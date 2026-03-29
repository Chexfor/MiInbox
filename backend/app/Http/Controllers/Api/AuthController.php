<?php

namespace App\Http\Controllers\Api;

use App\Application\Auth\Commands\LoginCommand;
use App\Application\Auth\Handlers\LoginHandler;
use App\Http\Requests\Api\Auth\LoginRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use InvalidArgumentException;

final class AuthController extends Controller
{
    public function __construct(
        private readonly LoginHandler $loginHandler,
    ) {}

    /**
     * POST /api/v1/auth/login
     */
    public function login(LoginRequest $request): JsonResponse
    {
        try {
            $token = $this->loginHandler->handle(
                new LoginCommand(
                    email: $request->validated('email'),
                    password: $request->validated('password'),
                )
            );
        } catch (InvalidArgumentException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 401);
        }

        return response()->json([
            'access_token' => $token,
            'token_type'   => 'Bearer',
        ]);
    }

    /**
     * GET /api/v1/auth/me
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json(new \App\Http\Resources\UserResource($request->user()));
    }

    /**
     * POST /api/v1/auth/logout
     */
    public function logout(): JsonResponse
    {
        Auth::guard('api')->logout();

        return response()->json(['message' => 'Sesión cerrada correctamente.']);
    }
}

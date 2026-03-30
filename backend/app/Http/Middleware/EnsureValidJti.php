<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureValidJti
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = auth('api')->user();

        if ($user) {
            try {
                $payload = \PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth::getPayload();
                $jti = $payload->get('jti');

                if ($user->current_jti !== $jti) {
                    return response()->json([
                        'message' => 'Sesión cerrada. Has iniciado sesión desde otro dispositivo.'
                    ], 401);
                }
            } catch (\Exception $e) {
                // If token is invalid or expired, auth:api middleware will handle it
            }
        }

        return $next($request);
    }
}

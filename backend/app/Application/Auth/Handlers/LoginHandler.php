<?php

namespace App\Application\Auth\Handlers;

use App\Application\Auth\Commands\LoginCommand;
use App\Domain\Shared\Events\Auth\UserSessionStarted;
use App\Events\SessionKicked;
use Illuminate\Support\Facades\Auth;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use InvalidArgumentException;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;
use App\Domain\User\Entities\User;

final class LoginHandler
{
    /**
     * Handle the LoginCommand and return a JWT token.
     *
     * @throws InvalidArgumentException
     * @throws ConflictHttpException
     */
    public function handle(LoginCommand $command): string
    {
        $user = User::where('email', $command->email)->first();

        if ($user && $user->current_jti && !$command->force) {
            throw new ConflictHttpException('Hay otra sesión activa. ¿Deseas desconectarla para iniciar sesión aquí?');
        }

        // Si llegamos aquí y hay un current_jti, significa que force = true
        if ($user && $user->current_jti) {
            SessionKicked::dispatch($user->id);
        }

        $token = Auth::guard('api')->attempt([
            'email'    => $command->email,
            'password' => $command->password,
        ]);

        if (! $token) {
            throw new InvalidArgumentException('Las credenciales proporcionadas son incorrectas.');
        }

        $authUser = Auth::guard('api')->user();
        
        // Asignar el nuevo JTI
        $payload = JWTAuth::setToken($token)->getPayload();
        $jti = $payload->get('jti');
        $authUser->current_jti = $jti;
        $authUser->save();

        // Broadcast domain event for real-time notification
        UserSessionStarted::dispatch($authUser->name, now()->toIso8601String());

        return $token;
    }
}

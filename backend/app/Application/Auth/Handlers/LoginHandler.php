<?php

namespace App\Application\Auth\Handlers;

use App\Application\Auth\Commands\LoginCommand;
use Illuminate\Support\Facades\Auth;
use InvalidArgumentException;

final class LoginHandler
{
    /**
     * Handle the LoginCommand and return a JWT token.
     *
     * @throws InvalidArgumentException
     */
    public function handle(LoginCommand $command): string
    {
        $token = Auth::guard('api')->attempt([
            'email'    => $command->email,
            'password' => $command->password,
        ]);

        if (! $token) {
            throw new InvalidArgumentException('Las credenciales proporcionadas son incorrectas.');
        }

        return $token;
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Domain\User\Entities\User;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    /**
     * Display a paginated listing of users for search.
     */
    public function index(Request $request): JsonResponse
    {
        $currentUserId = Auth::guard('api')->id();
        $searchTerm = $request->query('search');
        
        // Bandera de arquitectura (Architecture rule flag)
        // Permite apagar o encender la busqueda cruzada de toda la empresa.
        // Se puede sobreescribir vía una variable de entorno en un entorno real.
        $searchAllUsers = config('messaging.search_restrict_departments', env('USER_SEARCH_RESTRICT', false)) === false;
        
        $query = User::query()
            ->select(['id', 'name', 'email', 'avatar_url', 'last_seen_at'])
            ->where('id', '!=', $currentUserId);

        if ($searchTerm) {
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'like', '%' . $searchTerm . '%')
                  ->orWhere('email', 'like', '%' . $searchTerm . '%');
            });
        }

        // Si la bandera restringe (ej. para Producción), filtramos.
        // En este prototipo se permite si $searchAllUsers = true
        if (!$searchAllUsers) {
            // Lógica futura para limitar búsqueda, ej: 
            // $query->where('department_id', Auth::guard('api')->user()->department_id);
        }

        // Retornamos agrupados u ordenados
        $users = $query->orderBy('name', 'asc')->paginate((int) $request->query('limit', 20));

        return response()->json([
            'status' => 'success',
            'data'   => $users->items(),
            'meta'   => [
                'current_page' => $users->currentPage(),
                'last_page'    => $users->lastPage(),
                'per_page'     => $users->perPage(),
                'total'        => $users->total(),
            ]
        ]);
    }
}

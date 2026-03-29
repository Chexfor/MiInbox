<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MessageResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'thread_id'      => $this->thread_id,
            'sender'         => new UserResource($this->whenLoaded('sender')),
            'body'           => $this->body,
            'type'           => $this->type,
            'read_at'        => $this->read_at?->toIso8601String(),
            'created_at'     => $this->created_at->toIso8601String(),
            'is_own_message' => $this->sender_id === $request->user()?->id,
        ];
    }
}

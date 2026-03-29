<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ThreadResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $userId = (int) ($request->user()?->id);
        $currentUserPivot = $this->participants->where('id', $userId)->first()?->pivot;

        return [
            'id'              => $this->id,
            'subject'         => $this->subject,
            'is_group'        => $this->is_group,
            'last_message_at' => $this->last_message_at?->toIso8601String(),
            'unread_count'    => $currentUserPivot?->unread_count ?? 0,
            'is_favorite'     => (bool) ($currentUserPivot?->is_favorite ?? false),
            'participants'    => UserResource::collection($this->whenLoaded('participants')),
            'latest_message'  => new MessageResource($this->whenLoaded('latestMessage')),
            'created_at'      => $this->created_at->toIso8601String(),
        ];
    }
}

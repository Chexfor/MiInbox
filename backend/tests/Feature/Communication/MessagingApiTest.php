<?php

namespace Tests\Feature\Communication;

use App\Domain\User\Entities\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class MessagingApiTest extends TestCase
{
    use RefreshDatabase;

    private User $user1;
    private User $user2;
    private string $token1;
    private string $token2;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user1 = User::factory()->create(['email' => 'test@example.com']);
        $this->user2 = User::factory()->create(['email' => 'user1@example.com']);
    }

    /** @test */
    public function a_user_can_create_a_thread_with_another_user()
    {
        $response = $this->actingAs($this->user1, 'api')
            ->postJson('/api/v1/messaging/threads', [
                'participant_ids' => [$this->user2->id],
                'subject' => 'Test Thread'
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.subject', 'Test Thread')
            ->assertJsonCount(2, 'data.participants');
            
        $this->assertDatabaseHas('threads', ['subject' => 'Test Thread']);
    }

    /** @test */
    public function a_user_can_send_a_message_and_increment_unread_count()
    {
        // 1. Create thread
        $threadResponse = $this->actingAs($this->user1, 'api')
            ->postJson('/api/v1/messaging/threads', [
                'participant_ids' => [$this->user2->id]
            ]);
        $threadId = $threadResponse->json('data.id');

        // 2. Send message from User 1
        $messageResponse = $this->actingAs($this->user1, 'api')
            ->postJson("/api/v1/messaging/threads/{$threadId}/messages", [
                'body' => 'Hello User 2'
            ]);

        $messageResponse->assertStatus(201);

        // Verify in DB directly
        $this->assertDatabaseHas('thread_user', [
            'thread_id' => $threadId,
            'user_id' => $this->user2->id,
            'unread_count' => 1
        ]);

        // 3. Check unread count for User 2
        // We need to clear the current auth state to ensure it picks up User 2
        \Illuminate\Support\Facades\Auth::forgetGuards();

        $listResponse = $this->actingAs($this->user2, 'api')
            ->getJson('/api/v1/messaging/threads');

        $listResponse->assertStatus(200);
        $threadData = collect($listResponse->json('data'))->where('id', $threadId)->first();
        
        $this->assertEquals(1, $threadData['unread_count'], "User 2 should have 1 unread message");
    }

    /** @test */
    public function reading_messages_marks_them_as_read_and_resets_unread_count()
    {
        // 1. Setup thread and message
        $threadResponse = $this->actingAs($this->user1, 'api')
            ->postJson('/api/v1/messaging/threads', [
                'participant_ids' => [$this->user2->id]
            ]);
        $threadId = $threadResponse->json('data.id');

        $this->actingAs($this->user1, 'api')
            ->postJson("/api/v1/messaging/threads/{$threadId}/messages", ['body' => 'Msg 1']);

        // 2. Verify unread = 1
        \Illuminate\Support\Facades\Auth::forgetGuards();
        $initialList = $this->actingAs($this->user2, 'api')
            ->getJson('/api/v1/messaging/threads');
        $this->assertEquals(1, collect($initialList->json('data'))->where('id', $threadId)->first()['unread_count']);

        // 3. User 2 reads messages
        \Illuminate\Support\Facades\Auth::forgetGuards();
        $this->actingAs($this->user2, 'api')
            ->getJson("/api/v1/messaging/threads/{$threadId}/messages");

        // 4. Verify unread = 0
        \Illuminate\Support\Facades\Auth::forgetGuards();
        $finalList = $this->actingAs($this->user2, 'api')
            ->getJson('/api/v1/messaging/threads');
        $this->assertEquals(0, collect($finalList->json('data'))->where('id', $threadId)->first()['unread_count']);
    }
}

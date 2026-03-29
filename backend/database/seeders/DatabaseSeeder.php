<?php

namespace Database\Seeders;

use App\Domain\User\Entities\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create the main test user
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => \Illuminate\Support\Facades\Hash::make('password'),
        ]);

        // Create 4 more users for multiple user testing
        foreach (range(1, 4) as $index) {
            User::factory()->create([
                'name' => "User {$index}",
                'email' => "user{$index}@example.com",
                'password' => \Illuminate\Support\Facades\Hash::make('password'),
            ]);
        }
    }
}

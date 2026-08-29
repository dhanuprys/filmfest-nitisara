<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Hash;

/**
 * Service class for handling user-related business logic.
 */
class UserService
{
    /**
     * Get users with pagination.
     */
    public function getUsers(): LengthAwarePaginator
    {
        return User::latest()->paginate(20);
    }

    /**
     * Create user.
     */
    public function create(array $data): User
    {
        return User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
        ]);
    }

    /**
     * Update user.
     */
    public function update(User $user, array $data): bool
    {
        $updateData = [
            'name' => $data['name'],
            'email' => $data['email'],
        ];

        if (isset($data['password']) && $data['password']) {
            $updateData['password'] = Hash::make($data['password']);
        }

        return $user->update($updateData);
    }

    /**
     * Delete user.
     *
     * @throws \Exception
     */
    public function delete(User $user): bool
    {
        if ($user->id === auth()->id()) {
            throw new \Exception('Tidak dapat menghapus akun sendiri');
        }

        return $user->delete();
    }

    /**
     * Check if user can be deleted.
     */
    public function canDelete(User $user): bool
    {
        return $user->id !== auth()->id();
    }
}

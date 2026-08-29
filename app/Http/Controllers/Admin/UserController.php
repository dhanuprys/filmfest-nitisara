<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UserRequest;
use App\Models\User;
use App\Services\UserService;
use Inertia\Inertia;

class UserController extends Controller
{
    public function __construct(
        private UserService $userService
    ) {}

    public function index()
    {
        $users = $this->userService->getUsers();

        return Inertia::render('admin/users/index', [
            'users' => $users,
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/users/create');
    }

    public function store(UserRequest $request)
    {
        $this->userService->create($request->validated());

        return redirect()->route('admin.users.index')
            ->with('success', 'User berhasil dibuat');
    }

    public function show(User $user)
    {
        return Inertia::render('admin/users/show', [
            'user' => $user,
        ]);
    }

    public function edit(User $user)
    {
        return Inertia::render('admin/users/edit', [
            'user' => $user,
        ]);
    }

    public function update(UserRequest $request, User $user)
    {
        $this->userService->update($user, $request->validated());

        return redirect()->route('admin.users.show', $user)
            ->with('success', 'User berhasil diperbarui');
    }

    public function destroy(User $user)
    {
        try {
            $this->userService->delete($user);
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }

        return redirect()->route('admin.users.index')
            ->with('success', 'User berhasil dihapus');
    }
}

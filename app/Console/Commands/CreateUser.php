<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class CreateUser extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'user:create {--name=} {--email=} {--password=}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a new user account';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🎬 NITISARA Film Festival - User Creation');
        $this->info('==========================================');

        // Get user input
        $name = $this->option('name') ?: $this->ask('Masukkan nama lengkap');
        $email = $this->option('email') ?: $this->ask('Masukkan alamat email');
        $password = $this->option('password') ?: $this->secret('Masukkan kata sandi');

        // Validate input
        $validator = Validator::make([
            'name' => $name,
            'email' => $email,
            'password' => $password,
        ], [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
        ]);

        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $error) {
                $this->error($error);
            }

            return 1;
        }

        // Check if user already exists
        if (User::where('email', $email)->exists()) {
            $this->error('❌ User dengan email tersebut sudah ada!');

            return 1;
        }

        // Create user
        try {
            $user = User::create([
                'name' => $name,
                'email' => $email,
                'password' => Hash::make($password),
            ]);

            $this->info('✅ User berhasil dibuat!');
            $this->info("📧 Email: {$user->email}");
            $this->info("👤 Nama: {$user->name}");
            $this->info("🆔 ID: {$user->id}");
            $this->info('');
            $this->info('🎉 User dapat login ke panel admin sekarang!');

            return 0;
        } catch (\Exception $e) {
            $this->error('❌ Gagal membuat user: '.$e->getMessage());

            return 1;
        }
    }
}

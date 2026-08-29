<?php

namespace App\Console\Commands;

use App\Models\ParticipantSession;
use Illuminate\Console\Command;

class CleanupExpiredSessions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sessions:cleanup';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean up expired participant sessions';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Cleaning up expired participant sessions...');

        $deletedCount = ParticipantSession::cleanupExpired();

        $this->info("Successfully deleted {$deletedCount} expired sessions.");

        return Command::SUCCESS;
    }
}

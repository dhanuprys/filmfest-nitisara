<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class ParticipantSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'participant_id',
        'token',
        'ip_address',
        'user_agent',
        'expires_at',
        'last_accessed_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'last_accessed_at' => 'datetime',
    ];

    public function participant()
    {
        return $this->belongsTo(Participant::class);
    }

    public function isExpired()
    {
        return $this->expires_at->isPast();
    }

    public function isActive()
    {
        return ! $this->isExpired();
    }

    public function updateLastAccessed()
    {
        $this->update(['last_accessed_at' => now()]);
    }

    public static function generateToken()
    {
        return Str::random(64);
    }

    public static function createSession(Participant $participant, $ipAddress = null, $userAgent = null)
    {
        // Clean up expired sessions for this participant
        self::where('participant_id', $participant->id)
            ->where('expires_at', '<', now())
            ->delete();

        return self::create([
            'participant_id' => $participant->id,
            'token' => self::generateToken(),
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent,
            'expires_at' => now()->addDays(7), // 7 days expiration
            'last_accessed_at' => now(),
        ]);
    }

    public static function findByToken($token)
    {
        return self::where('token', $token)
            ->where('expires_at', '>', now())
            ->first();
    }

    public static function cleanupExpired()
    {
        return self::where('expires_at', '<', now())->delete();
    }
}

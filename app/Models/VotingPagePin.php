<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class VotingPagePin extends Model
{
    use HasFactory;

    protected $fillable = [
        'pin',
        'name',
        'is_active',
        'lifetime_minutes',
        'expires_at',
        'last_active_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'lifetime_minutes' => 'integer',
        'expires_at' => 'datetime',
        'last_active_at' => 'datetime',
    ];

    /**
     * Generate a unique PIN
     */
    public static function generateUniquePin(): string
    {
        do {
            $pin = Str::upper(Str::random(6));
        } while (self::where('pin', $pin)->exists());

        return $pin;
    }

    /**
     * Check if the PIN is valid and active
     */
    public function isValid(): bool
    {
        if (! $this->is_active) {
            return false;
        }

        if ($this->expires_at && now()->gt($this->expires_at)) {
            return false;
        }

        return true;
    }

    /**
     * Update the last active timestamp
     */
    public function updateLastActive(): void
    {
        $this->update(['last_active_at' => now()]);
    }

    /**
     * Calculate and set the expiry time based on lifetime_minutes
     */
    public function setExpiryTime(): void
    {
        $this->expires_at = now()->addMinutes($this->lifetime_minutes);
        $this->save();
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * Film Model
 *
 * @property int $id
 * @property int $participant_id
 * @property string $title
 * @property string $synopsis
 * @property string $film_url
 * @property string|null $direct_video_url
 * @property string|null $originality_file
 * @property string|null $poster_landscape_file
 * @property string|null $poster_portrait_file
 * @property string|null $backdrop_file
 * @property int|null $verified_by_user_id
 * @property Carbon|null $verified_at
 * @property int|null $ranking
 * @property-read Participant $participant
 * @property-read User|null $verifiedBy
 */
class Film extends Model
{
    use HasFactory;

    protected $fillable = [
        'participant_id',
        'title',
        'synopsis',
        'direct_video_url',
        'film_url',
        'originality_file',
        'poster_landscape_file',
        'poster_portrait_file',
        'backdrop_file',
        'verified_by_user_id',
        'verified_at',
        'ranking',
        'director', // NEW: Director name
        'teaser_url', // NEW: Teaser URL
    ];

    protected $casts = [
        'verified_at' => 'datetime',
        'ranking' => 'integer',
    ];

    protected $appends = [
        'is_verified',
        'verification_status',
    ];

    /**
     * Get the participant that owns the film.
     */
    public function participant()
    {
        return $this->belongsTo(Participant::class);
    }

    /**
     * Get the user who verified the film.
     */
    public function verifiedBy()
    {
        return $this->belongsTo(User::class, 'verified_by_user_id');
    }

    /**
     * Get the votings for this film.
     */
    public function votings()
    {
        return $this->hasMany(FilmVoting::class);
    }

    /**
     * Get the castings for the film.
     */
    public function castings()
    {
        return $this->hasMany(Casting::class);
    }

    /**
     * Scope a query to only include verified films.
     */
    public function scopeVerified(Builder $query): Builder
    {
        return $query->whereNotNull('verified_by_user_id');
    }

    /**
     * Scope a query to only include pending films.
     */
    public function scopePending(Builder $query): Builder
    {
        return $query->whereNull('verified_by_user_id');
    }

    /**
     * Scope a query to only include films by participant.
     */
    public function scopeByParticipant(Builder $query, int $participantId): Builder
    {
        return $query->where('participant_id', $participantId);
    }

    /**
     * Scope a query to only include films by event year.
     */
    public function scopeByEventYear(Builder $query, int $eventYearId): Builder
    {
        return $query->whereHas('participant', function ($q) use ($eventYearId) {
            $q->where('event_year_id', $eventYearId);
        });
    }

    /**
     * Scope a query to only include films by category.
     */
    public function scopeByCategory(Builder $query, int $categoryId): Builder
    {
        return $query->whereHas('participant', function ($q) use ($categoryId) {
            $q->where('category_id', $categoryId);
        });
    }

    /**
     * Scope a query to search films by title, synopsis, or participant info.
     */
    public function scopeSearch(Builder $query, string $search): Builder
    {
        return $query->where(function ($q) use ($search) {
            $q->where('title', 'like', "%{$search}%")
                ->orWhere('synopsis', 'like', "%{$search}%")
                ->orWhereHas('participant', function ($participantQuery) use ($search) {
                    $participantQuery->where('team_name', 'like', "%{$search}%")
                        ->orWhere('leader_name', 'like', "%{$search}%")
                        ->orWhere('city', 'like', "%{$search}%")
                        ->orWhere('company', 'like', "%{$search}%");
                });
        });
    }

    /**
     * Scope a query to order films by ranking and title.
     */
    public function scopeOrderedByRanking(Builder $query): Builder
    {
        return $query->orderBy('ranking', 'asc')->orderBy('title', 'asc');
    }

    /**
     * Get whether the film is verified.
     */
    public function getIsVerifiedAttribute(): bool
    {
        return $this->verified_by_user_id !== null;
    }

    /**
     * Get the verification status of the film.
     */
    public function getVerificationStatusAttribute(): string
    {
        return $this->is_verified ? 'verified' : 'pending';
    }

    /**
     * Get the formatted ranking string.
     */
    public function getFormattedRankingAttribute(): string
    {
        return $this->ranking ? "#{$this->ranking}" : 'N/A';
    }

    /**
     * Get the total file size of all film files.
     */
    public function getFileSizeAttribute(): string
    {
        $size = 0;

        if ($this->originality_file && file_exists(storage_path("app/public/{$this->originality_file}"))) {
            $size += filesize(storage_path("app/public/{$this->originality_file}"));
        }

        if ($this->poster_landscape_file && file_exists(storage_path("app/public/{$this->poster_landscape_file}"))) {
            $size += filesize(storage_path("app/public/{$this->poster_landscape_file}"));
        }

        if ($this->poster_portrait_file && file_exists(storage_path("app/public/{$this->poster_portrait_file}"))) {
            $size += filesize(storage_path("app/public/{$this->poster_portrait_file}"));
        }

        if ($this->backdrop_file && file_exists(storage_path("app/public/{$this->backdrop_file}"))) {
            $size += filesize(storage_path("app/public/{$this->backdrop_file}"));
        }

        return $this->formatBytes($size);
    }

    /**
     * Check if the film is verified.
     */
    public function isVerified(): bool
    {
        return $this->verified_by_user_id !== null;
    }

    /**
     * Check if the film is pending verification.
     */
    public function isPending(): bool
    {
        return $this->verified_by_user_id === null;
    }

    /**
     * Check if the film can be verified.
     */
    public function canBeVerified(): bool
    {
        return $this->isPending();
    }

    /**
     * Check if the film can be rejected.
     */
    public function canBeRejected(): bool
    {
        return $this->isVerified();
    }

    /**
     * Mark the film as verified by a user.
     */
    public function verify(int $verifiedByUserId): bool
    {
        return $this->update([
            'verified_by_user_id' => $verifiedByUserId,
            'verified_at' => now(),
        ]);
    }

    /**
     * Mark the film as rejected (unverified).
     */
    public function reject(): bool
    {
        return $this->update([
            'verified_by_user_id' => null,
            'verified_at' => null,
        ]);
    }

    /**
     * Check if the film has an originality file.
     */
    public function hasOriginalityFile(): bool
    {
        return ! empty($this->originality_file);
    }

    /**
     * Check if the film has a landscape poster file.
     */
    public function hasPosterLandscapeFile(): bool
    {
        return ! empty($this->poster_landscape_file);
    }

    /**
     * Check if the film has a portrait poster file.
     */
    public function hasPosterPortraitFile(): bool
    {
        return ! empty($this->poster_portrait_file);
    }

    /**
     * Get the filename of the originality file.
     */
    public function getOriginalityFileName(): string
    {
        return basename($this->originality_file ?? '');
    }

    /**
     * Get the filename of the landscape poster file.
     */
    public function getPosterLandscapeFileName(): string
    {
        return basename($this->poster_landscape_file ?? '');
    }

    /**
     * Get the filename of the portrait poster file.
     */
    public function getPosterPortraitFileName(): string
    {
        return basename($this->poster_portrait_file ?? '');
    }

    /**
     * Get the filename of the backdrop file.
     */
    public function getBackdropFileName(): string
    {
        return basename($this->backdrop_file ?? '');
    }

    /**
     * Get the category name of the film's participant.
     */
    public function getCategoryName(): string
    {
        return $this->participant->category->name ?? 'N/A';
    }

    /**
     * Get the team name of the film's participant.
     */
    public function getParticipantTeamName(): string
    {
        return $this->participant->team_name ?? 'N/A';
    }

    /**
     * Get the leader name of the film's participant.
     */
    public function getParticipantLeaderName(): string
    {
        return $this->participant->leader_name ?? 'N/A';
    }

    /**
     * Format bytes as a human-readable string.
     */
    private function formatBytes(int $bytes, int $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, $precision).' '.$units[$i];
    }
}

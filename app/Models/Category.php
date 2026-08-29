<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Category Model
 *
 * @property int $id
 * @property string $name
 * @property int $event_year_id
 * @property bool $is_active
 * @property-read EventYear $eventYear
 */
class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'event_year_id',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    protected $appends = [
        'participants_count',
        'films_count',
        'verified_films_count',
    ];

    /**
     * Get the event year this category belongs to.
     */
    public function eventYear()
    {
        return $this->belongsTo(EventYear::class);
    }

    /**
     * Get the participants for this category.
     */
    public function participants()
    {
        return $this->hasMany(Participant::class);
    }

    /**
     * Get the films for this category (via participants).
     */
    public function films()
    {
        return $this->hasManyThrough(Film::class, Participant::class);
    }

    /**
     * Scope a query to only include active categories.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include inactive categories.
     */
    public function scopeInactive(Builder $query): Builder
    {
        return $query->where('is_active', false);
    }

    /**
     * Scope a query to only include categories by event year.
     */
    public function scopeByEventYear(Builder $query, int $eventYearId): Builder
    {
        return $query->where('event_year_id', $eventYearId);
    }

    /**
     * Scope a query to include participant count.
     */
    public function scopeWithParticipantCount(Builder $query): Builder
    {
        return $query->withCount('participants');
    }

    /**
     * Scope a query to include film count.
     */
    public function scopeWithFilmCount(Builder $query): Builder
    {
        return $query->withCount('films');
    }

    /**
     * Scope a query to order categories by name.
     */
    public function scopeOrderedByName(Builder $query): Builder
    {
        return $query->orderBy('name', 'asc');
    }

    /**
     * Get the number of participants in this category.
     */
    public function getParticipantsCountAttribute(): int
    {
        return $this->participants()->count();
    }

    /**
     * Get the number of films in this category.
     */
    public function getFilmsCountAttribute(): int
    {
        return $this->films()->count();
    }

    /**
     * Get the number of verified films in this category.
     */
    public function getVerifiedFilmsCountAttribute(): int
    {
        return $this->films()->whereNotNull('films.verified_by_user_id')->count();
    }

    /**
     * Get the number of pending films in this category.
     */
    public function getPendingFilmsCountAttribute(): int
    {
        return $this->films()->whereNull('films.verified_by_user_id')->count();
    }

    /**
     * Get the badge class for the category status.
     */
    public function getStatusBadgeClassAttribute(): string
    {
        return $this->is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    }

    /**
     * Get the status text for the category.
     */
    public function getStatusTextAttribute(): string
    {
        return $this->is_active ? 'Aktif' : 'Tidak Aktif';
    }

    /**
     * Check if the category is active.
     */
    public function isActive(): bool
    {
        return $this->is_active;
    }

    /**
     * Check if the category is inactive.
     */
    public function isInactive(): bool
    {
        return ! $this->is_active;
    }

    /**
     * Check if the category can be deleted (no participants).
     */
    public function canBeDeleted(): bool
    {
        return $this->participants()->count() === 0;
    }

    /**
     * Check if the category has participants.
     */
    public function hasParticipants(): bool
    {
        return $this->participants()->exists();
    }

    /**
     * Check if the category has films.
     */
    public function hasFilms(): bool
    {
        return $this->films()->exists();
    }

    /**
     * Get the event year name for this category.
     */
    public function getEventYearName(): string
    {
        return $this->eventYear->year ?? 'N/A';
    }

    /**
     * Get a formatted participant count string.
     */
    public function getFormattedParticipantCount(): string
    {
        $count = $this->participants_count;

        return $count.' peserta';
    }

    /**
     * Get a formatted film count string.
     */
    public function getFormattedFilmCount(): string
    {
        $count = $this->films_count;

        return $count.' film';
    }

    /**
     * Get a formatted verified film count string.
     */
    public function getFormattedVerifiedFilmCount(): string
    {
        $count = $this->verified_films_count;

        return $count.' film terverifikasi';
    }

    /**
     * Get a formatted pending film count string.
     */
    public function getFormattedPendingFilmCount(): string
    {
        $count = $this->pending_films_count;

        return $count.' film pending';
    }

    /**
     * Activate the category.
     */
    public function activate(): bool
    {
        return $this->update(['is_active' => true]);
    }

    /**
     * Deactivate the category.
     */
    public function deactivate(): bool
    {
        return $this->update(['is_active' => false]);
    }

    /**
     * Toggle the category's active status.
     */
    public function toggleStatus(): bool
    {
        return $this->update(['is_active' => ! $this->is_active]);
    }
}

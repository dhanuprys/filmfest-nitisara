<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EventYear extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $fillable = [
        'year',
        'title',
        'description',
        'registration_start',
        'registration_end',
        'submission_start_date',
        'submission_end_date',
        'show_start',
        'show_end',
        'event_guide_document',
    ];

    protected $casts = [
        'registration_start' => 'datetime',
        'registration_end' => 'datetime',
        'submission_start_date' => 'datetime',
        'submission_end_date' => 'datetime',
        'show_start' => 'datetime',
        'show_end' => 'datetime',
    ];

    protected $appends = [
        'is_registration_open',
        'is_submission_open',
        'is_show_active',
        'submission_status',
    ];

    // Relationships
    public function participants()
    {
        return $this->hasMany(Participant::class);
    }

    public function films()
    {
        return $this->hasManyThrough(
            Film::class,
            Participant::class,
            'event_year_id', // Foreign key on participants table
            'participant_id', // Foreign key on films table
            'id', // Local key on event_years table
            'id'  // Local key on participants table
        );
    }

    public function categories()
    {
        return $this->hasMany(Category::class);
    }

    public function tickets()
    {
        return $this->hasMany(Ticket::class);
    }

    // Scopes
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('show_start', '<=', now())
            ->where('show_end', '>=', now());
    }

    public function scopeUpcoming(Builder $query): Builder
    {
        return $query->where('show_start', '>', now());
    }

    public function scopePast(Builder $query): Builder
    {
        return $query->where('show_end', '<', now());
    }

    public function scopeRegistrationOpen(Builder $query): Builder
    {
        return $query->where('registration_start', '<=', now())
            ->where('registration_end', '>=', now());
    }

    public function scopeSubmissionOpen(Builder $query): Builder
    {
        return $query->where('submission_start_date', '<=', now())
            ->where('submission_end_date', '>=', now());
    }

    // Accessors
    public function getIsRegistrationOpenAttribute(): bool
    {
        return $this->registration_start && $this->registration_end &&
            now()->between($this->registration_start, $this->registration_end);
    }

    public function getIsSubmissionOpenAttribute(): bool
    {
        return $this->submission_start_date && $this->submission_end_date &&
            now()->between($this->submission_start_date, $this->submission_end_date);
    }

    public function getIsShowActiveAttribute(): bool
    {
        return $this->show_start && $this->show_end &&
            now()->between($this->show_start, $this->show_end);
    }

    public function getSubmissionStatusAttribute(): string
    {
        if (! $this->submission_start_date || ! $this->submission_end_date) {
            return 'not_set';
        }

        $now = now();

        if ($now < $this->submission_start_date) {
            return 'coming_soon';
        } elseif ($now >= $this->submission_start_date && $now <= $this->submission_end_date) {
            return 'open';
        } else {
            return 'ended';
        }
    }

    // Helper methods
    public function hasParticipants(): bool
    {
        return $this->participants()->exists();
    }

    public function hasEventGuide(): bool
    {
        return ! empty($this->event_guide_document);
    }

    public function getEventGuideFileName(): ?string
    {
        if (! $this->event_guide_document) {
            return null;
        }

        return basename($this->event_guide_document);
    }

    public function getDaysUntilShow(): int
    {
        if (! $this->show_start) {
            return -1;
        }

        return now()->diffInDays($this->show_start, false);
    }

    public function getDaysUntilSubmissionEnd(): int
    {
        if (! $this->submission_end_date) {
            return -1;
        }

        return now()->diffInDays($this->submission_end_date, false);
    }

    public function canBeDeleted(): bool
    {
        return ! $this->hasParticipants();
    }

    public function getStatusBadgeClass(): string
    {
        if ($this->is_show_active) {
            return 'bg-green-100 text-green-800';
        } elseif ($this->is_submission_open) {
            return 'bg-blue-100 text-blue-800';
        } elseif ($this->is_registration_open) {
            return 'bg-yellow-100 text-yellow-800';
        } else {
            return 'bg-gray-100 text-gray-800';
        }
    }

    public function getStatusText(): string
    {
        if ($this->is_show_active) {
            return 'Sedang Berlangsung';
        } elseif ($this->is_submission_open) {
            return 'Submit Film Terbuka';
        } elseif ($this->is_registration_open) {
            return 'Pendaftaran Terbuka';
        } else {
            return 'Selesai';
        }
    }
}

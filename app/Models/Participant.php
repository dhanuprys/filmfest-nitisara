<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Participant extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $fillable = [
        'event_year_id',
        'pin',
        'team_name',
        'city',
        'company',
        'category_id',
        'leader_name',
        'leader_email',
        'leader_whatsapp',
        'student_card_file',
        'payment_evidence_file',
        'verified_by_user_id',
        'verification_status',
        'rejection_reason',
    ];

    protected $casts = [
        'verification_status' => 'string',
    ];

    protected $appends = [
        'status_badge_class',
        'status_text',
    ];

    // Relationships
    public function eventYear()
    {
        return $this->belongsTo(EventYear::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function verifiedBy()
    {
        return $this->belongsTo(User::class, 'verified_by_user_id');
    }

    public function films()
    {
        return $this->hasMany(Film::class);
    }

    // Scopes
    public function scopePending(Builder $query): Builder
    {
        return $query->where('verification_status', 'pending');
    }

    public function scopeApproved(Builder $query): Builder
    {
        return $query->where('verification_status', 'approved');
    }

    public function scopeRejected(Builder $query): Builder
    {
        return $query->where('verification_status', 'rejected');
    }

    public function scopeByEventYear(Builder $query, int $eventYearId): Builder
    {
        return $query->where('event_year_id', $eventYearId);
    }

    public function scopeByCategory(Builder $query, int $categoryId): Builder
    {
        return $query->where('category_id', $categoryId);
    }

    public function scopeSearch(Builder $query, string $search): Builder
    {
        return $query->where(function ($q) use ($search) {
            $q->where('team_name', 'like', "%{$search}%")
                ->orWhere('leader_name', 'like', "%{$search}%")
                ->orWhere('leader_email', 'like', "%{$search}%")
                ->orWhere('leader_whatsapp', 'like', "%{$search}%");
        });
    }

    // Accessors
    public function getStatusBadgeClassAttribute(): string
    {
        return match ($this->verification_status) {
            'approved' => 'bg-green-100 text-green-800',
            'rejected' => 'bg-red-100 text-red-800',
            'pending' => 'bg-yellow-100 text-yellow-800',
            default => 'bg-gray-100 text-gray-800',
        };
    }

    public function getStatusTextAttribute(): string
    {
        return match ($this->verification_status) {
            'approved' => 'Disetujui',
            'rejected' => 'Ditolak',
            'pending' => 'Menunggu',
            default => 'Tidak Diketahui',
        };
    }

    // Helper methods for verification status
    public function isPending(): bool
    {
        return $this->verification_status === 'pending';
    }

    public function isApproved(): bool
    {
        return $this->verification_status === 'approved';
    }

    public function isRejected(): bool
    {
        return $this->verification_status === 'rejected';
    }

    public function isVerified(): bool
    {
        return $this->isApproved();
    }

    public function hasFilms(): bool
    {
        return $this->films()->exists();
    }

    public function getFilmsCount(): int
    {
        return $this->films()->count();
    }

    public function getVerifiedFilmsCount(): int
    {
        return $this->films()->whereNotNull('films.verified_by_user_id')->count();
    }

    public function getPendingFilmsCount(): int
    {
        return $this->films()->whereNull('films.verified_by_user_id')->count();
    }

    public function canBeApproved(): bool
    {
        return $this->isPending() || $this->isRejected();
    }

    public function canBeRejected(): bool
    {
        return $this->isPending() || $this->isApproved();
    }

    public function canBeReset(): bool
    {
        return $this->isApproved() || $this->isRejected();
    }

    public function approve(int $verifiedByUserId): bool
    {
        return $this->update([
            'verification_status' => 'approved',
            'verified_by_user_id' => $verifiedByUserId,
            'rejection_reason' => null,
        ]);
    }

    public function reject(int $verifiedByUserId, string $rejectionReason): bool
    {
        return $this->update([
            'verification_status' => 'rejected',
            'verified_by_user_id' => $verifiedByUserId,
            'rejection_reason' => $rejectionReason,
        ]);
    }

    public function resetStatus(): bool
    {
        return $this->update([
            'verification_status' => 'pending',
            'verified_by_user_id' => null,
            'rejection_reason' => null,
        ]);
    }

    public function getFullAddress(): string
    {
        return "{$this->city}, {$this->company}";
    }

    public function getLeaderInfo(): string
    {
        return "{$this->leader_name} ({$this->leader_email})";
    }
}

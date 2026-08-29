<?php

namespace App\Services;

use App\Models\Category;
use App\Models\EventYear;
use App\Models\Film;
use App\Models\Ticket;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection as SupportCollection;

class EventYearService
{
    public function __construct(
        private FileUploadService $fileUploadService
    ) {}

    /**
     * Get event years with ticket statistics
     */
    public function getEventYearsWithTicketStats(): LengthAwarePaginator
    {
        $eventYears = EventYear::withCount(['participants', 'categories'])->latest()->paginate(20);

        $eventYears->getCollection()->transform(function ($eventYear) {
            $eventYear->ticket_stats = $this->getTicketStats($eventYear->id);

            return $eventYear;
        });

        return $eventYears;
    }

    /**
     * Get ticket statistics for an event year
     */
    public function getTicketStats(int $eventYearId): array
    {
        $stats = Ticket::where('event_year_id', $eventYearId)
            ->selectRaw('
                COUNT(*) as total,
                COUNT(CASE WHEN used_at IS NOT NULL THEN 1 END) as used,
                COUNT(CASE WHEN used_at IS NULL THEN 1 END) as unused
            ')
            ->first();

        return [
            'total' => $stats->total ?? 0,
            'used' => $stats->used ?? 0,
            'unused' => $stats->unused ?? 0,
        ];
    }

    /**
     * Get event year with detailed statistics
     */
    public function getEventYearWithStats(EventYear $eventYear): EventYear
    {
        // Load relationships
        $eventYear->load([
            'participants' => function ($query) {
                $query->with(['category', 'verifiedBy'])->latest();
            },
            'categories' => function ($query) {
                $query->withCount('participants')->latest();
            },
        ]);

        // Add participants count
        $eventYear->participants_count = $eventYear->participants()->count();

        // Add ticket statistics
        $eventYear->ticket_stats = $this->getTicketStats($eventYear->id);

        // Add favorite films by category
        $eventYear->favorite_films_by_category = $this->getFavoriteFilmsByCategory($eventYear->id);

        return $eventYear;
    }

    /**
     * Get favorite films by category for an event year
     */
    public function getFavoriteFilmsByCategory(int $eventYearId): SupportCollection
    {
        return Category::where('event_year_id', $eventYearId)
            ->with(['participants.films.votings'])
            ->get()
            ->map(function ($category) {
                $films = Film::whereHas('participant', function ($query) use ($category) {
                    $query->where('category_id', $category->id);
                })
                    ->with(['participant', 'votings', 'verifiedBy'])
                    ->get()
                    ->map(function ($film) {
                        return [
                            'id' => $film->id,
                            'title' => $film->title,
                            'synopsis' => $film->synopsis,
                            'film_url' => $film->film_url,
                            'direct_video_url' => $film->direct_video_url,
                            'is_verified' => $film->is_verified,
                            'verified_at' => $film->verified_at,
                            'ranking' => $film->ranking,
                            'created_at' => $film->created_at,
                            'participant' => [
                                'id' => $film->participant->id,
                                'team_name' => $film->participant->team_name,
                                'leader_name' => $film->participant->leader_name,
                                'city' => $film->participant->city,
                                'company' => $film->participant->company,
                            ],
                            'verified_by' => $film->verifiedBy ? [
                                'id' => $film->verifiedBy->id,
                                'name' => $film->verifiedBy->name,
                            ] : null,
                            'vote_count' => $film->votings->count(),
                        ];
                    })
                    ->sortByDesc('vote_count')
                    ->take(3);

                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'is_active' => $category->is_active,
                    'participants_count' => $category->participants_count,
                    'top_films' => $films->values(),
                    'total_films' => $films->count(),
                ];
            });
    }

    /**
     * Get all films by category for an event year
     */
    public function getAllFilmsByCategory(int $eventYearId): SupportCollection
    {
        return Category::where('event_year_id', $eventYearId)
            ->with(['participants.films.votings'])
            ->get()
            ->map(function ($category) {
                $films = Film::whereHas('participant', function ($query) use ($category) {
                    $query->where('category_id', $category->id);
                })
                    ->with(['participant', 'votings', 'verifiedBy'])
                    ->get()
                    ->map(function ($film) {
                        return [
                            'id' => $film->id,
                            'title' => $film->title,
                            'synopsis' => $film->synopsis,
                            'film_url' => $film->film_url,
                            'direct_video_url' => $film->direct_video_url,
                            'is_verified' => $film->is_verified,
                            'verified_at' => $film->verified_at,
                            'ranking' => $film->ranking,
                            'created_at' => $film->created_at,
                            'participant' => [
                                'id' => $film->participant->id,
                                'team_name' => $film->participant->team_name,
                                'leader_name' => $film->participant->leader_name,
                                'city' => $film->participant->city,
                                'company' => $film->participant->company,
                            ],
                            'verified_by' => $film->verifiedBy ? [
                                'id' => $film->verifiedBy->id,
                                'name' => $film->verifiedBy->name,
                            ] : null,
                            'vote_count' => $film->votings->count(),
                        ];
                    })
                    ->sortByDesc('vote_count');

                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'is_active' => $category->is_active,
                    'participants_count' => $category->participants_count,
                    'films' => $films->values(),
                    'total_films' => $films->count(),
                    'verified_films_count' => $films->where('is_verified', true)->count(),
                    'pending_films_count' => $films->where('is_verified', false)->count(),
                ];
            });
    }

    /**
     * Create event year with file upload handling
     */
    public function create(array $data): EventYear
    {
        if (isset($data['event_guide_document']) && $data['event_guide_document']) {
            $data['event_guide_document'] = $this->fileUploadService->uploadEventGuide($data['event_guide_document']);
        }

        return EventYear::create($data);
    }

    /**
     * Update event year with file upload handling
     */
    public function update(EventYear $eventYear, array $data): bool
    {
        if (isset($data['event_guide_document']) && $data['event_guide_document']) {
            // Delete old file if exists
            $this->fileUploadService->delete($eventYear->event_guide_document);
            $data['event_guide_document'] = $this->fileUploadService->uploadEventGuide($data['event_guide_document']);
        } else {
            // Preserve existing document if no new one is provided
            unset($data['event_guide_document']);
        }

        return $eventYear->update($data);
    }

    /**
     * Delete event year with file cleanup
     */
    public function delete(EventYear $eventYear): bool
    {
        if ($eventYear->participants()->count() > 0) {
            throw new \Exception('Tidak dapat menghapus tahun event yang memiliki peserta');
        }

        // Delete event guide document if exists
        $this->fileUploadService->delete($eventYear->event_guide_document);

        return $eventYear->delete();
    }

    /**
     * Get submission status for an event year
     */
    public function getSubmissionStatus(EventYear $eventYear): string
    {
        $now = now();
        $submissionStart = $eventYear->submission_start_date;
        $submissionEnd = $eventYear->submission_end_date;

        if ($now < $submissionStart) {
            return 'coming_soon';
        } elseif ($now >= $submissionStart && $now <= $submissionEnd) {
            return 'open';
        } else {
            return 'ended';
        }
    }
}

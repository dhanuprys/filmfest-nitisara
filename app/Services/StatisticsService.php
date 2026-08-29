<?php

namespace App\Services;

use App\Models\Category;
use App\Models\EventYear;
use App\Models\Film;
use App\Models\Participant;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Collection as SupportCollection;

class StatisticsService
{
    public function __construct(
        private EventYearService $eventYearService
    ) {}

    /**
     * Get dashboard statistics
     */
    public function getDashboardStats(): array
    {
        return [
            'total_participants' => Participant::count(),
            'pending_participants' => Participant::where('verification_status', 'pending')->count(),
            'approved_participants' => Participant::where('verification_status', 'approved')->count(),
            'rejected_participants' => Participant::where('verification_status', 'rejected')->count(),
            'total_films' => Film::count(),
            'pending_films' => Film::whereNull('verified_by_user_id')->count(),
            'verified_films' => Film::whereNotNull('verified_by_user_id')->count(),
            'total_categories' => Category::count(),
            'total_event_years' => EventYear::count(),
            'total_users' => User::count(),
        ];
    }

    /**
     * Get recent participants
     */
    public function getRecentParticipants(int $limit = 5): SupportCollection
    {
        return Participant::with(['eventYear', 'category', 'verifiedBy'])
            ->latest()
            ->take($limit)
            ->get()
            ->map(function ($participant) {
                return [
                    'id' => $participant->id,
                    'team_name' => $participant->team_name,
                    'leader_name' => $participant->leader_name,
                    'city' => $participant->city,
                    'verification_status' => $participant->verification_status,
                    'verified_by_user_id' => $participant->verified_by_user_id,
                    'created_at' => $participant->created_at,
                ];
            });
    }

    /**
     * Get recent films
     */
    public function getRecentFilms(int $limit = 5): SupportCollection
    {
        return Film::with(['participant', 'verifiedBy'])
            ->latest()
            ->take($limit)
            ->get()
            ->map(function ($film) {
                return [
                    'id' => $film->id,
                    'title' => $film->title,
                    'participant' => $film->participant ? [
                        'id' => $film->participant->id,
                        'team_name' => $film->participant->team_name,
                    ] : null,
                    'verified_by_user_id' => $film->verified_by_user_id,
                    'created_at' => $film->created_at,
                ];
            });
    }

    /**
     * Get detailed statistics
     */
    public function getDetailedStatistics(): array
    {
        $currentYear = date('Y');

        return [
            'participants_by_month' => $this->getParticipantsByMonth($currentYear),
            'films_by_month' => $this->getFilmsByMonth($currentYear),
            'films_by_category' => $this->getFilmsByCategory(),
            'verification_stats' => $this->getVerificationStats(),
            'event_years_stats' => $this->getEventYearsStats(),
            'recent_activity' => $this->getRecentActivity(),
            'overall_stats' => $this->getOverallStats(),
            'current_year' => $currentYear,
        ];
    }

    /**
     * Get participants by month for a specific year
     */
    private function getParticipantsByMonth(int $year): Collection
    {
        return Participant::selectRaw('MONTH(created_at) as month, COUNT(*) as count')
            ->whereYear('created_at', $year)
            ->groupBy('month')
            ->orderBy('month')
            ->get();
    }

    /**
     * Get films by month for a specific year
     */
    private function getFilmsByMonth(int $year): Collection
    {
        return Film::selectRaw('MONTH(created_at) as month, COUNT(*) as count')
            ->whereYear('created_at', $year)
            ->groupBy('month')
            ->orderBy('month')
            ->get();
    }

    /**
     * Get films by category
     */
    private function getFilmsByCategory(): SupportCollection
    {
        return Category::withCount(['participants as total_participants'])
            ->get()
            ->map(function ($category) {
                $total_films = Film::whereHas('participant', function ($q) use ($category) {
                    $q->where('category_id', $category->id);
                })->count();

                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'total_participants' => $category->total_participants,
                    'total_films' => $total_films,
                ];
            });
    }

    /**
     * Get verification statistics
     */
    private function getVerificationStats(): array
    {
        return [
            'participants' => [
                'pending' => Participant::whereNull('verified_by_user_id')->count(),
                'verified' => Participant::whereNotNull('verified_by_user_id')->count(),
                'total' => Participant::count(),
            ],
            'films' => [
                'pending' => Film::whereNull('verified_by_user_id')->count(),
                'verified' => Film::whereNotNull('verified_by_user_id')->count(),
                'total' => Film::count(),
            ],
        ];
    }

    /**
     * Get event years statistics
     */
    private function getEventYearsStats(): SupportCollection
    {
        return EventYear::withCount(['participants', 'films'])
            ->orderBy('show_start', 'desc')
            ->get()
            ->map(function ($eventYear) {
                return [
                    'id' => $eventYear->id,
                    'title' => $eventYear->title,
                    'show_start' => $eventYear->show_start,
                    'show_end' => $eventYear->show_end,
                    'submission_start_date' => $eventYear->submission_start_date,
                    'submission_end_date' => $eventYear->submission_end_date,
                    'participants_count' => $eventYear->participants_count,
                    'films_count' => $eventYear->films_count,
                    'is_active' => ($eventYear->show_start && $eventYear->show_end)
                        ? now()->between($eventYear->show_start, $eventYear->show_end)
                        : false,
                    'submission_status' => $this->eventYearService->getSubmissionStatus($eventYear),
                ];
            });
    }

    /**
     * Get recent activity (last 30 days)
     */
    private function getRecentActivity(): array
    {
        return [
            'new_participants' => Participant::where('created_at', '>=', now()->subDays(30))->count(),
            'new_films' => Film::where('created_at', '>=', now()->subDays(30))->count(),
            'verified_participants' => Participant::where('verified_at', '>=', now()->subDays(30))->count(),
            'verified_films' => Film::where('verified_at', '>=', now()->subDays(30))->count(),
        ];
    }

    /**
     * Get overall statistics
     */
    private function getOverallStats(): array
    {
        $totalParticipants = Participant::count();

        return [
            'total_participants' => $totalParticipants,
            'total_films' => Film::count(),
            'total_categories' => Category::count(),
            'total_event_years' => EventYear::count(),
            'total_users' => User::count(),
            'avg_films_per_participant' => $totalParticipants > 0 ? round(Film::count() / $totalParticipants, 2) : 0,
        ];
    }
}

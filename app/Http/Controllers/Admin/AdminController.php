<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\EventYear;
use App\Services\StatisticsService;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function __construct(
        private StatisticsService $statisticsService
    ) {}

    public function dashboard()
    {
        $stats = $this->statisticsService->getDashboardStats();
        $recentParticipants = $this->statisticsService->getRecentParticipants();
        $recentFilms = $this->statisticsService->getRecentFilms();
        $categories = Category::withCount('participants')->get();
        $eventYears = EventYear::withCount('participants')->get();

        return Inertia::render('admin/dashboard', [
            'stats' => $stats,
            'recent_participants' => $recentParticipants,
            'recent_films' => $recentFilms,
            'categories' => $categories,
            'event_years' => $eventYears,
        ]);
    }

    public function statistics()
    {
        $statistics = $this->statisticsService->getDetailedStatistics();

        return Inertia::render('admin/statistics', $statistics);
    }
}

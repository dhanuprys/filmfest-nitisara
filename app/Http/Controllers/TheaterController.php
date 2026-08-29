<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\EventYear;
use App\Models\Film;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class TheaterController extends Controller
{
    /**
     * Display the main theater page.
     * Caches all data except for search results to improve performance.
     */
    public function index(Request $request)
    {
        $now = now();
        $search = $request->query('search');

        // Eager load relationships for performance.
        $filmRelations = [
            'participant',
            'participant.eventYear',
            'participant.category',
            'votings',
            'castings',
        ];

        // Cache additional data (categories, years, and randomized film lists) for 1 hour.
        // This data is not paginated and is the same for all users.
        $additionalData = Cache::remember('theater.index.additional_data', 3600, function () use ($now, $filmRelations) {
            $baseFilmQuery = fn () => Film::whereNotNull('verified_by_user_id')
                ->with($filmRelations)
                ->whereHas('participant.eventYear', function ($query) use ($now) {
                    $query->where('show_end', '<', $now); // Ensure event has finished
                });

            return [
                'latestFilms' => $baseFilmQuery()->orderBy('created_at', 'desc')->limit(8)->get(),
                'trendingFilms' => $baseFilmQuery()->inRandomOrder()->limit(8)->get(),
                'currentYearFilms' => $baseFilmQuery()->whereHas('participant.eventYear', function ($query) use ($now) {
                    $query->where('year', $now->year);
                })->inRandomOrder()->get(),
                'allFilms' => $baseFilmQuery()->inRandomOrder()->get(),
                'categories' => Category::orderBy('id')->get(['id', 'name']),
                'eventYears' => EventYear::orderBy('year', 'desc')->get(['id', 'year', 'show_end']),
            ];
        });

        // Handle the main films list (paginated).
        // If a search query is present, perform a live query. Otherwise, get from cache.
        if ($search) {
            // Server-side search is NOT cached to provide real-time results.
            $filmQuery = Film::query()
                ->whereNotNull('verified_by_user_id')
                ->with($filmRelations);

            $filmQuery->where(function ($q) use ($search) {
                $q->where('title', 'like', "%$search%")
                    ->orWhere('synopsis', 'like', "%$search%");
                // Search inside relationships
                $q->orWhereHas('participant', function ($q2) use ($search) {
                    $q2->where('team_name', 'like', "%$search%")
                        // Category name
                        ->orWhereHas('category', function ($q3) use ($search) {
                            $q3->where('name', 'like', "%$search%");
                        })
                        // Event year
                        ->orWhereHas('eventYear', function ($q4) use ($search) {
                            $q4->where('year', 'like', "%$search%");
                        });
                });
            });

            $films = $filmQuery->whereHas('participant.eventYear', function ($query) use ($now) {
                $query->where('show_end', '<', $now); // Ensure the event has ended
            })->orderByDesc('id')->paginate(12)->appends($request->query());

        } else {
            // If not searching, retrieve the paginated film list from the cache.
            // The cache key is unique for each page to support pagination.
            $currentPage = $request->query('page', 1);
            $films = Cache::remember("theater.index.films.page.{$currentPage}", 3600, function () use ($request, $filmRelations, $now) {
                return Film::query()
                    ->whereNotNull('verified_by_user_id')
                    ->with($filmRelations)
                    ->whereHas('participant.eventYear', function ($query) use ($now) {
                        $query->where('show_end', '<', $now); // Ensure the event has ended
                    })
                    ->orderByDesc('id')
                    ->paginate(12)
                    ->appends($request->query());
            });
        }

        // Combine all data and render the view.
        return Inertia::render('theater/index', array_merge(
            [
                'films' => $films,
                'search' => $search,
            ],
            $additionalData
        ));
    }

    /**
     * Display a single film's details page.
     */
    public function show($filmId)
    {
        // Note: Caching could also be applied here for individual film pages.
        $film = Film::with([
            'participant',
            'participant.eventYear',
            'participant.category',
            'castings',
        ])
            ->withCount('votings')
            ->where('id', $filmId)
            ->whereNotNull('verified_by_user_id')
            ->firstOrFail();

        $recommended = Film::whereNotNull('verified_by_user_id')
            ->where('id', '!=', $film->id)
            ->whereHas('participant.eventYear', function ($q) {
                $q->where('show_end', '<', now()); // Ensure event has finished
            })
            ->with([
                'participant',
                'participant.eventYear',
                'participant.category',
            ])
            ->inRandomOrder()
            ->limit(6)
            ->get();

        return Inertia::render('theater/film-show', [
            'film' => $film,
            'recommended' => $recommended,
        ]);
    }
}

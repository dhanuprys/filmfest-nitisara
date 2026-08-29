<?php

namespace App\Services;

use App\Models\Category;
use App\Models\Film;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * Service class for handling category-related business logic.
 */
class CategoryService
{
    /**
     * Get categories with participant count.
     */
    public function getCategoriesWithParticipantCount(): LengthAwarePaginator
    {
        return Category::withCount('participants')->latest()->paginate(20);
    }

    /**
     * Create category for event year.
     */
    public function createForEventYear(int $eventYearId, array $data): Category
    {
        $data['event_year_id'] = $eventYearId;

        return Category::create($data);
    }

    /**
     * Update category.
     */
    public function update(Category $category, array $data): bool
    {
        return $category->update($data);
    }

    /**
     * Delete category if it has no participants.
     *
     * @throws \Exception
     */
    public function delete(Category $category): bool
    {
        if ($category->participants()->count() > 0) {
            throw new \Exception('Tidak dapat menghapus kategori yang memiliki peserta');
        }

        return $category->delete();
    }

    /**
     * Get categories for event year.
     */
    public function getCategoriesForEventYear(int $eventYearId): Collection
    {
        return Category::where('event_year_id', $eventYearId)->get();
    }

    /**
     * Ensure category belongs to event year.
     *
     * @throws \Exception
     */
    public function ensureCategoryBelongsToEventYear(Category $category, int $eventYearId): bool
    {
        if ($category->event_year_id != $eventYearId) {
            throw new \Exception('Kategori tidak ditemukan dalam tahun event ini');
        }

        return true;
    }

    /**
     * Get category with participants.
     */
    public function getCategoryWithParticipants(Category $category): Category
    {
        return $category->load([
            'participants' => function ($query) {
                $query->with(['eventYear', 'verifiedBy', 'films'])->latest();
            },
        ]);
    }

    /**
     * Get category with films and detailed statistics.
     */
    public function getCategoryWithFilms(Category $category): Category
    {
        $category->load([
            'eventYear',
            'participants' => function ($query) {
                $query->with(['verifiedBy'])->latest();
            },
        ]);

        // Get all films for this category with detailed information
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

        // Use setRelation to ensure these are included in serialization
        $category->setRelation('films', $films->values());
        $category->setRelation('eventYear', $category->eventYear);

        $category->total_films = $films->count();
        $category->verified_films_count = $films->where('is_verified', true)->count();
        $category->pending_films_count = $films->where('is_verified', false)->count();
        $category->ranked_films_count = $films->where('ranking')->count();
        $category->total_votes = $films->sum('vote_count');

        return $category;
    }
}

<?php

namespace App\Services;

use App\Models\Film;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * Service class for handling film-related business logic and file operations.
 */
class FilmService
{
    /**
     * FilmService constructor.
     */
    public function __construct(
        private FileUploadService $fileUploadService
    ) {}

    /**
     * Get films with filters.
     */
    public function getFilmsWithFilters(array $filters): LengthAwarePaginator
    {
        return Film::with(['participant', 'verifiedBy'])
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                        ->orWhere('synopsis', 'like', "%{$search}%")
                        ->orWhereHas('participant', function ($participantQuery) use ($search) {
                            $participantQuery->where('team_name', 'like', "%{$search}%")
                                ->orWhere('leader_name', 'like', "%{$search}%")
                                ->orWhere('city', 'like', "%{$search}%")
                                ->orWhere('company', 'like', "%{$search}%");
                        });
                });
            })
            ->when($filters['status'] ?? null, function ($query, $status) {
                return match ($status) {
                    'verified' => $query->whereNotNull('verified_by_user_id'),
                    'pending' => $query->whereNull('verified_by_user_id'),
                    default => $query,
                };
            })
            ->latest()
            ->paginate(20);
    }

    /**
     * Verify a film.
     */
    public function verify(Film $film): bool
    {
        return $film->update([
            'verified_by_user_id' => auth()->id(),
            'verified_at' => now(),
        ]);
    }

    /**
     * Reject a film.
     */
    public function reject(Film $film): bool
    {
        return $film->update([
            'verified_by_user_id' => null,
            'verified_at' => null,
        ]);
    }

    /**
     * Delete a film with file cleanup.
     */
    public function delete(Film $film): bool
    {
        // Delete uploaded files if they exist
        $this->fileUploadService->delete($film->originality_file);
        $this->fileUploadService->delete($film->poster_file);
        $this->fileUploadService->delete($film->backdrop_file);

        return $film->delete();
    }

    /**
     * Update film ranking.
     */
    public function updateRanking(Film $film, array $data): bool
    {
        return $film->update($data);
    }

    /**
     * Get film file path for download.
     *
     * @throws \Exception
     */
    public function getFilmForDownload(Film $film, string $fileType): string
    {
        $filePath = match ($fileType) {
            'originality' => $film->originality_file,
            'poster' => $film->poster_file,
            'backdrop' => $film->backdrop_file,
            default => throw new \InvalidArgumentException('Invalid file type'),
        };

        if (! $filePath || ! $this->fileUploadService->exists($filePath)) {
            throw new \Exception('File tidak ditemukan');
        }

        return $this->fileUploadService->getFilePath($filePath);
    }

    /**
     * Get download filename for a film file.
     */
    public function getDownloadFilename(Film $film, string $fileType): string
    {
        $extension = match ($fileType) {
            'originality' => 'pdf',
            'poster', 'backdrop' => 'jpg',
            default => 'file',
        };

        return match ($fileType) {
            'originality' => "surat_orisinalitas_{$film->title}.{$extension}",
            'poster' => "poster_{$film->title}.{$extension}",
            'backdrop' => "backdrop_{$film->title}.{$extension}",
            default => "{$fileType}_{$film->title}.{$extension}",
        };
    }
}

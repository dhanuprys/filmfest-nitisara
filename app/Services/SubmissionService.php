<?php

namespace App\Services;

use App\Models\Film;
use App\Models\Participant;
use Illuminate\Support\Facades\DB;

class SubmissionService
{
    public function __construct(
        private FileUploadService $fileUploadService
    ) {}

    /**
     * Verify PIN and get participant
     */
    public function verifyPin(string $pin): ?Participant
    {
        return Participant::with('eventYear')->where('pin', $pin)->first();
    }

    /**
     * Check if submission period is open for participant
     */
    public function isSubmissionOpen(Participant $participant): bool
    {
        $eventYear = $participant->eventYear;
        $now = now();

        return $eventYear &&
            $now >= $eventYear->submission_start_date &&
            $now <= $eventYear->submission_end_date;
    }

    /**
     * Check if participant already has a film
     */
    public function hasExistingFilm(Participant $participant): bool
    {
        return Film::where('participant_id', $participant->id)->exists();
    }

    /**
     * Submit film
     */
    public function submitFilm(array $data, Participant $participant): Film
    {
        return DB::transaction(function () use ($data, $participant) {
            // Handle file uploads
            $originalityPath = $this->fileUploadService->upload(
                $data['originality_file'],
                'originality-files'
            );

            $posterLandscapePath = $this->fileUploadService->upload(
                $data['poster_landscape_file'],
                'posters/landscape'
            );
            $posterPortraitPath = $this->fileUploadService->upload(
                $data['poster_portrait_file'],
                'posters/portrait'
            );

            $backdropPath = null;
            if (isset($data['backdrop_file'])) {
                $backdropPath = $this->fileUploadService->upload(
                    $data['backdrop_file'],
                    'backdrop-files'
                );
            }

            // Create film
            return Film::create([
                'participant_id' => $participant->id,
                'title' => $data['title'],
                'synopsis' => $data['synopsis'],
                'film_url' => $data['film_url'],
                'originality_file' => $originalityPath,
                'poster_landscape_file' => $posterLandscapePath,
                'poster_portrait_file' => $posterPortraitPath,
                'backdrop_file' => $backdropPath,
            ]);
        });
    }

    /**
     * Update film
     */
    public function updateFilm(Film $film, array $data): bool
    {
        return DB::transaction(function () use ($film, $data) {
            $updateData = [
                'title' => $data['title'],
                'synopsis' => $data['synopsis'],
                'film_url' => $data['film_url'],
            ];

            // Handle file uploads if provided
            if (isset($data['originality_file'])) {
                $this->fileUploadService->delete($film->originality_file);
                $updateData['originality_file'] = $this->fileUploadService->upload(
                    $data['originality_file'],
                    'originality-files'
                );
            }

            if (isset($data['poster_landscape_file'])) {
                $this->fileUploadService->delete($film->poster_landscape_file);
                $updateData['poster_landscape_file'] = $this->fileUploadService->upload(
                    $data['poster_landscape_file'],
                    'posters/landscape'
                );
            }
            if (isset($data['poster_portrait_file'])) {
                $this->fileUploadService->delete($film->poster_portrait_file);
                $updateData['poster_portrait_file'] = $this->fileUploadService->upload(
                    $data['poster_portrait_file'],
                    'posters/portrait'
                );
            }

            if (isset($data['backdrop_file'])) {
                $this->fileUploadService->delete($film->backdrop_file);
                $updateData['backdrop_file'] = $this->fileUploadService->upload(
                    $data['backdrop_file'],
                    'backdrop-files'
                );
            }

            return $film->update($updateData);
        });
    }

    /**
     * Get participant from session
     */
    public function getParticipantFromSession(int $participantId): ?Participant
    {
        return Participant::with('eventYear')->find($participantId);
    }
}

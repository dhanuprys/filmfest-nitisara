<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\FilmRequest;
use App\Models\Film;
use App\Models\Participant;
use App\Services\FilmService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class FilmController extends Controller
{
    public function __construct(
        private FilmService $filmService
    ) {}

    public function index(Request $request)
    {
        $films = $this->filmService->getFilmsWithFilters($request->only(['search', 'status']));

        return Inertia::render('admin/films/index', [
            'films' => $films,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function show(Film $film)
    {
        $film->load(['participant', 'verifiedBy', 'castings']);

        return Inertia::render('admin/films/show', [
            'film' => $film,
        ]);
    }

    public function edit(Film $film)
    {
        $film->load(['participant', 'verifiedBy', 'castings']);

        return Inertia::render('admin/films/edit', [
            'film' => $film,
        ]);
    }

    public function destroy(Film $film)
    {
        $this->filmService->delete($film);

        return redirect()->route('admin.films.index')
            ->with('success', 'Film berhasil dihapus');
    }

    public function verify(Film $film)
    {
        $this->filmService->verify($film);

        return back()->with('success', 'Film berhasil diverifikasi');
    }

    public function reject(Film $film)
    {
        $this->filmService->reject($film);

        return back()->with('success', 'Verifikasi film dibatalkan');
    }

    public function download(Film $film)
    {
        $filePath = $this->filmService->getFilmForDownload($film, 'originality');
        $filename = $this->filmService->getDownloadFilename($film, 'originality');

        return response()->download($filePath, $filename);
    }

    public function downloadPoster(Film $film)
    {
        $filePath = $this->filmService->getFilmForDownload($film, 'poster');
        $filename = $this->filmService->getDownloadFilename($film, 'poster');

        return response()->download($filePath, $filename);
    }

    public function downloadBackdrop(Film $film)
    {
        $filePath = $this->filmService->getFilmForDownload($film, 'backdrop');
        $filename = $this->filmService->getDownloadFilename($film, 'backdrop');

        return response()->download($filePath, $filename);
    }

    public function update(FilmRequest $request, Film $film)
    {
        $validated = $request->validated();

        // Transform data for database
        $updateData = [
            'title' => $validated['title'],
            'synopsis' => $validated['synopsis'],
            'film_url' => $validated['film_url'],
            'direct_video_url' => $validated['direct_video_url'] ?: null,
            'ranking' => $validated['ranking'] ? (int) $validated['ranking'] : null,
            'director' => $validated['director'] ?? null,
            'teaser_url' => $validated['teaser_url'] ?? null,
        ];

        // Handle file uploads if provided
        if ($request->hasFile('originality_file')) {
            if ($film->originality_file) {
                Storage::disk('public')->delete($film->originality_file);
            }
            $updateData['originality_file'] = $request->file('originality_file')->store('originality-files', 'public');
        }
        if ($request->hasFile('poster_landscape_file')) {
            if ($film->poster_landscape_file) {
                Storage::disk('public')->delete($film->poster_landscape_file);
            }
            $updateData['poster_landscape_file'] = $request->file('poster_landscape_file')->store('posters/landscape', 'public');
        }
        if ($request->hasFile('poster_portrait_file')) {
            if ($film->poster_portrait_file) {
                Storage::disk('public')->delete($film->poster_portrait_file);
            }
            $updateData['poster_portrait_file'] = $request->file('poster_portrait_file')->store('posters/portrait', 'public');
        }
        if ($request->hasFile('backdrop_file')) {
            if ($film->backdrop_file) {
                Storage::disk('public')->delete($film->backdrop_file);
            }
            $updateData['backdrop_file'] = $request->file('backdrop_file')->store('backdrop-files', 'public');
        }

        DB::transaction(function () use ($film, $updateData, $validated) {
            $film->update($updateData);

            // Handle castings (optional, replace all)
            if (isset($validated['castings'])) {
                $film->castings()->delete();
                foreach ($validated['castings'] as $casting) {
                    $film->castings()->create([
                        'real_name' => $casting['real_name'],
                        'film_name' => $casting['film_name'],
                    ]);
                }
            }
        });

        return redirect()->route('admin.films.show', $film)
            ->with('success', 'Film berhasil diperbarui.');
    }

    public function createForParticipant(Participant $participant)
    {
        return Inertia::render('admin/films/create-for-participant', [
            'participant' => $participant->load(['eventYear', 'category']),
        ]);
    }

    public function storeForParticipant(FilmRequest $request, Participant $participant)
    {
        $validated = $request->validated();

        // Set the participant_id automatically
        $validated['participant_id'] = $participant->id;

        // Handle file uploads if provided
        if ($request->hasFile('originality_file')) {
            $validated['originality_file'] = $request->file('originality_file')->store('originality-files', 'public');
        }
        if ($request->hasFile('poster_landscape_file')) {
            $validated['poster_landscape_file'] = $request->file('poster_landscape_file')->store('posters/landscape', 'public');
        }
        if ($request->hasFile('poster_portrait_file')) {
            $validated['poster_portrait_file'] = $request->file('poster_portrait_file')->store('posters/portrait', 'public');
        }
        if ($request->hasFile('backdrop_file')) {
            $validated['backdrop_file'] = $request->file('backdrop_file')->store('backdrop-files', 'public');
        }

        // Auto-verify admin-created films
        $validated['verified_by_user_id'] = auth()->id();
        $validated['verified_at'] = now();

        try {
            $film = DB::transaction(function () use ($validated) {
                $film = Film::create($validated);

                // Handle castings (optional)
                if (isset($validated['castings'])) {
                    foreach ($validated['castings'] as $casting) {
                        $film->castings()->create([
                            'real_name' => $casting['real_name'],
                            'film_name' => $casting['film_name'],
                        ]);
                    }
                }

                return $film;
            });
        } catch (\Exception $e) {
            $filesToDelete = array_filter([
                $validated['originality_file'] ?? null,
                $validated['poster_landscape_file'] ?? null,
                $validated['poster_portrait_file'] ?? null,
                $validated['backdrop_file'] ?? null,
            ]);
            if (! empty($filesToDelete)) {
                Storage::disk('public')->delete($filesToDelete);
            }
            throw $e;
        }

        return redirect()->route('admin.participants.show', $participant)
            ->with('success', 'Film berhasil ditambahkan untuk peserta ini');
    }
}

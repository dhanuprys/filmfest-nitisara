<?php

namespace App\Http\Controllers;

use App\Models\EventYear;
use App\Models\Film;
use App\Models\Participant;
use App\Services\TelegramService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SubmissionController extends Controller
{
    public function index(Request $request)
    {
        $participant = null;
        $existingFilm = null;
        $eventYear = null;
        $isSubmissionOpen = false;
        $submissionStatus = 'closed'; // 'closed', 'coming_soon', 'open', 'ended'
        $countdownInfo = null;

        // Check if participant is in session
        if ($request->session()->has('participant_id')) {
            $participant = Participant::with('eventYear')->find($request->session()->get('participant_id'));

            if ($participant) {
                $eventYear = $participant->eventYear;
                $existingFilm = Film::where('participant_id', $participant->id)->first();
            }
        }

        // If no participant or no event year from participant, check for active event year
        if (! $eventYear) {
            $eventYear = EventYear::where('show_start', '<=', now())
                ->where('show_end', '>=', now())
                ->orderBy('submission_start_date')
                ->first();
        }

        // Check submission period status
        $now = now();
        if ($eventYear) {
            $submissionStart = $eventYear->submission_start_date;
            $submissionEnd = $eventYear->submission_end_date;

            if ($now < $submissionStart) {
                $submissionStatus = 'coming_soon';
                $countdownInfo = [
                    'target_date' => $submissionStart,
                    'message' => 'Submit film akan dibuka dalam:',
                ];
            } elseif ($now >= $submissionStart && $now <= $submissionEnd) {
                $submissionStatus = 'open';
                $isSubmissionOpen = true;
            } else {
                $submissionStatus = 'ended';
                $countdownInfo = [
                    'target_date' => $submissionEnd,
                    'message' => 'Submit film telah ditutup sejak:',
                ];
            }
        }

        return Inertia::render('submission/index', [
            'participant' => $participant,
            'existingFilm' => $existingFilm,
            'eventYear' => $eventYear,
            'isSubmissionOpen' => $isSubmissionOpen,
            'submissionStatus' => $submissionStatus,
            'countdownInfo' => $countdownInfo,
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    public function verify(Request $request)
    {
        $request->validate([
            'pin' => 'required|string|size:6',
        ]);

        $participant = Participant::with('eventYear')->where('pin', $request->pin)->first();

        if (! $participant) {
            return back()->withErrors(['pin' => 'PIN tidak valid']);
        }

        // Check if participant is verified
        if ($participant->verification_status !== 'approved') {
            return Inertia::render('submission/submission-unverified', [
                'message' => 'Akun Anda belum diverifikasi oleh admin. Silakan menunggu verifikasi sebelum dapat mengupload film.',
            ]);
        }

        // Check if submission period is open
        $eventYear = $participant->eventYear;
        $now = now();
        $isSubmissionOpen = $eventYear &&
            $now >= $eventYear->submission_start_date &&
            $now <= $eventYear->submission_end_date;

        if (! $isSubmissionOpen) {
            return back()->withErrors(['pin' => 'Periode submit film belum dibuka atau sudah berakhir']);
        }

        // Store participant in session
        $request->session()->put('participant_id', $participant->id);

        return redirect()->route('submission');
    }

    public function store(Request $request)
    {
        // Check if participant is in session
        if (! $request->session()->has('participant_id')) {
            return redirect()->route('submission')->withErrors(['error' => 'Silakan masukkan PIN terlebih dahulu']);
        }

        $participant = Participant::with('eventYear')->find($request->session()->get('participant_id'));

        if (! $participant) {
            $request->session()->forget('participant_id');

            return redirect()->route('submission')->withErrors(['error' => 'Sesi tidak valid']);
        }

        // Check if submission period is open
        $eventYear = $participant->eventYear;
        $now = now();
        $isSubmissionOpen = $eventYear &&
            $now >= $eventYear->submission_start_date &&
            $now <= $eventYear->submission_end_date;

        if (! $isSubmissionOpen) {
            return back()->withErrors(['error' => 'Periode submit film belum dibuka atau sudah berakhir']);
        }

        // Check if participant already has a film
        $existingFilm = Film::where('participant_id', $participant->id)->first();
        if ($existingFilm) {
            return back()->withErrors(['error' => 'Anda sudah mengirimkan film']);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'synopsis' => 'required|string|max:1000',
            'film_url' => 'required|url',
            'originality_file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:3072',
            'poster_landscape_file' => 'required|file|mimes:jpg,jpeg,png|max:3072',
            'poster_portrait_file' => 'required|file|mimes:jpg,jpeg,png|max:3072',
            'backdrop_file' => 'nullable|file|mimes:jpg,jpeg,png|max:3072',
            'director' => 'nullable|string|max:255',
            'teaser_url' => 'required|url', // now required
            'castings' => 'nullable|array',
            'castings.*.real_name' => 'required_with:castings|string|max:255',
            'castings.*.film_name' => 'required_with:castings|string|max:255',
        ]);

        // Handle file uploads
        $originalityPath = $request->file('originality_file')->store('originality-files', 'public');
        $posterLandscapePath = $request->file('poster_landscape_file')->store('posters/landscape', 'public');
        $posterPortraitPath = $request->file('poster_portrait_file')->store('posters/portrait', 'public');
        $backdropPath = null;

        if ($request->hasFile('backdrop_file')) {
            $backdropPath = $request->file('backdrop_file')->store('backdrop-files', 'public');
        }

        try {
            $film = DB::transaction(function () use ($participant, $validated, $originalityPath, $posterLandscapePath, $posterPortraitPath, $backdropPath) {
                $film = Film::create([
                    'participant_id' => $participant->id,
                    'title' => $validated['title'],
                    'synopsis' => $validated['synopsis'],
                    'film_url' => $validated['film_url'],
                    'originality_file' => $originalityPath,
                    'poster_landscape_file' => $posterLandscapePath,
                    'poster_portrait_file' => $posterPortraitPath,
                    'backdrop_file' => $backdropPath,
                    'director' => $validated['director'] ?? null,
                    'teaser_url' => $validated['teaser_url'] ?? null,
                ]);

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
            $filesToDelete = array_filter([$originalityPath, $posterLandscapePath, $posterPortraitPath, $backdropPath]);
            if (! empty($filesToDelete)) {
                Storage::disk('public')->delete($filesToDelete);
            }
            throw $e;
        }

        // Send Telegram notification (silent on error)
        try {
            app(TelegramService::class)->sendMessage(
                "<b>Film Baru Dikirim</b>\nTim: {$participant->team_name}\nJudul: {$film->title}\nKetua: {$participant->leader_name}\nEmail: {$participant->leader_email}\nWhatsApp: {$participant->leader_whatsapp}"
            );
        } catch (\Throwable $e) {
            // Silently ignore
        }

        return redirect()->route('submission')
            ->with('success', 'Film berhasil dikirim');
    }

    public function update(Request $request, Film $film)
    {
        // Check if participant is in session and owns this film
        if (! $request->session()->has('participant_id')) {
            return redirect()->route('submission')->withErrors(['error' => 'Silakan masukkan PIN terlebih dahulu']);
        }

        $participant = Participant::with('eventYear')->find($request->session()->get('participant_id'));

        if (! $participant || $film->participant_id !== $participant->id) {
            return redirect()->route('submission')->withErrors(['error' => 'Tidak dapat mengakses film ini']);
        }

        // Check if submission period is open
        $eventYear = $participant->eventYear;
        $now = now();
        $isSubmissionOpen = $eventYear &&
            $now >= $eventYear->submission_start_date &&
            $now <= $eventYear->submission_end_date;

        if (! $isSubmissionOpen) {
            return back()->withErrors(['error' => 'Periode submit film belum dibuka atau sudah berakhir']);
        }

        $validated = $request->validate([
            'film_url' => 'required|url',
            'originality_file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:3072',
            'poster_landscape_file' => 'nullable|file|mimes:jpg,jpeg,png|max:3072',
            'poster_portrait_file' => 'nullable|file|mimes:jpg,jpeg,png|max:3072',
            'backdrop_file' => 'nullable|file|mimes:jpg,jpeg,png|max:3072',
            'director' => 'nullable|string|max:255',
            'teaser_url' => 'nullable|url',
            'castings' => 'nullable|array',
            'castings.*.real_name' => 'required_with:castings|string|max:255',
            'castings.*.film_name' => 'required_with:castings|string|max:255',
        ]);

        $updateData = [
            'film_url' => $validated['film_url'],
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

        return redirect()->route('submission')
            ->with('success', 'Film berhasil diperbarui');
    }

    public function logout(Request $request)
    {
        $request->session()->forget('participant_id');

        return redirect()->route('submission');
    }
}

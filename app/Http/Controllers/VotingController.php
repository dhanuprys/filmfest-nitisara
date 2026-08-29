<?php

namespace App\Http\Controllers;

use App\Models\EventYear;
use App\Models\Film;
use App\Models\FilmVoting;
use App\Models\Ticket;
use App\Models\VotingPagePin;
use App\Models\VotingPageSession;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VotingController extends Controller
{
    /**
     * Display the voting page or login screen
     */
    public function index(Request $request)
    {
        $session = null;
        $sessionToken = $request->session()->get('voting_session_token');

        if ($sessionToken) {
            $session = VotingPageSession::findByToken($sessionToken);

            // Debug: Log session status
            \Log::info('Session check in index', [
                'session_token' => $sessionToken,
                'session_exists' => $session ? true : false,
                'session_valid' => $session ? $session->isValid() : false,
                'pin_is_active' => $session ? $session->votingPagePin->is_active : null,
            ]);

            // Check if session is valid
            if ($session && $session->isValid()) {
                // Update last accessed time
                $session->updateLastAccessed();

                // Get current active event year
                $activeEventYear = EventYear::where('show_start', '<=', now())
                    ->where('show_end', '>=', now())
                    ->latest('year')
                    ->first();

                if (!$activeEventYear) {
                    return Inertia::render('voting/closed');
                }

                // Load verified films grouped by category
                $films = Film::whereNotNull('verified_by_user_id')
                    ->with(['participant.category'])
                    ->when($activeEventYear, function ($query) use ($activeEventYear) {
                        $query->whereHas('participant', function ($q) use ($activeEventYear) {
                            $q->where('event_year_id', $activeEventYear->id);
                        });
                    })
                    ->get();

                // Group films by category
                $filmsByCategory = $films->groupBy('participant.category.name');

                // Get categories for this event year
                $categories = \App\Models\Category::where('event_year_id', $activeEventYear->id)
                    ->where('is_active', true)
                    ->get();

                return Inertia::render('voting/index', [
                    'filmsByCategory' => $filmsByCategory,
                    'categories' => $categories,
                    'session' => [
                        'token' => $session->token,
                        'expires_at' => $session->expires_at,
                    ],
                    'activeEventYear' => $activeEventYear,
                ]);
            } else {
                // Clear invalid session
                $request->session()->forget('voting_session_token');
            }
        }

        return Inertia::render('voting/login');
    }

    /**
     * Show the closed page when voting is inactive
     */
    public function closed()
    {
        return Inertia::render('voting/closed');
    }

    /**
     * Verify PIN and create session
     */
    public function verifyPin(Request $request)
    {
        $request->validate([
            'pin' => 'required|string|size:6',
        ]);

        $pin = VotingPagePin::where('pin', $request->pin)->first();

        if (!$pin) {
            return back()->withErrors(['pin' => 'PIN tidak ditemukan']);
        }

        // Check if PIN exists and is not expired (but allow deactivated PINs)
        if ($pin->expires_at && now()->gt($pin->expires_at)) {
            return back()->withErrors(['pin' => 'PIN sudah tidak aktif']);
        }

        // Debug: Log PIN status
        \Log::info('PIN verification', [
            'pin' => $request->pin,
            'is_active' => $pin->is_active,
            'expires_at' => $pin->expires_at,
            'lifetime_minutes' => $pin->lifetime_minutes,
        ]);

        // Create a new session
        $session = VotingPageSession::createSession(
            $pin,
            $request->ip(),
            $request->userAgent()
        );

        // Store session token in browser session
        $request->session()->put('voting_session_token', $session->token);

        return redirect()->route('voting.index');
    }

    /**
     * Check if the session is still valid (for polling)
     */
    public function checkSession(Request $request)
    {
        $sessionToken = $request->session()->get('voting_session_token');

        if (!$sessionToken) {
            return response()->json(['valid' => false, 'reason' => 'no_session']);
        }

        $session = VotingPageSession::findByToken($sessionToken);

        if (!$session) {
            return response()->json(['valid' => false, 'reason' => 'session_not_found']);
        }

        // Check if the session has expired
        if (now()->gt($session->expires_at)) {
            return response()->json(['valid' => false, 'reason' => 'expired']);
        }

        // Check if the PIN is still active
        if (!$session->votingPagePin->is_active) {
            return response()->json(['valid' => false, 'reason' => 'pin_deactivated']);
        }

        // Update last accessed time
        $session->updateLastAccessed();

        return response()->json([
            'valid' => true,
            'expires_at' => $session->expires_at,
        ]);
    }

    /**
     * Log out from the voting page
     */
    public function logout(Request $request)
    {
        $request->session()->forget('voting_session_token');
        return redirect()->route('voting.index');
    }

    /**
     * Start a voting session with a ticket code
     */
    public function startVotingSession(Request $request)
    {
        // Check if session is valid
        $sessionToken = $request->session()->get('voting_session_token');
        if (!$sessionToken) {
            return response()->json([
                'success' => false,
                'message' => 'Sesi tidak valid'
            ], 401);
        }

        $session = VotingPageSession::findByToken($sessionToken);
        if (!$session || !$session->isValid()) {
            return response()->json([
                'success' => false,
                'message' => 'Sesi telah berakhir'
            ], 401);
        }

        // Validate request
        $validated = $request->validate([
            'ticket_code' => 'required|string|max:8',
        ]);

        // Get current active event year
        $activeEventYear = EventYear::where('show_start', '<=', now())
            ->where('show_end', '>=', now())
            ->latest('year')
            ->first();

        if (!$activeEventYear) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak ada event yang aktif saat ini'
            ], 400);
        }

        // Find the ticket
        $ticket = Ticket::where('code', $validated['ticket_code'])
            ->where(function ($query) use ($activeEventYear) {
                $query->where('event_year_id', $activeEventYear->id)
                    ->orWhereNull('event_year_id'); // For backward compatibility with existing tickets
            })
            ->first();

        if (!$ticket) {
            return response()->json([
                'success' => false,
                'message' => 'Kode tiket tidak valid atau tidak untuk event ini'
            ], 400);
        }

        // Check if ticket has been completely used (all categories voted)
        if ($ticket->used_at) {
            return response()->json([
                'success' => false,
                'message' => 'Tiket sudah digunakan untuk voting login'
            ], 400);
        }

        // Mark ticket as used immediately when used for voting login
        $ticket->update(['used_at' => now()]);

        \Log::info('Ticket marked as used for voting login', [
            'ticket_code' => $validated['ticket_code'],
            'ticket_id' => $ticket->id,
            'used_at' => now(),
        ]);

        // Get categories for this event year
        $categories = \App\Models\Category::where('event_year_id', $activeEventYear->id)
            ->where('is_active', true)
            ->get();

        // Check which categories have already been voted for this ticket
        $votedCategories = $ticket->filmVotings()
            ->with('film.participant.category')
            ->get()
            ->pluck('film.participant.category.name')
            ->toArray();

        $remainingCategories = $categories->whereNotIn('name', $votedCategories);

        return response()->json([
            'success' => true,
            'ticket' => [
                'id' => $ticket->id,
                'code' => $ticket->code,
            ],
            'categories' => $categories,
            'voted_categories' => $votedCategories,
            'remaining_categories' => $remainingCategories->values()->toArray(),
            'is_complete' => $remainingCategories->isEmpty(),
        ]);
    }

    /**
     * Submit a vote for a specific category
     */
    public function vote(Request $request)
    {
        // Check if session is valid
        $sessionToken = $request->session()->get('voting_session_token');
        if (!$sessionToken) {
            return response()->json([
                'success' => false,
                'message' => 'Sesi tidak valid'
            ], 401);
        }

        $session = VotingPageSession::findByToken($sessionToken);
        if (!$session || !$session->isValid()) {
            return response()->json([
                'success' => false,
                'message' => 'Sesi telah berakhir'
            ], 401);
        }

        // Validate request
        $validated = $request->validate([
            'ticket_code' => 'required|string|max:8',
            'film_id' => 'required|exists:films,id',
        ]);

        // Get current active event year
        $activeEventYear = EventYear::where('show_start', '<=', now())
            ->where('show_end', '>=', now())
            ->latest('year')
            ->first();

        if (!$activeEventYear) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak ada event yang aktif saat ini'
            ], 400);
        }

        // Find the ticket
        $ticket = Ticket::where('code', $validated['ticket_code'])
            ->where(function ($query) use ($activeEventYear) {
                $query->where('event_year_id', $activeEventYear->id)
                    ->orWhereNull('event_year_id'); // For backward compatibility with existing tickets
            })
            ->first();

        if (!$ticket) {
            return response()->json([
                'success' => false,
                'message' => 'Kode tiket tidak valid atau tidak untuk event ini'
            ], 400);
        }

        // Note: Tickets are marked as used upon login, so we don't check used_at here
        // The ticket can still vote within the same session

        // Get the film
        $film = Film::with('participant.category')->find($validated['film_id']);

        if (!$film || !$film->verified_by_user_id) {
            return response()->json([
                'success' => false,
                'message' => 'Film tidak ditemukan atau belum diverifikasi'
            ], 400);
        }

        // Check if film belongs to the current event year
        $filmEventYearId = $film->participant->event_year_id ?? null;
        if (!$filmEventYearId || $filmEventYearId != $activeEventYear->id) {
            return response()->json([
                'success' => false,
                'message' => 'Film tidak termasuk dalam event yang aktif'
            ], 400);
        }

        // Check if this category has already been voted for this ticket
        $categoryName = $film->participant->category->name;

        $lockKey = "voting_ticket_{$ticket->id}_category_{$categoryName}";
        $lock = \Illuminate\Support\Facades\Cache::lock($lockKey, 10);
        
        if (!$lock->get()) {
            return response()->json([
                'success' => false,
                'message' => 'Sedang memproses vote lain. Silakan coba lagi.'
            ], 429);
        }

        try {
            $existingVote = $ticket->filmVotings()
                ->whereHas('film.participant.category', function ($query) use ($categoryName) {
                    $query->where('name', $categoryName);
                })
                ->exists();

            if ($existingVote) {
                return response()->json([
                    'success' => false,
                    'message' => 'Kategori ini sudah divote untuk tiket ini'
                ], 400);
            }

            // Create the vote
            FilmVoting::create([
                'ticket_id' => $ticket->id,
                'film_id' => $film->id,
            ]);
        } finally {
            $lock->release();
        }

        // Check if all categories have been voted
        $categories = \App\Models\Category::where('event_year_id', $activeEventYear->id)
            ->where('is_active', true)
            ->get();

        $votedCategories = $ticket->filmVotings()
            ->with('film.participant.category')
            ->get()
            ->pluck('film.participant.category.name')
            ->toArray();

        $remainingCategories = $categories->whereNotIn('name', $votedCategories);

        \Log::info('Vote response', [
            'ticket_code' => $validated['ticket_code'],
            'film_id' => $validated['film_id'],
            'remaining_categories_count' => $remainingCategories->count(),
            'is_complete' => $remainingCategories->isEmpty(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Voting berhasil',
            'remaining_categories' => $remainingCategories->values()->toArray(),
            'is_complete' => $remainingCategories->isEmpty(),
        ]);
    }
}

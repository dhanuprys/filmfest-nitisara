<?php

namespace App\Http\Controllers;

use App\Models\Participant;
use App\Models\ParticipantSession;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StatusController extends Controller
{
    public function index()
    {
        return Inertia::render('status/index');
    }

    public function check(Request $request)
    {
        $request->validate([
            'pin' => 'required|string|size:6',
        ]);

        $participant = Participant::where('pin', $request->pin)
            ->with(['eventYear', 'category', 'verifiedBy', 'films'])
            ->first();

        if (! $participant) {
            return back()->withErrors(['pin' => 'PIN tidak ditemukan. Silakan cek kembali.']);
        }

        // Create or get existing session
        $session = ParticipantSession::createSession(
            $participant,
            $request->ip(),
            $request->userAgent()
        );

        return redirect()->route('status.show', ['token' => $session->token]);
    }

    public function show(Request $request, $token)
    {
        $session = ParticipantSession::findByToken($token);

        if (! $session) {
            return redirect()->route('status.index')
                ->withErrors(['session' => 'Sesi telah berakhir atau tidak valid. Silakan masukkan PIN kembali.']);
        }

        // Update last accessed time
        $session->updateLastAccessed();

        $participant = $session->participant->load(['eventYear', 'category', 'verifiedBy', 'films']);

        return Inertia::render('status/show', [
            'participant' => $participant,
            'session' => [
                'token' => $session->token,
                'expires_at' => $session->expires_at,
                'last_accessed_at' => $session->last_accessed_at,
            ],
        ]);
    }

    public function logout(Request $request, $token)
    {
        $session = ParticipantSession::findByToken($token);

        if ($session) {
            $session->delete();
        }

        return redirect()->route('status.index')
            ->with('success', 'Anda telah keluar dari sesi status tracking.');
    }

    public function extendSession(Request $request, $token)
    {
        $session = ParticipantSession::findByToken($token);

        if (! $session) {
            return response()->json(['error' => 'Sesi tidak valid'], 404);
        }

        // Extend session for another 7 days
        $session->update([
            'expires_at' => now()->addDays(7),
            'last_accessed_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'expires_at' => $session->expires_at,
        ]);
    }
}

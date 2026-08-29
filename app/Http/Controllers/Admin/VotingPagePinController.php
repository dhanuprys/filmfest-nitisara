<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\VotingPagePin;
use App\Models\VotingPageSession;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VotingPagePinController extends Controller
{
    /**
     * Display a listing of the voting page PINs
     */
    public function index(Request $request)
    {
        $pins = VotingPagePin::when($request->search, function ($query, $search) {
            $query->where('pin', 'like', "%{$search}%")
                ->orWhere('name', 'like', "%{$search}%");
        })
            ->when($request->status, function ($query, $status) {
                if ($status === 'active') {
                    $query->where('is_active', true);
                } elseif ($status === 'inactive') {
                    $query->where('is_active', false);
                }
            })
            ->latest()
            ->paginate(20);

        return Inertia::render('admin/voting-pins/index', [
            'pins' => $pins,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Show the form for creating a new voting page PIN
     */
    public function create()
    {
        return Inertia::render('admin/voting-pins/create');
    }

    /**
     * Store a newly created voting page PIN
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'lifetime_minutes' => 'required|integer|min:5',
            'is_active' => 'boolean',
        ]);

        $pin = VotingPagePin::create([
            'pin' => VotingPagePin::generateUniquePin(),
            'name' => $validated['name'],
            'lifetime_minutes' => $validated['lifetime_minutes'],
            'is_active' => $validated['is_active'] ?? true,
        ]);

        // Set expiry time
        $pin->setExpiryTime();

        return redirect()->route('admin.voting-pins.index')
            ->with('success', 'PIN berhasil dibuat');
    }

    /**
     * Show the form for editing the specified voting page PIN
     */
    public function edit(VotingPagePin $votingPin)
    {
        return Inertia::render('admin/voting-pins/edit', [
            'pin' => $votingPin,
        ]);
    }

    /**
     * Update the specified voting page PIN
     */
    public function update(Request $request, VotingPagePin $votingPin)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'lifetime_minutes' => 'required|integer|min:5',
            'is_active' => 'boolean',
        ]);

        $votingPin->update([
            'name' => $validated['name'],
            'lifetime_minutes' => $validated['lifetime_minutes'],
            'is_active' => $validated['is_active'] ?? false,
        ]);

        // Update expiry time if active
        if ($validated['is_active'] ?? false) {
            $votingPin->setExpiryTime();
        }

        return redirect()->route('admin.voting-pins.index')
            ->with('success', 'PIN berhasil diperbarui');
    }

    /**
     * Remove the specified voting page PIN
     */
    public function destroy(VotingPagePin $votingPin)
    {
        // This will cascade delete associated sessions due to foreign key constraint
        $votingPin->delete();

        return redirect()->route('admin.voting-pins.index')
            ->with('success', 'PIN berhasil dihapus');
    }

    /**
     * Toggle the active status of the voting page PIN
     */
    public function toggleActive(VotingPagePin $votingPin)
    {
        $votingPin->update([
            'is_active' => ! $votingPin->is_active,
        ]);

        // If activated, set expiry time
        if ($votingPin->is_active) {
            $votingPin->setExpiryTime();
        }

        return back()->with('success', 'Status PIN berhasil diubah');
    }

    /**
     * Regenerate a new PIN code
     */
    public function regenerate(VotingPagePin $votingPin)
    {
        $votingPin->update([
            'pin' => VotingPagePin::generateUniquePin(),
        ]);

        return back()->with('success', 'Kode PIN berhasil diperbarui');
    }

    /**
     * View active sessions for a PIN
     */
    public function sessions(VotingPagePin $votingPin)
    {
        $sessions = VotingPageSession::where('voting_page_pin_id', $votingPin->id)
            ->latest('last_accessed_at')
            ->get();

        return Inertia::render('admin/voting-pins/sessions', [
            'pin' => $votingPin,
            'sessions' => $sessions,
        ]);
    }

    /**
     * Terminate a specific session
     */
    public function terminateSession(VotingPageSession $session)
    {
        $session->delete();

        return back()->with('success', 'Sesi berhasil dihentikan');
    }

    /**
     * Terminate all sessions for a PIN
     */
    public function terminateAllSessions(VotingPagePin $votingPin)
    {
        VotingPageSession::where('voting_page_pin_id', $votingPin->id)->delete();

        return back()->with('success', 'Semua sesi berhasil dihentikan');
    }

    /**
     * Bulk activate voting page pins
     */
    public function bulkActivate(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:voting_page_pins,id',
        ]);
        $count = VotingPagePin::whereIn('id', $request->ids)->update(['is_active' => true]);
        // Optionally, set expiry time for all activated pins
        $pins = VotingPagePin::whereIn('id', $request->ids)->get();
        foreach ($pins as $pin) {
            $pin->setExpiryTime();
        }

        return back()->with('success', "$count PIN berhasil diaktifkan");
    }

    /**
     * Bulk deactivate voting page pins
     */
    public function bulkDeactivate(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:voting_page_pins,id',
        ]);
        $count = VotingPagePin::whereIn('id', $request->ids)->update(['is_active' => false]);

        return back()->with('success', "$count PIN berhasil dinonaktifkan");
    }
}

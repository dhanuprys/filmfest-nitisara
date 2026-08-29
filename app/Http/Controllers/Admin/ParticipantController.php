<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ParticipantRequest;
use App\Http\Requests\Admin\RejectParticipantRequest;
use App\Models\Category;
use App\Models\EventYear;
use App\Models\Participant;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ParticipantController extends Controller
{
    public function index(Request $request)
    {
        $participants = Participant::with(['eventYear', 'category', 'verifiedBy', 'films'])
            ->when($request->search, fn ($query, $search) => $query->search($search))
            ->when($request->category_id, fn ($query, $categoryId) => $query->byCategory($categoryId))
            ->when($request->event_year_id, fn ($query, $eventYearId) => $query->byEventYear($eventYearId))
            ->when($request->status, function ($query, $status) {
                return match ($status) {
                    'approved' => $query->approved(),
                    'pending' => $query->pending(),
                    'rejected' => $query->rejected(),
                    default => $query,
                };
            })
            ->latest()
            ->paginate(20);

        $eventYears = EventYear::all();
        $categories = collect();

        if ($request->event_year_id) {
            $categories = Category::where('event_year_id', $request->event_year_id)->get();
        }

        return Inertia::render('admin/participants/index', [
            'participants' => $participants,
            'categories' => $categories,
            'event_years' => $eventYears,
            'filters' => $request->only(['search', 'category_id', 'event_year_id', 'status']),
        ]);
    }

    public function create()
    {
        $eventYears = EventYear::all();
        $categories = Category::all();

        return Inertia::render('admin/participants/create', [
            'event_years' => $eventYears,
            'categories' => $categories,
        ]);
    }

    public function store(ParticipantRequest $request)
    {
        $validated = $request->validated();

        // Generate unique PIN
        do {
            $pin = mt_rand(100000, 999999);
        } while (Participant::where('pin', $pin)->exists());

        // Handle file uploads if provided
        if ($request->hasFile('student_card_file')) {
            $validated['student_card_file'] = $request->file('student_card_file')->store('student-cards', 'public');
        }

        if ($request->hasFile('payment_evidence_file')) {
            $validated['payment_evidence_file'] = $request->file('payment_evidence_file')->store('payment-evidence', 'public');
        }

        $validated['pin'] = $pin;
        $validated['verification_status'] = 'approved'; // Auto-approve admin-created participants

        $participant = Participant::create($validated);

        return redirect()->route('admin.participants.show', $participant)
            ->with('success', 'Peserta berhasil ditambahkan');
    }

    public function show(Participant $participant)
    {
        $participant->load(['eventYear', 'category', 'verifiedBy', 'films']);

        return Inertia::render('admin/participants/show', [
            'participant' => $participant,
        ]);
    }

    public function edit(Participant $participant)
    {
        $participant->load(['eventYear', 'category', 'verifiedBy']);
        $eventYears = EventYear::all();
        $categories = collect();

        if ($participant->event_year_id) {
            $categories = Category::where('event_year_id', $participant->event_year_id)->get();
        }

        return Inertia::render('admin/participants/edit', [
            'participant' => $participant,
            'categories' => $categories,
            'event_years' => $eventYears,
        ]);
    }

    public function update(ParticipantRequest $request, Participant $participant)
    {
        $participant->update($request->validated());

        return redirect()->route('admin.participants.show', $participant)
            ->with('success', 'Data peserta berhasil diperbarui');
    }

    public function destroy(Participant $participant)
    {
        // Delete associated films first
        $participant->films()->delete();
        $participant->delete();

        return redirect()->route('admin.participants.index')
            ->with('success', 'Peserta berhasil dihapus');
    }

    public function approve(Participant $participant)
    {
        if (! $participant->canBeApproved()) {
            return back()->with('error', 'Status peserta tidak dapat disetujui');
        }

        $participant->approve(auth()->id());

        return back()->with('success', 'Peserta berhasil disetujui');
    }

    public function reject(RejectParticipantRequest $request, Participant $participant)
    {
        if (! $participant->canBeRejected()) {
            return back()->with('error', 'Status peserta tidak dapat ditolak');
        }

        $participant->reject(auth()->id(), $request->validated()['rejection_reason']);

        return back()->with('success', 'Peserta berhasil ditolak');
    }

    public function resetStatus(Participant $participant)
    {
        if (! $participant->canBeReset()) {
            return back()->with('error', 'Status peserta tidak dapat direset');
        }

        $participant->resetStatus();

        return back()->with('success', 'Status verifikasi peserta berhasil direset');
    }

    public function films(Participant $participant)
    {
        $films = $participant->films()->with('verifiedBy')->latest()->get();

        return Inertia::render('admin/participants/films', [
            'participant' => $participant->load(['eventYear', 'category']),
            'films' => $films,
        ]);
    }

    /**
     * Show participants list for a specific event year
     */
    public function indexByEventYear(Request $request, EventYear $eventYear)
    {
        $participants = Participant::with(['category', 'verifiedBy', 'films'])
            ->where('event_year_id', $eventYear->id)
            ->when($request->search, fn ($query, $search) => $query->search($search))
            ->when($request->category_id, fn ($query, $categoryId) => $query->byCategory($categoryId))
            ->when($request->status, function ($query, $status) {
                return match ($status) {
                    'approved' => $query->approved(),
                    'pending' => $query->pending(),
                    'rejected' => $query->rejected(),
                    default => $query,
                };
            })
            ->latest()
            ->paginate(20);

        $categories = Category::where('event_year_id', $eventYear->id)->get();

        return Inertia::render('admin/event-years/participants/index', [
            'event_year' => $eventYear,
            'participants' => $participants,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category_id', 'status']),
        ]);
    }

    /**
     * Show create participant form for a specific event year
     */
    public function createForEventYear(EventYear $eventYear)
    {
        $categories = Category::where('event_year_id', $eventYear->id)->get();

        return Inertia::render('admin/event-years/participants/create', [
            'event_year' => $eventYear,
            'categories' => $categories,
        ]);
    }

    /**
     * Store participant for a specific event year
     */
    public function storeForEventYear(ParticipantRequest $request, EventYear $eventYear)
    {
        $validated = $request->validated();
        $validated['event_year_id'] = $eventYear->id;

        // Generate unique PIN
        do {
            $pin = mt_rand(100000, 999999);
        } while (Participant::where('pin', $pin)->exists());

        // Handle file uploads if provided
        if ($request->hasFile('student_card_file')) {
            $validated['student_card_file'] = $request->file('student_card_file')->store('student-cards', 'public');
        }

        if ($request->hasFile('payment_evidence_file')) {
            $validated['payment_evidence_file'] = $request->file('payment_evidence_file')->store('payment-evidence', 'public');
        }

        $validated['pin'] = $pin;
        $validated['verification_status'] = 'approved'; // Auto-approve admin-created participants

        $participant = Participant::create($validated);

        return redirect()->route('admin.event-years.participants.index', $eventYear)
            ->with('success', 'Peserta berhasil ditambahkan');
    }
}

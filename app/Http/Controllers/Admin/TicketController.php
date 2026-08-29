<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\EventYear;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class TicketController extends Controller
{
    /**
     * Display a listing of tickets
     */
    public function index(Request $request, EventYear $eventYear)
    {
        $tickets = Ticket::with(['filmVotings.film.participant', 'eventYear'])
            ->where('event_year_id', $eventYear->id)
            ->when($request->search, function ($query, $search) {
                $query->where('code', 'like', "%{$search}%");
            })
            ->when($request->status, function ($query, $status) {
                if ($status === 'used') {
                    $query->whereNotNull('used_at');
                } elseif ($status === 'unused') {
                    $query->whereNull('used_at');
                }
            })
            ->latest()
            ->paginate(50);

        // Get stats for this event year
        $totalTickets = Ticket::where('event_year_id', $eventYear->id)->count();
        $usedTickets = Ticket::where('event_year_id', $eventYear->id)->whereNotNull('used_at')->count();

        // Get event years for filtering (but only show current one)
        $eventYears = collect([$eventYear]);

        return Inertia::render('admin/event-years/tickets/index', [
            'tickets' => $tickets,
            'filters' => $request->only(['search', 'status']),
            'eventYears' => $eventYears,
            'currentEventYear' => $eventYear,
            'stats' => [
                'total' => $totalTickets,
                'used' => $usedTickets,
                'unused' => $totalTickets - $usedTickets,
            ],
        ]);
    }

    /**
     * Show the form for creating tickets
     */
    public function create(Request $request, EventYear $eventYear)
    {
        return Inertia::render('admin/event-years/tickets/create', [
            'eventYears' => collect([$eventYear]),
            'currentEventYear' => $eventYear,
            'preselectedEventYear' => $eventYear->id,
        ]);
    }

    /**
     * Store a newly created ticket or generate multiple tickets
     */
    public function store(Request $request, EventYear $eventYear)
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:1|max:1000',
            'event_year_id' => 'required|exists:event_years,id',
        ]);

        // Ensure the event_year_id matches the current event year
        if ($validated['event_year_id'] != $eventYear->id) {
            return back()->withErrors(['error' => 'Invalid event year']);
        }

        $count = 0;
        $quantity = $validated['quantity'];

        // Generate tickets in batches to avoid memory issues
        for ($i = 0; $i < $quantity; $i++) {
            $code = $this->generateUniqueTicketCode();

            Ticket::create([
                'code' => $code,
                'event_year_id' => $validated['event_year_id'],
            ]);

            $count++;
        }

        return redirect()->route('admin.event-years.tickets.index', $eventYear)
            ->with('success', "{$count} tiket berhasil dibuat");
    }

    /**
     * Display the specified ticket
     */
    public function show(Ticket $ticket, EventYear $eventYear)
    {
        // Ensure ticket belongs to the current event year
        if ($ticket->event_year_id != $eventYear->id) {
            abort(404);
        }

        $ticket->load(['filmVotings.film.participant', 'eventYear']);

        return Inertia::render('admin/event-years/tickets/show', [
            'ticket' => $ticket,
            'currentEventYear' => $eventYear,
        ]);
    }

    /**
     * Remove the specified ticket
     */
    public function destroy(Ticket $ticket, EventYear $eventYear)
    {
        // Ensure ticket belongs to the current event year
        if ($ticket->event_year_id != $eventYear->id) {
            abort(404);
        }

        // Check if ticket has been used
        if ($ticket->used_at || $ticket->filmVotings()->exists()) {
            return back()->withErrors(['error' => 'Tiket sudah digunakan dan tidak dapat dihapus']);
        }

        $ticket->delete();

        return redirect()->route('admin.event-years.tickets.index', $eventYear)
            ->with('success', 'Tiket berhasil dihapus');
    }

    /**
     * Reset a used ticket
     */
    public function reset(Ticket $ticket, EventYear $eventYear)
    {
        // Ensure ticket belongs to the current event year
        if ($ticket->event_year_id != $eventYear->id) {
            abort(404);
        }

        // Delete any associated votes
        $ticket->filmVotings()->delete();

        // Reset the used_at timestamp
        $ticket->update(['used_at' => null]);

        return back()->with('success', 'Tiket berhasil direset');
    }

    /**
     * Export tickets to CSV
     */
    public function export(Request $request, EventYear $eventYear)
    {
        $tickets = Ticket::with('eventYear')
            ->where('event_year_id', $eventYear->id)
            ->when($request->status, function ($query, $status) {
                if ($status === 'used') {
                    $query->whereNotNull('used_at');
                } elseif ($status === 'unused') {
                    $query->whereNull('used_at');
                }
            })
            ->latest()
            ->get();

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="tickets-' . $eventYear->year . '.csv"',
        ];

        $callback = function () use ($tickets) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Code', 'Event Year', 'Status', 'Used At', 'Created At']);

            foreach ($tickets as $ticket) {
                $status = $ticket->used_at ? 'Used' : 'Unused';
                $eventYear = $ticket->eventYear ? $ticket->eventYear->year . ' - ' . $ticket->eventYear->title : 'N/A';
                fputcsv($file, [
                    $ticket->code,
                    $eventYear,
                    $status,
                    $ticket->used_at ? $ticket->used_at->format('Y-m-d H:i:s') : '',
                    $ticket->created_at->format('Y-m-d H:i:s'),
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Generate a unique ticket code
     */
    private function generateUniqueTicketCode(): string
    {
        do {
            $code = strtoupper(Str::random(8));
        } while (Ticket::where('code', $code)->exists());

        return $code;
    }
}

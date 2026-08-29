<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\EventYear;
use App\Models\Participant;
use App\Models\ParticipantSession;
use App\Services\TelegramService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class RegistrationController extends Controller
{
    public function index()
    {
        $eventYears = EventYear::where('show_start', '<=', now())
            ->where('show_end', '>=', now())
            ->orderBy('registration_start')
            ->get();

        $activeEventYear = $eventYears->first();
        $categories = collect();
        if ($activeEventYear) {
            $categories = Category::where('is_active', true)
                ->where('event_year_id', $activeEventYear->id)
                ->get();
        }

        return Inertia::render('registration/registration', [
            'eventYears' => $eventYears,
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'team_name' => 'required|string|max:100',
            'city' => 'required|string|max:100',
            'company' => 'required|string|max:100',
            'category_id' => 'required|exists:categories,id',
            'leader_name' => 'required|string|max:100',
            'leader_email' => 'required|email|max:100',
            'leader_whatsapp' => 'required|string|max:20',
            'student_card_file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:4096',
            'payment_evidence_file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:4096',
        ]);

        // Get the active event year
        $activeEventYear = EventYear::where('show_start', '<=', now())
            ->where('show_end', '>=', now())
            ->where('registration_start', '<=', now())
            ->where('registration_end', '>=', now())
            ->orderBy('registration_start')
            ->first();

        if (! $activeEventYear) {
            return back()->withErrors(['general' => 'Tidak ada event yang sedang berlangsung']);
        }

        // Generate unique PIN
        do {
            $pin = mt_rand(100000, 999999);
        } while (Participant::where('pin', $pin)->exists());

        // Handle file uploads
        $studentCardPath = $request->file('student_card_file')->store('student-cards', 'public');
        $paymentEvidencePath = $request->file('payment_evidence_file')->store('payment-evidence', 'public');

        try {
            $participant = DB::transaction(function () use ($activeEventYear, $pin, $validated, $studentCardPath, $paymentEvidencePath) {
                return Participant::create([
                    'event_year_id' => $activeEventYear->id,
                    'pin' => $pin,
                    'team_name' => $validated['team_name'],
                    'city' => $validated['city'],
                    'company' => $validated['company'],
                    'category_id' => $validated['category_id'],
                    'leader_name' => $validated['leader_name'],
                    'leader_email' => $validated['leader_email'],
                    'leader_whatsapp' => $validated['leader_whatsapp'],
                    'student_card_file' => $studentCardPath,
                    'payment_evidence_file' => $paymentEvidencePath,
                ]);
            });
        } catch (\Exception $e) {
            Storage::disk('public')->delete([$studentCardPath, $paymentEvidencePath]);
            throw $e;
        }

        // Send Telegram notification (silent on error)
        try {
            app(TelegramService::class)->sendMessage(
                "<b>Registrasi Baru</b>\nTim: {$participant->team_name}\nKetua: {$participant->leader_name}\nEmail: {$participant->leader_email}\nWhatsApp: {$participant->leader_whatsapp}"
            );
        } catch (\Throwable $e) {
            // Silently ignore
        }

        // Create session for the new participant
        $session = ParticipantSession::createSession(
            $participant,
            $request->ip(),
            $request->userAgent()
        );

        return redirect()->route('registration.success', ['token' => $session->token]);
    }

    public function guidebook()
    {
        // Get the active event year
        $activeEventYear = EventYear::where('show_start', '<=', now())
            ->where('show_end', '>=', now())
            ->where('registration_start', '<=', now())
            ->where('registration_end', '>=', now())
            ->orderBy('registration_start')
            ->first();

        if (! $activeEventYear) {
            abort(404);
        }

        if (
            ! $activeEventYear->event_guide_document
            || ! file_exists(
                storage_path(
                    'app/public/'.$activeEventYear->event_guide_document
                )
            )
        ) {
            abort(404);
        }

        return response()->download(
            storage_path('app/public/'.$activeEventYear->event_guide_document)
        );
    }

    public function success(Request $request)
    {
        $token = $request->query('token');
        $session = ParticipantSession::findByToken($token);

        if (! $session) {
            return redirect()->route('status.index')
                ->withErrors(['session' => 'Sesi telah berakhir atau tidak valid. Silakan masukkan PIN untuk melihat status.']);
        }

        // Update last accessed time
        $session->updateLastAccessed();

        $participant = $session->participant->load(['eventYear', 'category', 'verifiedBy', 'films']);

        return Inertia::render('registration/registration-success', [
            'participant' => $participant,
            'session' => [
                'token' => $session->token,
                'expires_at' => $session->expires_at,
                'last_accessed_at' => $session->last_accessed_at,
            ],
        ]);
    }

    public function download(Request $request, $pin, $type)
    {
        $participant = Participant::where('pin', $pin)->first();

        if (! $participant) {
            abort(404);
        }

        // Security Check: Must be admin OR have a valid participant session token
        $isAuthorized = false;

        if (auth()->check()) {
            $isAuthorized = true;
        } else {
            $token = $request->query('token');
            if ($token) {
                $session = ParticipantSession::findByToken($token);
                if ($session && $session->participant_id === $participant->id && $session->isValid()) {
                    $isAuthorized = true;
                    $session->updateLastAccessed();
                }
            }
        }

        if (! $isAuthorized) {
            abort(403, 'Unauthorized access to participant files.');
        }

        $filePath = null;
        $filename = '';

        switch ($type) {
            case 'student-card':
                $filePath = $participant->student_card_file;
                $filename = 'student-card-'.$participant->team_name.'.'.pathinfo($filePath, PATHINFO_EXTENSION);
                break;
            case 'payment-evidence':
                $filePath = $participant->payment_evidence_file;
                $filename = 'payment-evidence-'.$participant->team_name.'.'.pathinfo($filePath, PATHINFO_EXTENSION);
                break;
            default:
                abort(404);
        }

        if (! $filePath || ! file_exists(storage_path('app/public/'.$filePath))) {
            abort(404);
        }

        return response()->download(storage_path('app/public/'.$filePath), $filename);
    }
}

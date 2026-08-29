<?php

namespace App\Services;

use App\Models\EventYear;
use App\Models\Participant;
use Illuminate\Support\Facades\DB;

class RegistrationService
{
    public function __construct(
        private FileUploadService $fileUploadService
    ) {}

    /**
     * Get active event year for registration
     */
    public function getActiveEventYear(): ?EventYear
    {
        return EventYear::where('show_start', '<=', now())
            ->where('show_end', '>=', now())
            ->where('registration_start', '<=', now())
            ->where('registration_end', '>=', now())
            ->orderBy('registration_start')
            ->first();
    }

    /**
     * Generate unique PIN
     */
    public function generateUniquePin(): string
    {
        do {
            $pin = mt_rand(100000, 999999);
        } while (Participant::where('pin', $pin)->exists());

        return (string) $pin;
    }

    /**
     * Register participant
     */
    public function register(array $data, EventYear $eventYear): Participant
    {
        return DB::transaction(function () use ($data, $eventYear) {
            // Generate unique PIN
            $pin = $this->generateUniquePin();

            // Handle file uploads
            $studentCardPath = $this->fileUploadService->upload(
                $data['student_card_file'],
                'student-cards'
            );

            $paymentEvidencePath = $this->fileUploadService->upload(
                $data['payment_evidence_file'],
                'payment-evidence'
            );

            // Create participant
            return Participant::create([
                'event_year_id' => $eventYear->id,
                'pin' => $pin,
                'team_name' => $data['team_name'],
                'city' => $data['city'],
                'company' => $data['company'],
                'category_id' => $data['category_id'],
                'leader_name' => $data['leader_name'],
                'leader_email' => $data['leader_email'],
                'leader_whatsapp' => $data['leader_whatsapp'],
                'student_card_file' => $studentCardPath,
                'payment_evidence_file' => $paymentEvidencePath,
                'verification_status' => 'pending',
            ]);
        });
    }

    /**
     * Check if registration is open
     */
    public function isRegistrationOpen(): bool
    {
        return $this->getActiveEventYear() !== null;
    }
}

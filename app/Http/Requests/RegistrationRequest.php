<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegistrationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'team_name' => 'required|string|max:100',
            'city' => 'required|string|max:100',
            'company' => 'required|string|max:100',
            'category_id' => 'required|exists:categories,id',
            'leader_name' => 'required|string|max:100',
            'leader_email' => 'required|email|max:100',
            'leader_whatsapp' => 'required|string|max:20',
            'student_card_file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:4096',
            'payment_evidence_file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:4096',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $eventYear = \App\Models\EventYear::where('show_start', '<=', now())
                ->where('show_end', '>=', now())
                ->where('registration_start', '<=', now())
                ->where('registration_end', '>=', now())
                ->orderBy('registration_start')
                ->first();

            if ($eventYear) {
                $exists = \App\Models\Participant::where('event_year_id', $eventYear->id)
                    ->where('team_name', $this->input('team_name'))
                    ->exists();

                if ($exists) {
                    $validator->errors()->add('team_name', 'Nama tim sudah terdaftar untuk event tahun ini.');
                }
            }
        });
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'team_name.required' => 'Nama tim harus diisi.',
            'team_name.max' => 'Nama tim maksimal 100 karakter.',
            'city.required' => 'Kota harus diisi.',
            'city.max' => 'Kota maksimal 100 karakter.',
            'company.required' => 'Perusahaan/Institusi harus diisi.',
            'company.max' => 'Perusahaan/Institusi maksimal 100 karakter.',
            'category_id.required' => 'Kategori harus dipilih.',
            'category_id.exists' => 'Kategori yang dipilih tidak valid.',
            'leader_name.required' => 'Nama ketua tim harus diisi.',
            'leader_name.max' => 'Nama ketua tim maksimal 100 karakter.',
            'leader_email.required' => 'Email ketua tim harus diisi.',
            'leader_email.email' => 'Format email tidak valid.',
            'leader_email.max' => 'Email maksimal 100 karakter.',
            'leader_whatsapp.required' => 'WhatsApp ketua tim harus diisi.',
            'leader_whatsapp.max' => 'WhatsApp maksimal 20 karakter.',
            'student_card_file.required' => 'File kartu mahasiswa harus diupload.',
            'student_card_file.file' => 'File kartu mahasiswa harus berupa file.',
            'student_card_file.mimes' => 'File kartu mahasiswa harus berformat PDF, JPG, JPEG, atau PNG.',
            'student_card_file.max' => 'File kartu mahasiswa maksimal 4MB.',
            'payment_evidence_file.required' => 'File bukti pembayaran harus diupload.',
            'payment_evidence_file.file' => 'File bukti pembayaran harus berupa file.',
            'payment_evidence_file.mimes' => 'File bukti pembayaran harus berformat PDF, JPG, JPEG, atau PNG.',
            'payment_evidence_file.max' => 'File bukti pembayaran maksimal 4MB.',
        ];
    }
}
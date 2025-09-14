<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ParticipantRequest extends FormRequest
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
        $participantId = $this->route('participant')?->id;

        $rules = [
            'team_name' => 'required|string|max:100',
            'city' => 'required|string|max:100',
            'company' => 'required|string|max:100',
            'category_id' => 'required|exists:categories,id',
            'event_year_id' => 'required|exists:event_years,id',
            'leader_name' => 'required|string|max:100',
            'leader_email' => 'required|email|max:100',
            'leader_whatsapp' => 'required|string|max:20',
        ];

        // PIN validation (only for updates, auto-generated for new participants)
        if ($this->isMethod('PUT') || $this->isMethod('PATCH')) {
            $rules['pin'] = [
                'required',
                'integer',
                Rule::unique('participants', 'pin')->ignore($participantId),
            ];
        }

        // File validation rules (only if files are being uploaded)
        if ($this->hasFile('student_card_file')) {
            $rules['student_card_file'] = 'file|mimes:pdf,jpg,jpeg,png|max:4096';
        }

        if ($this->hasFile('payment_evidence_file')) {
            $rules['payment_evidence_file'] = 'file|mimes:pdf,jpg,jpeg,png|max:4096';
        }

        return $rules;
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'pin.unique' => 'PIN ini sudah digunakan oleh peserta lain.',
            'category_id.exists' => 'Kategori yang dipilih tidak valid.',
            'event_year_id.exists' => 'Tahun event yang dipilih tidak valid.',
            'leader_email.email' => 'Format email tidak valid.',
        ];
    }
}
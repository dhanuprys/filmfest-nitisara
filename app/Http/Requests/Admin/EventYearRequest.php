<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class EventYearRequest extends FormRequest
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
        $eventYearId = $this->route('eventYear')?->id;

        return [
            'year' => [
                'required',
                'integer',
                'min:2020',
                'max:2030',
                Rule::unique('event_years', 'year')->ignore($eventYearId),
            ],
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'registration_start' => 'required|date',
            'registration_end' => 'required|date|after:registration_start',
            'submission_start_date' => 'required|date',
            'submission_end_date' => 'required|date|after:submission_start_date',
            'show_start' => 'required|date',
            'show_end' => 'required|date|after:show_start',
            'event_guide_document' => 'nullable|file|mimes:pdf,doc,docx|max:30240', // 10MB max
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'year.unique' => 'Tahun event ini sudah ada.',
            'registration_end.after' => 'Tanggal selesai pendaftaran harus setelah tanggal mulai pendaftaran.',
            'submission_end_date.after' => 'Tanggal selesai submit film harus setelah tanggal mulai submit film.',
            'show_end.after' => 'Tanggal selesai event harus setelah tanggal mulai event.',
            'event_guide_document.max' => 'Ukuran file panduan event maksimal 10MB.',
            'event_guide_document.mimes' => 'Format file panduan event harus PDF, DOC, atau DOCX.',
        ];
    }
}

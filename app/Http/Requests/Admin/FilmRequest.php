<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class FilmRequest extends FormRequest
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
        // Debug: Log what data is being received
        \Log::info('FilmRequest data:', [
            'all' => $this->all(),
            'has_files' => $this->hasFile('originality_file') || $this->hasFile('poster_landscape_file') || $this->hasFile('poster_portrait_file') || $this->hasFile('backdrop_file'),
            'content_type' => $this->header('Content-Type'),
            'method' => $this->method(),
        ]);

        $rules = [
            'title' => 'required|string|max:255',
            'synopsis' => 'required|string|max:1000',
            'film_url' => 'required|url',
            'direct_video_url' => 'nullable|url',
            'originality_file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:3072',
            'poster_landscape_file' => 'nullable|file|mimes:jpg,jpeg,png|max:3072',
            'poster_portrait_file' => 'nullable|file|mimes:jpg,jpeg,png|max:3072',
            'backdrop_file' => 'nullable|file|mimes:jpg,jpeg,png|max:3072',
            'ranking' => 'nullable|integer',
            'director' => 'nullable|string|max:255',
            'teaser_url' => 'nullable|url',
            'castings' => 'nullable|array',
            'castings.*.real_name' => 'required_with:castings|string|max:255',
            'castings.*.film_name' => 'required_with:castings|string|max:255',
        ];

        // Participant ID validation (only for new films, and only if provided)
        if ($this->isMethod('POST') && $this->has('participant_id')) {
            $rules['participant_id'] = 'required|exists:participants,id';
        }

        return $rules;
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'title.required' => 'Judul film wajib diisi.',
            'title.max' => 'Judul film maksimal 255 karakter.',
            'synopsis.required' => 'Sinopsis film wajib diisi.',
            'synopsis.max' => 'Sinopsis film maksimal 1000 karakter.',
            'film_url.required' => 'URL film wajib diisi.',
            'film_url.url' => 'URL film harus valid.',
            'direct_video_url.url' => 'URL video langsung harus valid.',
            'ranking.integer' => 'Peringkat harus berupa angka.',
            'ranking.min' => 'Peringkat minimal adalah 1.',
            'originality_file.file' => 'File surat pernyataan orisinalitas harus berupa file.',
            'originality_file.mimes' => 'File surat pernyataan orisinalitas harus berformat PDF, JPG, JPEG, atau PNG.',
            'originality_file.max' => 'File surat pernyataan orisinalitas maksimal 4MB.',
            'poster_landscape_file.file' => 'Poster landscape harus berupa file.',
            'poster_landscape_file.mimes' => 'Poster landscape harus berupa file JPG atau PNG.',
            'poster_landscape_file.max' => 'Ukuran poster landscape maksimal 3MB.',
            'poster_portrait_file.file' => 'Poster portrait harus berupa file.',
            'poster_portrait_file.mimes' => 'Poster portrait harus berupa file JPG atau PNG.',
            'poster_portrait_file.max' => 'Ukuran poster portrait maksimal 3MB.',
            'backdrop_file.file' => 'File backdrop harus berupa file.',
            'backdrop_file.mimes' => 'File backdrop harus berformat JPG, JPEG, atau PNG.',
            'backdrop_file.max' => 'File backdrop maksimal 4MB.',
        ];
    }
}

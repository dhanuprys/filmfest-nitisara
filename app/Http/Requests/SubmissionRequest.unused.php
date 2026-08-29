<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SubmissionRequest extends FormRequest
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
            'title' => 'required|string|max:255',
            'synopsis' => 'required|string|max:1000',
            'film_url' => 'required|url',
            'originality_file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:4096',
            'poster_file' => 'required|file|mimes:jpg,jpeg,png|max:4096',
            'backdrop_file' => 'nullable|file|mimes:jpg,jpeg,png|max:4096',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'title.required' => 'Judul film harus diisi.',
            'title.max' => 'Judul film maksimal 255 karakter.',
            'synopsis.required' => 'Sinopsis film harus diisi.',
            'synopsis.max' => 'Sinopsis film maksimal 1000 karakter.',
            'film_url.required' => 'URL film harus diisi.',
            'film_url.url' => 'Format URL film tidak valid.',
            'originality_file.required' => 'File surat orisinalitas harus diupload.',
            'originality_file.file' => 'File surat orisinalitas harus berupa file.',
            'originality_file.mimes' => 'File surat orisinalitas harus berformat PDF, JPG, JPEG, atau PNG.',
            'originality_file.max' => 'File surat orisinalitas maksimal 4MB.',
            'poster_file.required' => 'File poster film harus diupload.',
            'poster_file.file' => 'File poster film harus berupa file.',
            'poster_file.mimes' => 'File poster film harus berformat JPG, JPEG, atau PNG.',
            'poster_file.max' => 'File poster film maksimal 4MB.',
            'backdrop_file.file' => 'File backdrop film harus berupa file.',
            'backdrop_file.mimes' => 'File backdrop film harus berformat JPG, JPEG, atau PNG.',
            'backdrop_file.max' => 'File backdrop film maksimal 4MB.',
        ];
    }
}

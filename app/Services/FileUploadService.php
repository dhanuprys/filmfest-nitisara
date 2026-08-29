<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class FileUploadService
{
    /**
     * Upload a file to the specified disk and directory
     */
    public function upload(UploadedFile $file, string $directory, string $disk = 'public'): string
    {
        $fileName = time().'_'.$file->getClientOriginalName();

        return $file->storeAs($directory, $fileName, $disk);
    }

    /**
     * Upload event guide document
     */
    public function uploadEventGuide(UploadedFile $file): string
    {
        return $this->upload($file, 'event-guides');
    }

    /**
     * Delete a file from storage
     */
    public function delete(?string $filePath, string $disk = 'public'): bool
    {
        if (! $filePath) {
            return false;
        }

        return Storage::disk($disk)->delete($filePath);
    }

    /**
     * Get file path for download
     */
    public function getFilePath(string $filePath, string $disk = 'public'): string
    {
        return Storage::disk($disk)->path($filePath);
    }

    /**
     * Check if file exists
     */
    public function exists(string $filePath, string $disk = 'public'): bool
    {
        return Storage::disk($disk)->exists($filePath);
    }
}

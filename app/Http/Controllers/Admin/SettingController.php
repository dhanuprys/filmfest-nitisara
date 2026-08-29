<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingController extends Controller
{
    public function index()
    {
        $settings = Setting::all()->keyBy('key');

        return Inertia::render('admin/settings/index', [
            'settings' => $settings,
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'festival_name' => 'required|string|max:255',
            'festival_description' => 'nullable|string',
            'contact_email' => 'required|email',
            'contact_phone' => 'nullable|string|max:20',
            'contact_address' => 'nullable|string',
            'social_media' => 'nullable|array',
            'social_media.facebook' => 'nullable|url',
            'social_media.instagram' => 'nullable|url',
            'social_media.twitter' => 'nullable|url',
            'social_media.youtube' => 'nullable|url',
            'registration_enabled' => 'boolean',
            'maintenance_mode' => 'boolean',
            'max_file_size' => 'nullable|integer|min:1',
            'allowed_file_types' => 'nullable|string',
        ]);

        foreach ($validated as $key => $value) {
            if ($key === 'social_media') {
                $value = json_encode($value);
            }

            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => $value]
            );
        }

        return back()->with('success', 'Pengaturan berhasil diperbarui');
    }
}

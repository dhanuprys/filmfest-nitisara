<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Models\EventYear;
use App\Models\Film;
use Illuminate\Http\Request;
use App\Models\Participant;

Route::get('/', function () {
    $activeEvent = EventYear::withCount('participants')
        ->select(['id', 'year', 'title', 'registration_start', 'registration_end', 'event_guide_document'])
        ->where('show_start', '<=', now())
        ->where('show_end', '>=', now())
        ->orderBy('registration_start')
        ->first();

    $images = Film::query()
        ->whereNotNull('poster_landscape_file')
        ->inRandomOrder()
        ->limit(5)
        ->pluck('poster_landscape_file');

    return Inertia::render('home', [
        'activeEvent' => $activeEvent,
        'images' => $images
    ]);
})->name('home');
Route::get('/contact', function () {
    return Inertia::render('contact');
});
Route::get('/registration', [App\Http\Controllers\RegistrationController::class, 'index'])->name('registration');
Route::post('/registration', [App\Http\Controllers\RegistrationController::class, 'store'])->name('registration.store');
Route::get('/registration/guidebook', [App\Http\Controllers\RegistrationController::class, 'guidebook'])->name('registration.guidebook');
Route::get('/registration/success', [App\Http\Controllers\RegistrationController::class, 'success'])->name('registration.success');
Route::get('/registration/{pin}/download/{type}', [App\Http\Controllers\RegistrationController::class, 'download'])->name('registration.download')->middleware('throttle:60,1');

// AJAX endpoint for checking unique team name for the current event year
Route::get('/registration/check-team-name', function (Request $request) {
    $teamName = $request->query('team_name');
    $eventYearId = $request->query('event_year_id');

    if (!$teamName || !$eventYearId) {
        return response()->json(['unique' => false, 'message' => 'Missing parameters'], 400);
    }

    $exists = Participant::where('event_year_id', $eventYearId)
        ->where('team_name', $teamName)
        ->exists();

    return response()->json(['unique' => !$exists]);
});

// Status tracking routes
Route::get('/status', [App\Http\Controllers\StatusController::class, 'index'])->name('status.index');
Route::post('/status/check', [App\Http\Controllers\StatusController::class, 'check'])->name('status.check');
Route::get('/status/{token}', [App\Http\Controllers\StatusController::class, 'show'])->name('status.show');
Route::post('/status/{token}/logout', [App\Http\Controllers\StatusController::class, 'logout'])->name('status.logout');
Route::post('/status/{token}/extend', [App\Http\Controllers\StatusController::class, 'extendSession'])->name('status.extend');
Route::get('/submission', [App\Http\Controllers\SubmissionController::class, 'index'])->name('submission');
Route::post('/submission/verify', [App\Http\Controllers\SubmissionController::class, 'verify'])->name('submission.verify');
Route::post('/submission', [App\Http\Controllers\SubmissionController::class, 'store'])->name('submission.store');
Route::put('/submission/{film}', [App\Http\Controllers\SubmissionController::class, 'update'])->name('submission.update');
Route::post('/submission/logout', [App\Http\Controllers\SubmissionController::class, 'logout'])->name('submission.logout');

// Voting routes
Route::get('/voting', [App\Http\Controllers\VotingController::class, 'index'])->name('voting.index');
Route::get('/voting/closed', [App\Http\Controllers\VotingController::class, 'closed'])->name('voting.closed');
Route::post('/voting/verify', [App\Http\Controllers\VotingController::class, 'verifyPin'])->name('voting.verify');
Route::post('/voting/logout', [App\Http\Controllers\VotingController::class, 'logout'])->name('voting.logout');
Route::post('/voting/start-session', [App\Http\Controllers\VotingController::class, 'startVotingSession'])->name('voting.start-session')->middleware('throttle:30,1');
Route::post('/voting/vote', [App\Http\Controllers\VotingController::class, 'vote'])->name('voting.vote')->middleware('throttle:30,1');
Route::get('/voting/check-session', [App\Http\Controllers\VotingController::class, 'checkSession'])->name('voting.check-session');

Route::get('/theater', [App\Http\Controllers\TheaterController::class, 'index'])->name('theater.index');
Route::get('/theater/film/{film}', [App\Http\Controllers\TheaterController::class, 'show'])->name('theater.film.show');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return redirect()->route('admin.dashboard');
    })->name('dashboard');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
require __DIR__ . '/admin.php';

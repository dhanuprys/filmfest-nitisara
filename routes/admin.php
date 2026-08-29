<?php

use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\EventYearController;
use App\Http\Controllers\Admin\FilmController;
use App\Http\Controllers\Admin\ParticipantController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\TicketController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\VotingPagePinController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth', 'verified'])->prefix('admin')->name('admin.')->group(function () {
    // Dashboard & Statistics
    Route::get('/', [AdminController::class, 'dashboard'])->name('dashboard');
    Route::get('statistics', [AdminController::class, 'statistics'])->name('statistics');

    // Test route
    Route::get('/test', function () {
        return Inertia::render('admin/test');
    })->name('test');

    // Event Years Management
    Route::resource('event-years', EventYearController::class);
    Route::post('event-years/{eventYear}', [EventYearController::class, 'update'])->name('event-years.update-post');
    Route::get('event-years/{eventYear}/download-guide', [EventYearController::class, 'downloadEventGuide'])->name('event-years.download-guide');

    // Categories Management (nested under event-years)
    Route::prefix('event-years/{eventYear}')->name('event-years.')->group(function () {
        Route::get('categories/create', [CategoryController::class, 'create'])->name('categories.create');
        Route::post('categories', [CategoryController::class, 'store'])->name('categories.store');
        Route::get('categories/{category}', [CategoryController::class, 'show'])->name('categories.show');
        Route::get('categories/{category}/edit', [CategoryController::class, 'edit'])->name('categories.edit');
        Route::put('categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
        Route::delete('categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');
    });

    // Participants Management
    Route::resource('participants', ParticipantController::class);
    Route::prefix('participants/{participant}')->name('participants.')->group(function () {
        Route::post('approve', [ParticipantController::class, 'approve'])->name('approve');
        Route::post('reject', [ParticipantController::class, 'reject'])->name('reject');
        Route::post('reset-status', [ParticipantController::class, 'resetStatus'])->name('reset-status');
        Route::get('films', [ParticipantController::class, 'films'])->name('films');
        Route::get('films/create', [FilmController::class, 'createForParticipant'])->name('films.create');
        Route::post('films', [FilmController::class, 'storeForParticipant'])->name('films.store');
    });

    // Event Year Participants (dedicated lists per event year)
    Route::prefix('event-years/{eventYear}')->name('event-years.')->group(function () {
        Route::get('participants', [ParticipantController::class, 'indexByEventYear'])->name('participants.index');
        Route::get('participants/create', [ParticipantController::class, 'createForEventYear'])->name('participants.create');
        Route::post('participants', [ParticipantController::class, 'storeForEventYear'])->name('participants.store');
    });

    // Films Management
    Route::resource('films', FilmController::class)->except(['create', 'store']);
    // Add POST support for film updates to handle file uploads
    Route::post('films/{film}', [FilmController::class, 'update'])->name('films.update-post');
    Route::prefix('films/{film}')->name('films.')->group(function () {
        Route::post('verify', [FilmController::class, 'verify'])->name('verify');
        Route::post('reject', [FilmController::class, 'reject'])->name('reject');
        Route::get('download', [FilmController::class, 'download'])->name('download');
        Route::get('download-poster', [FilmController::class, 'downloadPoster'])->name('download-poster');
        Route::get('download-backdrop', [FilmController::class, 'downloadBackdrop'])->name('download-backdrop');
    });

    // Tickets Management (nested under event-years)
    Route::prefix('event-years/{eventYear}')->name('event-years.')->group(function () {
        Route::get('tickets', [TicketController::class, 'index'])->name('tickets.index');
        Route::get('tickets/create', [TicketController::class, 'create'])->name('tickets.create');
        Route::post('tickets', [TicketController::class, 'store'])->name('tickets.store');
        Route::get('tickets/{ticket}', [TicketController::class, 'show'])->name('tickets.show');
        Route::delete('tickets/{ticket}', [TicketController::class, 'destroy'])->name('tickets.destroy');
        Route::post('tickets/{ticket}/reset', [TicketController::class, 'reset'])->name('tickets.reset');
        Route::get('tickets-export', [TicketController::class, 'export'])->name('tickets.export');
    });

    // Voting Page PINs Management
    Route::resource('voting-pins', VotingPagePinController::class)->parameters([
        'voting-pins' => 'votingPin',
    ]);
    Route::prefix('voting-pins/{votingPin}')->name('voting-pins.')->group(function () {
        Route::post('toggle-active', [VotingPagePinController::class, 'toggleActive'])->name('toggle-active');
        Route::post('regenerate', [VotingPagePinController::class, 'regenerate'])->name('regenerate');
        Route::get('sessions', [VotingPagePinController::class, 'sessions'])->name('sessions');
        Route::delete('sessions', [VotingPagePinController::class, 'terminateAllSessions'])->name('terminate-all-sessions');
    });
    Route::delete('voting-sessions/{session}', [VotingPagePinController::class, 'terminateSession'])->name('voting-sessions.terminate');

    // Bulk actions for voting pins
    Route::prefix('voting-pins')->name('voting-pins.')->group(function () {
        Route::post('bulk-activate', [VotingPagePinController::class, 'bulkActivate'])->name('bulk-activate');
        Route::post('bulk-deactivate', [VotingPagePinController::class, 'bulkDeactivate'])->name('bulk-deactivate');
    });

    // Users Management
    Route::resource('users', UserController::class);

    // Settings
    Route::get('settings', [SettingController::class, 'index'])->name('settings.index');
    Route::post('settings', [SettingController::class, 'update'])->name('settings.update');
});

<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\EventYearRequest;
use App\Models\EventYear;
use App\Services\EventYearService;
use App\Services\FileUploadService;
use Inertia\Inertia;

class EventYearController extends Controller
{
    public function __construct(
        private EventYearService $eventYearService,
        private FileUploadService $fileUploadService
    ) {}

    public function index()
    {
        $eventYears = $this->eventYearService->getEventYearsWithTicketStats();

        return Inertia::render('admin/event-years/index', [
            'event_years' => $eventYears,
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/event-years/create');
    }

    public function store(EventYearRequest $request)
    {
        $this->eventYearService->create($request->validated());

        return redirect()->route('admin.event-years.index')
            ->with('success', 'Tahun event berhasil dibuat');
    }

    public function show(EventYear $eventYear)
    {
        $eventYear = $this->eventYearService->getEventYearWithStats($eventYear);

        return Inertia::render('admin/event-years/show', [
            'event_year' => $eventYear,
        ]);
    }

    public function edit(EventYear $eventYear)
    {
        return Inertia::render('admin/event-years/edit', [
            'event_year' => $eventYear,
        ]);
    }

    public function update(EventYearRequest $request, EventYear $eventYear)
    {
        $this->eventYearService->update($eventYear, $request->validated());

        return redirect()->route('admin.event-years.show', $eventYear)
            ->with('success', 'Tahun event berhasil diperbarui');
    }

    public function downloadEventGuide(EventYear $eventYear)
    {
        if (! $eventYear->hasEventGuide()) {
            return back()->with('error', 'Dokumen panduan event tidak ditemukan');
        }

        if (! $this->fileUploadService->exists($eventYear->event_guide_document)) {
            return back()->with('error', 'File tidak ditemukan');
        }

        $filePath = $this->fileUploadService->getFilePath($eventYear->event_guide_document);

        return response()->download($filePath);
    }

    public function destroy(EventYear $eventYear)
    {
        try {
            $this->eventYearService->delete($eventYear);

            return redirect()->route('admin.event-years.index')
                ->with('success', 'Tahun event berhasil dihapus');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }
}

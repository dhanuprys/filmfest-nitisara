import Hero from '@/components/registration/hero';
import JoinForm from '@/components/registration/join-form';
import NoActiveEvent from '@/components/registration/NoActiveEvent';
import Footer from '@/components/shared/footer';
import Header from '@/components/shared/header';
import { type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { AlertCircle } from 'lucide-react';
import { useRef } from 'react';
dayjs.extend(duration);

export default function Registration() {
    const { auth, eventYears, categories } = usePage<SharedData>().props;
    const containerRef = useRef<HTMLDivElement>(null);

    // Pick the first event in the window (could be improved for multi-event support)
    const eventYear = eventYears && eventYears.length > 0 ? eventYears[0] : undefined;

    // Determine registration state
    const now = dayjs();
    const registrationStart = eventYear ? dayjs(eventYear.registration_start) : null;
    const registrationEnd = eventYear ? dayjs(eventYear.registration_end) : null;

    if (!eventYear) {
        return <NoActiveEvent />;
    }

    if (registrationStart && now.isBefore(registrationStart)) {
        // Registration not open yet
        const diff = registrationStart.diff(now);
        const duration = dayjs.duration(diff);
        return (
            <div ref={containerRef}>
                <Header autoHide alwaysSeamless />
                <Hero eventYear={eventYear.year} />
                <div className="flex flex-col items-center justify-center py-24">
                    <AlertCircle className="mb-2 h-12 w-12 text-yellow-500" />
                    <h2 className="mb-2 text-2xl font-bold">Pendaftaran Belum Dibuka</h2>
                    <p className="mb-4 text-gray-600">Pendaftaran akan dibuka dalam:</p>
                    <div className="text-primary mb-8 font-mono text-3xl">
                        {Math.floor(duration.asDays())} hari {duration.hours()} jam {duration.minutes()} menit
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (registrationEnd && now.isAfter(registrationEnd)) {
        // Registration closed, but event still visible
        return (
            <div ref={containerRef}>
                <Header autoHide alwaysSeamless />
                <Hero eventYear={eventYear.year} />
                <div className="flex flex-col items-center justify-center py-24">
                    <AlertCircle className="mb-2 h-12 w-12 text-red-500" />
                    <h2 className="mb-2 text-2xl font-bold">Pendaftaran Ditutup</h2>
                    <p className="text-gray-600">
                        Pendaftaran untuk event ini telah ditutup. Silakan hubungi panitia untuk informasi lebih lanjut.
                    </p>
                </div>
                <Footer />
            </div>
        );
    }

    // Registration open
    return (
        <>
            <Head title="Pendaftaran - NITISARA">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            <div ref={containerRef}>
                <Header autoHide alwaysSeamless />
                <Hero eventYear={eventYear.year} />
                <JoinForm eventYears={eventYears ?? []} categories={categories ?? []} />
                <Footer />
            </div>
        </>
    );
}

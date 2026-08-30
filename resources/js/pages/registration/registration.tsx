import Guidebook from '@/components/registration/guidebook'; // <-- 1. Import the new component
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

    const eventYear = eventYears && eventYears.length > 0 ? eventYears[0] : undefined;

    const now = dayjs();
    const registrationStart = eventYear ? dayjs(eventYear.registration_start) : null;
    const registrationEnd = eventYear ? dayjs(eventYear.registration_end) : null;

    if (!eventYear) {
        return <NoActiveEvent />;
    }

    if (registrationStart && now.isBefore(registrationStart)) {
        // --- State: Registration Not Yet Open ---
        const diff = registrationStart.diff(now);
        const d = dayjs.duration(diff);
        const countdownText = `${Math.floor(d.asDays())} hari ${d.hours()} jam ${d.minutes()} menit`;

        return (
            <div ref={containerRef}>
                <Header autoHide alwaysSeamless />
                <Hero eventYear={eventYear.year} />
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <AlertCircle className="mb-4 h-12 w-12 text-yellow-500" />
                    <h2 className="mb-2 text-2xl font-bold">Pendaftaran Belum Dibuka</h2>
                    <p className="mb-4 text-gray-600">Pendaftaran akan dibuka dalam:</p>
                    <div className="text-primary mb-8 font-mono text-3xl">{countdownText}</div>
                </div>
                <Guidebook eventYear={eventYear} /> {/* <-- 2. Added here */}
                <Footer />
            </div>
        );
    }

    if (registrationEnd && now.isAfter(registrationEnd)) {
        // --- State: Registration Closed ---
        return (
            <div ref={containerRef}>
                <Header autoHide alwaysSeamless />
                <Hero eventYear={eventYear.year} />
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
                    <h2 className="mb-2 text-2xl font-bold">Pendaftaran Telah Ditutup</h2>
                    <p className="max-w-md text-gray-600">
                        Pendaftaran untuk event ini telah ditutup. Terima kasih atas partisipasinya! Silakan hubungi
                        panitia untuk informasi lebih lanjut.
                    </p>
                </div>
                <Guidebook eventYear={eventYear} /> {/* <-- 2. Added here */}
                <Footer />
            </div>
        );
    }

    // --- State: Registration Is Open ---
    return (
        <>
            <Head title="Pendaftaran - NITISARA">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            <div ref={containerRef}>
                <Header autoHide alwaysSeamless />
                <Hero eventYear={eventYear.year} />
                <Guidebook eventYear={eventYear} /> {/* <-- 2. Added here, replacing the placeholder */}
                <JoinForm eventYears={eventYears ?? []} categories={categories ?? []} />
                <Footer />
            </div>
        </>
    );
}

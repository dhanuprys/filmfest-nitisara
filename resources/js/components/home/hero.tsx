import { cn } from '@/lib/utils';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { useEffect, useMemo, useState } from 'react';
import SafeWidth from '../safe-width';
import { Button } from '../ui/button';
// Recommended: Add an icon library like lucide-react
// import { ArrowRight, Download } from 'lucide-react';

dayjs.extend(duration);

// Helper function to pad numbers with a leading zero
const pad = (n: number) => n.toString().padStart(2, '0');

// --- NEW: Countdown Display Component ---
// This component makes the countdown much clearer to the user.
interface CountdownDisplayProps {
    timeParts: { days: string; hours: string; minutes: string; seconds: string };
}

function CountdownDisplay({ timeParts }: CountdownDisplayProps) {
    const timeUnits = [
        { label: 'Hari', value: timeParts.days },
        { label: 'Jam', value: timeParts.hours },
        { label: 'Menit', value: timeParts.minutes },
        { label: 'Detik', value: timeParts.seconds },
    ];

    return (
        <div className="flex w-full justify-center gap-3 sm:gap-4">
            {timeUnits.map((unit, index) => (
                <div key={unit.label} className="flex items-center gap-3 sm:gap-4">
                    <div className="flex flex-col items-center">
                        <span className="font-mono text-3xl font-bold text-white tabular-nums md:text-4xl">
                            {unit.value}
                        </span>
                        <span className="text-xs font-medium tracking-widest text-blue-300">
                            {unit.label.toUpperCase()}
                        </span>
                    </div>
                    {index < timeUnits.length - 1 && <span className="text-3xl font-light text-blue-300/50">:</span>}
                </div>
            ))}
        </div>
    );
}

// --- NEW: CTA Buttons Component ---
// This component cleanly handles the logic for which buttons to show.
function CtaButtons({ activeEvent, registrationIsOpen }: { activeEvent: any; registrationIsOpen: boolean }) {
    if (!activeEvent) return null;

    const showGuideButton = !!activeEvent.event_guide_document;

    return (
        <div className="flex w-full max-w-lg flex-col items-center justify-center gap-4 sm:flex-row">
            {/* Improved Download Button */}
            {showGuideButton && (
                <Button
                    className="w-full items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-6 text-base font-semibold text-white shadow-lg backdrop-blur-lg transition-transform hover:scale-105 active:scale-95 sm:w-auto"
                    size="lg"
                    asChild
                >
                    <a href={route('registration.guidebook')} target="_blank" rel="noopener noreferrer">
                        {/* <Download className="h-5 w-5" /> */}
                        <span>Unduh Buku Panduan</span>
                    </a>
                </Button>
            )}

            {/* Main Registration Button (shown only when open) */}
            {registrationIsOpen && (
                <Button
                    className="w-full items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-6 text-base font-bold text-white shadow-md shadow-blue-500/30 transition-transform hover:scale-105 active:scale-95 sm:w-auto"
                    size="lg"
                    asChild
                >
                    <a href="/registration">
                        <span>Daftar Sekarang!</span>
                        {/* <ArrowRight className="h-5 w-5" /> */}
                    </a>
                </Button>
            )}
        </div>
    );
}

interface HeroProps {
    images: string[];
    activeEvent?: {
        // ... same props as before
        id: number;
        year: number;
        title: string;
        participants_count: number;
        registration_start?: string;
        registration_end?: string;
        event_guide_document?: string;
        show_start?: string;
        show_end?: string;
    } | null;
}

export default function Hero({ activeEvent, images }: HeroProps) {
    const [activeSlideIndex, setActiveSlideIndex] = useState(0);
    const [now, setNow] = useState(() => dayjs());
    const [mounted, setMounted] = useState(false);

    // --- IMPROVED: Logic is memoized for better performance ---
    const registrationStart = useMemo(
        () => (activeEvent?.registration_start ? dayjs(activeEvent.registration_start) : null),
        [activeEvent?.registration_start],
    );

    const registrationIsOpen = !registrationStart || now.isAfter(registrationStart);

    const countdownTimeParts = useMemo(() => {
        if (registrationIsOpen || !registrationStart) {
            return { days: '00', hours: '00', minutes: '00', seconds: '00' };
        }
        const diff = dayjs.duration(registrationStart.diff(now));
        return {
            days: pad(Math.floor(diff.asDays())),
            hours: pad(diff.hours()),
            minutes: pad(diff.minutes()),
            seconds: pad(diff.seconds()),
        };
    }, [now, registrationStart, registrationIsOpen]);

    useEffect(() => {
        setMounted(true);
        const slideInterval = setInterval(() => {
            setActiveSlideIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 4000);
        const timerInterval = setInterval(() => setNow(dayjs()), 1000);

        return () => {
            clearInterval(slideInterval);
            clearInterval(timerInterval);
        };
    }, []);

    // --- IMPROVED: The `mounted` class logic is now cleaner ---
    const getTransitionClass = (delay = 0) =>
        cn(
            'transition-all duration-700',
            mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
            `delay-${delay}`,
        );

    return (
        <div className="flex h-screen flex-col items-center justify-center bg-slate-950">
            {/* --- IMPROVED: Background opacity slightly increased for better visuals --- */}
            <div className="absolute top-0 left-0 size-full">
                {images.map((image, index) => (
                    <img
                        key={image}
                        className={cn(
                            'absolute top-0 left-0 size-full object-cover opacity-0 transition-opacity duration-1000',
                            index === activeSlideIndex && 'opacity-10', // Was opacity-5
                        )}
                        src={`/storage/${image}`}
                        alt="Festival film background image"
                    />
                ))}
            </div>

            <SafeWidth className="relative z-[1] flex max-w-[65rem] flex-col items-center space-y-8 px-4 text-center">
                <h1
                    className={cn(
                        'font-luckiest bg-gradient-to-b from-blue-700 to-blue-500 bg-clip-text text-7xl text-transparent drop-shadow-[0_0_1px_#1D4ED8] md:text-8xl lg:text-9xl',
                        getTransitionClass(0),
                    )}
                >
                    Satu Layar,
                    <br />
                    Seribu Cerita
                </h1>

                <p className={cn('max-w-3xl text-lg text-white/80 md:text-xl', getTransitionClass(100))}>
                    Selamat datang di Festival Film Nitisara — sebuah selebrasi sinema yang menyatukan imajinasi,
                    budaya, dan suara generasi.
                </p>

                <div className={cn('flex flex-col items-center gap-4 pt-4', getTransitionClass(200))}>
                    {!registrationIsOpen && (
                        <>
                            <p className="mb-2 text-sm font-medium tracking-widest text-blue-300 uppercase">
                                Pendaftaran Dibuka Dalam
                            </p>
                            <CountdownDisplay timeParts={countdownTimeParts} />
                        </>
                    )}

                    <div className="mt-4">
                        <CtaButtons activeEvent={activeEvent} registrationIsOpen={registrationIsOpen} />
                    </div>
                </div>
            </SafeWidth>
        </div>
    );
}

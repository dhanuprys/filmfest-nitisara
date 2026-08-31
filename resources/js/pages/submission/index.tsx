import SafeWidth from '@/components/safe-width';
import Footer from '@/components/shared/footer';
import Header from '@/components/shared/header';
import { FilmSummary, PinInput, ProfileCard, SubmissionForm, SubmittedFilmDetails } from '@/components/submission';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Head, router, useForm } from '@inertiajs/react';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { AlertCircle, AlertTriangle, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
dayjs.extend(duration);

interface Participant {
    id: number;
    team_name: string;
    leader_name: string;
    city: string;
    company: string;
    pin: string;
    eventYear: {
        id: number;
        title: string;
        submission_start_date: string;
        submission_end_date: string;
    };
}

interface Film {
    id: number;
    title: string;
    synopsis: string;
    film_url: string;
    originality_file: string;
    poster_file: string;
    backdrop_file: string | null;
    created_at: string;
    updated_at: string;
    director?: string; // NEW
    teaser_url?: string; // NEW
    castings?: Array<{ real_name: string; film_name: string }>; // NEW
}

interface Props {
    participant: Participant | null;
    existingFilm: Film | null;
    eventYear: any;
    isSubmissionOpen: boolean;
    submissionStatus: 'closed' | 'coming_soon' | 'open' | 'ended';
    countdownInfo?: {
        target_date: string;
        message: string;
    } | null;
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function Submission({
    participant,
    existingFilm,
    eventYear,
    isSubmissionOpen,
    submissionStatus,
    countdownInfo,
    flash,
}: Props) {
    const [dragOver, setDragOver] = useState<string | null>(null);
    const [pinDigits, setPinDigits] = useState(['', '', '', '', '', '']);
    const [currentDigit, setCurrentDigit] = useState(0);
    const [now, setNow] = useState(dayjs());
    const [castings, setCastings] = useState<Array<{ real_name: string; film_name: string }>>([]);

    // Initialize castings from existingFilm if present
    useEffect(() => {
        if (existingFilm?.castings && existingFilm.castings.length > 0) {
            setCastings(existingFilm.castings);
        }
    }, [existingFilm]);

    // Always sync filmForm.data.castings with castings state
    useEffect(() => {
        filmForm.setData('castings', castings);
    }, [castings]);

    const pinForm = useForm({
        pin: '',
    });

    const filmForm = useForm({
        title: existingFilm?.title || '',
        synopsis: existingFilm?.synopsis || '',
        film_url: existingFilm?.film_url || '',
        originality_file: null as File | null,
        poster_landscape_file: null as File | null,
        poster_portrait_file: null as File | null,
        backdrop_file: null as File | null,
        director: existingFilm?.director || '',
        teaser_url: existingFilm?.teaser_url || '', // will be required
        castings: existingFilm?.castings || [],
    });

    // Add state for confirmation checkbox
    const [isConfirmed, setIsConfirmed] = useState(false);

    const [showSuccess, setShowSuccess] = useState(false);

    // Show success message when flash.success is present
    useEffect(() => {
        if (flash?.success) {
            setShowSuccess(true);
        }
    }, [flash?.success]);

    // Auto-focus first input on mount
    useEffect(() => {
        const firstInput = document.getElementById('pin-0');
        if (firstInput) {
            firstInput.focus();
        }
    }, []);

    // Reset PIN digits when there's an error
    useEffect(() => {
        if (pinForm.errors.pin) {
            setPinDigits(['', '', '', '', '', '']);
            setCurrentDigit(0);
            // Focus back to first input after reset
            setTimeout(() => {
                const firstInput = document.getElementById('pin-0');
                if (firstInput) {
                    firstInput.focus();
                }
            }, 100);
        }
    }, [pinForm.errors.pin]);

    // Update countdown timer
    useEffect(() => {
        const timer = setInterval(() => setNow(dayjs()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handlePinDigitChange = (index: number, value: string) => {
        if (value.length > 1) return; // Only allow single digit

        const newPinDigits = [...pinDigits];
        newPinDigits[index] = value;
        setPinDigits(newPinDigits);

        // Auto-focus next input
        if (value && index < 5) {
            setCurrentDigit(index + 1);
            const nextInput = document.getElementById(`pin-${index + 1}`);
            if (nextInput) {
                nextInput.focus();
            }
        }

        // Update form data
        const fullPin = newPinDigits.join('');
        pinForm.setData('pin', fullPin);
    };

    const handlePinKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !pinDigits[index] && index > 0) {
            // Move to previous input on backspace if current is empty
            setCurrentDigit(index - 1);
            const prevInput = document.getElementById(`pin-${index - 1}`);
            if (prevInput) {
                prevInput.focus();
            }
        }
    };

    const handlePinSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const fullPin = pinDigits.join('');
        if (fullPin.length === 6) {
            pinForm.setData('pin', fullPin);
            pinForm.post(route('submission.verify'));
        }
    };

    const handleAddCasting = () => setCastings([...castings, { real_name: '', film_name: '' }]);
    const handleRemoveCasting = (idx: number) => setCastings(castings.filter((_, i) => i !== idx));
    const handleCastingChange = (idx: number, field: 'real_name' | 'film_name', value: string) => {
        setCastings(castings.map((c, i) => (i === idx ? { ...c, [field]: value } : c)));
    };

    const handleFilmSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!filmForm.data.teaser_url) {
            filmForm.setError('teaser_url', 'Teaser URL wajib diisi');
            return;
        }
        filmForm.setData('castings', castings);
        filmForm.post(route('submission.store'));
    };

    const handleLogout = () => {
        router.post(
            route('submission.logout'),
            {},
            {
                preserveScroll: false,
                preserveState: false,
            },
        );
    };

    const handleDragOver = (e: React.DragEvent, field: string) => {
        e.preventDefault();
        setDragOver(field);
    };

    const handleDragLeave = () => {
        setDragOver(null);
    };

    const handleDrop = (
        e: React.DragEvent,
        field: 'originality_file' | 'poster_landscape_file' | 'poster_portrait_file' | 'backdrop_file',
    ) => {
        e.preventDefault();
        setDragOver(null);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            filmForm.setData(field, files[0]);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getCountdownText = () => {
        if (!countdownInfo) return '';

        const target = dayjs(countdownInfo.target_date);
        const diff = target.diff(now);
        const d = dayjs.duration(diff);

        if (submissionStatus === 'coming_soon') {
            const pad = (n: number) => n.toString().padStart(2, '0');
            return `${pad(Math.floor(d.asDays()))}:${pad(d.hours())}:${pad(d.minutes())}:${pad(d.seconds())}`;
        } else {
            return target.format('DD MMMM YYYY, HH:mm');
        }
    };

    const getSubmissionStatusMessage = () => {
        switch (submissionStatus) {
            case 'coming_soon':
                return {
                    title: 'Submit Film Belum Dibuka',
                    subtitle: 'Periode submit film akan segera dibuka',
                    description:
                        'Festival Film NITISARA sedang mempersiapkan sistem submit film. Silakan cek kembali nanti untuk mengirim karya Anda.',
                    icon: Clock,
                    color: 'text-yellow-600',
                    bgColor: 'bg-gradient-to-br from-yellow-50 to-orange-50',
                    borderColor: 'border-yellow-200',
                    buttonText: 'Kembali ke Beranda',
                    buttonHref: '/',
                    showProgress: true,
                    progressText: 'Menunggu periode submit film',
                };
            case 'ended':
                return {
                    title: 'Submit Film Telah Ditutup',
                    subtitle: 'Periode submit film telah berakhir',
                    description:
                        'Terima kasih atas partisipasi Anda dalam Festival Film NITISARA. Semua film telah diterima dan sedang dalam proses penilaian.',
                    icon: AlertTriangle,
                    color: 'text-red-600',
                    bgColor: 'bg-gradient-to-br from-red-50 to-pink-50',
                    borderColor: 'border-red-200',
                    buttonText: 'Lihat Status Film',
                    buttonHref: '/status',
                    showProgress: false,
                    progressText: 'Periode submit telah berakhir',
                };
            default:
                return {
                    title: 'Submit Film Tidak Tersedia',
                    subtitle: 'Sistem submit film sedang tidak aktif',
                    description:
                        'Submit film tidak tersedia saat ini. Silakan hubungi panitia untuk informasi lebih lanjut.',
                    icon: AlertCircle,
                    color: 'text-gray-600',
                    bgColor: 'bg-gradient-to-br from-gray-50 to-slate-50',
                    borderColor: 'border-gray-200',
                    buttonText: 'Kembali ke Beranda',
                    buttonHref: '/',
                    showProgress: false,
                    progressText: 'Sistem tidak tersedia',
                };
        }
    };

    // If submission is not open and no participant, show closed message
    if (!participant && submissionStatus !== 'open') {
        const statusMessage = getSubmissionStatusMessage();
        const StatusIcon = statusMessage.icon;

        return (
            <>
                <Head title="Submit Film - NITISARA" />
                <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                    <Header autoHide alwaysSeamless />

                    <SafeWidth className="flex min-h-screen items-center justify-center py-24">
                        <div className="mx-auto w-full max-w-2xl text-center">
                            {/* Main Status Card */}
                            <div
                                className={`mb-8 rounded-2xl border shadow-xl backdrop-blur-sm ${statusMessage.bgColor} ${statusMessage.borderColor} overflow-hidden`}
                            >
                                <div className="p-8">
                                    <div className="mb-6">
                                        <div
                                            className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full ${statusMessage.bgColor} shadow-lg`}
                                        >
                                            <StatusIcon className={`h-10 w-10 ${statusMessage.color}`} />
                                        </div>
                                        <h1 className="mb-2 text-3xl font-bold text-gray-900">{statusMessage.title}</h1>
                                        <p className="mb-4 text-lg font-medium text-gray-700">
                                            {statusMessage.subtitle}
                                        </p>
                                        <p className="leading-relaxed text-gray-600">{statusMessage.description}</p>
                                    </div>

                                    {countdownInfo && (
                                        <div className="mb-6 rounded-xl bg-white/50 p-6 backdrop-blur-sm">
                                            <p className="mb-3 text-sm font-medium text-gray-700">
                                                {countdownInfo.message}
                                            </p>
                                            <div className="font-mono text-4xl font-bold tracking-widest text-blue-600">
                                                {getCountdownText()}
                                            </div>
                                            <div className="mt-3 flex justify-center gap-4 text-xs text-gray-500">
                                                <span>Hari</span>
                                                <span>Jam</span>
                                                <span>Menit</span>
                                                <span>Detik</span>
                                            </div>
                                        </div>
                                    )}

                                    {statusMessage.showProgress && (
                                        <div className="mb-6">
                                            <div className="mb-2 flex items-center justify-between text-sm">
                                                <span className="font-medium text-gray-700">
                                                    {statusMessage.progressText}
                                                </span>
                                                <span className="text-gray-500">Menunggu...</span>
                                            </div>
                                            <div className="h-2 overflow-hidden rounded-full bg-white/50">
                                                <div className="h-full w-full animate-pulse bg-gradient-to-r from-yellow-400 to-orange-400"></div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                                <Button
                                    asChild
                                    size="lg"
                                    className="bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg hover:from-blue-700 hover:to-blue-600"
                                >
                                    <a href={statusMessage.buttonHref}>{statusMessage.buttonText}</a>
                                </Button>
                                <Button
                                    asChild
                                    variant="outline"
                                    size="lg"
                                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                                >
                                    <a href="/registration">Daftar Event</a>
                                </Button>
                            </div>

                            {/* Additional Info */}
                            <div className="mt-8 rounded-lg bg-white/50 p-6 backdrop-blur-sm">
                                <h3 className="mb-3 text-lg font-semibold text-gray-900">Informasi Penting</h3>
                                <div className="space-y-2 text-sm text-gray-600">
                                    <div className="flex items-start gap-2">
                                        <div className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                                        <span>Pastikan Anda telah mendaftar sebagai peserta terlebih dahulu</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                                        <span>Simpan PIN registrasi Anda untuk akses submit film</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                                        <span>Periksa email Anda untuk informasi terbaru tentang event</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </SafeWidth>

                    <Footer />
                </div>
            </>
        );
    }

    // If participant is logged in but submission is not open, show status
    if (participant && !isSubmissionOpen) {
        const statusMessage = getSubmissionStatusMessage();
        const StatusIcon = statusMessage.icon;

        return (
            <>
                <Head title="Submit Film - NITISARA" />
                <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                    <Header autoHide alwaysSeamless />

                    <SafeWidth className="py-24">
                        {/* Profile Card */}
                        <ProfileCard participant={participant} handleLogout={handleLogout} />

                        {/* Enhanced Submission Status */}
                        <Card
                            className={`border-0 shadow-xl backdrop-blur-sm ${statusMessage.bgColor} ${statusMessage.borderColor} overflow-hidden`}
                        >
                            <CardContent className="p-8">
                                <div className="text-center">
                                    <div
                                        className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full ${statusMessage.bgColor} shadow-lg`}
                                    >
                                        <StatusIcon className={`h-10 w-10 ${statusMessage.color}`} />
                                    </div>
                                    <h2 className="mb-2 text-3xl font-bold text-gray-900">{statusMessage.title}</h2>
                                    <p className="mb-2 text-lg font-medium text-gray-700">{statusMessage.subtitle}</p>
                                    <p className="mb-6 leading-relaxed text-gray-600">{statusMessage.description}</p>

                                    {countdownInfo && (
                                        <div className="mb-6 rounded-xl bg-white/50 p-6 backdrop-blur-sm">
                                            <p className="mb-3 text-sm font-medium text-gray-700">
                                                {countdownInfo.message}
                                            </p>
                                            <div className="font-mono text-4xl font-bold tracking-widest text-blue-600">
                                                {getCountdownText()}
                                            </div>
                                            <div className="mt-3 flex justify-center gap-4 text-xs text-gray-500">
                                                <span>Hari</span>
                                                <span>Jam</span>
                                                <span>Menit</span>
                                                <span>Detik</span>
                                            </div>
                                        </div>
                                    )}

                                    {statusMessage.showProgress && (
                                        <div className="mb-6">
                                            <div className="mb-2 flex items-center justify-between text-sm">
                                                <span className="font-medium text-gray-700">
                                                    {statusMessage.progressText}
                                                </span>
                                                <span className="text-gray-500">Menunggu...</span>
                                            </div>
                                            <div className="h-2 overflow-hidden rounded-full bg-white/50">
                                                <div className="h-full w-full animate-pulse bg-gradient-to-r from-yellow-400 to-orange-400"></div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                                        <Button
                                            asChild
                                            size="lg"
                                            className="bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg hover:from-blue-700 hover:to-blue-600"
                                        >
                                            <a href={statusMessage.buttonHref}>{statusMessage.buttonText}</a>
                                        </Button>
                                        <Button
                                            asChild
                                            variant="outline"
                                            size="lg"
                                            className="border-gray-300 text-gray-700 hover:bg-gray-50"
                                        >
                                            <a href="/">Kembali ke Beranda</a>
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Additional Information for Logged-in Users */}
                        <Card className="border-0 bg-white/90 shadow-lg backdrop-blur-sm">
                            <CardContent className="p-6">
                                <h3 className="mb-4 text-lg font-semibold text-gray-900">Persiapan Submit Film</h3>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-3">
                                        <h4 className="font-medium text-gray-800">Dokumen yang Diperlukan:</h4>
                                        <ul className="space-y-2 text-sm text-gray-600">
                                            <li className="flex items-start gap-2">
                                                <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-green-500"></div>
                                                <span>File film (MP4, MOV, AVI)</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-green-500"></div>
                                                <span>Surat pernyataan orisinalitas</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-green-500"></div>
                                                <span>Poster film (JPG, PNG)</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                                                <span>Backdrop film (opsional)</span>
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="space-y-3">
                                        <h4 className="font-medium text-gray-800">Tips Submit Film:</h4>
                                        <ul className="space-y-2 text-sm text-gray-600">
                                            <li className="flex items-start gap-2">
                                                <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                                                <span>Pastikan kualitas video minimal 720p</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                                                <span>Durasi film sesuai ketentuan kategori</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                                                <span>Siapkan semua dokumen sebelum submit</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                                                <span>Periksa koneksi internet yang stabil</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </SafeWidth>

                    <Footer />
                </div>
            </>
        );
    }

    // PIN Input Form (when no participant is logged in)
    if (!participant) {
        return (
            <>
                <Head title="Submit Film - NITISARA" />
                <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                    <Header autoHide alwaysSeamless />

                    <SafeWidth className="flex min-h-screen items-center justify-center py-16">
                        <div className="mx-auto w-full max-w-lg">
                            {/* Header */}
                            <div className="mb-8 text-center">
                                <h1 className="mb-2 text-3xl font-bold text-gray-900">Submit Film NITISARA</h1>
                                <p className="text-lg text-gray-600">
                                    Masukkan PIN registrasi Anda untuk mengakses halaman submit film
                                </p>
                            </div>

                            {/* PIN Input Form */}
                            <PinInput
                                pinDigits={pinDigits}
                                currentDigit={currentDigit}
                                pinForm={pinForm}
                                handlePinDigitChange={handlePinDigitChange}
                                handlePinKeyDown={handlePinKeyDown}
                                handlePinSubmit={handlePinSubmit}
                                setPinDigits={setPinDigits}
                            />
                        </div>
                    </SafeWidth>

                    <Footer />
                </div>
            </>
        );
    }

    return (
        <>
            <Head title="Submit Film - NITISARA" />
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                <Header autoHide alwaysSeamless />

                <SafeWidth className="py-24">
                    {/* Profile Card */}
                    <ProfileCard participant={participant} handleLogout={handleLogout} />

                    {/* Success Message with Summary */}
                    {showSuccess && (
                        <FilmSummary
                            existingFilm={existingFilm}
                            showSuccess={showSuccess}
                            setShowSuccess={setShowSuccess}
                        />
                    )}

                    {/* Submission Status */}
                    {!isSubmissionOpen && (
                        <Alert className="mb-6 border-amber-200 bg-amber-50">
                            <Clock className="h-4 w-4 text-amber-600" />
                            <AlertDescription className="text-amber-800">
                                Periode submit film: {formatDate(eventYear.submission_start_date)} -{' '}
                                {formatDate(eventYear.submission_end_date)}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Existing Film Display */}
                    {existingFilm && isSubmissionOpen && <SubmittedFilmDetails film={existingFilm} />}

                    {/* Film Submission Form */}
                    {!existingFilm && isSubmissionOpen && (
                        <SubmissionForm
                            filmForm={filmForm}
                            castings={castings}
                            dragOver={dragOver}
                            isConfirmed={isConfirmed}
                            setIsConfirmed={setIsConfirmed}
                            handleFilmSubmit={handleFilmSubmit}
                            handleAddCasting={handleAddCasting}
                            handleRemoveCasting={handleRemoveCasting}
                            handleCastingChange={handleCastingChange}
                            handleDragOver={handleDragOver}
                            handleDragLeave={handleDragLeave}
                            handleDrop={handleDrop}
                        />
                    )}

                    {!isSubmissionOpen && (
                        <Alert className="border-amber-200 bg-amber-50">
                            <AlertCircle className="h-4 w-4 text-amber-600" />
                            <AlertDescription className="text-amber-800">
                                Periode submit film belum dibuka atau sudah berakhir. Silakan cek kembali nanti.
                            </AlertDescription>
                        </Alert>
                    )}
                </SafeWidth>

                <Footer />
            </div>
        </>
    );
}

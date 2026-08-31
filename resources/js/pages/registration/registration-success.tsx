import SafeWidth from '@/components/safe-width';
import Footer from '@/components/shared/footer';
import Header from '@/components/shared/header';
import { Button } from '@/components/ui/button';

import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { CheckCircle, Copy, Download, FileText, Home } from 'lucide-react';
import { useRef } from 'react';

interface Participant {
    id: number;
    team_name: string;
    city: string;
    leader_name: string;
    pin: string;
    verification_status: 'pending' | 'approved' | 'rejected';
    rejection_reason: string | null;
    student_card_file: string;
    payment_evidence_file: string;
}

interface Session {
    token: string;
    expires_at: string;
    last_accessed_at: string;
}

export default function RegistrationSuccess() {
    const props = usePage<SharedData>().props;
    const participant = (props as any).participant as Participant;
    const session = (props as any).session as Session;
    const containerRef = useRef<HTMLDivElement>(null);

    const copyPinToClipboard = () => {
        navigator.clipboard.writeText(participant.pin.toString());
    };

    return (
        <>
            <Head title="Pendaftaran Berhasil - NITISARA">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            <div ref={containerRef}>
                <Header autoHide alwaysSeamless />
                <SafeWidth className="py-24">
                    <div className="mx-auto max-w-2xl text-center">
                        <div className="space-y-6">
                            <div className="text-center">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                                    <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                                </div>
                                <h1 className="font-luckiest mb-2 text-2xl">Pendaftaran Berhasil!</h1>
                                <p className="text-muted-foreground">
                                    Tim Anda telah berhasil terdaftar dalam festival film NITISARA
                                </p>
                            </div>
                            <div className="space-y-4">
                                <div className="bg-muted rounded-lg p-4">
                                    <div className="mb-3 flex items-center gap-2">
                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
                                            <svg
                                                className="h-3 w-3 text-blue-600"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                                />
                                            </svg>
                                        </div>
                                        <h3 className="font-semibold text-gray-900">Informasi Tim</h3>
                                    </div>
                                    <div className="space-y-2.5 text-sm">
                                        <div className="flex items-center justify-between py-1.5">
                                            <div className="flex items-center gap-2">
                                                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-gray-100">
                                                    <svg
                                                        className="h-3 w-3 text-gray-600"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                                        />
                                                    </svg>
                                                </div>
                                                <span className="text-muted-foreground">Nama Tim:</span>
                                            </div>
                                            <span className="font-medium text-gray-900">{participant.team_name}</span>
                                        </div>
                                        <div className="flex items-center justify-between py-1.5">
                                            <div className="flex items-center gap-2">
                                                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-gray-100">
                                                    <svg
                                                        className="h-3 w-3 text-gray-600"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                                        />
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                                        />
                                                    </svg>
                                                </div>
                                                <span className="text-muted-foreground">Kota:</span>
                                            </div>
                                            <span className="font-medium text-gray-900">{participant.city}</span>
                                        </div>
                                        <div className="flex items-center justify-between py-1.5">
                                            <div className="flex items-center gap-2">
                                                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-gray-100">
                                                    <svg
                                                        className="h-3 w-3 text-gray-600"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                                        />
                                                    </svg>
                                                </div>
                                                <span className="text-muted-foreground">Ketua Tim:</span>
                                            </div>
                                            <span className="font-medium text-gray-900">{participant.leader_name}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-primary rounded-lg border-2 border-dashed bg-yellow-50 p-6">
                                    <div className="mb-4 flex items-center justify-center gap-2">
                                        <FileText className="text-primary h-5 w-5" />
                                        <h3 className="font-semibold">PIN Pendaftaran</h3>
                                    </div>
                                    <div className="mb-4 flex items-center justify-center">
                                        <div className="text-center">
                                            <p className="mb-2 text-sm font-medium text-gray-600">PIN Anda</p>
                                            <div className="rounded-lg border border-gray-200 bg-gray-100 p-4">
                                                <span className="font-mono text-3xl font-bold text-gray-900">
                                                    {participant.pin}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-center gap-3">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={copyPinToClipboard}
                                            className="flex items-center gap-2"
                                        >
                                            <Copy className="h-4 w-4" />
                                            Salin PIN
                                        </Button>
                                    </div>
                                    <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-100 p-3">
                                        <p className="text-sm font-medium text-yellow-800">
                                            ⚠️ Simpan PIN ini dengan aman! Anda akan membutuhkannya untuk upload film
                                            nanti.
                                        </p>
                                    </div>
                                </div>

                                {/* Status Check Shortcut */}
                                <div className="rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
                                    <div className="flex flex-col items-center gap-4 text-center">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                                            <svg
                                                className="h-6 w-6 text-blue-600"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                Cek Status Verifikasi
                                            </h3>
                                            <p className="mt-1 text-sm text-gray-600">
                                                Pantau status verifikasi tim Anda secara real-time
                                            </p>
                                        </div>
                                        <Button asChild className="bg-blue-600 text-white hover:bg-blue-700">
                                            <Link href={`/status/${session.token}`}>
                                                <svg
                                                    className="mr-2 h-4 w-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                    />
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                    />
                                                </svg>
                                                Lihat Status Sekarang
                                            </Link>
                                        </Button>
                                    </div>
                                </div>

                                <div className="bg-muted rounded-lg p-4">
                                    <div className="mb-3 flex items-center gap-2">
                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
                                            <Download className="h-3 w-3 text-blue-600" />
                                        </div>
                                        <h3 className="font-semibold text-gray-900">Dokumen Terupload</h3>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-muted-foreground text-sm">Kartu Identitas Pelajar:</span>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                asChild
                                                className="flex items-center gap-2"
                                            >
                                                <a
                                                    href={`/registration/${participant.pin}/download/student-card?token=${session.token}`}
                                                    target="_blank"
                                                >
                                                    <Download className="h-4 w-4" />
                                                    Download
                                                </a>
                                            </Button>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-muted-foreground text-sm">Bukti Pembayaran:</span>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                asChild
                                                className="flex items-center gap-2"
                                            >
                                                <a
                                                    href={`/registration/${participant.pin}/download/payment-evidence?token=${session.token}`}
                                                    target="_blank"
                                                >
                                                    <Download className="h-4 w-4" />
                                                    Download
                                                </a>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-semibold">Langkah Selanjutnya</h3>
                                <div className="space-y-3 text-left">
                                    <div className="flex items-start gap-3">
                                        <div className="bg-primary text-primary-foreground flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold">
                                            1
                                        </div>
                                        <div>
                                            <p className="font-medium">Verifikasi Pendaftaran</p>
                                            <p className="text-muted-foreground text-sm">
                                                Tim kami akan memverifikasi dokumen Anda dalam 1-2 hari kerja.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="bg-primary text-primary-foreground flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold">
                                            2
                                        </div>
                                        <div>
                                            <p className="font-medium">Cek Status</p>
                                            <p className="text-muted-foreground text-sm">
                                                Pantau status verifikasi tim Anda melalui{' '}
                                                <a href="/status" className="text-primary hover:underline">
                                                    halaman status
                                                </a>
                                                .
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="bg-primary text-primary-foreground flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold">
                                            3
                                        </div>
                                        <div>
                                            <p className="font-medium">Upload Film</p>
                                            <p className="text-muted-foreground text-sm">
                                                Setelah diverifikasi, Anda dapat mengupload film menggunakan PIN ini.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="bg-primary text-primary-foreground flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold">
                                            4
                                        </div>
                                        <div>
                                            <p className="font-medium">Tunggu Pengumuman</p>
                                            <p className="text-muted-foreground text-sm">
                                                Hasil seleksi akan diumumkan sesuai jadwal festival.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Session Info */}
                            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
                                        <svg
                                            className="h-3 w-3 text-blue-600"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-blue-900">Akses Status Tracking</h4>
                                        <p className="mt-1 text-sm text-blue-700">
                                            Anda dapat mengakses status verifikasi tim Anda kapan saja melalui{' '}
                                            <a href="/status" className="font-medium underline">
                                                halaman status tracking
                                            </a>
                                            . Sesi Anda akan aktif selama 7 hari.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                                <Button asChild className="w-full sm:w-auto">
                                    <Link href="/">
                                        <Home className="mr-2 h-4 w-4" />
                                        Kembali ke Beranda
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </SafeWidth>
                <Footer />
            </div>
        </>
    );
}

import SafeWidth from '@/components/safe-width';
import Footer from '@/components/shared/footer';
import Header from '@/components/shared/header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Head, Link, router } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    Building,
    CheckCircle,
    Clock,
    Download,
    FileText,
    FileVideo,
    LogOut,
    Mail,
    MapPin,
    Phone,
    RefreshCw,
    Users,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface Participant {
    id: number;
    team_name: string;
    city: string;
    company: string;
    category_id: number;
    event_year_id: number;
    leader_name: string;
    leader_email: string;
    leader_whatsapp: string;
    pin: number;
    verification_status: 'pending' | 'approved' | 'rejected';
    rejection_reason: string | null;
    student_card_file: string;
    payment_evidence_file: string;
    verified_by_user_id: number | null;
    verified_at: string | null;
    created_at: string;
    event_year: { id: number; year: string };
    category: { id: number; name: string };
    verified_by: { id: number; name: string } | null;
    films: any[];
}

interface Session {
    token: string;
    expires_at: string;
    last_accessed_at: string;
}

interface StatusShowProps {
    participant: Participant;
    session: Session;
}

export default function StatusShow({ participant, session }: StatusShowProps) {
    const [timeLeft, setTimeLeft] = useState<string>('');
    const [isExtending, setIsExtending] = useState(false);
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);

    // Calculate time left for session
    useEffect(() => {
        const updateTimeLeft = () => {
            const expiresAt = new Date(session.expires_at);
            const now = new Date();
            const diff = expiresAt.getTime() - now.getTime();

            if (diff <= 0) {
                setTimeLeft('Sesi berakhir');
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

            if (days > 0) {
                setTimeLeft(`${days} hari ${hours} jam`);
            } else if (hours > 0) {
                setTimeLeft(`${hours} jam ${minutes} menit`);
            } else {
                setTimeLeft(`${minutes} menit`);
            }
        };

        updateTimeLeft();
        const interval = setInterval(updateTimeLeft, 60000); // Update every minute

        return () => clearInterval(interval);
    }, [session.expires_at]);

    const handleLogout = () => {
        setShowLogoutDialog(true);
    };

    const confirmLogout = () => {
        setShowLogoutDialog(false);
        router.post(route('status.logout', session.token));
    };

    const handleExtendSession = async () => {
        setIsExtending(true);
        try {
            const response = await fetch(route('status.extend', session.token), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                window.location.reload();
            }
        } catch (error) {
            console.error('Failed to extend session:', error);
        } finally {
            setIsExtending(false);
        }
    };

    const getStatusBadge = () => {
        switch (participant.verification_status) {
            case 'approved':
                return (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Disetujui
                    </Badge>
                );
            case 'rejected':
                return (
                    <Badge variant="default" className="bg-red-100 text-red-800">
                        <X className="mr-1 h-3 w-3" />
                        Ditolak
                    </Badge>
                );
            default:
                return (
                    <Badge variant="secondary">
                        <Clock className="mr-1 h-3 w-3" />
                        Menunggu Verifikasi
                    </Badge>
                );
        }
    };

    const getStatusMessage = () => {
        switch (participant.verification_status) {
            case 'approved':
                return 'Tim Anda telah disetujui! Anda dapat melanjutkan ke tahap upload film.';
            case 'rejected':
                return 'Tim Anda ditolak. Silakan hubungi panitia untuk informasi lebih lanjut.';
            default:
                return 'Tim Anda sedang dalam proses verifikasi. Proses ini memakan waktu 1-2 hari kerja.';
        }
    };

    return (
        <>
            <Head title={`Status: ${participant.team_name} - NITISARA`}>
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            <div>
                <Header autoHide alwaysSeamless />
                <SafeWidth className="py-24">
                    <div className="mx-auto max-w-4xl">
                        {/* Header */}
                        <div className="mb-6 sm:mb-8">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                                    <Button variant="ghost" size="sm" asChild className="w-fit">
                                        <Link href={route('status.index')}>
                                            <ArrowLeft className="mr-2 h-4 w-4" />
                                            Kembali
                                        </Link>
                                    </Button>
                                    <div className="space-y-1">
                                        <h1 className="text-xl font-bold sm:text-2xl">{participant.team_name}</h1>
                                        <p className="text-muted-foreground text-sm">PIN: {participant.pin}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleExtendSession}
                                        disabled={isExtending}
                                        className="w-full sm:w-auto"
                                    >
                                        <RefreshCw className={`mr-2 h-4 w-4 ${isExtending ? 'animate-spin' : ''}`} />
                                        Perpanjang Sesi
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleLogout}
                                        className="w-full sm:w-auto"
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Keluar
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Session Info */}
                        <Card className="mb-6">
                            <CardContent className="pt-6">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <span className="text-muted-foreground text-sm">Sesi aktif hingga:</span>
                                    <span className="text-sm font-medium text-green-600">{timeLeft}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid gap-6 lg:grid-cols-2">
                            {/* Status Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CheckCircle className="h-5 w-5" />
                                        Status Verifikasi
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-3">{getStatusBadge()}</div>
                                    <p className="text-muted-foreground text-sm">{getStatusMessage()}</p>

                                    {participant.rejection_reason && (
                                        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                                            <div className="flex items-start gap-2">
                                                <AlertCircle className="mt-0.5 h-4 w-4 text-red-600" />
                                                <div>
                                                    <p className="text-sm font-medium text-red-800">
                                                        Alasan Penolakan:
                                                    </p>
                                                    <p className="text-sm text-red-700">
                                                        {participant.rejection_reason}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {participant.verification_status === 'approved' && (
                                        <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                                            <div className="flex items-start gap-2">
                                                <CheckCircle className="mt-0.5 h-4 w-4 text-green-600" />
                                                <div>
                                                    <p className="text-sm font-medium text-green-800">
                                                        Siap Upload Film!
                                                    </p>
                                                    <p className="text-sm text-green-700">
                                                        Tim Anda telah disetujui. Silakan lanjutkan ke{' '}
                                                        <Link href="/submission" className="underline">
                                                            halaman upload film
                                                        </Link>
                                                        .
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Team Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5" />
                                        Informasi Tim
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4">
                                        <div className="flex items-center gap-3">
                                            <Users className="text-muted-foreground h-4 w-4" />
                                            <div>
                                                <div className="font-medium">Nama Tim</div>
                                                <div className="text-muted-foreground text-sm">
                                                    {participant.team_name}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <MapPin className="text-muted-foreground h-4 w-4" />
                                            <div>
                                                <div className="font-medium">Kota</div>
                                                <div className="text-muted-foreground text-sm">{participant.city}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Building className="text-muted-foreground h-4 w-4" />
                                            <div>
                                                <div className="font-medium">Perusahaan/Institusi</div>
                                                <div className="text-muted-foreground text-sm">
                                                    {participant.company}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <FileText className="text-muted-foreground h-4 w-4" />
                                            <div>
                                                <div className="font-medium">PIN</div>
                                                <div className="text-muted-foreground font-mono text-sm">
                                                    {participant.pin}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="grid gap-4">
                                        <div>
                                            <div className="font-medium">Kategori</div>
                                            <div className="text-muted-foreground text-sm">
                                                {participant.category?.name}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="font-medium">Tahun Event</div>
                                            <div className="text-muted-foreground text-sm">
                                                {participant.event_year?.year}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="font-medium">Tanggal Daftar</div>
                                            <div className="text-muted-foreground text-sm">
                                                {new Date(participant.created_at).toLocaleDateString('id-ID')}
                                            </div>
                                        </div>
                                        {participant.verified_by_user_id && (
                                            <div>
                                                <div className="font-medium">Diverifikasi Oleh</div>
                                                <div className="text-muted-foreground text-sm">
                                                    {participant.verified_by?.name} pada{' '}
                                                    {new Date(participant.verified_at!).toLocaleDateString('id-ID')}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Leader Information */}
                        <Card className="mt-6">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Informasi Ketua Tim
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    <div className="flex items-center gap-3">
                                        <Users className="text-muted-foreground h-4 w-4 flex-shrink-0" />
                                        <div className="min-w-0 flex-1">
                                            <div className="font-medium">Nama Ketua</div>
                                            <div className="text-muted-foreground truncate text-sm">
                                                {participant.leader_name}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Mail className="text-muted-foreground h-4 w-4 flex-shrink-0" />
                                        <div className="min-w-0 flex-1">
                                            <div className="font-medium">Email</div>
                                            <div className="text-muted-foreground truncate text-sm">
                                                {participant.leader_email}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 sm:col-span-2 lg:col-span-1">
                                        <Phone className="text-muted-foreground h-4 w-4 flex-shrink-0" />
                                        <div className="min-w-0 flex-1">
                                            <div className="font-medium">WhatsApp</div>
                                            <div className="text-muted-foreground truncate text-sm">
                                                {participant.leader_whatsapp}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Document Downloads */}
                                <div className="space-y-3">
                                    <div className="font-medium">Dokumen</div>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <Button variant="outline" size="sm" asChild className="w-full justify-start">
                                            <a
                                                href={`/registration/${participant.pin}/download/student-card?token=${session.token}`}
                                                target="_blank"
                                            >
                                                <Download className="mr-2 h-4 w-4" />
                                                Download Kartu Identitas Pelajar
                                            </a>
                                        </Button>
                                        <Button variant="outline" size="sm" asChild className="w-full justify-start">
                                            <a
                                                href={`/registration/${participant.pin}/download/payment-evidence?token=${session.token}`}
                                                target="_blank"
                                            >
                                                <Download className="mr-2 h-4 w-4" />
                                                Download Bukti Pembayaran
                                            </a>
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Films */}
                        <Card className="mt-6">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileVideo className="h-5 w-5" />
                                    Film ({participant.films.length})
                                </CardTitle>
                                <CardDescription>Film yang diunggah oleh tim ini</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {participant.films.length > 0 ? (
                                    <div className="space-y-3">
                                        {participant.films.map((film) => (
                                            <div
                                                key={film.id}
                                                className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                                            >
                                                {/* Poster Portrait */}
                                                <div className="mb-2 flex-shrink-0 sm:mr-4 sm:mb-0">
                                                    {film.poster_portrait_file ? (
                                                        <img
                                                            src={`/storage/${film.poster_portrait_file}`}
                                                            alt="Poster portrait"
                                                            className="h-24 w-16 rounded bg-gray-100 object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-24 w-16 items-center justify-center rounded bg-gray-200 text-gray-400">
                                                            <FileVideo className="h-8 w-8" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="font-medium text-gray-900">
                                                        {film.title || `Film #${film.id}`}
                                                    </div>
                                                    {film.synopsis && (
                                                        <div className="text-muted-foreground mt-1 line-clamp-2 text-sm">
                                                            {film.synopsis}
                                                        </div>
                                                    )}
                                                    <div className="text-muted-foreground mt-2 text-xs">
                                                        Dikirim:{' '}
                                                        {new Date(film.created_at).toLocaleDateString('id-ID', {
                                                            day: '2-digit',
                                                            month: 'short',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {film.verified_by_user_id ? (
                                                        <Badge
                                                            variant="default"
                                                            className="bg-green-100 text-green-800"
                                                        >
                                                            <CheckCircle className="mr-1 h-3 w-3" />
                                                            Terverifikasi
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="secondary">
                                                            <Clock className="mr-1 h-3 w-3" />
                                                            Menunggu
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-8 text-center">
                                        <FileVideo className="text-muted-foreground mx-auto mb-3 h-12 w-12" />
                                        <p className="text-muted-foreground mb-4 text-sm">
                                            Belum ada film yang diunggah
                                        </p>
                                        {participant.verification_status === 'approved' && (
                                            <Button asChild>
                                                <Link href="/submission">Upload Film Sekarang</Link>
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </SafeWidth>
                <Footer />

                {/* Logout Confirmation Dialog */}
                <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <LogOut className="h-5 w-5" />
                                Konfirmasi Keluar
                            </DialogTitle>
                            <DialogDescription>
                                Apakah Anda yakin ingin keluar dari sesi ini? Anda perlu memasukkan PIN lagi untuk
                                mengakses status tim.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowLogoutDialog(false)}>
                                Batal
                            </Button>
                            <Button variant="destructive" onClick={confirmLogout}>
                                <LogOut className="mr-2 h-4 w-4" />
                                Keluar
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}

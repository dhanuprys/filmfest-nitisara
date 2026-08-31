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
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Building,
    Check,
    CheckCircle,
    Clock,
    Download,
    Edit,
    Eye,
    FileText,
    FileVideo,
    Mail,
    MapPin,
    Phone,
    RotateCcw,
    Users,
    X,
} from 'lucide-react';
import { useState } from 'react';

interface ParticipantShowProps {
    participant: {
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
        student_card_file: string;
        payment_evidence_file: string;
        verification_status: 'pending' | 'approved' | 'rejected';
        rejection_reason: string | null;
        verified_by_user_id: number | null;
        verified_at: string | null;
        created_at: string;
        event_year: { id: number; year: string };
        category: { id: number; name: string };
        verified_by: { id: number; name: string } | null;
        films: any[];
    };
}

export default function ParticipantShow({ participant }: ParticipantShowProps) {
    const [rejectionReason, setRejectionReason] = useState('');
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

    const handleApprove = () => {
        router.post(route('admin.participants.approve', participant.id));
    };

    const handleReject = () => {
        if (!rejectionReason.trim()) {
            alert('Alasan penolakan harus diisi');
            return;
        }

        router.post(route('admin.participants.reject', participant.id), {
            rejection_reason: rejectionReason,
        });

        setIsRejectDialogOpen(false);
        setRejectionReason('');
    };

    const handleResetStatus = () => {
        if (confirm('Apakah Anda yakin ingin mereset status verifikasi peserta ini?')) {
            router.post(route('admin.participants.reset-status', participant.id));
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

    return (
        <AdminLayout title={`Peserta: ${participant.team_name}`}>
            <Head title={`${participant.team_name} - NITISARA Admin`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={route('admin.participants.index')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Kembali
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">{participant.team_name}</h1>
                            <p className="text-muted-foreground">PIN: {participant.pin}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={route('admin.participants.edit', participant.id)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        </Button>
                        {participant.films.length === 0 && (
                            <Button asChild>
                                <Link href={route('admin.participants.films.create', participant.id)}>
                                    <FileVideo className="mr-2 h-4 w-4" />
                                    Tambah Film
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
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
                                        <div className="text-muted-foreground text-sm">{participant.team_name}</div>
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
                                        <div className="text-muted-foreground text-sm">{participant.company}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <FileText className="text-muted-foreground h-4 w-4" />
                                    <div>
                                        <div className="font-medium">PIN</div>
                                        <div className="text-muted-foreground font-mono text-sm">{participant.pin}</div>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div className="grid gap-4">
                                <div>
                                    <div className="font-medium">Kategori</div>
                                    <div className="text-muted-foreground text-sm">{participant.category?.name}</div>
                                </div>
                                <div>
                                    <div className="font-medium">Tahun Event</div>
                                    <div className="text-muted-foreground text-sm">{participant.event_year?.year}</div>
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
                                {participant.rejection_reason && (
                                    <div>
                                        <div className="font-medium">Alasan Penolakan</div>
                                        <div className="text-muted-foreground rounded border bg-red-50 p-2 text-sm">
                                            {participant.rejection_reason}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <Separator />

                            {/* Verification Actions */}
                            <div className="space-y-3">
                                <div className="font-medium">Status Verifikasi</div>
                                <div className="flex items-center gap-2">{getStatusBadge()}</div>

                                <div className="flex flex-wrap gap-2">
                                    {participant.verification_status === 'pending' && (
                                        <>
                                            <Button
                                                size="sm"
                                                onClick={handleApprove}
                                                className="bg-green-600 hover:bg-green-700"
                                            >
                                                <Check className="mr-2 h-4 w-4" />
                                                Setujui
                                            </Button>
                                            <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                                                <DialogTrigger asChild>
                                                    <Button variant="destructive" size="sm">
                                                        <X className="mr-2 h-4 w-4" />
                                                        Tolak
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Tolak Peserta</DialogTitle>
                                                        <DialogDescription>
                                                            Berikan alasan penolakan untuk peserta ini.
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <Label htmlFor="rejection-reason">Alasan Penolakan</Label>
                                                            <Textarea
                                                                id="rejection-reason"
                                                                placeholder="Masukkan alasan penolakan..."
                                                                value={rejectionReason}
                                                                onChange={(e) => setRejectionReason(e.target.value)}
                                                                rows={4}
                                                            />
                                                        </div>
                                                    </div>
                                                    <DialogFooter>
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => setIsRejectDialogOpen(false)}
                                                        >
                                                            Batal
                                                        </Button>
                                                        <Button variant="destructive" onClick={handleReject}>
                                                            Tolak Peserta
                                                        </Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        </>
                                    )}

                                    {participant.verification_status !== 'pending' && (
                                        <Button variant="outline" size="sm" onClick={handleResetStatus}>
                                            <RotateCcw className="mr-2 h-4 w-4" />
                                            Reset Status
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Leader Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Informasi Ketua Tim
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4">
                                <div className="flex items-center gap-3">
                                    <Users className="text-muted-foreground h-4 w-4" />
                                    <div>
                                        <div className="font-medium">Nama Ketua</div>
                                        <div className="text-muted-foreground text-sm">{participant.leader_name}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Mail className="text-muted-foreground h-4 w-4" />
                                    <div>
                                        <div className="font-medium">Email</div>
                                        <div className="text-muted-foreground text-sm">{participant.leader_email}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone className="text-muted-foreground h-4 w-4" />
                                    <div>
                                        <div className="font-medium">WhatsApp</div>
                                        <div className="text-muted-foreground text-sm">
                                            {participant.leader_whatsapp}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Document Downloads */}
                            <div className="space-y-3">
                                <div className="font-medium">Dokumen</div>
                                <div className="space-y-2">
                                    <Button variant="outline" size="sm" asChild className="w-full justify-start">
                                        <a
                                            href={`/registration/${participant.pin}/download/student-card`}
                                            target="_blank"
                                        >
                                            <Download className="mr-2 h-4 w-4" />
                                            Download Kartu Identitas Pelajar
                                        </a>
                                    </Button>
                                    <Button variant="outline" size="sm" asChild className="w-full justify-start">
                                        <a
                                            href={`/registration/${participant.pin}/download/payment-evidence`}
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
                </div>

                {/* Films */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileVideo className="h-5 w-5" />
                            Film ({participant.films.length})
                        </CardTitle>
                        <CardDescription>Film yang diunggah oleh peserta ini</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {participant.films.length > 0 ? (
                            <div className="space-y-3">
                                {participant.films.map((film) => (
                                    <div
                                        key={film.id}
                                        className="flex items-center justify-between rounded-lg border p-3"
                                    >
                                        <div>
                                            <div className="font-medium">{film.title || `Film #${film.id}`}</div>
                                            <div className="text-muted-foreground text-sm">
                                                Durasi: {film.duration} menit
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {film.verified_by_user_id ? (
                                                <Badge variant="default" className="bg-green-100 text-green-800">
                                                    <CheckCircle className="mr-1 h-3 w-3" />
                                                    Terverifikasi
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary">
                                                    <Clock className="mr-1 h-3 w-3" />
                                                    Menunggu
                                                </Badge>
                                            )}
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={route('admin.films.show', film.id)}>
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-6 text-center">
                                <FileVideo className="text-muted-foreground mx-auto mb-2 h-8 w-8" />
                                <p className="text-muted-foreground text-sm">Belum ada film yang diunggah</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}

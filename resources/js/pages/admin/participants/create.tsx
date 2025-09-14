import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Upload, Users } from 'lucide-react';
import { useState } from 'react';

interface ParticipantCreateProps {
    event_years: Array<{
        id: number;
        year: number;
        title: string;
    }>;
    categories: Array<{
        id: number;
        name: string;
        event_year_id: number;
    }>;
}

export default function ParticipantCreate({ event_years, categories }: ParticipantCreateProps) {
    const [dragOver, setDragOver] = useState<string | null>(null);

    const form = useForm({
        team_name: '',
        city: '',
        company: '',
        category_id: '',
        event_year_id: '',
        leader_name: '',
        leader_email: '',
        leader_whatsapp: '',
        student_card_file: null as File | null,
        payment_evidence_file: null as File | null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(route('admin.participants.store'));
    };

    const handleDragOver = (e: React.DragEvent, field: string) => {
        e.preventDefault();
        setDragOver(field);
    };

    const handleDragLeave = () => {
        setDragOver(null);
    };

    const handleDrop = (e: React.DragEvent, field: string) => {
        e.preventDefault();
        setDragOver(null);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            form.setData(field as any, files[0]);
        }
    };

    // Filter categories by selected event year
    const filteredCategories = categories.filter(
        (category) => category.event_year_id === parseInt(form.data.event_year_id),
    );

    return (
        <AdminLayout title="Tambah Peserta Baru">
            <Head title="Tambah Peserta Baru - NITISARA Admin" />

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
                            <h1 className="text-2xl font-bold">Tambah Peserta Baru</h1>
                            <p className="text-muted-foreground">Daftarkan peserta baru untuk event</p>
                        </div>
                    </div>
                </div>

                {/* Create Form */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Data Peserta
                        </CardTitle>
                        <CardDescription>Isi informasi lengkap peserta yang akan didaftarkan</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Basic Information */}
                            <div className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <Label htmlFor="team_name">Nama Tim *</Label>
                                        <Input
                                            id="team_name"
                                            type="text"
                                            value={form.data.team_name}
                                            onChange={(e) => form.setData('team_name', e.target.value)}
                                            placeholder="Masukkan nama tim"
                                            className={form.errors.team_name ? 'border-red-500' : ''}
                                        />
                                        {form.errors.team_name && (
                                            <p className="text-sm text-red-600">{form.errors.team_name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="city">Kota *</Label>
                                        <Input
                                            id="city"
                                            type="text"
                                            value={form.data.city}
                                            onChange={(e) => form.setData('city', e.target.value)}
                                            placeholder="Masukkan kota"
                                            className={form.errors.city ? 'border-red-500' : ''}
                                        />
                                        {form.errors.city && <p className="text-sm text-red-600">{form.errors.city}</p>}
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="company">Institusi/Perusahaan *</Label>
                                    <Input
                                        id="company"
                                        type="text"
                                        value={form.data.company}
                                        onChange={(e) => form.setData('company', e.target.value)}
                                        placeholder="Masukkan nama institusi atau perusahaan"
                                        className={form.errors.company ? 'border-red-500' : ''}
                                    />
                                    {form.errors.company && (
                                        <p className="text-sm text-red-600">{form.errors.company}</p>
                                    )}
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <Label htmlFor="event_year_id">Tahun Event *</Label>
                                        <Select
                                            value={form.data.event_year_id}
                                            onValueChange={(value) => {
                                                form.setData('event_year_id', value);
                                                form.setData('category_id', ''); // Reset category when event year changes
                                            }}
                                        >
                                            <SelectTrigger
                                                className={form.errors.event_year_id ? 'border-red-500' : ''}
                                            >
                                                <SelectValue placeholder="Pilih tahun event" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {event_years.map((eventYear) => (
                                                    <SelectItem key={eventYear.id} value={eventYear.id.toString()}>
                                                        {eventYear.year} - {eventYear.title}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {form.errors.event_year_id && (
                                            <p className="text-sm text-red-600">{form.errors.event_year_id}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="category_id">Kategori *</Label>
                                        <Select
                                            value={form.data.category_id}
                                            onValueChange={(value) => form.setData('category_id', value)}
                                            disabled={!form.data.event_year_id}
                                        >
                                            <SelectTrigger className={form.errors.category_id ? 'border-red-500' : ''}>
                                                <SelectValue placeholder="Pilih kategori" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {filteredCategories.map((category) => (
                                                    <SelectItem key={category.id} value={category.id.toString()}>
                                                        {category.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {form.errors.category_id && (
                                            <p className="text-sm text-red-600">{form.errors.category_id}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Leader Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Informasi Ketua Tim</h3>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <Label htmlFor="leader_name">Nama Ketua *</Label>
                                        <Input
                                            id="leader_name"
                                            type="text"
                                            value={form.data.leader_name}
                                            onChange={(e) => form.setData('leader_name', e.target.value)}
                                            placeholder="Masukkan nama ketua tim"
                                            className={form.errors.leader_name ? 'border-red-500' : ''}
                                        />
                                        {form.errors.leader_name && (
                                            <p className="text-sm text-red-600">{form.errors.leader_name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="leader_email">Email Ketua *</Label>
                                        <Input
                                            id="leader_email"
                                            type="email"
                                            value={form.data.leader_email}
                                            onChange={(e) => form.setData('leader_email', e.target.value)}
                                            placeholder="Masukkan email ketua tim"
                                            className={form.errors.leader_email ? 'border-red-500' : ''}
                                        />
                                        {form.errors.leader_email && (
                                            <p className="text-sm text-red-600">{form.errors.leader_email}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="leader_whatsapp">WhatsApp Ketua *</Label>
                                    <Input
                                        id="leader_whatsapp"
                                        type="text"
                                        value={form.data.leader_whatsapp}
                                        onChange={(e) => form.setData('leader_whatsapp', e.target.value)}
                                        placeholder="Masukkan nomor WhatsApp ketua tim"
                                        className={form.errors.leader_whatsapp ? 'border-red-500' : ''}
                                    />
                                    {form.errors.leader_whatsapp && (
                                        <p className="text-sm text-red-600">{form.errors.leader_whatsapp}</p>
                                    )}
                                </div>
                            </div>

                            {/* File Uploads */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-medium">Upload Dokumen</h3>

                                {/* Student Card File */}
                                <div>
                                    <Label htmlFor="student_card_file">Kartu Mahasiswa/Pelajar</Label>
                                    <div
                                        className={`mt-2 cursor-pointer rounded-lg border-2 border-dashed p-4 transition-all duration-200 ${dragOver === 'student_card_file'
                                            ? 'border-primary bg-primary/5 scale-105'
                                            : form.data.student_card_file
                                                ? 'border-green-300 bg-green-50'
                                                : 'border-primary/30 hover:border-primary/50'
                                            }`}
                                        onDragOver={(e) => handleDragOver(e, 'student_card_file')}
                                        onDragLeave={handleDragLeave}
                                        onDrop={(e) => handleDrop(e, 'student_card_file')}
                                        onClick={() => document.getElementById('student_card_file')?.click()}
                                    >
                                        <div className="flex items-center justify-center">
                                            <div className="text-center">
                                                <Upload className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                                                <p className="text-sm text-gray-600">
                                                    {form.data.student_card_file
                                                        ? form.data.student_card_file.name
                                                        : 'Drag & drop file atau klik untuk memilih'}
                                                </p>
                                                <p className="text-xs text-gray-500">PDF, JPG, JPEG, PNG (max 4MB)</p>
                                            </div>
                                        </div>
                                        <input
                                            id="student_card_file"
                                            type="file"
                                            className="hidden"
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) form.setData('student_card_file', file);
                                            }}
                                        />
                                    </div>
                                    {form.errors.student_card_file && (
                                        <p className="text-sm text-red-600">{form.errors.student_card_file}</p>
                                    )}
                                </div>

                                {/* Payment Evidence File */}
                                <div>
                                    <Label htmlFor="payment_evidence_file">Bukti Pembayaran</Label>
                                    <div
                                        className={`mt-2 cursor-pointer rounded-lg border-2 border-dashed p-4 transition-all duration-200 ${dragOver === 'payment_evidence_file'
                                            ? 'border-primary bg-primary/5 scale-105'
                                            : form.data.payment_evidence_file
                                                ? 'border-green-300 bg-green-50'
                                                : 'border-primary/30 hover:border-primary/50'
                                            }`}
                                        onDragOver={(e) => handleDragOver(e, 'payment_evidence_file')}
                                        onDragLeave={handleDragLeave}
                                        onDrop={(e) => handleDrop(e, 'payment_evidence_file')}
                                        onClick={() => document.getElementById('payment_evidence_file')?.click()}
                                    >
                                        <div className="flex items-center justify-center">
                                            <div className="text-center">
                                                <Upload className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                                                <p className="text-sm text-gray-600">
                                                    {form.data.payment_evidence_file
                                                        ? form.data.payment_evidence_file.name
                                                        : 'Drag & drop file atau klik untuk memilih'}
                                                </p>
                                                <p className="text-xs text-gray-500">PDF, JPG, JPEG, PNG (max 4MB)</p>
                                            </div>
                                        </div>
                                        <input
                                            id="payment_evidence_file"
                                            type="file"
                                            className="hidden"
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) form.setData('payment_evidence_file', file);
                                            }}
                                        />
                                    </div>
                                    {form.errors.payment_evidence_file && (
                                        <p className="text-sm text-red-600">{form.errors.payment_evidence_file}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    type="submit"
                                    disabled={form.processing}
                                    className="from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 bg-gradient-to-r"
                                >
                                    {form.processing ? 'Menyimpan...' : 'Simpan Peserta'}
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href={route('admin.participants.index')}>Batal</Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}

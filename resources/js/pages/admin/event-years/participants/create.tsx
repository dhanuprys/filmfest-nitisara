import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Upload, Users } from 'lucide-react';

interface EventYearParticipantCreateProps {
    event_year: {
        id: number;
        year: number;
        title: string;
        description: string;
    };
    categories: any[];
}

export default function EventYearParticipantCreate({ event_year, categories }: EventYearParticipantCreateProps) {
    const { data, setData, post, processing, errors } = useForm({
        event_year_id: event_year.id,
        team_name: '',
        city: '',
        company: '',
        category_id: '',
        leader_name: '',
        leader_email: '',
        leader_whatsapp: '',
        student_card_file: null as File | null,
        payment_evidence_file: null as File | null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.event-years.participants.store', event_year.id));
    };

    const handleFileChange = (field: 'student_card_file' | 'payment_evidence_file', file: File | null) => {
        setData(field, file);
    };

    return (
        <AdminLayout
            title={`Tambah Peserta ${event_year.year}`}
            description={`Tambah peserta baru untuk ${event_year.title}`}
        >
            <Head title={`Tambah Peserta ${event_year.year} - NITISARA Admin`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={route('admin.event-years.participants.index', event_year.id)}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Kembali ke Daftar Peserta
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">Tambah Peserta {event_year.year}</h1>
                            <p className="text-muted-foreground">
                                {event_year.title} - Tambah peserta baru untuk festival ini
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-8 lg:grid-cols-2">
                        {/* Team Information */}
                        <Card className="border-l-4 border-l-blue-500">
                            <CardHeader className="pb-4">
                                <CardTitle className="flex items-center gap-3 text-lg">
                                    <div className="rounded-lg bg-blue-100 p-2">
                                        <Users className="h-5 w-5 text-blue-600" />
                                    </div>
                                    Informasi Tim
                                </CardTitle>
                                <CardDescription>Data tim dan kategori peserta</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="team_name">Nama Tim *</Label>
                                    <Input
                                        id="team_name"
                                        value={data.team_name}
                                        onChange={(e) => setData('team_name', e.target.value)}
                                        placeholder="Masukkan nama tim"
                                        className={errors.team_name ? 'border-red-500' : ''}
                                    />
                                    {errors.team_name && <p className="text-sm text-red-600">{errors.team_name}</p>}
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="city">Kota *</Label>
                                        <Input
                                            id="city"
                                            value={data.city}
                                            onChange={(e) => setData('city', e.target.value)}
                                            placeholder="Masukkan kota"
                                            className={errors.city ? 'border-red-500' : ''}
                                        />
                                        {errors.city && <p className="text-sm text-red-600">{errors.city}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="company">Perusahaan/Institusi *</Label>
                                        <Input
                                            id="company"
                                            value={data.company}
                                            onChange={(e) => setData('company', e.target.value)}
                                            placeholder="Masukkan nama perusahaan"
                                            className={errors.company ? 'border-red-500' : ''}
                                        />
                                        {errors.company && <p className="text-sm text-red-600">{errors.company}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="category_id">Kategori *</Label>
                                    <Select
                                        value={data.category_id}
                                        onValueChange={(value) => setData('category_id', value)}
                                    >
                                        <SelectTrigger className={errors.category_id ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Pilih kategori" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem key={category.id} value={category.id.toString()}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.category_id && <p className="text-sm text-red-600">{errors.category_id}</p>}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Leader Information */}
                        <Card className="border-l-4 border-l-green-500">
                            <CardHeader className="pb-4">
                                <CardTitle className="flex items-center gap-3 text-lg">
                                    <div className="rounded-lg bg-green-100 p-2">
                                        <Users className="h-5 w-5 text-green-600" />
                                    </div>
                                    Informasi Ketua Tim
                                </CardTitle>
                                <CardDescription>Data ketua tim dan kontak</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="leader_name">Nama Ketua *</Label>
                                    <Input
                                        id="leader_name"
                                        value={data.leader_name}
                                        onChange={(e) => setData('leader_name', e.target.value)}
                                        placeholder="Masukkan nama ketua tim"
                                        className={errors.leader_name ? 'border-red-500' : ''}
                                    />
                                    {errors.leader_name && <p className="text-sm text-red-600">{errors.leader_name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="leader_email">Email *</Label>
                                    <Input
                                        id="leader_email"
                                        type="email"
                                        value={data.leader_email}
                                        onChange={(e) => setData('leader_email', e.target.value)}
                                        placeholder="Masukkan email ketua"
                                        className={errors.leader_email ? 'border-red-500' : ''}
                                    />
                                    {errors.leader_email && (
                                        <p className="text-sm text-red-600">{errors.leader_email}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="leader_whatsapp">WhatsApp *</Label>
                                    <Input
                                        id="leader_whatsapp"
                                        value={data.leader_whatsapp}
                                        onChange={(e) => setData('leader_whatsapp', e.target.value)}
                                        placeholder="Masukkan nomor WhatsApp"
                                        className={errors.leader_whatsapp ? 'border-red-500' : ''}
                                    />
                                    {errors.leader_whatsapp && (
                                        <p className="text-sm text-red-600">{errors.leader_whatsapp}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* File Uploads */}
                        <Card className="border-l-4 border-l-purple-500 lg:col-span-2">
                            <CardHeader className="pb-4">
                                <CardTitle className="flex items-center gap-3 text-lg">
                                    <div className="rounded-lg bg-purple-100 p-2">
                                        <Upload className="h-5 w-5 text-purple-600" />
                                    </div>
                                    Dokumen Pendukung
                                </CardTitle>
                                <CardDescription>Upload dokumen yang diperlukan (opsional untuk admin)</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="student_card_file">Kartu Identitas Pelajar</Label>
                                        <div className="relative">
                                            <Input
                                                id="student_card_file"
                                                type="file"
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0] || null;
                                                    handleFileChange('student_card_file', file);
                                                }}
                                                className="cursor-pointer"
                                                onClick={(e) => e.currentTarget.click()}
                                            />
                                            <Upload className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2" />
                                        </div>
                                        {errors.student_card_file && (
                                            <p className="text-sm text-red-600">{errors.student_card_file}</p>
                                        )}
                                        <p className="text-muted-foreground text-xs">
                                            Format: PDF, JPG, JPEG, PNG (maks. 4MB)
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="payment_evidence_file">Bukti Pembayaran</Label>
                                        <div className="relative">
                                            <Input
                                                id="payment_evidence_file"
                                                type="file"
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0] || null;
                                                    handleFileChange('payment_evidence_file', file);
                                                }}
                                                className="cursor-pointer"
                                                onClick={(e) => e.currentTarget.click()}
                                            />
                                            <Upload className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2" />
                                        </div>
                                        {errors.payment_evidence_file && (
                                            <p className="text-sm text-red-600">{errors.payment_evidence_file}</p>
                                        )}
                                        <p className="text-muted-foreground text-xs">
                                            Format: PDF, JPG, JPEG, PNG (maks. 4MB)
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Submit Button */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
                        <div className="text-muted-foreground text-sm sm:order-2">
                            Semua field bertanda * wajib diisi
                        </div>
                        <div className="flex gap-3 sm:order-1">
                            <Button variant="outline" asChild>
                                <Link href={route('admin.event-years.participants.index', event_year.id)}>Batal</Link>
                            </Button>
                            <Button type="submit" disabled={processing} className="min-w-[140px]">
                                {processing ? 'Menyimpan...' : 'Simpan Peserta'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}

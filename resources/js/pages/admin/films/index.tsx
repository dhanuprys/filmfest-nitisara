import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Calendar, CheckCircle, Clock, Download, Eye, FileVideo, Filter, Search, User, X } from 'lucide-react';
import { useState } from 'react';

interface FilmsIndexProps {
    films: {
        data: any[];
        links: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
        status?: string;
    };
}

export default function FilmsIndex({ films, filters }: FilmsIndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');

    const handleFilter = () => {
        router.get(
            route('admin.films.index'),
            {
                search,
                status: status === 'all' ? '' : status,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const clearFilters = () => {
        setSearch('');
        setStatus('all');
        router.get(
            route('admin.films.index'),
            {},
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AdminLayout title="Film" description="Kelola data festival film">
            <Head title="Film - NITISARA Admin" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Film</h1>
                        <p className="text-muted-foreground">
                            Verifikasi dan kelola festival film NITISARA. Film baru dapat ditambahkan melalui halaman
                            peserta.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-sm">
                            Total: {films.total} film
                        </Badge>
                    </div>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filter & Pencarian
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Pencarian</label>
                                <div className="relative">
                                    <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                                    <Input
                                        placeholder="Cari judul film, deskripsi, atau nama tim..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Status Verifikasi</label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Semua status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua status</SelectItem>
                                        <SelectItem value="pending">Menunggu verifikasi</SelectItem>
                                        <SelectItem value="verified">Terverifikasi</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="mt-4 flex gap-2">
                            <Button onClick={handleFilter}>
                                <Search className="mr-2 h-4 w-4" />
                                Filter
                            </Button>
                            <Button variant="outline" onClick={clearFilters}>
                                <X className="mr-2 h-4 w-4" />
                                Bersihkan
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Films List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Film</CardTitle>
                        <CardDescription>Total {films.total} film ditemukan</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {films.data.length > 0 ? (
                            <div className="space-y-4">
                                {films.data.map((film) => (
                                    <div
                                        key={film.id}
                                        className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-gray-50"
                                    >
                                        <div className="flex flex-1 items-center gap-4">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                                                <FileVideo className="h-6 w-6 text-blue-600" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="mb-1 flex items-center gap-2">
                                                    <h3 className="truncate font-semibold text-gray-900">
                                                        {film.title}
                                                    </h3>
                                                    {film.verified_by_user_id ? (
                                                        <Badge
                                                            variant="default"
                                                            className="bg-green-100 text-xs text-green-800"
                                                        >
                                                            <CheckCircle className="mr-1 h-3 w-3" />
                                                            Terverifikasi
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="secondary" className="text-xs">
                                                            <Clock className="mr-1 h-3 w-3" />
                                                            Menunggu
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="mb-2 line-clamp-2 text-sm text-gray-600">
                                                    {film.synopsis}
                                                </p>
                                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                                    <div className="flex items-center gap-1">
                                                        <User className="h-3 w-3" />
                                                        <span>{film.participant?.team_name || 'N/A'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        <span>{formatDate(film.created_at)}</span>
                                                    </div>
                                                    {film.verified_by_user_id && (
                                                        <div className="flex items-center gap-1">
                                                            <CheckCircle className="h-3 w-3" />
                                                            <span>Diverifikasi oleh {film.verified_by?.name}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-1">
                                                        <span className="font-semibold">Peringkat:</span>
                                                        <span>{film.ranking ?? '-'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={route('admin.films.show', film.id)}>
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            {film.originality_file && (
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={route('admin.films.download', film.id)}>
                                                        <Download className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 text-center">
                                <FileVideo className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
                                <h3 className="mb-2 text-lg font-medium">Tidak ada film</h3>
                                <p className="text-muted-foreground mx-auto max-w-md">
                                    Belum ada film yang diunggah atau tidak ada yang sesuai dengan filter yang dipilih.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}

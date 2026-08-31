import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AdminLayout from '@/layouts/admin-layout';
import { Head, Link } from '@inertiajs/react';
import { Award, Edit, Eye, Plus } from 'lucide-react';

interface CategoriesIndexProps {
    categories: {
        data: any[];
        links: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export default function CategoriesIndex({ categories }: CategoriesIndexProps) {
    return (
        <AdminLayout title="Kategori" description="Kelola kategori festival film">
            <Head title="Kategori - NITISARA Admin" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Kategori</h1>
                        <p className="text-muted-foreground">Kelola kategori festival film NITISARA</p>
                    </div>
                    <Button asChild>
                        <Link href={route('admin.categories.create')}>
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Kategori
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Kategori</CardTitle>
                        <CardDescription>Total {categories.total} kategori</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {categories.data.length > 0 ? (
                            <div className="space-y-4">
                                {categories.data.map((category) => (
                                    <div
                                        key={category.id}
                                        className="flex items-center justify-between rounded-lg border p-4"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium">{category.name}</span>
                                                <span className="text-muted-foreground text-sm">
                                                    {category.description || 'Tidak ada deskripsi'}
                                                </span>
                                                <span className="text-muted-foreground text-sm">
                                                    {category.participants_count} peserta
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={route('admin.categories.show', category.id)}>
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={route('admin.categories.edit', category.id)}>
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-8 text-center">
                                <Award className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                                <h3 className="mb-2 text-lg font-medium">Tidak ada kategori</h3>
                                <p className="text-muted-foreground">Belum ada kategori yang dibuat.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}

// This file is no longer used since categories are now managed through event years
// The standalone category management has been replaced with event-year scoped categories
// See resources/js/pages/admin/event-years/show.tsx for the new implementation

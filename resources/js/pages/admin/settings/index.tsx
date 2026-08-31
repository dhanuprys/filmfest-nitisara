import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/admin-layout';
import { Head, useForm } from '@inertiajs/react';
import { Save, Settings } from 'lucide-react';

interface SettingsIndexProps {
    settings: {
        [key: string]: any;
    };
}

export default function SettingsIndex({ settings }: SettingsIndexProps) {
    const { data, setData, post, processing, errors } = useForm({
        festival_name: settings.festival_name?.value || 'NITISARA Festival Film',
        festival_description: settings.festival_description?.value || '',
        contact_email: settings.contact_email?.value || '',
        contact_phone: settings.contact_phone?.value || '',
        contact_address: settings.contact_address?.value || '',
        social_media: settings.social_media?.value
            ? JSON.parse(settings.social_media.value)
            : {
                  facebook: '',
                  instagram: '',
                  twitter: '',
                  youtube: '',
              },
        registration_enabled: settings.registration_enabled?.value === '1',
        maintenance_mode: settings.maintenance_mode?.value === '1',
        max_file_size: settings.max_file_size?.value || '100',
        allowed_file_types: settings.allowed_file_types?.value || 'mp4,avi,mov',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.settings.update'));
    };

    return (
        <AdminLayout title="Pengaturan" description="Kelola pengaturan aplikasi">
            <Head title="Pengaturan - NITISARA Admin" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">Pengaturan</h1>
                    <p className="text-muted-foreground">Konfigurasi aplikasi festival film NITISARA</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Festival Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Settings className="h-5 w-5" />
                                    Informasi Festival
                                </CardTitle>
                                <CardDescription>Pengaturan informasi dasar festival</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="festival_name">Nama Festival</Label>
                                    <Input
                                        id="festival_name"
                                        value={data.festival_name}
                                        onChange={(e) => setData('festival_name', e.target.value)}
                                        placeholder="NITISARA Festival Film"
                                    />
                                    {errors.festival_name && (
                                        <p className="text-sm text-red-600">{errors.festival_name}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="festival_description">Deskripsi Festival</Label>
                                    <Textarea
                                        id="festival_description"
                                        value={data.festival_description}
                                        onChange={(e) => setData('festival_description', e.target.value)}
                                        placeholder="Deskripsi festival film..."
                                        rows={3}
                                    />
                                    {errors.festival_description && (
                                        <p className="text-sm text-red-600">{errors.festival_description}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Contact Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Informasi Kontak</CardTitle>
                                <CardDescription>Informasi kontak festival</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="contact_email">Email Kontak</Label>
                                    <Input
                                        id="contact_email"
                                        type="email"
                                        value={data.contact_email}
                                        onChange={(e) => setData('contact_email', e.target.value)}
                                        placeholder="contact@nitisara.com"
                                    />
                                    {errors.contact_email && (
                                        <p className="text-sm text-red-600">{errors.contact_email}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="contact_phone">Telepon</Label>
                                    <Input
                                        id="contact_phone"
                                        value={data.contact_phone}
                                        onChange={(e) => setData('contact_phone', e.target.value)}
                                        placeholder="+62 123 456 789"
                                    />
                                    {errors.contact_phone && (
                                        <p className="text-sm text-red-600">{errors.contact_phone}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="contact_address">Alamat</Label>
                                    <Textarea
                                        id="contact_address"
                                        value={data.contact_address}
                                        onChange={(e) => setData('contact_address', e.target.value)}
                                        placeholder="Alamat festival..."
                                        rows={2}
                                    />
                                    {errors.contact_address && (
                                        <p className="text-sm text-red-600">{errors.contact_address}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Social Media */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Media Sosial</CardTitle>
                                <CardDescription>Link media sosial festival</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="facebook">Facebook</Label>
                                    <Input
                                        id="facebook"
                                        value={data.social_media.facebook}
                                        onChange={(e) =>
                                            setData('social_media', { ...data.social_media, facebook: e.target.value })
                                        }
                                        placeholder="https://facebook.com/nitisara"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="instagram">Instagram</Label>
                                    <Input
                                        id="instagram"
                                        value={data.social_media.instagram}
                                        onChange={(e) =>
                                            setData('social_media', { ...data.social_media, instagram: e.target.value })
                                        }
                                        placeholder="https://instagram.com/nitisara"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="twitter">Twitter</Label>
                                    <Input
                                        id="twitter"
                                        value={data.social_media.twitter}
                                        onChange={(e) =>
                                            setData('social_media', { ...data.social_media, twitter: e.target.value })
                                        }
                                        placeholder="https://twitter.com/nitisara"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="youtube">YouTube</Label>
                                    <Input
                                        id="youtube"
                                        value={data.social_media.youtube}
                                        onChange={(e) =>
                                            setData('social_media', { ...data.social_media, youtube: e.target.value })
                                        }
                                        placeholder="https://youtube.com/nitisara"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* System Settings */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Pengaturan Sistem</CardTitle>
                                <CardDescription>Konfigurasi sistem aplikasi</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="registration_enabled"
                                        checked={data.registration_enabled}
                                        onCheckedChange={(checked) => setData('registration_enabled', checked)}
                                    />
                                    <Label htmlFor="registration_enabled">Aktifkan Pendaftaran</Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="maintenance_mode"
                                        checked={data.maintenance_mode}
                                        onCheckedChange={(checked) => setData('maintenance_mode', checked)}
                                    />
                                    <Label htmlFor="maintenance_mode">Mode Maintenance</Label>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="max_file_size">Ukuran Maksimal File (MB)</Label>
                                    <Input
                                        id="max_file_size"
                                        type="number"
                                        value={data.max_file_size}
                                        onChange={(e) => setData('max_file_size', e.target.value)}
                                        placeholder="100"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="allowed_file_types">Tipe File yang Diizinkan</Label>
                                    <Input
                                        id="allowed_file_types"
                                        value={data.allowed_file_types}
                                        onChange={(e) => setData('allowed_file_types', e.target.value)}
                                        placeholder="mp4,avi,mov"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="mt-6">
                        <Button type="submit" disabled={processing}>
                            <Save className="mr-2 h-4 w-4" />
                            {processing ? 'Menyimpan...' : 'Simpan Pengaturan'}
                        </Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}

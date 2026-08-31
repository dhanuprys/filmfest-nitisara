import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Head, useForm } from '@inertiajs/react';
import { Film } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function VotingLogin() {
    const { data, setData, post, processing, errors } = useForm({
        pin: '',
    });

    const [errorDialogOpen, setErrorDialogOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Show error dialog when there are errors
    useEffect(() => {
        if (errors.pin) {
            setErrorMessage(errors.pin);
            setErrorDialogOpen(true);
        }
    }, [errors]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('voting.verify'));
    };

    return (
        <>
            <Head title="Voting Login" />
            <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4 dark:bg-gray-900">
                <div className="w-full max-w-md">
                    <div className="mb-8 text-center">
                        <div className="bg-primary/10 mb-4 inline-flex items-center justify-center rounded-full p-4">
                            <Film className="text-primary h-10 w-10" />
                        </div>
                        <h1 className="text-3xl font-bold">Festival Film Voting</h1>
                        <p className="mt-2 text-gray-500 dark:text-gray-400">
                            Masukkan PIN untuk Page Login (akses halaman voting)
                        </p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Login Voting</CardTitle>
                            <CardDescription>Masukkan PIN yang diberikan oleh panitia</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit}>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="pin">PIN</Label>
                                        <Input
                                            id="pin"
                                            placeholder="Masukkan 6 digit PIN"
                                            value={data.pin}
                                            onChange={(e) => setData('pin', e.target.value.toUpperCase())}
                                            maxLength={6}
                                            className="text-center text-xl tracking-widest"
                                            autoComplete="off"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w-full" disabled={processing}>
                                    {processing ? 'Memverifikasi...' : 'Masuk'}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            </div>

            {/* Error Dialog */}
            <Dialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Kesalahan</DialogTitle>
                        <DialogDescription>{errorMessage}</DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end">
                        <Button onClick={() => setErrorDialogOpen(false)}>Tutup</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

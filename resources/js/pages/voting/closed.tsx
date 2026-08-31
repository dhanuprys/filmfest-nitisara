import { Head } from '@inertiajs/react';
import { Film, Lock } from 'lucide-react';

export default function VotingClosed() {
    return (
        <>
            <Head title="Voting Ditutup" />
            <div className="flex min-h-screen flex-col items-center justify-center bg-black p-4 dark:bg-gray-900">
                <div className="w-full max-w-md text-center">
                    <div className="mb-6 inline-flex items-center justify-center rounded-full bg-red-100 p-6 dark:bg-red-900/20">
                        <Lock className="h-16 w-16 text-red-600 dark:text-red-400" />
                    </div>

                    <h1 className="mb-2 text-3xl font-bold text-white">Voting Ditutup</h1>
                    <p className="mb-8 text-gray-600 dark:text-gray-400">
                        Halaman voting saat ini tidak aktif atau telah ditutup oleh admin.
                    </p>

                    <div className="flex items-center justify-center">
                        <Film className="mr-2 h-6 w-6 text-gray-500" />
                        <span className="text-lg font-medium text-gray-500">Festival Film</span>
                    </div>
                </div>
            </div>
        </>
    );
}

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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import {
    Award,
    CheckCircle,
    ChevronDown,
    ChevronUp,
    Delete,
    Film,
    Hash,
    LogOut,
    Star,
    Ticket,
    Timer,
    Users,
    XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface FilmType {
    id: number;
    title: string;
    synopsis: string;
    poster_landscape_file?: string;
    poster_portrait_file?: string;
    participant: {
        team_name: string;
        company: string;
        city: string;
        category: {
            id: number;
            name: string;
        };
    };
}

interface Category {
    id: number;
    name: string;
}

interface EventYear {
    id: number;
    year: number;
    title: string;
}

interface Props {
    filmsByCategory: Record<string, FilmType[]>;
    categories: Category[];
    session: {
        token: string;
        expires_at: string;
    };
    activeEventYear: EventYear | null;
}

interface VotingSession {
    ticket: {
        id: number;
        code: string;
    };
    categories: Category[];
    voted_categories: string[];
    remaining_categories: Category[];
    is_complete: boolean;
}

// Custom hook for letter animation
const useLetterAnimation = (text: string, intervalMs: number = 300) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % text.length);
        }, intervalMs);

        return () => clearInterval(interval);
    }, [text.length, intervalMs]);

    const getLetterStyle = useCallback(
        (index: number) => {
            const isHighlighted = index === currentIndex;
            const isAdjacent =
                Math.abs(index - currentIndex) === 1 ||
                (currentIndex === 0 && index === text.length - 1) ||
                (currentIndex === text.length - 1 && index === 0);

            const baseClasses = 'transition-all duration-300 transform';

            if (isHighlighted) {
                return `${baseClasses} text-white scale-110 font-bold drop-shadow-lg`;
            }
            if (isAdjacent) {
                return `${baseClasses} text-gray-400 scale-105`;
            }
            return `${baseClasses} text-gray-900`;
        },
        [currentIndex, text.length],
    );

    return { currentIndex, getLetterStyle };
};

// Custom hook for session management
const useVotingSession = () => {
    const [votingSession, setVotingSession] = useState<VotingSession | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const startVotingSession = useCallback(async (ticketCode: string) => {
        if (ticketCode.length !== 4) return;

        setLoading(true);
        setError(null);

        try {
            const response = await axios.post(route('voting.start-session'), {
                ticket_code: ticketCode,
            });

            setVotingSession(response.data);
            setSuccess('Sesi voting dimulai');
            return response.data;
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || 'Terjadi kesalahan. Silakan coba lagi.';
            setError(errorMsg);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const resetSession = useCallback(() => {
        setVotingSession(null);
        setError(null);
        setSuccess(null);
    }, []);

    const updateVotingSession = useCallback((session: VotingSession) => {
        setVotingSession(session);
    }, []);

    return {
        votingSession,
        loading,
        error,
        success,
        startVotingSession,
        resetSession,
        updateVotingSession,
    };
};

// Custom hook for voting actions
const useVotingActions = (
    votingSession: VotingSession | null,
    onComplete: () => void,
    updateVotingSession: (session: VotingSession) => void,
) => {
    const [selectedFilm, setSelectedFilm] = useState<FilmType | null>(null);
    const [votingDialogOpen, setVotingDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const openVotingDialog = useCallback((film: FilmType) => {
        setSelectedFilm(film);
        setVotingDialogOpen(true);
        setError(null);
        setSuccess(null);
    }, []);

    const handleVote = useCallback(async () => {
        if (!selectedFilm || !votingSession) return;

        setLoading(true);
        setError(null);

        try {
            const response = await axios.post(route('voting.vote'), {
                ticket_code: votingSession.ticket.code,
                film_id: selectedFilm.id,
            });

            setSuccess(response.data.message);

            // Update the voting session with new data from response
            if (response.data.success && votingSession) {
                const updatedSession: VotingSession = {
                    ...votingSession,
                    remaining_categories: response.data.remaining_categories || [],
                    is_complete: response.data.is_complete || false,
                };
                updateVotingSession(updatedSession);
            }

            setTimeout(() => {
                setVotingDialogOpen(false);
                setSelectedFilm(null);

                if (response.data.is_complete) {
                    onComplete();
                }
            }, 500);

            return response.data;
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || 'Terjadi kesalahan. Silakan coba lagi.';
            setError(errorMsg);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [selectedFilm, votingSession, onComplete, updateVotingSession]);

    return {
        selectedFilm,
        votingDialogOpen,
        loading,
        error,
        success,
        openVotingDialog,
        handleVote,
        setVotingDialogOpen,
    };
};

// Custom hook for session validation
const useSessionValidation = (session: { token: string; expires_at: string }) => {
    const [sessionValid, setSessionValid] = useState(true);
    const [pageDisabled, setPageDisabled] = useState(false);
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const checkSession = async () => {
            try {
                const response = await axios.get(route('voting.check-session'));

                if (!response.data.valid) {
                    if (response.data.reason === 'pin_deactivated') {
                        setPageDisabled(true);
                    } else {
                        setSessionValid(false);
                        router.visit(route('voting.index'));
                    }
                } else {
                    setPageDisabled(false);
                    setSessionValid(true);
                }
            } catch (error) {
                setSessionValid(false);
                router.visit(route('voting.index'));
            }
        };

        const updateTimeLeft = () => {
            const now = new Date();
            const expiresAt = new Date(session.expires_at);
            const diff = expiresAt.getTime() - now.getTime();

            if (diff <= 0) {
                setTimeLeft('Sesi berakhir');
                setSessionValid(false);
                router.visit(route('voting.index'));
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeLeft(
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
            );
        };

        checkSession();
        updateTimeLeft();

        const sessionCheckInterval = setInterval(checkSession, 2000);
        const timeLeftInterval = setInterval(updateTimeLeft, 1000);

        return () => {
            clearInterval(sessionCheckInterval);
            clearInterval(timeLeftInterval);
        };
    }, [session.expires_at]);

    return { sessionValid, pageDisabled, timeLeft };
};

// Disabled Page Component
function DisabledPage() {
    const text = 'NITISARA';
    const { currentIndex, getLetterStyle } = useLetterAnimation(text);

    return (
        <>
            <Head title="Voting Sedang Ditutup" />
            <div className="flex max-h-screen min-h-screen items-center justify-center !overflow-y-hidden bg-black">
                <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="font-luckiest mb-4 text-9xl font-bold tracking-wider">
                            {text.split('').map((letter, index) => (
                                <span key={index} className={getLetterStyle(index)}>
                                    {letter}
                                </span>
                            ))}
                        </h2>

                        <p className="mt-4 text-lg text-gray-400">Halaman akan kembali aktif secara otomatis</p>
                    </div>
                </main>
            </div>
        </>
    );
}

export default function VotingIndex({ filmsByCategory, categories, session, activeEventYear }: Props) {
    const [ticketCode, setTicketCode] = useState('');
    const [currentStep, setCurrentStep] = useState(0);
    const [headerVisible, setHeaderVisible] = useState(false);
    const [messageDialogOpen, setMessageDialogOpen] = useState(false);
    const [messageType, setMessageType] = useState<'error' | 'success'>('error');
    const [messageContent, setMessageContent] = useState('');
    const [completionDialogOpen, setCompletionDialogOpen] = useState(false);
    const [logoutCountdown, setLogoutCountdown] = useState(5);
    const countdownRef = useRef<NodeJS.Timeout | null>(null);
    const headerTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Add local state for delayed pageDisabled
    const [delayedPageDisabled, setDelayedPageDisabled] = useState(true);
    const [delayedSessionValid, setDelayedSessionValid] = useState(true);
    const [delayDone, setDelayDone] = useState(false);

    // Get the real session validation values
    const { sessionValid, pageDisabled, timeLeft } = useSessionValidation(session);

    // Delay logic: after 2 seconds, update the local state to match the real API check
    useEffect(() => {
        const timer = setTimeout(() => {
            setDelayedPageDisabled(pageDisabled);
            setDelayedSessionValid(sessionValid);
            setDelayDone(true);
        }, 2000);
        return () => clearTimeout(timer);
    }, [pageDisabled, sessionValid]);

    const {
        votingSession,
        loading: sessionLoading,
        error: sessionError,
        success: sessionSuccess,
        startVotingSession: startSession,
        resetSession,
        updateVotingSession,
    } = useVotingSession();

    // Move inputRef and useEffect here, after votingSession is declared
    const inputRef = useRef<HTMLInputElement>(null);
    useEffect(() => {
        if (!votingSession && inputRef.current) {
            inputRef.current.focus();
        }
    }, [votingSession]);

    const handleVotingComplete = useCallback(() => {
        setCompletionDialogOpen(true);
        setLogoutCountdown(5);
    }, []);

    // Auto-trigger completion dialog when voting is complete
    useEffect(() => {
        if (votingSession && votingSession.is_complete) {
            handleVotingComplete();
        }
    }, [votingSession?.is_complete, handleVotingComplete]);

    const {
        selectedFilm,
        votingDialogOpen,
        loading: votingLoading,
        error: votingError,
        success: votingSuccess,
        openVotingDialog,
        handleVote,
        setVotingDialogOpen,
    } = useVotingActions(votingSession, handleVotingComplete, updateVotingSession);

    const handleLogout = useCallback(() => {
        router.post(route('voting.logout'));
    }, []);

    const toggleHeader = useCallback(() => {
        if (headerVisible) {
            setHeaderVisible(false);
            if (headerTimerRef.current) {
                clearTimeout(headerTimerRef.current);
                headerTimerRef.current = null;
            }
        } else {
            setHeaderVisible(true);
            if (headerTimerRef.current) {
                clearTimeout(headerTimerRef.current);
            }
            headerTimerRef.current = setTimeout(() => {
                setHeaderVisible(false);
                headerTimerRef.current = null;
            }, 10000);
        }
    }, [headerVisible]);

    const resetVotingSession = useCallback(() => {
        resetSession();
        setVotingDialogOpen(false);
        setCompletionDialogOpen(false);
        setCurrentStep(0);

        if (countdownRef.current) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
        }
    }, [resetSession, setVotingDialogOpen]);

    const getCurrentCategory = useCallback(() => {
        if (votingSession && votingSession.remaining_categories && votingSession.remaining_categories.length > 0) {
            return votingSession.remaining_categories[0];
        }
        return null;
    }, [votingSession]);

    // Start countdown for automatic session reset
    useEffect(() => {
        if (completionDialogOpen) {
            if (countdownRef.current) {
                clearInterval(countdownRef.current);
            }

            countdownRef.current = setInterval(() => {
                setLogoutCountdown((prev) => {
                    if (prev <= 1) {
                        if (countdownRef.current) {
                            clearInterval(countdownRef.current);
                            countdownRef.current = null;
                        }
                        resetVotingSession();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => {
                if (countdownRef.current) {
                    clearInterval(countdownRef.current);
                    countdownRef.current = null;
                }
            };
        }
    }, [completionDialogOpen, resetVotingSession]);

    const handleStartVotingSession = useCallback(async () => {
        if (ticketCode.length !== 4) return;

        try {
            await startSession(ticketCode);
            setTicketCode('');
            setCurrentStep(1);
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || 'Terjadi kesalahan. Silakan coba lagi.';
            showMessage('error', errorMsg);

            if (error.response?.status === 400 && errorMsg.includes('sudah digunakan')) {
                setTicketCode('');
            }
        }
    }, [ticketCode, startSession]);

    const showMessage = useCallback((type: 'error' | 'success', content: string) => {
        setMessageType(type);
        setMessageContent(content);
        setMessageDialogOpen(true);
    }, []);

    const isUsedTicketError = useCallback((message: string) => {
        return message.includes('sudah digunakan');
    }, []);

    useEffect(() => {
        if (messageDialogOpen && messageType === 'error') {
            const timer = setTimeout(() => {
                setMessageDialogOpen(false);
                setTicketCode(''); // Reset the ticket code input after error
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [messageDialogOpen, messageType]);

    // Use delayedPageDisabled and delayedSessionValid for rendering
    if (!delayDone || delayedPageDisabled) {
        return <DisabledPage />;
    }
    if (!delayedSessionValid) {
        return null;
    }
    if (!activeEventYear) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-black">
                <div className="text-center">
                    <h1 className="mb-4 text-4xl font-bold text-white">Voting Belum Dibuka</h1>
                    <p className="text-lg text-gray-300">
                        Saat ini tidak ada event voting yang sedang berlangsung.
                        <br />
                        Silakan cek kembali nanti.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <>
            <Head title="Voting Film" />
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <header
                    className={`border-b border-gray-200 bg-white/95 backdrop-blur-sm transition-all duration-300 ${
                        headerVisible ? 'h-auto' : 'h-0 overflow-hidden'
                    }`}
                >
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                        <div className="flex items-center">
                            <div className="mr-4 rounded-lg bg-gray-100 p-2">
                                <Film className="h-8 w-8 text-gray-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Festival Film Voting</h1>
                                {activeEventYear && (
                                    <p className="text-sm text-gray-500">
                                        {activeEventYear.year} - {activeEventYear.title}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">
                                <Timer className="mr-2 h-4 w-4" />
                                <span className="font-mono">{timeLeft}</span>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleLogout}
                                className="border-gray-200 text-gray-600 hover:bg-gray-50"
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                Logout
                            </Button>
                        </div>
                    </div>
                </header>

                {/* Header Toggle Button */}
                <div className="absolute top-4 right-4 z-10">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleHeader}
                        className="h-8 w-8 rounded-full border-gray-200 p-0 shadow-sm"
                    >
                        {headerVisible ? (
                            <ChevronUp className="h-4 w-4 text-gray-600" />
                        ) : (
                            <ChevronDown className="h-4 w-4 text-gray-600" />
                        )}
                    </Button>
                </div>

                {/* Main content */}
                <main
                    className={`mx-auto max-w-7xl px-4 transition-all duration-300 sm:px-6 lg:px-8 ${
                        headerVisible ? 'py-8' : 'pt-16 pb-8'
                    }`}
                >
                    {!votingSession ? (
                        // Ticket Input Screen
                        <div className="mx-auto w-full max-w-3xl">
                            <div className="mb-8 text-center">
                                <div className="mb-4 inline-block rounded-full bg-gray-100 p-4">
                                    <Ticket className="h-12 w-12 text-gray-600" />
                                </div>
                                <h2 className="mb-2 text-3xl font-bold text-gray-900">Masukkan Kode Tiket</h2>
                                <p className="text-gray-600">
                                    Masukkan kode 4 digit yang tertera pada tiket untuk Voting Login
                                </p>
                            </div>

                            {/* Two-column layout for form and instructions */}
                            <div className="flex flex-col gap-8 md:flex-row md:gap-12">
                                {/* Left: Form */}
                                <div className="md:w-1/2">
                                    <Card className="border-0 bg-white shadow-lg">
                                        <CardContent className="px-8">
                                            <div className="space-y-6">
                                                <div className="space-y-3">
                                                    <Label htmlFor="ticket" className="text-base font-medium">
                                                        Kode Tiket
                                                    </Label>
                                                    {/* Input with auto-focus and shake on error */}
                                                    <input
                                                        id="ticket"
                                                        ref={inputRef}
                                                        placeholder="0000"
                                                        value={ticketCode}
                                                        onChange={(e) => setTicketCode(e.target.value.toUpperCase())}
                                                        maxLength={4}
                                                        className={`h-16 w-full border-2 text-center font-mono text-3xl tracking-widest transition-all duration-150 focus:border-gray-400 ${sessionError ? 'animate-shake border-red-500' : ''}`}
                                                        autoComplete="off"
                                                        disabled={sessionLoading}
                                                        aria-label="Kode Tiket"
                                                        onKeyDown={(e) => {
                                                            if (
                                                                e.key === 'Enter' &&
                                                                ticketCode.length === 4 &&
                                                                !sessionLoading
                                                            ) {
                                                                handleStartVotingSession();
                                                            }
                                                        }}
                                                    />
                                                    {/* Numpad alternative input */}
                                                    <div className="mt-6 flex flex-col items-center">
                                                        <div className="grid grid-cols-3 gap-4">
                                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                                                                <button
                                                                    key={num}
                                                                    type="button"
                                                                    className="hover:bg-primary/10 active:bg-primary/20 focus:ring-primary/40 h-16 w-16 rounded-2xl border border-gray-200 bg-white text-3xl font-bold text-gray-800 shadow-md transition-all duration-150 focus:ring-2 focus:ring-offset-2 focus:outline-none"
                                                                    onClick={() => {
                                                                        if (ticketCode.length < 4 && !sessionLoading) {
                                                                            setTicketCode(ticketCode + num.toString());
                                                                            inputRef.current?.focus();
                                                                        }
                                                                    }}
                                                                    disabled={ticketCode.length >= 4 || sessionLoading}
                                                                    aria-label={`Input ${num}`}
                                                                >
                                                                    {num}
                                                                </button>
                                                            ))}
                                                            {/* Empty cell for layout */}
                                                            <div></div>
                                                            {/* 0 button */}
                                                            <button
                                                                type="button"
                                                                className="hover:bg-primary/10 active:bg-primary/20 focus:ring-primary/40 h-16 w-16 rounded-2xl border border-gray-200 bg-white text-3xl font-bold text-gray-800 shadow-md transition-all duration-150 focus:ring-2 focus:ring-offset-2 focus:outline-none"
                                                                onClick={() => {
                                                                    if (ticketCode.length < 4 && !sessionLoading) {
                                                                        setTicketCode(ticketCode + '0');
                                                                        inputRef.current?.focus();
                                                                    }
                                                                }}
                                                                disabled={ticketCode.length >= 4 || sessionLoading}
                                                                aria-label="Input 0"
                                                            >
                                                                0
                                                            </button>
                                                            {/* Backspace button */}
                                                            <button
                                                                type="button"
                                                                className="flex h-16 w-16 items-center justify-center rounded-2xl border border-gray-200 bg-white text-2xl font-bold text-gray-800 shadow-md transition-all duration-150 hover:bg-red-50 focus:ring-2 focus:ring-red-300 focus:ring-offset-2 focus:outline-none active:bg-red-100"
                                                                onClick={() => {
                                                                    if (ticketCode.length > 0 && !sessionLoading) {
                                                                        setTicketCode(ticketCode.slice(0, -1));
                                                                        inputRef.current?.focus();
                                                                    }
                                                                }}
                                                                disabled={ticketCode.length === 0 || sessionLoading}
                                                                aria-label="Delete"
                                                            >
                                                                <Delete className="h-7 w-7" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <p className="text-center text-xs text-gray-500">
                                                        Masukkan kode 4 digit untuk Voting Login
                                                    </p>
                                                </div>

                                                <Button
                                                    onClick={handleStartVotingSession}
                                                    disabled={ticketCode.length !== 4 || sessionLoading}
                                                    className="h-12 w-full text-lg font-medium"
                                                    size="lg"
                                                    aria-label="Mulai Voting"
                                                >
                                                    {sessionLoading ? (
                                                        <>
                                                            <div className="mr-2 h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
                                                            Memproses...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Award className="mr-2 h-5 w-5" />
                                                            Mulai Voting
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Right: Instructions */}
                                <div className="md:w-1/2">
                                    <Card className="border-0 bg-gray-50 shadow-none">
                                        <CardHeader>
                                            <CardTitle className="text-lg font-semibold text-gray-800">
                                                Langkah-langkah Voting
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4 text-gray-700">
                                            <ol className="list-decimal space-y-3 pl-5 text-base">
                                                <li className="flex items-start gap-2">
                                                    <Ticket className="text-primary mt-1 h-5 w-5" />
                                                    <span>
                                                        <span className="font-medium">Dapatkan kode tiket voting</span>{' '}
                                                        dari panitia atau pada tiket fisik/digital Anda.
                                                    </span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <Hash className="text-primary mt-1 h-5 w-5" />
                                                    <span>
                                                        <span className="font-medium">Masukkan kode tiket 4 digit</span>{' '}
                                                        pada kolom di sebelah kiri, lalu klik{' '}
                                                        <span className="font-semibold">Mulai Voting</span>.
                                                    </span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <Film className="text-primary mt-1 h-5 w-5" />
                                                    <span>
                                                        Setelah login,{' '}
                                                        <span className="font-medium">pilih satu film terbaik</span>{' '}
                                                        untuk setiap kategori yang tersedia.
                                                    </span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <CheckCircle className="mt-1 h-5 w-5 text-green-600" />
                                                    <span>
                                                        Setelah semua kategori dipilih, voting Anda akan{' '}
                                                        <span className="font-medium">tersimpan otomatis</span> dan Anda
                                                        akan melihat pesan konfirmasi.
                                                    </span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <XCircle className="mt-1 h-5 w-5 text-red-500" />
                                                    <span>
                                                        Jika mengalami kendala, silakan hubungi panitia di lokasi.
                                                    </span>
                                                </li>
                                            </ol>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Voting Session Screen
                        <div className="mx-auto max-w-4xl">
                            {/* Progress Header */}
                            <div className="mb-8">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold text-gray-900">Voting Progress</h2>
                                    <div className="text-sm text-gray-500">
                                        {votingSession?.remaining_categories?.length || 0} kategori tersisa
                                    </div>
                                </div>

                                {/* Progress Indicator */}
                                <div className="mt-4">
                                    <div className="flex items-center justify-center space-x-4">
                                        <div className="flex items-center space-x-2">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-600 text-sm font-medium text-white">
                                                1
                                            </div>
                                            <span className="text-sm font-medium text-gray-700">
                                                Kategori Berikutnya
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {votingSession?.remaining_categories?.[0]?.name || 'Memuat...'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Current Step Content */}
                            {currentStep === 0 ? (
                                // Ticket Input Step
                                <div className="text-center">
                                    <div className="mb-6 inline-flex items-center justify-center rounded-full bg-gray-100 p-6">
                                        <Ticket className="h-12 w-12 text-gray-600" />
                                    </div>
                                    <h3 className="mb-2 text-xl font-bold text-gray-900">Masukkan Kode Tiket</h3>
                                    <p className="mb-6 text-gray-600">Masukkan kode 4 digit yang tertera pada tiket</p>

                                    <Card className="mx-auto max-w-md border-0 bg-white shadow-lg">
                                        <CardContent className="p-6">
                                            <div className="space-y-4">
                                                <Input
                                                    placeholder="0000"
                                                    value={ticketCode}
                                                    onChange={(e) => setTicketCode(e.target.value.toUpperCase())}
                                                    maxLength={4}
                                                    className="h-12 border-2 text-center font-mono text-2xl tracking-widest focus:border-gray-400"
                                                    autoComplete="off"
                                                    disabled={sessionLoading}
                                                />
                                                <Button
                                                    onClick={handleStartVotingSession}
                                                    disabled={ticketCode.length !== 4 || sessionLoading}
                                                    className="w-full"
                                                    size="lg"
                                                >
                                                    {sessionLoading ? (
                                                        <>
                                                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                                                            Memproses...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Award className="mr-2 h-4 w-4" />
                                                            Mulai Voting
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            ) : votingSession &&
                              votingSession.remaining_categories &&
                              votingSession.remaining_categories.length > 0 ? (
                                // Category Voting Step
                                <div>
                                    {(() => {
                                        const currentCategory = getCurrentCategory();
                                        if (!currentCategory) {
                                            return (
                                                <div className="text-center">
                                                    <div className="mb-6 inline-flex items-center justify-center rounded-full bg-gray-100 p-6">
                                                        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-gray-600"></div>
                                                    </div>
                                                    <h3 className="mb-2 text-xl font-bold text-gray-900">Memuat...</h3>
                                                    <p className="text-gray-600">Menyiapkan kategori berikutnya</p>
                                                </div>
                                            );
                                        }

                                        const categoryFilms = filmsByCategory[currentCategory.name] || [];

                                        return (
                                            <div className="space-y-6">
                                                {/* Category Header */}
                                                <div className="text-center">
                                                    <div className="mb-4 inline-flex items-center justify-center rounded-full bg-gray-100 p-4">
                                                        <Award className="h-8 w-8 text-gray-600" />
                                                    </div>
                                                    <h3 className="mb-2 text-2xl font-bold text-gray-900">
                                                        {currentCategory.name}
                                                    </h3>
                                                    <p className="text-gray-600">
                                                        Pilih satu film terbaik dari kategori ini
                                                    </p>
                                                </div>

                                                {/* Films Grid */}
                                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                                    {categoryFilms.map((film) => (
                                                        <Card
                                                            key={film.id}
                                                            className="cursor-pointer overflow-hidden border-0 bg-white shadow-lg transition-all duration-200 hover:shadow-xl"
                                                            onClick={() => openVotingDialog(film)}
                                                        >
                                                            <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200">
                                                                {film.poster_landscape_file ? (
                                                                    <img
                                                                        src={`/storage/${film.poster_landscape_file}`}
                                                                        alt={film.title}
                                                                        className="h-full w-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="flex h-full items-center justify-center">
                                                                        <Film className="h-12 w-12 text-gray-400" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <CardHeader className="pb-3">
                                                                <CardTitle className="line-clamp-1 text-lg">
                                                                    {film.title}
                                                                </CardTitle>
                                                                <CardDescription className="flex items-center gap-2">
                                                                    <Users className="h-4 w-4" />
                                                                    {film.participant.team_name} -{' '}
                                                                    {film.participant.city}
                                                                </CardDescription>
                                                            </CardHeader>
                                                            <CardContent className="pb-4">
                                                                <p className="line-clamp-3 text-sm text-gray-600">
                                                                    {film.synopsis}
                                                                </p>
                                                            </CardContent>
                                                        </Card>
                                                    ))}
                                                </div>

                                                {/* Navigation */}
                                                <div className="flex justify-center">
                                                    <div className="text-sm text-gray-500">
                                                        {votingSession?.remaining_categories?.length || 0} kategori
                                                        tersisa
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            ) : votingSession && votingSession.is_complete ? (
                                // Completion Step
                                <div className="text-center">
                                    <div className="mb-6 inline-flex items-center justify-center rounded-full bg-gray-100 p-6">
                                        <CheckCircle className="h-12 w-12 text-gray-600" />
                                    </div>
                                    <h3 className="mb-2 text-2xl font-bold text-gray-900">Voting Selesai!</h3>
                                    <p className="mb-6 text-gray-600">
                                        Terima kasih telah berpartisipasi dalam voting festival film
                                    </p>

                                    <Card className="mx-auto max-w-md border-0 bg-white shadow-lg">
                                        <CardContent className="p-6">
                                            <div className="space-y-4">
                                                <div className="text-center">
                                                    <div className="mb-4 text-4xl">🎉</div>
                                                    <p className="text-sm text-gray-600">
                                                        Semua kategori telah divote dengan sukses
                                                    </p>
                                                </div>
                                                <Button onClick={resetVotingSession} className="w-full" size="lg">
                                                    <LogOut className="mr-2 h-4 w-4" />
                                                    Kembali ke Input Tiket
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            ) : null}
                        </div>
                    )}
                </main>
            </div>

            {/* Voting Dialog */}
            <Dialog open={votingDialogOpen} onOpenChange={setVotingDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <Star className="h-6 w-6 text-yellow-500" />
                            Vote untuk Film
                        </DialogTitle>
                        <DialogDescription className="text-base">
                            <div className="space-y-2">
                                <div className="font-semibold text-gray-900">{selectedFilm?.title}</div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Users className="h-4 w-4" />
                                    {selectedFilm?.participant.team_name} - {selectedFilm?.participant.city}
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Award className="h-4 w-4 text-gray-600" />
                                    <span className="font-medium text-gray-600">
                                        Kategori: {selectedFilm?.participant.category.name}
                                    </span>
                                </div>
                            </div>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                            <div className="flex items-start gap-3">
                                <div className="rounded-full bg-gray-200 p-2">
                                    <CheckCircle className="h-5 w-5 text-gray-600" />
                                </div>
                                <div className="text-sm text-gray-700">
                                    <p className="mb-1 font-medium">Konfirmasi Voting</p>
                                    <p>
                                        Anda akan memilih film ini sebagai pemenang untuk kategori{' '}
                                        <span className="font-bold">{selectedFilm?.participant.category.name}</span>.
                                        <br />
                                        Pastikan pilihan Anda sudah tepat sebelum melanjutkan.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setVotingDialogOpen(false)}
                            disabled={votingLoading}
                            className="flex-1"
                        >
                            Batal
                        </Button>
                        <Button onClick={handleVote} disabled={votingLoading} className="flex-1">
                            {votingLoading ? (
                                <>
                                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                                    Memproses...
                                </>
                            ) : (
                                <>
                                    <Star className="mr-2 h-4 w-4" />
                                    Konfirmasi Vote
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Message Dialog */}
            <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            {isUsedTicketError(messageContent) ? (
                                <div className="rounded-full bg-red-100 p-2">
                                    <XCircle className="h-6 w-6 text-red-600" />
                                </div>
                            ) : messageType === 'success' ? (
                                <div className="rounded-full bg-green-100 p-2">
                                    <CheckCircle className="h-6 w-6 text-green-600" />
                                </div>
                            ) : (
                                <div className="rounded-full bg-red-100 p-2">
                                    <XCircle className="h-6 w-6 text-red-600" />
                                </div>
                            )}
                            {isUsedTicketError(messageContent)
                                ? 'Tiket Tidak Valid'
                                : messageType === 'success'
                                  ? 'Berhasil'
                                  : 'Kesalahan'}
                        </DialogTitle>
                        <DialogDescription className="text-base">
                            <div
                                className={`rounded-lg p-4 ${
                                    isUsedTicketError(messageContent)
                                        ? 'border border-red-200 bg-red-50'
                                        : messageType === 'success'
                                          ? 'border border-green-200 bg-green-50'
                                          : 'border border-red-200 bg-red-50'
                                }`}
                            >
                                <p
                                    className={`${
                                        isUsedTicketError(messageContent)
                                            ? 'text-red-700'
                                            : messageType === 'success'
                                              ? 'text-green-700'
                                              : 'text-red-700'
                                    }`}
                                >
                                    {messageContent}
                                </p>
                                {isUsedTicketError(messageContent) && (
                                    <p className="mt-2 text-sm text-red-600">Silakan masukkan kode tiket yang lain.</p>
                                )}
                            </div>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end">
                        <Button onClick={() => setMessageDialogOpen(false)} className="w-full">
                            Tutup
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Completion Dialog */}
            <Dialog open={completionDialogOpen} onOpenChange={setCompletionDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3 text-xl">
                            <div className="rounded-full bg-green-100 p-3">
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                            Voting Selesai!
                        </DialogTitle>
                        <DialogDescription className="text-base">
                            <div className="space-y-4">
                                <p className="text-gray-700">
                                    Terima kasih telah berpartisipasi dalam voting festival film.
                                </p>

                                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-full bg-green-200 p-2">
                                            <Timer className="h-5 w-5 text-green-600" />
                                        </div>
                                        <div className="text-sm text-green-700">
                                            <p className="mb-1 font-medium">Kembali ke Input Tiket</p>
                                            <p className="font-mono text-lg font-bold">{logoutCountdown} detik</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setCompletionDialogOpen(false)} className="flex-1">
                            Tetap di Halaman
                        </Button>
                        <Button onClick={resetVotingSession} className="flex-1">
                            Reset Sekarang
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
